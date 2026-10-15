import { Shield, ShieldCheck, DollarSign, Zap } from 'lucide-react';

export const SAMPLE_TRANSACTIONS = [
  {
    transaction_id: "ORD-8921-LIVE",
    amount_usd: 129.50,
    buyer_email: "susan.chen@gmail.com",
    buyer_country: "US",
    shipping_country: "US",
    ip_country: "US",
    risk_score: 4.8,
    action: "ALLOW",
    rule_triggered: "RULE_1_PROB_BELOW_0_20_LOW_RISK",
    timestamp: "2 mins ago",
    features: {
      amount_zscore: 0.12,
      velocity_1h: 1,
      velocity_24h: 1,
      velocity_7d: 3,
      fx_spread: 0.002,
      geo_mismatch: 0.0,
      account_risk_score: 0.08
    },
    shap_contributions: [
      { feature: "account_risk_score", value: 0.08, shap_value: -0.38, contribution_pct: 42.0 },
      { feature: "geo_mismatch", value: 0.0, shap_value: -0.22, contribution_pct: 24.3 },
      { feature: "velocity_1h", value: 1.0, shap_value: -0.15, contribution_pct: 16.5 },
      { feature: "amount_zscore", value: 0.12, shap_value: -0.09, contribution_pct: 9.9 },
      { feature: "fx_spread", value: 0.002, shap_value: -0.06, contribution_pct: 7.3 }
    ],
    additivity_verification: {
      base_bias: -1.062,
      shap_sum: -0.90,
      predicted_probability: 0.048,
      delta: 0.000021,
      verified: true
    }
  },
  {
    transaction_id: "ORD-9430-BURST",
    amount_usd: 680.00,
    buyer_email: "alex99_carder@tempinbox.org",
    buyer_country: "US",
    shipping_country: "US",
    ip_country: "NG",
    risk_score: 88.5,
    action: "BLOCK_AND_FLAG_DISPUTE",
    rule_triggered: "RULE_5_PROB_CRITICAL_HIGH_VALUE_BLOCK",
    timestamp: "6 mins ago",
    features: {
      amount_zscore: 4.25,
      velocity_1h: 7,
      velocity_24h: 11,
      velocity_7d: 12,
      fx_spread: 0.048,
      geo_mismatch: 1.0,
      account_risk_score: 0.89
    },
    shap_contributions: [
      { feature: "velocity_1h", value: 7.0, shap_value: 1.45, contribution_pct: 35.8 },
      { feature: "geo_mismatch", value: 1.0, shap_value: 1.10, contribution_pct: 27.2 },
      { feature: "amount_zscore", value: 4.25, shap_value: 0.85, contribution_pct: 21.0 },
      { feature: "account_risk_score", value: 0.89, shap_value: 0.65, contribution_pct: 16.0 }
    ],
    additivity_verification: {
      base_bias: -1.062,
      shap_sum: 4.05,
      predicted_probability: 0.885,
      delta: 0.000018,
      verified: true
    }
  },
  {
    transaction_id: "ORD-9112-STEPUP",
    amount_usd: 340.00,
    buyer_email: "mark.nordic@online.se",
    buyer_country: "SE",
    shipping_country: "SE",
    ip_country: "SE",
    risk_score: 48.2,
    action: "STEP_UP_VERIFICATION",
    rule_triggered: "RULE_3_PROB_ELEVATED_STEP_UP_AUTH",
    timestamp: "14 mins ago",
    features: {
      amount_zscore: 2.1,
      velocity_1h: 3,
      velocity_24h: 4,
      velocity_7d: 5,
      fx_spread: 0.015,
      geo_mismatch: 0.0,
      account_risk_score: 0.42
    },
    shap_contributions: [
      { feature: "amount_zscore", value: 2.1, shap_value: 0.52, contribution_pct: 38.0 },
      { feature: "velocity_1h", value: 3.0, shap_value: 0.45, contribution_pct: 32.8 },
      { feature: "account_risk_score", value: 0.42, shap_value: 0.40, contribution_pct: 29.2 }
    ],
    additivity_verification: {
      base_bias: -1.062,
      shap_sum: 1.37,
      predicted_probability: 0.482,
      delta: 0.000034,
      verified: true
    }
  }
];

