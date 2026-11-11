# ML & Decision Engine Contract

## Overview
The analytical core of PayShield AI. Implements leakage-safe feature engineering, Platt-calibrated LightGBM inference, mathematically grounded SHAP attributions, cost-optimal deterministic policy enforcement, L402 machine-payment gatekeeping, and dispute expected-value calculations.

## Interface
- `feature_pipeline.py`:
  - `extract_features(request, history)`: Computes 7 strictly prior features (`amount_zscore`, `velocity_1h`, `velocity_24h`, `geo_mismatch`, `fx_spread_deviation`, `account_risk_score`, `amount_log`).
- `model_runner.py`:
  - `ModelRunner`: Loads serialized `payshield_lgbm_v1.pkl` and computes Platt-calibrated fraud probability ($P_{\text{fraud}} \in [0.0, 1.0]$).
- `shap_explainer.py`:
  - `GroundedShapExplainer`: Runs `shap.TreeExplainer` over tree leaves and verifies mathematical additivity ($\Delta < 10^{-4}$).
- `decision_engine.py`:
  - `evaluate_policy(prob, amount, features)`: Deterministic 5-rule policy engine operating at cost-optimal threshold 0.20, mapping to 4 bounded actions (`ALLOW`, `ALLOW_WITH_MONITORING`, `STEP_UP_VERIFICATION`, `BLOCK_AND_FLAG_DISPUTE`).
- `l402_gateway.py`:
  - `generate_l402_challenge()`: Issues HTTP 402 Payment Required challenge with $0.05 PayPal Orders v2 offer.
  - `issue_l402_token(offer_id, agent_id)`: Mints HMAC-SHA256 bearer token upon verified payment capture.
  - `verify_l402_token(token)`: Validates signature and expiration of bearer token.
- `dispute_recovery.py`:
  - `compute_win_probability(evidence)`: Heuristic and historical feature-weighted dispute win rate ($P_{\text{win}}$).
  - `evaluate_dispute_recovery(amount, evidence, tier)`: Calculates expected value ($EV = P_{\text{win}} \times \text{Amount} - \text{FilingFee}$) to autonomously concede negative EV claims or compile dossiers for positive EV claims.

## Invariants
- Separation of Concerns: The ML model strictly predicts probability; the Decision Engine strictly chooses actions. SHAP explanations cannot alter decisions.
- Additivity Seal: Every inference verifies $\text{base\_bias} + \sum \text{shap\_values} \equiv \text{raw\_score} \pm 10^{-4}$.
- Zero Feature Leakage: Features are calculated strictly from events occurring prior to transaction timestamp ($t < t_{\text{current}}$).

## Side Effects
- Loads serialized model artifact (`payshield_lgbm_v1.pkl`) into memory on startup.

## Verification
- Run: `pytest tests/test_feature_pipeline.py tests/test_ml_and_policy.py tests/test_l402_gateway.py`
