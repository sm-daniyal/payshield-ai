"""
PayShield AI — PayPal Webhook Event Ingestion Router

Exposes POST /api/v1/paypal/webhook
Listens for asynchronous PayPal events:
  - CHECKOUT.ORDER.APPROVED
  - PAYMENT.CAPTURE.COMPLETED
  - CUSTOMER.DISPUTE.CREATED
  - PAYMENT.SALE.REVERSED

Verifies webhook signature via PayPal's /v1/notifications/verify-webhook-signature
endpoint BEFORE mutating any system state. Performs SQLite-backed idempotency check,
enriches sparse payloads via demo fixture, dispatches to the risk or dispute engine,
and records all events to the append-only audit log.
"""
from __future__ import annotations

import json
import logging
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Request, status

from app.config import settings
from app.db.audit_store import AuditStore
from app.engine.dispute_recovery import DisputeEvidenceInput, evaluate_dispute_recovery
from app.engine.model_runner import ModelRunner
from app.paypal.client import PayPalClient
from app.schemas.transaction import TransactionEvaluationRequest, TransactionHistory

logger = logging.getLogger("payshield.webhooks")
router = APIRouter(prefix="/api/v1/paypal", tags=["PayPal Webhooks"])

DEMO_CUSTOMERS_FILE = Path(__file__).parent.parent / "data" / "demo_customers.json"


