# PayShield AI Backend Blueprint

## System Overview
High-performance asynchronous backend service engineered with Python 3.12 and FastAPI. Powers pre-transaction fraud scoring in under 50ms, machine micropayment tollgates via the L402 HTTP 402 protocol, and autonomous dispute decisioning on PayPal rails.

## Subdirectories & System Boundaries
- [app](./app/README.md): Application source code containing API routers, decision engines, schemas, and database layers.
- [ml](./ml/README.md): Offline machine learning training pipelines, Platt calibration scripts, and holdout evaluation metrics.
- [tests](./tests): Comprehensive test suite covering feature leakage, SHAP additivity, webhooks, and payment clients.

## Global Invariants
- Sub-50ms Latency: ML inference and policy evaluation must complete within 50ms for synchronous checkout.
- Zero Future Leakage: Features must only use strictly prior transaction telemetry.
- Bounded Actions: Policy decisions are constrained to 4 immutable states (`ALLOW`, `ALLOW_WITH_MONITORING`, `STEP_UP_VERIFICATION`, `BLOCK_AND_FLAG_DISPUTE`).
- Cost-Optimal Operation: Threshold set to 0.20, minimizing total monetary cost against the empirical fraud matrix.
- Mathematical Grounding: SHAP additivity delta must strictly satisfy $\Delta < 10^{-4}$.

## Global Side Effects
- Writes every transaction score and dispute action to append-only SQLite audit ledger with SHA-256 chaining.
- Dispatches order captures and dispute evidence to PayPal Sandbox REST APIs.

## System Verification
- Run: `pytest tests/ -v`
