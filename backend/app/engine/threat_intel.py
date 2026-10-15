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
        id="DISPATCH-2026-101",
        headline="The $14k Holiday Chargeback Wave: How an Indie Boutique Survived Coordinated Return Fraud",
        summary=(
            "Independent boutique owners report sophisticated return-syndicates exploiting holiday return policies. "
            "Real-time address validation and carrier delivery proofs prevented 92% of frivolous losses."
        ),
        category="MERCHANT_CHRONICLES",
        severity="CRITICAL",
        published_at="2026-10-15T18:30:00Z",
        mitigation_rule="Enforce Delivery Scan Verification Prior to Issuing Merchant Refunds",
        impacted_channels=["Shopify Checkout", "PayPal Express", "Custom Boutiques"],
        actionable_recommendation=(
            "Never contest low-ticket claims without carrier scans; automate dispute evidence submission for claims >$50."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-088",
        headline="Postal Reality Check: Why Carrier Tracking Scans Are Your Only Legal Shield Under Disputes v1",
        summary=(
            "PayPal's seller protection updates reaffirm that verified online carrier delivery confirmation "
            "to the recipient's postal code provides conclusive merchant defense on Item-Not-Received claims."
        ),
        category="SHIPPING_LOGISTICS",
        severity="ELEVATED",
        published_at="2026-10-15T18:00:00Z",
        mitigation_rule="PayShield Dispute Engine — Autonomous Dossier Generation",
        impacted_channels=["USPS Priority", "FedEx Home Delivery", "UPS Ground"],
        actionable_recommendation=(
            "Automatically sync postal tracking scans to PayPal Disputes v1 API to maintain a >85% win probability."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-074",
        headline="The $15 Fee Trap: Why Fighting a $12 Claim Mathematically Destroys Merchant Margins",
        summary=(
            "PayPal assesses a non-refundable $15 fee on contested claims regardless of outcome. Independent data "
            "shows store owners lose more capital fighting cheap claims than immediately conceding."
        ),
        category="PAYMENTS_RAILS",
        severity="ELEVATED",
        published_at="2026-10-15T17:30:00Z",
        mitigation_rule="PayShield Net EV Model: Auto-Concede Claims with Negative Expected Value",
        impacted_channels=["Multi-Currency Rails", "Digital Downloads", "Low-Dollar Goods"],
        actionable_recommendation=(
            "Only contest chargebacks when (P_win × Amount) > $15.00 to guarantee net positive recovery."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-052",
        headline="Taming Automated Scrapers: Why CAPTCHAs Fail and How L402 Turns Crawlers into Paying Customers",
        summary=(
            "Autonomous AI bots cannot solve visual puzzle captchas or enter credit card numbers. Implementing HTTP 402 "
            "with PayPal Orders v2 charges crawlers 5 cents per API call without human friction."
        ),
        category="BOT_WAVE",
        severity="LOW",
        published_at="2026-10-15T16:00:00Z",
        mitigation_rule="L402 Protocol Gateway with PayPal Orders v2 Micro-Settlement",
        impacted_channels=["Public Catalog APIs", "Threat Telemetry", "Merchant Inventory"],
        actionable_recommendation=(
            "Replace hostile CAPTCHA blockers with L402 PayPal micropayment paywalls to monetize autonomous bot traffic."
        ),
    ),
]

CATEGORY_ALIASES: dict[str, str] = {
    "CARD_TESTING": "MERCHANT_CHRONICLES",
    "CROSS_BORDER_FX": "PAYMENTS_RAILS",
    "DISPUTE_RULES": "SHIPPING_LOGISTICS",
    "ACCOUNT_TAKEOVER": "BOT_WAVE",
}


def get_latest_threat_bulletins(category: str | None = None) -> list[ThreatArticle]:
    """Retrieve all active threat intelligence bulletins, optionally filtered by category."""
    if not category or category.upper() == "ALL":
        return GLOBAL_THREAT_BULLETINS
    
    cat_upper = category.upper()
    resolved_category = CATEGORY_ALIASES.get(cat_upper, cat_upper)
    return [b for b in GLOBAL_THREAT_BULLETINS if b.category.upper() == resolved_category or b.category.upper() == cat_upper]


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

