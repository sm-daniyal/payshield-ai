# PayShield AI — System Architecture

## 1. Problem Definition

PayPal merchants processing global transactions face three categories of financial loss:

1. **Chargeback and dispute fees:** PayPal charges a non-refundable $15.00–$20.00 dispute fee per transaction lost, compounding the cost of fraud.
2. **Black-box fraud blocks:** Rule-based fraud filters produce unexplainable `BLOCK` decisions, causing legitimate customer friction and revenue loss.
3. **Cross-border currency and geolocation risk:** International transactions introduce FX manipulation, IP spoofing, and shipping fraud vectors absent from domestic payment systems.

---

## 2. Pipeline Architecture

```
PayPal Checkout Webhook / Sandbox Order Event (JSON)
                    │
                    ▼
      FastAPI Request Validation (Pydantic v2)
      - Typed TransactionEvaluationRequest schema
      - Automatic rejection of malformed payloads
                    │
                    ▼
      Leakage-Safe Feature Engineering Pipeline
      (app.engine.feature_pipeline)
      - amount_zscore: z = (x - mu_buyer) / sigma_buyer
      - velocity_1h, velocity_24h, velocity_7d: rolling counts
      - fx_spread: |actual_rate - mid_market| / mid_market
      - geo_mismatch: shipping_country != ip_country (binary)
      - account_risk_score: f(age, verified, disputes) in [0, 1]
                    │
                    ▼
      LightGBM Model Inference
      (app.engine.model_runner)
      - candidate_lgbm_v1.pkl (Platt-calibrated)
      - Output: probability in [0, 1]
      - Risk score = probability * 100
                    │
          ┌─────────┴────────────────────┐
          ▼                              ▼
  Risk Score (0–100)       Grounded SHAP Explainability
                           (app.engine.shap_explainer)
                           - shap.TreeExplainer
                           - Additivity verification:
                             base_bias + sum(shap) == prob
                             (delta < 1e-4)
          │                              │
          └──────────────┬───────────────┘
                         ▼
          Deterministic 5-Rule Decision Engine
          (app.engine.decision_engine)
          - Threshold: 0.40 (cost-optimal)
          - Actions: ALLOW | ALLOW_WITH_MONITORING |
                     STEP_UP_VERIFICATION | BLOCK_AND_FLAG_DISPUTE
                         │
         ┌───────────────┴────────────────────┐
         ▼                                    ▼
   SQLite Audit Store               PayPal Sandbox REST API
   (app.db.audit_store)             (app.paypal.client)
   - Immutable decision log         - Orders v2
   - SHA-256 record hash            - Disputes v1
         │                          - Webhooks
         ▼
   React 19 Dashboard
   - Live transaction feed
   - SHAP waterfall visualization
   - Dispute recovery queue
```

---

## 3. Leakage-Safe Feature Engineering

Every feature is computed exclusively from data available **before** the current transaction.
The current transaction's outcome is never used at feature extraction time.

| Feature | Formula / Logic | Risk Signal |
| :--- | :--- | :--- |
| `amount_zscore` | `(x - mean(prior)) / std(prior)` | Sudden spike above buyer's baseline |
| `velocity_1h` | Count of prior tx in past 3600s | Card-testing attack detection |
| `velocity_24h` | Count of prior tx in past 86400s | High-frequency fraud bursts |
| `velocity_7d` | Count of prior tx in past 604800s | Weekly pattern anomaly |
| `fx_spread` | `|actual - mid_market| / mid_market` | Currency manipulation |
| `geo_mismatch` | `shipping_country != ip_country` | Shipping fraud |
| `account_risk_score` | `f(age_days, verified, dispute_count)` | Structural account risk |

---

## 4. SHAP Additivity Invariant

Every inference call verifies:

```
base_bias + sum(shap_values) == predicted_probability    (delta < 1e-4)
```

If this invariant is violated, the response is rejected with HTTP 500 and logged.
This guarantees that every displayed feature attribution is mathematically grounded
and cannot be a hallucinated explanation.

---

## 5. Deterministic Policy Engine

The ML model predicts probability only. The policy engine maps `(probability, amount_usd)` to a bounded action. The AI is **structurally incapable** of producing an action outside these 5 rules.

| Rule | Condition | Action |
| :---: | :--- | :--- |
| 1 | `probability < 0.20` | `ALLOW` |
| 2 | `0.20 <= probability < 0.40` | `ALLOW_WITH_MONITORING` |
| 3 | `0.40 <= probability < 0.65` | `STEP_UP_VERIFICATION` |
| 4 | `probability >= 0.65` and `amount_usd < 500` | `BLOCK_AND_FLAG_DISPUTE` |
| 5 | `probability >= 0.65` and `amount_usd >= 500` | `BLOCK_AND_FLAG_DISPUTE` (priority escalation) |

Threshold 0.40 is selected by minimizing the total cost function:

```
Total Cost = (FP_count × friction_cost_per_block) + (FN_count × (order_value + $15_paypal_dispute_fee))
```

---

## 6. Dispute Recovery Agent

Triggered when a `PAYMENT.SALE.REVERSED` or `CUSTOMER.DISPUTE.CREATED` webhook arrives from PayPal.

**Economics model:**
```
Expected Net Recovery = (P_win × dispute_amount_usd) - $15.00
```

- If `Expected Net Recovery > 0`: proceed to evidence compilation and PayPal API submission.
- If `Expected Net Recovery <= 0`: auto-write-off (uneconomic to fight).
- If `P_win >= 0.40` but borderline: escalate to merchant review queue.

---

## 7. Audit Trail

Every evaluation result is persisted to SQLite with:
- Transaction ID, timestamp, feature vector (JSON), risk score, decision action
- SHA-256 hash of the full record for tamper detection
- Additivity delta (proof that the SHAP explanation is grounded)