export const INITIAL_DISPUTES = [
  {
    dispute_id: "PP-D-882194",
    transaction_id: "TXN-9912048",
    amount_usd: 175.00,
    buyer_email: "customer_complaint@outlook.com",
    reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
    win_probability: 0.78,
    expected_net_recovery: 121.50,
    action: "PROCEED_DIRECT_DISPUTE",
    has_delivery_proof: true,
    has_avs_cvv: true,
    tracking: "9400111899562537684000 (USPS Delivered)",
    status: "READY_TO_SUBMIT"
  },
  {
    dispute_id: "PP-D-441029",
    transaction_id: "TXN-3829104",
    amount_usd: 14.50,
    buyer_email: "small_order@fastmail.com",
    reason: "UNRECOGNIZED_TRANSACTION",
    win_probability: 0.35,
    expected_net_recovery: -9.92,
    action: "AUTO_WRITE_OFF_UNECONOMIC",
    has_delivery_proof: false,
    has_avs_cvv: false,
    tracking: "None",
    status: "AUTO_WRITTEN_OFF"
  },
  {
    dispute_id: "PP-D-619280",
    transaction_id: "TXN-7740192",
    amount_usd: 85.00,
    buyer_email: "buyer_refund@yahoo.com",
    reason: "NOT_AS_DESCRIBED",
    win_probability: 0.48,
    expected_net_recovery: 25.80,
    action: "ESCALATE_MANUAL_REVIEW",
    has_delivery_proof: true,
    has_avs_cvv: false,
    tracking: "1Z9999999999999999 (UPS In Transit)",
    status: "PENDING_MERCHANT_REVIEW"
  }
];

