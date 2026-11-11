# API Routing Contract

## Overview
FastAPI controller layer defining the RESTful interface for transaction risk scoring, L402 machine commerce, dispute recovery automation, threat intelligence feeds, and PayPal webhook ingestion.

## Interface
- `POST /api/v1/evaluate`: Ingests `TransactionEvaluationRequest`, coordinates feature extraction, runs calibrated LightGBM scoring, generates grounded SHAP values, evaluates policy, commits to audit vault, and returns `TransactionEvaluationResponse`.
- `GET /api/v1/l402/threat-feed`: Paywalled threat feed endpoint. Returns `HTTP 402 Payment Required` challenge if unauthenticated; returns intelligence feed if valid HMAC bearer token is presented.
- `POST /api/v1/l402/payment-request`: Mints a new L402 payment challenge for autonomous agents.
- `GET /api/v1/l402/challenge`: Returns active L402 payment offers and accepted rails (PayPal, Razorpay).
- `POST /api/v1/disputes/evaluate`: Assesses expected value for incoming disputes across merchant tiers ($15 standard, $30 advanced, $0 enterprise).
- `POST /api/v1/disputes/{dispute_id}/submit`: Dispatches compiled evidence dossier to PayPal Disputes v1 API.
- `GET /api/v1/audit/transactions`: Returns chronological transaction audit stream with SHA-256 hashes.
- `GET /api/v1/audit/disputes`: Returns audit stream of dispute decisions.
- `GET /api/v1/threats`: Returns open telemetry and scraper metrics.
- `POST /api/v1/webhooks/paypal`: Ingests and verifies PayPal webhook events with cryptographic certificate checks and idempotency locks.

## Invariants
- Pydantic Validation: All request payloads are strictly validated before hitting application logic.
- Idempotency Guarantee: Inbound webhook transmissions are deduplicated via SQLite unique key constraints.
- Uniform Error Handling: All unhandled exceptions return structured RFC-7807 compliant error envelopes.

## Side Effects
- Spawns background audit writes to SQLite.
- External calls to PayPal Sandbox for order validation and evidence submission.

## Verification
- Run: `pytest tests/test_webhooks.py tests/test_paypal_and_disputes.py`
