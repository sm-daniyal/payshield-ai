# PayShield AI — Decision Engine Specification

## 1. Separation of Concerns Principle

In consumer-grade AI wrappers, an LLM often decides both what is happening and what action to execute. In financial fraud prevention, this is unacceptable:
- LLMs hallucinate non-deterministic boundary responses.
- Black-box classifiers shift decision boundaries without auditability.

**PayShield AI implements strict separation of concerns:**
1. **LightGBM ML Model:** Solely responsible for predicting the risk probability $P(\text{fraud}) \in [0.0, 1.0]$.
2. **Deterministic Policy Engine:** Pure, stateless mathematical rules that map $(P, \text{amount\_usd})$ to bounded operational decisions.
3. **SHAP Explainer:** Mathematical attribution of the decision inputs that has zero write-authority over the action taken.

---

## 2. Cost-Optimal Threshold Formulation

The standard threshold of $0.50$ is suboptimal in payment networks because the asymmetric cost of a False Negative (chargeback fee + lost inventory) drastically exceeds the cost of a False Positive (customer friction).

Let:
- $C_{\text{FN}} = \text{Transaction Amount} + \$15.00 \text{ (PayPal Dispute Fee)}$
- $C_{\text{FP}} = \$2.50 \text{ (Friction / Drop-off Cost)}$

The expected loss function minimized over the validation set:
$$\mathcal{L}(\theta) = \sum_{i \in \text{FP}} C_{\text{FP}} + \sum_{j \in \text{FN}} (\text{Amount}_j + 15.00)$$

Empirical sweep over synthetic transaction distributions establishes $\theta^* = 0.40$ as the optimal operating cutoff.

---

## 3. Decision Matrix & Action Enumeration

Every transaction is evaluated against 5 discrete rules:

| Rule ID | Condition | Action | Operational Impact |
| :--- | :--- | :--- | :--- |
| `RULE_1` | $P < 0.20$ | `ALLOW` | Auto-capture immediately. No friction. |
| `RULE_2` | $0.20 \le P < 0.40$ | `ALLOW_WITH_MONITORING` | Auto-capture. Flagged for async post-auth anomaly polling. |
| `RULE_3` | $0.40 \le P < 0.65$ | `STEP_UP_VERIFICATION` | Trigger PayPal 3-D Secure / biometric step-up authentication. |
| `RULE_4` | $P \ge 0.65 \land \text{Amount} < \$500$ | `BLOCK_AND_FLAG_DISPUTE` | Reject authorization. Record evidence dossier to SQLite audit log. |
| `RULE_5` | $P \ge 0.65 \land \text{Amount} \ge \$500$ | `BLOCK_AND_FLAG_DISPUTE` | Critical block with priority escalation for manual merchant review. |

---

## 4. Invariants & Proof of Bounded Execution

1. **Completeness:** For any tuple $(P, A) \in [0, 1] \times [0, \infty)$, exactly one rule condition evaluates to `True`.
2. **Bounded Output Set:** $\text{Action} \in \{\text{ALLOW}, \text{ALLOW\_WITH\_MONITORING}, \text{STEP\_UP\_VERIFICATION}, \text{BLOCK\_AND\_FLAG\_DISPUTE}\}$.
3. **No Dynamic Code Execution:** Rules are hard-coded deterministic branch conditions, structurally immune to prompt injection or model drift.