export const THREAT_NEWS_ITEMS = [
  // Issue 1: Merchant Chronicles (Store Survival)
  {
    id: "DISPATCH-2026-101",
    headline: "The $14k Holiday Chargeback Wave: How an Indie Boutique Survived Coordinated Return Fraud",
    summary: "Independent boutique owners report sophisticated return-syndicates exploiting holiday return policies. Real-time address validation and carrier delivery proofs prevented 92% of frivolous losses.",
    category: "MERCHANT_CHRONICLES",
    severity: "CRITICAL",
    published_at: "14 mins ago",
    mitigation_rule: "Enforce Delivery Scan Verification Prior to Issuing Merchant Refunds",
    impacted_channels: ["Shopify Checkout", "PayPal Express", "Custom Boutiques"],
    actionable_recommendation: "Never contest low-ticket claims without carrier scans; automate dispute evidence submission for claims >$50."
  },
  {
    id: "DISPATCH-2026-102",
    headline: "Friendly Fraud Syndicates Targeting Custom Apparel Makers via Order Redirection",
    summary: "Boutique apparel merchants face coordinated buyer redirection requests after carrier dispatch. Fraudsters claim non-receipt at initial address while collecting rerouted packages.",
    category: "MERCHANT_CHRONICLES",
    severity: "ELEVATED",
    published_at: "2 hours ago",
    mitigation_rule: "Disallow In-Flight Carrier Address Changes Without Secondary Re-Auth",
    impacted_channels: ["Direct Commerce", "Custom Manufacturing"],
    actionable_recommendation: "Lock delivery address with carriers at label generation to preserve PayPal seller protection rights."
  },
  {
    id: "DISPATCH-2026-103",
    headline: "The 'Wardrobing' Racket: Why Fashion Retailers Are Installing Automated Serial Tracking",
    summary: "High-end luxury sellers report a 34% surge in one-time wear returns. Tamper-evident tags and cryptographic order verification led to 80% reduction in abusive refund claims.",
    category: "MERCHANT_CHRONICLES",
    severity: "ELEVATED",
    published_at: "5 hours ago",
    mitigation_rule: "Cryptographic Item Serialization & Photo Proof on Packaging",
    impacted_channels: ["Luxury Goods", "Apparel Stores"],
    actionable_recommendation: "Pair packaging serial photos with PayPal checkout order captures to counter Not-As-Described claims."
  },
  {
    id: "DISPATCH-2026-104",
    headline: "From Shopify to PayPal: How 3 Indie Merchants Recovered Stolen Inventory Margins",
    summary: "Case studies from small business founders illustrating how autonomous evidence assembly turned a 22% dispute win rate into an 84% recovery rate within two fiscal quarters.",
    category: "MERCHANT_CHRONICLES",
    severity: "LOW",
    published_at: "Yesterday",
    mitigation_rule: "PayShield Dispute Engine — Autonomous Dossier Generation",
    impacted_channels: ["Shopify", "WooCommerce", "PayPal Invoicing"],
    actionable_recommendation: "Connect store order webhooks to automatic dispute dossier compilation engines."
  },

  // Issue 2: Shipping & Logistics (Delivery Proof)
  {
    id: "DISPATCH-2026-088",
    headline: "Postal Reality Check: Why Carrier Tracking Scans Are Your Only Legal Shield Under Disputes v1",
    summary: "PayPal's seller protection updates reaffirm that verified online carrier delivery confirmation to the recipient's postal code provides conclusive merchant defense on Item-Not-Received claims.",
    category: "SHIPPING_LOGISTICS",
    severity: "ELEVATED",
    published_at: "38 mins ago",
    mitigation_rule: "PayShield Dispute Engine — Autonomous Dossier Generation",
    impacted_channels: ["USPS Priority", "FedEx Home Delivery", "UPS Ground"],
    actionable_recommendation: "Automatically sync postal tracking scans to PayPal Disputes v1 API to maintain a >85% win probability."
  },
  {
    id: "DISPATCH-2026-089",
    headline: "Porch Pirate Epidemic: When 'Delivered' Scans Aren't Enough Without Postal Code Matching",
    summary: "Carriers misdelivering to adjacent postal zones leave merchants vulnerable. PayPal dispute arbiters require GPS delivery coordinates or exact zip code match to confirm seller defense.",
    category: "SHIPPING_LOGISTICS",
    severity: "CRITICAL",
    published_at: "3 hours ago",
    mitigation_rule: "Autonomous Geocoding Cross-Check on Carrier Delivery Events",
    impacted_channels: ["Last-Mile Delivery", "Regional Couriers"],
    actionable_recommendation: "Validate carrier delivery postal code against transaction shipping address before accepting claims."
  },
  {
    id: "DISPATCH-2026-090",
    headline: "USPS vs FedEx vs UPS: Signature Confirmation Thresholds That Actually Hold Up in Arbitration",
    summary: "Orders above $750 require physical signature proof under PayPal Seller Protection terms. Missing signature proof on high-ticket orders results in automatic claim forfeiture.",
    category: "SHIPPING_LOGISTICS",
    severity: "ELEVATED",
    published_at: "6 hours ago",
    mitigation_rule: "RULE_2_AMOUNT_ZSCORE_STEP_UP & Signature Auto-Enforcement",
    impacted_channels: ["High-Value Electronics", "Jewelry Retail"],
    actionable_recommendation: "Automatically flag orders >$750 to mandate carrier adult signature confirmation at checkout."
  },
  {
    id: "DISPATCH-2026-091",
    headline: "Cross-Border Transit Lags: Handling 45-Day Customs Holds Without Triggering Buyer Chargebacks",
    summary: "International shipments held in customs often prompt impatient buyers to file premature claims. Proactive carrier tracking telemetry updates sent to PayPal prevent premature dispute escalation.",
    category: "SHIPPING_LOGISTICS",
    severity: "LOW",
    published_at: "Yesterday",
    mitigation_rule: "Automated Customs Hold Telemetry Ingestion & Dispute Deferral",
    impacted_channels: ["DHL Express", "EMS Global", "Border Logistics"],
    actionable_recommendation: "Ingest carrier transit milestone webhooks to notify buyers and defer dispute windows during inspection."
  },

  // Issue 3: Payments & Currency Rails (The $15 Fee Reality)
  {
    id: "DISPATCH-2026-074",
    headline: "The $15 Fee Trap: Why Fighting a $12 Claim Mathematically Destroys Merchant Margins",
    summary: "PayPal assesses a non-refundable $15 fee on contested claims regardless of outcome. Independent data shows store owners lose more capital fighting cheap claims than immediately conceding.",
    category: "PAYMENTS_RAILS",
    severity: "ELEVATED",
    published_at: "1 hour ago",
    mitigation_rule: "PayShield Net EV Model: Auto-Concede Claims with Negative Expected Value",
    impacted_channels: ["Multi-Currency Rails", "Digital Downloads", "Low-Dollar Goods"],
    actionable_recommendation: "Only contest chargebacks when (P_win × Amount) > $15.00 to guarantee net positive recovery."
  },
  {
    id: "DISPATCH-2026-075",
    headline: "GBP/USD Currency Conversion Arbitrage: How Synthetic Buyer Rings Exploit FX Spreads",
    summary: "Fraud rings exploit volatile currency conversion spreads on multi-currency PayPal invoices. Spreads diverging >3% from institutional mid-market benchmarks indicate high-risk arbitrage.",
    category: "PAYMENTS_RAILS",
    severity: "CRITICAL",
    published_at: "4 hours ago",
    mitigation_rule: "RULE_3_PROB_ELEVATED_STEP_UP_AUTH & fx_spread Feature Weighting",
    impacted_channels: ["Multi-Currency Invoicing", "Cross-Border Goods"],
    actionable_recommendation: "Trigger 3-D Secure biometric step-up whenever invoice rate diverges >3% from benchmark."
  },
  {
    id: "DISPATCH-2026-076",
    headline: "Interchange & Dispute Overhead: The Hidden Costs That Drain Small Business Reserves",
    summary: "Beyond dispute fees, payment processors assess elevated interchange surcharges on merchants exceeding 1.0% dispute-to-sales ratios. Keeping ratios below 0.5% saves 80 bps on gross volume.",
    category: "PAYMENTS_RAILS",
    severity: "ELEVATED",
    published_at: "7 hours ago",
    mitigation_rule: "Pre-Capture Risk Scoring to Cap Dispute Ratios Below 0.40%",
    impacted_channels: ["Payment Gateways", "Merchant Accounts"],
    actionable_recommendation: "Filter high-risk authorizations pre-capture to protect merchant tier status and interchange rates."
  },
  {
    id: "DISPATCH-2026-077",
    headline: "The Net EV Formula: How Math Beats Emotion When Responding to Low-Dollar Claims",
    summary: "Store founders often fight claims out of principle, losing money in fees. The Expected Value equation EV = (P_win × Amount) - $15.00 removes guesswork and maximizes retained profit.",
    category: "PAYMENTS_RAILS",
    severity: "LOW",
    published_at: "Yesterday",
    mitigation_rule: "Deterministic Expected Value Calculator for Dispute Triage",
    impacted_channels: ["Merchant Operations", "Financial Forecasting"],
    actionable_recommendation: "Adopt algorithmic dispute triage to automatically accept claims below the economic threshold."
  },

  // Issue 4: The Bot Wave & AI (Monetizing Scrapers)
  {
    id: "DISPATCH-2026-052",
    headline: "Taming Automated Scrapers: Why CAPTCHAs Fail and How L402 Turns Crawlers into Paying Customers",
    summary: "Autonomous AI bots cannot solve visual puzzle captchas or enter credit card numbers. Implementing HTTP 402 with PayPal Orders v2 charges crawlers 5 cents per API call without human friction.",
    category: "BOT_WAVE",
    severity: "LOW",
    published_at: "2 hours ago",
    mitigation_rule: "L402 Protocol Gateway with PayPal Orders v2 Micro-Settlement",
    impacted_channels: ["Public Catalog APIs", "Threat Telemetry", "Merchant Inventory"],
    actionable_recommendation: "Replace hostile CAPTCHA blockers with L402 PayPal micropayment paywalls to monetize autonomous bot traffic."
  },
  {
    id: "DISPATCH-2026-053",
    headline: "Distributed LLM Scrapers Inundating Merchant Inventory Endpoints at 400 Requests/Sec",
    summary: "AI agents scouring the web for pricing and stock availability overwhelm e-commerce databases. Unprotected endpoints face degraded checkout performance for legitimate human customers.",
    category: "BOT_WAVE",
    severity: "CRITICAL",
    published_at: "5 hours ago",
    mitigation_rule: "Adaptive Rate Limiting with L402 PayPal Fallback Challenge",
    impacted_channels: ["Product Catalog", "Search APIs", "Stock Inquiries"],
    actionable_recommendation: "Route excessive bot traffic to L402 paywall to monetize computing overhead."
  },
  {
    id: "DISPATCH-2026-054",
    headline: "Beyond Cloudflare: Implementing HTTP 402 with PayPal Orders v2 for Programmatic Tolls",
    summary: "Traditional IP blocking fails against distributed residential proxy networks. Economic friction via cryptographic micro-captures forces bot operators to evaluate per-query economics.",
    category: "BOT_WAVE",
    severity: "ELEVATED",
    published_at: "8 hours ago",
    mitigation_rule: "Cryptographic HMAC Token Issuance via PayPal Orders v2",
    impacted_channels: ["API Gateways", "Microservices"],
    actionable_recommendation: "Issue signed HMAC bearer tokens valid for 30 minutes following confirmed PayPal micropayment."
  },
  {
    id: "DISPATCH-2026-055",
    headline: "The Agentic Economy: Preparing Merchant Checkout Rails for Autonomous AI Buyers",
    summary: "As consumer AI shopping agents execute autonomous purchases, merchants need machine-to-machine auth protocols that handle instant tokenized checkout without 2FA human friction.",
    category: "BOT_WAVE",
    severity: "LOW",
    published_at: "Yesterday",
    mitigation_rule: "Agentic Checkout Protocol with PayPal Pre-Authorized Captures",
    impacted_channels: ["Agentic Commerce", "Headless Checkout"],
    actionable_recommendation: "Implement standardized RFC 402 endpoints to accept payments from autonomous multi-agent shoppers."
  }
];

