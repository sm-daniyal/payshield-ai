# PayShield AI — Documentation Index

This directory contains technical documentation for PayShield AI. For the project overview, quick-start, and results summary see the root [README.md](../README.md).

## System documentation

| Document | What it covers |
| :--- | :--- |
| [ARCHITECTURE.md](architecture.md) | The 3-stage causal pipeline (Trust Verdict → L402 Paywall → Dispute EV). |
| [DECISION_ENGINE.md](decision_engine.md) | Why the 5-rule policy is deterministic, boundary conditions, and fail-safe proofs. |
| [EXPLAINABILITY.md](explainability.md) | SHAP TreeExplainer math, additivity invariant (Δ < 1e-4), and human-readable grounds. |
| [PAYPAL_INTEGRATION.md](paypal_integration.md) | Orders v2, Disputes v1, webhook signature verification, and idempotency. |
| [PAYMENT_SECURITY.md](payment_security.md) | Webhook verification, idempotency keys, and append-only SHA-256 audit chaining. |

## Reading order for code reviewers

1. Root [README.md](../README.md) — project overview, quick-start, and results.
2. [ARCHITECTURE.md](architecture.md) — how the 3 stages link together.
3. [DECISION_ENGINE.md](decision_engine.md) — why a 0.20 threshold was chosen.
4. [EXPLAINABILITY.md](explainability.md) — how we prove SHAP didn't hallucinate.
5. [PAYPAL_INTEGRATION.md](paypal_integration.md) — how the APIs are used.
