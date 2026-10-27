# PayShield AI — Documentation Index

This directory contains technical documentation for PayShield AI. For the project overview, quick-start, and results summary see the root [README.md](../README.md).

## System documentation

| Document | What it covers |
| :--- | :--- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | The 3-stage causal pipeline (Trust Verdict → L402 Paywall → Dispute EV). |
| [DECISION_ENGINE.md](DECISION_ENGINE.md) | Why the 5-rule policy is deterministic, boundary conditions, and fail-safe proofs. |
| [EXPLAINABILITY.md](EXPLAINABILITY.md) | SHAP TreeExplainer math, additivity invariant (Δ < 1e-4), and human-readable grounds. |
| [PAYPAL_INTEGRATION.md](PAYPAL_INTEGRATION.md) | Orders v2, Disputes v1, webhook signature verification, and idempotency. |
| [PAYMENT_SECURITY.md](PAYMENT_SECURITY.md) | Webhook verification, idempotency keys, and append-only SHA-256 audit chaining. |
| [DEMO_GUIDE.md](DEMO_GUIDE.md) | Complete 3-minute video presentation script, timing cues, and click walkthrough. |

## Reading order for code reviewers

1. Root [README.md](../README.md) — project overview, quick-start, and results.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — how the 3 stages link together.
3. [DECISION_ENGINE.md](DECISION_ENGINE.md) — why a 0.20 threshold was chosen.
4. [EXPLAINABILITY.md](EXPLAINABILITY.md) — how we prove SHAP didn't hallucinate.
5. [PAYPAL_INTEGRATION.md](PAYPAL_INTEGRATION.md) — how the APIs are used.