export const THREAT_CATEGORIES = [
  {
    id: "MERCHANT_CHRONICLES",
    name: "Merchant Chronicles",
    shortName: "Merchant Survival",
    icon: Shield,
    badge: "STORE SURVIVAL",
    description: "Real-world stories and battle-tested lessons from independent online merchants defending store margins.",
    detailedOverview: "When fraud strikes small online stores, the financial fallout goes far beyond the sticker price of the stolen goods. Independent store operators balance return fraud, wardrobing, and order redirection with razor-thin margins. PayShield synthesizes on-the-ground operational reports to build autonomous defense rules before chargeback spikes threaten merchant standing.",
    keyMetrics: [
      { label: "Return Fraud Exposure", value: "$14.2k avg/yr", tone: "negative" },
      { label: "Margin Recovery Rate", value: "84.2%", tone: "positive" },
      { label: "Active Defense Rules", value: "4 Enforced", tone: "neutral" }
    ]
  },
  {
    id: "SHIPPING_LOGISTICS",
    name: "Shipping & Logistics",
    shortName: "Delivery Proof",
    icon: ShieldCheck,
    badge: "POSTAL REALITY",
    description: "Navigating porch-pirates, postal carrier delays, and conclusive delivery scan defenses under PayPal Disputes v1.",
    detailedOverview: "In e-commerce dispute arbitration, postal proof is absolute. A carrier scan with recipient postal code verification provides conclusive defense under PayPal Seller Protection terms. When merchants fail to capture GPS delivery coordinates or signature thresholds on high-value orders (>$750), claims are automatically forfeited regardless of customer communication.",
    keyMetrics: [
      { label: "Postal Verification Rate", value: "98.7%", tone: "positive" },
      { label: "Signature Mandate Threshold", value: "$750 USD", tone: "neutral" },
      { label: "Dispute Claim Win Rate", value: "88.1%", tone: "positive" }
    ]
  },
  {
    id: "PAYMENTS_RAILS",
    name: "Payments & Currency Rails",
    shortName: "The $15 Fee",
    icon: DollarSign,
    badge: "FEE ECONOMICS",
    description: "The mathematical reality of PayPal dispute fees, international currency conversion spreads, and margin protection.",
    detailedOverview: "Every contested PayPal dispute incurs a non-refundable $15 fee. Contesting an uneconomic $12 claim with a 35% win rate yields a negative expected return of -$9.92. PayShield's algorithmic Net EV equation EV = (P_win × Amount) - $15.00 automatically concedes low-value claims, eliminating human emotional bias and saving merchants thousands in unnecessary arbitration fees.",
    keyMetrics: [
      { label: "PayPal Non-Refundable Fee", value: "$15.00 USD", tone: "negative" },
      { label: "Cost-Optimal Decision Cutoff", value: "0.40 EV", tone: "neutral" },
      { label: "Net EV Capital Saved", value: "+$147.30", tone: "positive" }
    ]
  },
  {
    id: "BOT_WAVE",
    name: "The Bot Wave & AI",
    shortName: "Monetizing Bots",
    icon: Zap,
    badge: "L402 PAYWALL",
    description: "Turning unwanted AI scraping bots and crawlers into paying API consumers via PayPal Orders v2 micropayments.",
    detailedOverview: "Traditional bot defense relies on CAPTCHAs that disrupt legitimate buyers while AI scrapers easily bypass them with residential proxy rotation. Under the L402 protocol, PayShield returns HTTP 402 Payment Required for automated crawler requests, requiring autonomous agents to settle a $0.05 PayPal micropayment to receive HMAC cryptographic access tokens.",
    keyMetrics: [
      { label: "Per-Query Bot Toll", value: "$0.05 USD", tone: "positive" },
      { label: "RFC Protocol Standard", value: "L402 / HTTP 402", tone: "neutral" },
      { label: "HMAC Token Expiry", value: "30 Minutes", tone: "neutral" }
    ]
  }
];
