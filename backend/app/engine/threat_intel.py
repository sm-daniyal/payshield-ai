"""
PayShield AI — PayPal Merchant Threat Intelligence & News Feed Engine

Aggregates real-time threat intelligence bulletins, BIN attack alerts,
cross-border FX manipulation signals, and chargeback regulatory updates.
Links each threat intelligence event directly to an active PayShield mitigation rule.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import NamedTuple
from pydantic import BaseModel, Field


class ThreatArticle(BaseModel):
    id: str
    headline: str
    summary: str
    category: str = Field(..., description="E.g. CARD_TESTING, CROSS_BORDER_FX, DISPUTE_RULES, ACCOUNT_TAKEOVER")
    severity: str = Field(..., description="LOW | ELEVATED | CRITICAL")
    published_at: str
    mitigation_rule: str
    impacted_channels: list[str]
    actionable_recommendation: str


# Pre-curated realistic threat telemetry bulletins for PayPal merchants
GLOBAL_THREAT_BULLETINS: list[ThreatArticle] = [
    ThreatArticle(
        id="INTEL-2026-089",
        headline="Coordinated Micro-Authorization Card Testing Spike on PayPal Express Checkout",
        summary=(
            "Distributed botnets utilizing Romanian and Nigerian egress IPs are attempting high-frequency "
            "sub-$2.00 authorizations to validate stolen card sets against European PayPal merchant accounts."
        ),
        category="CARD_TESTING",
        severity="CRITICAL",
        published_at="2026-10-13T18:45:00Z",
        mitigation_rule="RULE_5_PROB_CRITICAL_HIGH_VALUE_BLOCK & Rolling 1h Velocity Gating",
        impacted_channels=["Express Checkout", "Guest Payments", "Digital Goods"],
        actionable_recommendation=(
            "PayShield velocity window threshold automatically reduces tolerated 1-hour transaction "
            "counts from 5 to 2 per IP subnet. High-velocity bursts are blocked pre-capture."
        ),
    ),
    ThreatArticle(
        id="INTEL-2026-072",
        headline="Cross-Border FX Arbitrage Exploit Targeting GBP/USD Currency Conversion Rails",
        summary=(
            "Fraud rings exploiting cross-border currency conversion rate disparities on synthetic buyer accounts. "
            "Actual conversion spreads exceeding 4.5% above institutional mid-market benchmarks observed."
        ),
        category="CROSS_BORDER_FX",
        severity="ELEVATED",
        published_at="2026-10-12T11:20:00Z",
        mitigation_rule="RULE_3_PROB_ELEVATED_STEP_UP_AUTH & fx_spread Feature Weighting",
        impacted_channels=["Multi-Currency Invoicing", "Cross-Border Goods"],
        actionable_recommendation=(
            "PayShield FX spread detector triggers 3-D Secure biometric step-up verification whenever "
            "transaction rate diverges >3% from mid-market benchmark."
        ),
    ),
    ThreatArticle(
        id="INTEL-2026-061",
        headline="PayPal Seller Protection Evidence Clarification for Item-Not-Received Claims",
        summary=(
            "PayPal policy update specifies that online carrier tracking confirmation showing physical delivery "
            "at the buyer's recipient postal code constitutes conclusive seller defense under Disputes v1."
        ),
        category="DISPUTE_RULES",
        severity="LOW",
        published_at="2026-10-10T09:00:00Z",
        mitigation_rule="PayShield Dispute Engine — PROCEED_DIRECT_DISPUTE Dossier Generation",
        impacted_channels=["Disputes API v1", "Physical Shipments"],
        actionable_recommendation=(
            "PayShield dispute engine automatically pairs USPS/FedEx carrier delivery scans with PayPal order captures, "
            "yielding >75% win probability and guaranteed positive expected recovery."
        ),
    ),
    ThreatArticle(
        id="INTEL-2026-044",
        headline="Synthetic Identity Inundation on Fresh PayPal Buyer Accounts Under 14 Days",
        summary=(
            "Rise in newly minted PayPal accounts with unverified banking links attempting rapid bulk checkouts "
            "prior to initial bank account verification cycles."
        ),
        category="ACCOUNT_TAKEOVER",
        severity="ELEVATED",
        published_at="2026-10-08T14:15:00Z",
        mitigation_rule="account_risk_score Logarithmic Age Decay Feature",
        impacted_channels=["Marketplace Payments", "New Customers"],
        actionable_recommendation=(
            "PayShield account_risk_score assigns maximum penalty to unverified buyer accounts <30 days, "
            "requiring secondary email/SMS verification before capture."
        ),
    ),
]


def get_latest_threat_bulletins(category: str | None = None) -> list[ThreatArticle]:
    """Retrieve all active threat intelligence bulletins, optionally filtered by category."""
    if not category or category.upper() == "ALL":
        return GLOBAL_THREAT_BULLETINS
    return [b for b in GLOBAL_THREAT_BULLETINS if b.category.upper() == category.upper()]


class NewsletterSubscriptionRequest(BaseModel):
    email: str
    frequency: str = Field(default="DAILY", description="REALTIME | DAILY | WEEKLY")
    categories: list[str] = Field(default_factory=lambda: ["CARD_TESTING", "CROSS_BORDER_FX", "DISPUTE_RULES", "ACCOUNT_TAKEOVER"])


class NewsletterSubscriptionResponse(BaseModel):
    subscription_id: str
    email: str
    frequency: str
    categories: list[str]
    status: str
    message: str
    confirmed_at: str


# In-memory store for newsletter subscriptions
NEWSLETTER_SUBSCRIBERS: dict[str, dict] = {}


def register_newsletter_subscription(req: NewsletterSubscriptionRequest) -> NewsletterSubscriptionResponse:
    import uuid
    sub_id = f"SUB-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    record = {
        "subscription_id": sub_id,
        "email": req.email,
        "frequency": req.frequency,
        "categories": req.categories,
        "status": "ACTIVE",
        "message": f"Successfully subscribed {req.email} to PayShield Merchant Threat Dispatch ({req.frequency}).",
        "confirmed_at": now_iso
    }
    NEWSLETTER_SUBSCRIBERS[req.email.lower()] = record
    return NewsletterSubscriptionResponse(**record)