def _enrich_from_demo_store(payer_email: str, buyer_country: str = "US") -> dict[str, Any]:
    """
    Demo-only enrichment. Production systems would read from a
    customer data store; this repo uses a static JSON fixture.
    """
    if DEMO_CUSTOMERS_FILE.exists():
        try:
            with open(DEMO_CUSTOMERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if payer_email in data:
                    return data[payer_email]
        except Exception as exc:
            logger.warning("Failed to load demo_customers.json: %s", exc)

    # Safe fallback defaults
    return {
        "ip_country": buyer_country,
        "buyer_country": buyer_country,
        "shipping_country": buyer_country,
        "buyer_currency": "USD",
        "paypal_account_age_days": 365,
        "paypal_account_verified": True,
        "mid_market_rate_to_usd": 1.0,
        "actual_rate_to_usd": 1.0,
        "history": {
            "amounts": [],
            "timestamps": [],
            "dispute_count": 0,
        },
    }


def _check_and_record_idempotency(db_path: Path, transmission_id: str, event_type: str) -> bool:
    """Atomic idempotency check using INSERT OR IGNORE to eliminate TOCTOU race."""
    try:
        with sqlite3.connect(db_path, timeout=5.0) as conn:
            conn.execute("PRAGMA journal_mode=WAL")  # concurrent reads during write
            conn.execute("""
                CREATE TABLE IF NOT EXISTS webhook_idempotency (
                    transmission_id TEXT PRIMARY KEY,
                    event_type TEXT NOT NULL,
                    processed_at TEXT NOT NULL
                )
            """)
            cursor = conn.execute(
                "INSERT OR IGNORE INTO webhook_idempotency VALUES (?, ?, ?)",
                (transmission_id, event_type, datetime.now(timezone.utc).isoformat()),
            )
            return cursor.rowcount == 0  # 0 rows inserted = already existed = duplicate
    except Exception as exc:
        logger.error("Idempotency check failed, rejecting to prevent duplicate processing: %s", exc)
        raise HTTPException(status_code=503, detail="Idempotency store unavailable")


async def _verify_paypal_signature(
    request: Request,
    raw_body: bytes,
    body_json: dict[str, Any],
) -> None:
    """
    Verify PayPal webhook signature against PayPal's verification endpoint.
    Fails closed (HTTP 401) on any failure, missing header, or timeout.
    """
    transmission_id = request.headers.get("PAYPAL-TRANSMISSION-ID")
    transmission_time = request.headers.get("PAYPAL-TRANSMISSION-TIME")
    transmission_sig = request.headers.get("PAYPAL-TRANSMISSION-SIG")
    cert_url = request.headers.get("PAYPAL-CERT-URL")
    auth_algo = request.headers.get("PAYPAL-AUTH-ALGO")

    # Fail closed on missing signature headers
    if not all([transmission_id, transmission_time, transmission_sig, cert_url, auth_algo]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing required PayPal webhook signature headers",
        )

    # Validate cert_url belongs to official PayPal domain (prevent SSRF/spoofing)
    if not (cert_url.startswith("https://api.paypal.com") or cert_url.startswith("https://api.sandbox.paypal.com")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid cert_url domain: must be hosted on paypal.com",
        )

    # Fail closed if webhook_id is unconfigured
    if not settings.paypal_webhook_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PayPal webhook_id is not configured",
        )

    pp_client = PayPalClient()
    token = await pp_client.get_access_token()

    verify_payload = {
        "auth_algo": auth_algo,
        "cert_url": cert_url,
        "transmission_id": transmission_id,
        "transmission_sig": transmission_sig,
        "transmission_time": transmission_time,
        "webhook_id": settings.paypal_webhook_id,
        "webhook_event": body_json,
    }

    verify_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "PayPal-Request-Id": str(uuid.uuid4()),
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.paypal_base_url.rstrip('/')}/v1/notifications/verify-webhook-signature",
                headers=verify_headers,
                json=verify_payload,
            )
            if resp.status_code != status.HTTP_200_OK:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"PayPal verification endpoint returned HTTP {resp.status_code}",
                )
            result = resp.json()
            if result.get("verification_status") != "SUCCESS":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid PayPal webhook signature",
                )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("PayPal webhook signature verification error: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PayPal webhook signature verification failed (network/timeout error)",
        )


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Ingest PayPal Webhook events and trigger autonomous risk or recovery pipeline",
)
async def process_paypal_webhook(request: Request) -> dict[str, Any]:
    # 1. Parse raw body bytes as JSON
    try:
        raw_body = await request.body()
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed JSON webhook payload",
        )

    # 2. Strict PayPal signature verification (fail closed, no bypass)
    await _verify_paypal_signature(request, raw_body, payload)

    event_type = payload.get("event_type", "UNKNOWN")
    transmission_id = request.headers.get("PAYPAL-TRANSMISSION-ID", "")
    audit_store = AuditStore()

    # 3. SQLite Idempotency check
    if transmission_id:
        is_duplicate = _check_and_record_idempotency(
            db_path=audit_store.db_path,
            transmission_id=transmission_id,
            event_type=event_type,
        )
        if is_duplicate:
            return {"status": "DUPLICATE", "transmission_id": transmission_id}

    resource = payload.get("resource", {})

    # 4. Order / Capture Event -> Trigger Risk Radar
    if event_type in ("CHECKOUT.ORDER.APPROVED", "PAYMENT.CAPTURE.COMPLETED"):
        tx_id = resource.get("id", payload.get("id", f"ORD-{uuid.uuid4().hex[:6].upper()}"))
        amount_dict = resource.get("amount", {})
        amount_val = float(amount_dict.get("value", 100.00))

        payer = resource.get("payer", {})
        shipping = resource.get("shipping", {})
        shipping_addr = shipping.get("address", {})

        shipping_country = shipping_addr.get("country_code", "US")
        buyer_country = payer.get("address", {}).get("country_code", shipping_country)
        payer_email = payer.get("email_address", "buyer@paypal.sandbox")

        # Enrich from demo store or safe defaults
        profile = _enrich_from_demo_store(payer_email, buyer_country=buyer_country)
        history_data = profile.get("history", {})

        eval_request = TransactionEvaluationRequest(
            transaction_id=tx_id,
            amount_usd=amount_val,
            buyer_email=payer_email,
            buyer_country=profile.get("buyer_country", buyer_country),
            shipping_country=shipping_country,
            ip_country=profile.get("ip_country", buyer_country),
            buyer_currency=amount_dict.get("currency_code", profile.get("buyer_currency", "USD")),
            mid_market_rate_to_usd=float(profile.get("mid_market_rate_to_usd", 1.0)),
            actual_rate_to_usd=float(profile.get("actual_rate_to_usd", 1.0)),
            paypal_account_age_days=int(profile.get("paypal_account_age_days", 365)),
            paypal_account_verified=bool(profile.get("paypal_account_verified", True)),
            event_timestamp=datetime.now(timezone.utc),
            history=TransactionHistory(
                amounts=history_data.get("amounts", [amount_val * 0.9]),
                timestamps=[datetime.now(timezone.utc)],
                dispute_count=int(history_data.get("dispute_count", 0)),
            ),
        )

        runner = ModelRunner.get_instance()
        eval_resp = runner.evaluate(eval_request)

        record_hash = audit_store.record_transaction_evaluation(
            transaction_id=eval_resp.transaction_id,
            amount_usd=amount_val,
            buyer_email=eval_request.buyer_email,
            risk_score=eval_resp.risk_score,
            risk_probability=eval_resp.risk_probability,
            action=eval_resp.decision.action,
            rule_triggered=eval_resp.decision.rule_triggered,
            features=eval_resp.features,
            shap_contributions=[c.model_dump() for c in eval_resp.shap_contributions],
            additivity_delta=eval_resp.additivity_verification.delta,
        )

        return {
            "status": "PROCESSED",
            "event_type": event_type,
            "pipeline": "RISK_RADAR",
            "decision": eval_resp.decision.action,
            "risk_score": eval_resp.risk_score,
            "audit_hash": record_hash,
        }

    # 5. Dispute Event -> Trigger Dispute EV Recovery
    if event_type in ("CUSTOMER.DISPUTE.CREATED", "PAYMENT.SALE.REVERSED"):
        dispute_id = resource.get("dispute_id", f"DISPUTE-{payload.get('id', uuid.uuid4().hex[:6].upper())}")
        tx_id = resource.get("disputed_transactions", [{}])[0].get("seller_transaction_id", f"TXN-{dispute_id}")
        amount_dict = resource.get("dispute_amount", {})
        amount_val = float(amount_dict.get("value", 125.00))

        evidence_input = DisputeEvidenceInput(
            dispute_id=dispute_id,
            transaction_id=tx_id,
            dispute_amount_usd=amount_val,
            dispute_reason=resource.get("reason", "MERCHANDISE_OR_SERVICE_NOT_RECEIVED"),
            has_carrier_delivery_proof=True,
            has_avs_cvv_match=True,
            buyer_prior_disputes=0,
            has_customer_chat_history=True,
            tracking_number="9400111899562537684000",
            carrier_name="USPS",
        )

        dispute_res = evaluate_dispute_recovery(evidence_input)

        record_hash = audit_store.record_dispute_recovery(
            dispute_id=dispute_res.dispute_id,
            transaction_id=tx_id,
            amount_usd=dispute_res.dispute_amount_usd,
            win_probability=dispute_res.win_probability,
            expected_net_recovery=dispute_res.expected_net_recovery,
            action=dispute_res.action,
            reasoning=dispute_res.reasoning,
            evidence_dossier=dispute_res.evidence_dossier,
        )

        return {
            "status": "PROCESSED",
            "event_type": event_type,
            "pipeline": "DISPUTE_RECOVERY",
            "action": dispute_res.action,
            "win_probability": dispute_res.win_probability,
            "expected_net_recovery": dispute_res.expected_net_recovery,
            "audit_hash": record_hash,
        }

    return {"status": "IGNORED", "event_type": event_type, "message": "Unhandled event type"}
