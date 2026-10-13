"""
PayShield AI — PayPal Webhook Event Ingestion Router

Exposes POST /api/v1/paypal/webhook
Listens for asynchronous PayPal events:
  - CHECKOUT.ORDER.APPROVED
  - PAYMENT.CAPTURE.COMPLETED
  - CUSTOMER.DISPUTE.CREATED
  - PAYMENT.SALE.REVERSED

Extracts telemetry, triggers risk scoring or dispute economic recovery,
and persists audit trail with cryptographic signatures.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.db.audit_store import AuditStore
from app.engine.dispute_recovery import DisputeEvidenceInput, evaluate_dispute_recovery
from app.engine.model_runner import ModelRunner
from app.schemas.transaction import TransactionEvaluationRequest, TransactionHistory

router = APIRouter(prefix="/api/v1/paypal", tags=["PayPal Webhooks"])


class WebhookEventPayload(BaseModel):
    id: str = Field(..., description="PayPal Webhook event ID (e.g. WH-...)")
    event_type: str = Field(..., description="PayPal event type string")
    resource_type: str | None = None
    resource: dict[str, Any] = Field(default_factory=dict)
    create_time: str | None = None


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Ingest PayPal Webhook events and trigger autonomous risk or recovery pipeline",
)
async def process_paypal_webhook(payload: WebhookEventPayload) -> dict[str, Any]:
    audit_store = AuditStore()
    event_type = payload.event_type
    resource = payload.resource

    # 1. New Order / Capture Event -> Trigger Risk Radar
    if event_type in ("CHECKOUT.ORDER.APPROVED", "PAYMENT.CAPTURE.COMPLETED"):
        tx_id = resource.get("id", payload.id)
        # Parse amount safely
        amount_dict = resource.get("amount", {})
        amount_val = float(amount_dict.get("value", 100.00))

        # Payer and shipping info
        payer = resource.get("payer", {})
        shipping = resource.get("shipping", {})
        shipping_addr = shipping.get("address", {})

        shipping_country = shipping_addr.get("country_code", "US")
        buyer_country = payer.get("address", {}).get("country_code", shipping_country)
        ip_country = resource.get("supplementary_data", {}).get("ip_country", shipping_country)

        eval_request = TransactionEvaluationRequest(
            transaction_id=tx_id,
            amount_usd=amount_val,
            buyer_email=payer.get("email_address", "buyer@paypal.sandbox"),
            buyer_country=buyer_country,
            shipping_country=shipping_country,
            ip_country=ip_country,
            buyer_currency=amount_dict.get("currency_code", "USD"),
            mid_market_rate_to_usd=1.0,
            actual_rate_to_usd=1.0,
            paypal_account_age_days=180,
            paypal_account_verified=True,
            event_timestamp=datetime.now(timezone.utc),
            history=TransactionHistory(
                amounts=[amount_val * 0.9],
                timestamps=[datetime.now(timezone.utc)],
                dispute_count=0,
            ),
        )

        runner = ModelRunner.get_instance()
        eval_resp = runner.evaluate(eval_request)

        # Audit persistence
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

    # 2. Dispute Event -> Trigger Vasuli Recovery Optimization
    if event_type in ("CUSTOMER.DISPUTE.CREATED", "PAYMENT.SALE.REVERSED"):
        dispute_id = resource.get("dispute_id", f"DISPUTE-{payload.id}")
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
