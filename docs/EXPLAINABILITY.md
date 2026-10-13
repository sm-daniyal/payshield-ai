# PayShield AI — Grounded SHAP Explainability & Additivity Verification

## 1. Zero-Hallucination Explainability Invariant

Black-box explanations and generic LLM summaries are untrusted in regulated financial workflows.
PayShield AI uses direct mathematical tree-attribution via **SHAP (SHapley Additive exPlanations)** with a cryptographic additivity check.

### Mathematical Invariant (Platt Sigmoidal / Margin Additivity):
For every inference request evaluated through `shap.TreeExplainer`:
$$\text{Expected Value (Base Bias)} + \sum_{i=1}^{M} \phi_i(x) = f(x)$$

Where:
- $\phi_0$ is the base expected value of the model prior to conditioning on feature values.
- $\phi_i(x)$ is the Shapley attribution value for feature $i$.
- $f(x)$ is the model's raw unconstrained prediction margin.

Transformed to calibrated probability space:
$$\left| P_{\text{calibrated}} - \sigma\left(\text{base\_bias} + \sum_{i=1}^M \phi_i(x)\right) \right| < 10^{-4}$$

If the discrepancy $\Delta \ge 10^{-4}$, the evaluation is rejected as an ungrounded inference failure.

---

## 2. Feature Contributions Breakdown

The 7-dimensional feature vector mapped by SHAP:

1. `amount_zscore`: Magnitude of order amount relative to buyer's historical mean and standard deviation.
2. `velocity_1h`: High-frequency card-testing bursts in rolling 60-minute window.
3. `velocity_24h`: Daily transaction spikes.
4. `velocity_7d`: Weekly anomaly baseline shift.
5. `fx_spread`: Spread between applied FX rate and institutional mid-market benchmark.
6. `geo_mismatch`: Binary shipping country vs. IP-resolved geolocation discrepancy.
7. `account_risk_score`: Structural age, verification status, and prior dispute track record.

---

## 3. Directional Attribution Protocol

In the PayShield AI UI and API payload:
- **Positive SHAP ($\phi_i > 0$):** Pushes risk score upwards (fraud indicator).
- **Negative SHAP ($\phi_i < 0$):** Suppresses risk score downwards (trust indicator).
- **Relative Percentage:** Computed as $|\phi_i| / \sum_j |\phi_j|$ for intuitive waterfall rendering.
