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
