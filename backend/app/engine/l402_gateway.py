"""
PayShield AI — L402 Agentic Commerce Gateway (PayPal Paywall Protocol)

Implements the L402 protocol (HTTP 402 Payment Required) for autonomous AI agents.
Enables AI crawlers, risk agents, and algorithmic bots to purchase real-time
zero-day PayPal threat intelligence and fraud signals via programmatic PayPal micropayments.

L402 Protocol Flow:
1. Agent requests /api/v1/l402/threat-feed without auth -> Returns HTTP 402 with PayPal payment offers.
2. Agent initiates payment via POST /api/v1/l402/payment-request (creating PayPal Sandbox Order).
3. Upon payment confirmation, PayShield issues cryptographic L402 Bearer Token.
4. Agent provides token (Authorization: Bearer <token>) to unlock premium threat telemetry.
"""
from __future__ import annotations

import hmac
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field

L402_PROTOCOL_VERSION = "0.2.3"
HMAC_SECRET = b"payshield_l402_hmac_secret_2026"

# In-memory token ledger for L402 agent access
_active_l402_tokens: dict[str, dict[str, Any]] = {}


class L402Offer(BaseModel):
    id: str
    title: str
    description: str
    amount_usd: float
    currency: str = "USD"
    payment_methods: list[str] = ["paypal"]


class L402PaymentChallenge(BaseModel):
    version: str = L402_PROTOCOL_VERSION
    payment_request_url: str
    payment_context_token: str
    offers: list[L402Offer]


class L402PaymentRequest(BaseModel):
    payment_context_token: str
    offer_id: str
    agent_id: str = "autonomous_risk_agent_01"


class L402PaymentResponse(BaseModel):
    status: str
    bearer_token: str
    offer_id: str
    expires_at: str
    paypal_order_id: str
    message: str


def generate_l402_challenge(server_url: str = "http://localhost:8000") -> L402PaymentChallenge:
    """Generate HTTP 402 challenge payload conforming to L402 protocol specification."""
    context_token = str(uuid.uuid4())
    offers = [
        L402Offer(
            id="single_bulletin",
            title="Single Zero-Day Threat Bulletin Access",
            description="Real-time access to active card-testing botnet telemetry & mitigation rule",
            amount_usd=0.05,
        ),
        L402Offer(
            id="full_firehose",
            title="Full Threat Intelligence Firehose (24h)",
            description="Unrestricted programmatic stream of all cross-border FX and BIN fraud vectors",
            amount_usd=0.25,
        ),
    ]
    return L402PaymentChallenge(
        payment_request_url=f"{server_url}/api/v1/l402/payment-request",
        payment_context_token=context_token,
        offers=offers,
    )


def issue_l402_token(offer_id: str, agent_id: str) -> L402PaymentResponse:
    """Simulate settlement of PayPal micropayment and issue cryptographic L402 token."""
    raw_token = str(uuid.uuid4())
    signature = hmac.new(
        HMAC_SECRET,
        f"{raw_token}:{offer_id}:{agent_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    signed_bearer_token = f"l402_{raw_token}_{signature[:16]}"
    now = datetime.now(timezone.utc).isoformat()

    _active_l402_tokens[signed_bearer_token] = {
        "offer_id": offer_id,
        "agent_id": agent_id,
        "issued_at": now,
        "valid": True,
    }

    return L402PaymentResponse(
        status="PAYMENT_CONFIRMED",
        bearer_token=signed_bearer_token,
        offer_id=offer_id,
        expires_at="2026-11-13T00:00:00Z",
        paypal_order_id=f"PP-L402-{uuid.uuid4().hex[:8].upper()}",
        message="PayPal settlement complete. Use Bearer token in Authorization header.",
    )


def verify_l402_token(token: str | None) -> bool:
    """Validate incoming L402 token."""
    if not token:
        return False
    # Strip 'Bearer ' if present
    cleaned = token.replace("Bearer ", "").strip()
    return cleaned in _active_l402_tokens
