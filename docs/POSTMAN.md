# Manual API Testing via Postman

We provide a Postman collection (`PayShield_AI.postman_collection.json`) at the root of the repository to allow judges to test the API endpoints independently of the frontend dashboard.

## Setup

1. Open Postman and click **Import**.
2. Select the `PayShield_AI.postman_collection.json` file from the root directory.
3. Ensure your local FastAPI server is running (`uvicorn app.main:app --reload`).

## Included Requests

### 1. Trust Verdict (`POST /api/v1/evaluate`)
Sends a transaction payload to the LightGBM model.

- **Expected Result:** A 200 OK response containing the calibrated risk score, SHAP feature attributions, and the deterministic policy action (`BLOCK_AND_FLAG_DISPUTE`).
- **Body:** Pre-filled with a simulated "Carding Burst" payload.

### 2. L402 Paywall Challenge (`GET /api/v1/l402/threat-feed`)
Hits the paywalled endpoint without a token.

- **Expected Result:** An HTTP 402 Payment Required response containing the PayPal L402 offer details and a `payment_context_token`.

### 3. L402 Settle Payment (`POST /api/v1/l402/payment-request`)
Submits the `payment_context_token` to simulate the PayPal Orders v2 capture.

- **Expected Result:** A 200 OK response with a `bearer_token`.

> **Note:** You must paste the token from Request #2 into the body of this request.
