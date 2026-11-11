# Payment Rails & Integrations Contract

## Overview
Production-grade integration client for PayPal REST APIs (Orders v2 and Disputes v1) with an extensible, pluggable adapter for Razorpay Orders API for dual-rail global checkout.

## Interface
- `PayPalClient`: Asynchronous HTTP client wrapping PayPal Sandbox REST endpoints (`https://api-m.sandbox.paypal.com`).
  - `is_configured()`: Boolean flag verifying valid client credentials.
  - `get_access_token()`: OAuth2 client credentials flow with thread-safe token caching and automatic expiration refresh.
  - `create_order(amount, currency, reference_id)`: Generates PayPal Orders v2 checkout order.
  - `capture_order(order_id)`: Captures authorized PayPal order (used in L402 micropayment settlement).
  - `get_order(order_id)`: Fetches full order lifecycle details.
  - `get_dispute(dispute_id)`: Retrieves real-time dispute state from PayPal Customer Disputes v1 API.
  - `submit_dispute_evidence(dispute_id, evidence_dossier)`: Dispatches compiled evidence packet to PayPal Disputes API (`/v1/customer/disputes/{id}/provide-evidence`).
- `RazorpayClient`: Pluggable dual-rail adapter for Indian merchant routing.
  - `create_order(amount_inr, receipt_id)`: Creates Razorpay order for local currency settlement.
  - `verify_payment_signature(order_id, payment_id, signature)`: Validates HMAC-SHA256 signature.

## Invariants
- Zero Secret Hardcoding: Credentials are read strictly from runtime environment variables (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`).
- Webhook Signature Enforced: Inbound webhooks must be cryptographically validated before execution.
- Idempotent Dispatch: Dispute evidence submissions are tagged with unique transmission references.

## Side Effects
- Network I/O: External HTTPS calls to `api-m.sandbox.paypal.com` and `api.razorpay.com`.

## Verification
- Run: `pytest tests/test_paypal_and_disputes.py tests/test_webhooks.py`
