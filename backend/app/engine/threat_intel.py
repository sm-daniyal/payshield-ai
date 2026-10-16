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
    # Column 1: Merchant Chronicles (Store Survival)
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
        id="DISPATCH-2026-102",
        headline="Friendly Fraud Syndicates Targeting Custom Apparel Makers via Order Redirection",
        summary=(
            "Boutique apparel merchants face coordinated buyer redirection requests after carrier dispatch. "
            "Fraudsters claim non-receipt at initial address while collecting rerouted packages."
        ),
        category="MERCHANT_CHRONICLES",
        severity="ELEVATED",
        published_at="2026-10-15T16:15:00Z",
        mitigation_rule="Disallow In-Flight Carrier Address Changes Without Secondary Re-Auth",
        impacted_channels=["Direct Commerce", "Custom Manufacturing"],
        actionable_recommendation=(
            "Lock delivery address with carriers at label generation to preserve PayPal seller protection rights."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-103",
        headline="The 'Wardrobing' Racket: Why Fashion Retailers Are Installing Automated Serial Tracking",
        summary=(
            "High-end luxury sellers report a 34% surge in one-time wear returns. Tamper-evident tags "
            "and cryptographic order verification led to 80% reduction in abusive refund claims."
        ),
        category="MERCHANT_CHRONICLES",
        severity="ELEVATED",
        published_at="2026-10-15T13:40:00Z",
        mitigation_rule="Cryptographic Item Serialization & Photo Proof on Packaging",
        impacted_channels=["Luxury Goods", "Apparel Stores"],
        actionable_recommendation=(
            "Pair packaging serial photos with PayPal checkout order captures to counter Not-As-Described claims."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-104",
        headline="From Shopify to PayPal: How 3 Indie Merchants Recovered Stolen Inventory Margins",
        summary=(
            "Case studies from small business founders illustrating how autonomous evidence assembly "
            "turned a 22% dispute win rate into an 84% recovery rate within two fiscal quarters."
        ),
        category="MERCHANT_CHRONICLES",
        severity="LOW",
        published_at="2026-10-14T21:00:00Z",
        mitigation_rule="PayShield Dispute Engine — Autonomous Dossier Generation",
        impacted_channels=["Shopify", "WooCommerce", "PayPal Invoicing"],
        actionable_recommendation=(
            "Connect store order webhooks to automatic dispute dossier compilation engines."
        ),
    ),

    # Column 2: Shipping & Logistics (Delivery Proof)
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
        id="DISPATCH-2026-089",
        headline="Porch Pirate Epidemic: When 'Delivered' Scans Aren't Enough Without Postal Code Matching",
        summary=(
            "Carriers misdelivering to adjacent postal zones leave merchants vulnerable. PayPal dispute arbiters "
            "require GPS delivery coordinates or exact zip code match to confirm seller defense."
        ),
        category="SHIPPING_LOGISTICS",
        severity="CRITICAL",
        published_at="2026-10-15T15:20:00Z",
        mitigation_rule="Autonomous Geocoding Cross-Check on Carrier Delivery Events",
        impacted_channels=["Last-Mile Delivery", "Regional Couriers"],
        actionable_recommendation=(
            "Validate carrier delivery postal code against transaction shipping address before accepting claims."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-090",
        headline="USPS vs FedEx vs UPS: Signature Confirmation Thresholds That Actually Hold Up in Arbitration",
        summary=(
            "Orders above $750 require physical signature proof under PayPal Seller Protection terms. "
            "Missing signature proof on high-ticket orders results in automatic claim forfeiture."
        ),
        category="SHIPPING_LOGISTICS",
        severity="ELEVATED",
        published_at="2026-10-15T11:45:00Z",
        mitigation_rule="RULE_2_AMOUNT_ZSCORE_STEP_UP & Signature Auto-Enforcement",
        impacted_channels=["High-Value Electronics", "Jewelry Retail"],
        actionable_recommendation=(
            "Automatically flag orders >$750 to mandate carrier adult signature confirmation at checkout."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-091",
        headline="Cross-Border Transit Lags: Handling 45-Day Customs Holds Without Triggering Buyer Chargebacks",
        summary=(
            "International shipments held in customs often prompt impatient buyers to file premature claims. "
            "Proactive carrier tracking telemetry updates sent to PayPal prevent premature dispute escalation."
        ),
        category="SHIPPING_LOGISTICS",
        severity="LOW",
        published_at="2026-10-14T19:30:00Z",
        mitigation_rule="Automated Customs Hold Telemetry Ingestion & Dispute Deferral",
        impacted_channels=["DHL Express", "EMS Global", "Border Logistics"],
        actionable_recommendation=(
            "Ingest carrier transit milestone webhooks to notify buyers and defer dispute windows during inspection."
        ),
    ),

    # Column 3: Payments & Currency Rails (The $15 Fee Reality)
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
        id="DISPATCH-2026-075",
        headline="GBP/USD Currency Conversion Arbitrage: How Synthetic Buyer Rings Exploit FX Spreads",
        summary=(
            "Fraud rings exploit volatile currency conversion spreads on multi-currency PayPal invoices. "
            "Spreads diverging >3% from institutional mid-market benchmarks indicate high-risk arbitrage."
        ),
        category="PAYMENTS_RAILS",
        severity="CRITICAL",
        published_at="2026-10-15T14:10:00Z",
        mitigation_rule="RULE_3_PROB_ELEVATED_STEP_UP_AUTH & fx_spread Feature Weighting",
        impacted_channels=["Multi-Currency Invoicing", "Cross-Border Goods"],
        actionable_recommendation=(
            "Trigger 3-D Secure biometric step-up whenever invoice rate diverges >3% from benchmark."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-076",
        headline="Interchange & Dispute Overhead: The Hidden Costs That Drain Small Business Reserves",
        summary=(
            "Beyond dispute fees, payment processors assess elevated interchange surcharges on merchants "
            "exceeding 1.0% dispute-to-sales ratios. Keeping ratios below 0.5% saves 80 bps on gross volume."
        ),
        category="PAYMENTS_RAILS",
        severity="ELEVATED",
        published_at="2026-10-15T09:50:00Z",
        mitigation_rule="Pre-Capture Risk Scoring to Cap Dispute Ratios Below 0.40%",
        impacted_channels=["Payment Gateways", "Merchant Accounts"],
        actionable_recommendation=(
            "Filter high-risk authorizations pre-capture to protect merchant tier status and interchange rates."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-077",
        headline="The Net EV Formula: How Math Beats Emotion When Responding to Low-Dollar Claims",
        summary=(
            "Store founders often fight claims out of principle, losing money in fees. The Expected Value "
            "equation EV = (P_win × Amount) - $15.00 removes guesswork and maximizes retained profit."
        ),
        category="PAYMENTS_RAILS",
        severity="LOW",
        published_at="2026-10-14T17:15:00Z",
        mitigation_rule="Deterministic Expected Value Calculator for Dispute Triage",
        impacted_channels=["Merchant Operations", "Financial Forecasting"],
        actionable_recommendation=(
            "Adopt algorithmic dispute triage to automatically accept claims below the economic threshold."
        ),
    ),

    # Column 4: The Bot Wave & AI (Monetizing Scrapers)
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
    ThreatArticle(
        id="DISPATCH-2026-053",
        headline="Distributed LLM Scrapers Inundating Merchant Inventory Endpoints at 400 Requests/Sec",
        summary=(
            "AI agents scouring the web for pricing and stock availability overwhelm e-commerce databases. "
            "Unprotected endpoints face degraded checkout performance for legitimate human customers."
        ),
        category="BOT_WAVE",
        severity="CRITICAL",
        published_at="2026-10-15T12:30:00Z",
        mitigation_rule="Adaptive Rate Limiting with L402 PayPal Fallback Challenge",
        impacted_channels=["Product Catalog", "Search APIs", "Stock Inquiries"],
        actionable_recommendation=(
            "Route excessive bot traffic to L402 paywall to monetize computing overhead."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-054",
        headline="Beyond Cloudflare: Implementing HTTP 402 with PayPal Orders v2 for Programmatic Tolls",
        summary=(
            "Traditional IP blocking fails against distributed residential proxy networks. Economic friction "
            "via cryptographic micro-captures forces bot operators to evaluate per-query economics."
        ),
        category="BOT_WAVE",
        severity="ELEVATED",
        published_at="2026-10-15T08:15:00Z",
        mitigation_rule="Cryptographic HMAC Token Issuance via PayPal Orders v2",
        impacted_channels=["API Gateways", "Microservices"],
        actionable_recommendation=(
            "Issue signed HMAC bearer tokens valid for 30 minutes following confirmed PayPal micropayment."
        ),
    ),
    ThreatArticle(
        id="DISPATCH-2026-055",
        headline="The Agentic Economy: Preparing Merchant Checkout Rails for Autonomous AI Buyers",
        summary=(
            "As consumer AI shopping agents execute autonomous purchases, merchants need machine-to-machine "
            "auth protocols that handle instant tokenized checkout without 2FA human friction."
        ),
        category="BOT_WAVE",
        severity="LOW",
        published_at="2026-10-14T14:40:00Z",
        mitigation_rule="Agentic Checkout Protocol with PayPal Pre-Authorized Captures",
        impacted_channels=["Agentic Commerce", "Headless Checkout"],
        actionable_recommendation=(
            "Implement standardized RFC 402 endpoints to accept payments from autonomous multi-agent shoppers."
        ),
    ),
]

def get_latest_threat_bulletins(category: str | None = None) -> list[ThreatArticle]:
    """Retrieve all active threat intelligence bulletins, optionally filtered by category."""
    if not category or category.upper() == "ALL":
        return GLOBAL_THREAT_BULLETINS
    
    cat_upper = category.upper()
    return [b for b in GLOBAL_THREAT_BULLETINS if b.category.upper() == cat_upper]


