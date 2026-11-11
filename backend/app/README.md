# PayShield AI Application Blueprint

## Overview
Core backend application package organizing the business logic, API controllers, machine learning inference engines, database persistence, and external payment network adapters.

## Subdirectories & Boundaries
- [api](./api/README.md): HTTP REST routing for evaluate, L402, disputes, threats, and webhooks.
- [engine](./engine/README.md): Feature extraction, LightGBM model runner, SHAP explainer, policy engine, and dispute recovery.
- [db](./db/README.md): SQLite append-only audit vault with SHA-256 block hash chaining.
- [paypal](./paypal/README.md): PayPal Orders v2 & Disputes v1 clients, with modular Razorpay fallback adapter.
- [schemas](./schemas/README.md): Pydantic v2 data models and type contracts.

## Local Interface & Invariants
- `main.py`: FastAPI factory initializing CORS middleware, lifespan events, audit database connection, and mounting routers.
- `config.py`: Pydantic settings loading configuration from environment (`.env`) with fail-safe defaults for sandbox execution.

## System Verification
- Run: `pytest tests/`
