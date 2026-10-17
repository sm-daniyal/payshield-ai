# PayShield AI — PayPal Integration Specification

**Native Architecture for PayPal Orders v2, Disputes v1, Webhook Verification, and L402 Micropayments.**

---

## 1. Scope of PayPal Platform Integration

PayShield AI integrates natively with PayPal's REST platform across four core operational services:

| Resource | Version | Endpoints Used | Operational Function |
| :--- | :--- | :--- | :--- |
| **OAuth 2.0 Auth** | `v1` | `POST /v1/oauth2/token` | Issues short-lived access tokens with in-memory TTL caching and auto-refresh. |
| **Orders API** | `v2` | `GET /v2/checkout/orders/{id}`<br/>`POST /v2/checkout/orders` | Pre-capture telemetry extraction and L402 automated agent micro-captures ($0.05 USD). |
| **Disputes API** | `v1` | `GET /v1/customer/disputes/{id}`<br/>`POST /v1/customer/disputes/{id}/provide-evidence` | Post-capture dispute ingestion, economic triage, and autonomous dossier compilation. |
| **Webhooks API** | `v1` | `POST /v1/notifications/verify-webhook-signature`<br/>`POST /api/v1/paypal/webhook` | Cryptographic signature verification and real-time transaction event routing. |

---

## 2. Webhook Event Routing & Fail-Closed Invariant

```
                              PayPal Webhook Event
                                       │
                                       ▼
                  [/v1/notifications/verify-webhook-signature]
                   - transmission_id
                   - transmission_time
                   - cert_url
                   - auth_algo
                   - transmission_sig
                                       │
                      ┌────────────────┴────────────────┐
                      │ Signature Valid?                │
                      ▼                                 ▼
                   [ FAIL ]                          [ PASS ]
             Reject HTTP 401 / 400                      │
            Log Security Violation                      │
                                       ┌────────────────┴────────────────┐
                                       ▼                                 ▼
                            CHECKOUT.ORDER.APPROVED           CUSTOMER.DISPUTE.CREATED
                            PAYMENT.CAPTURE.COMPLETED         PAYMENT.SALE.REVERSED
                                       │                                 │
                                       ▼                                 ▼
                            Stage 1: Trust Radar              Stage 3: Dispute EV Engine
                            (LightGBM + Platt + SHAP)         (P_win × Amount - $15.00)
                                       │                                 │
                                       ▼                                 ▼
                            ALLOW / BLOCK / STEP_UP           PROCEED / AUTO_WRITE_OFF
                                       │                                 │
                                       └────────────────┬────────────────┘
                                                        ▼
                                            Append-Only Audit Vault
                                            (Chained SHA-256 Hashes)
```

### Fail-Closed Webhook Verification Protocol

Every inbound webhook is verified with PayPal's verification endpoint prior to any state mutation:

```python
verification_payload = {
    "transmission_id": headers.get("paypal-transmission-id"),
    "transmission_time": headers.get("paypal-transmission-time"),
    "cert_url": headers.get("paypal-cert-url"),
    "auth_algo": headers.get("paypal-auth-algo"),
    "transmission_sig": headers.get("paypal-transmission-sig"),
    "webhook_id": settings.PAYPAL_WEBHOOK_ID,
    "webhook_event": event_payload
}
```

- **Timeout Policy:** 5.0s maximum network timeout.
- **Fail-Closed Guarantee:** If PayPal's verification service times out, returns 5xx, or evaluates the signature as `FAILURE`, the webhook endpoint rejects the request with HTTP 401/400. **State mutation never occurs on unverified events.**

---

## 3. Idempotency Keys (`PayPal-Request-Id`)

Network retries and distributed webhook deliveries can duplicate order authorizations or dispute responses. To guarantee strict idempotency, every mutating HTTP POST request dispatched from PayShield AI to PayPal includes a unique idempotency header:

```http
POST /v2/checkout/orders HTTP/1.1
Host: api-m.sandbox.paypal.com
Authorization: Bearer <access_token>
Content-Type: application/json
PayPal-Request-Id: 62f1f983-589c-4d93-9ac8-eb8e5e28cc9e
```

- **Orders v2 Creation & Capture:** Unique UUIDv4 assigned per agent session to prevent double-charging autonomous bots.
- **Disputes v1 Evidence Submission:** Deterministic UUID derived as `UUID5(dispute_id, status)` to ensure duplicate transmissions are safely de-duplicated by PayPal's servers.

---

## 4. L402 Autonomous Bot Monetization Protocol

AI agents, web crawlers, and algorithmic shopping bots cannot solve visual CAPTCHA puzzles or execute 2-factor authentication. PayShield AI adopts the **L402 (RFC 402) Protocol** to transform unwanted scraping traffic into a profitable micropayment stream:

### Step 1: Challenge (`HTTP 402 Payment Required`)
When an unauthenticated agent requests protected threat intelligence or catalog data:
```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: L402 token_url="https://api.payshield.ai/api/v1/l402/payment-request"
Content-Type: application/json

{
  "version": "0.2.3",
  "status": 402,
  "payment_request_url": "https://api.payshield.ai/api/v1/l402/payment-request",
  "payment_context_token": "62f1f983-589c-4d93-9ac8-eb8e5e28cc9e",
  "offers": [
    {
      "id": "single_bulletin",
      "title": "Access Single Threat Vector Intel",
      "amount": 0.05,
      "currency": "USD",
      "payment_methods": ["paypal"]
    }
  ]
}
```

### Step 2: Autonomous Settlement (`PayPal Orders v2 CAPTURE`)
The agent transmits a POST request to `/api/v1/l402/payment-request`. PayShield AI executes a PayPal Orders v2 capture for `$0.05 USD` using stored sandbox or pre-authorized agent credentials.

### Step 3: Cryptographic Token Generation
Upon confirmed payment capture, PayShield AI mints a signed HMAC-SHA256 bearer token valid for 30 minutes:
$$\text{token} = \text{l402\_} \parallel \text{Hex}(\text{HMAC-SHA256}(K_{\text{server}}, \text{context\_token} \parallel \text{expiry}))$$

### Step 4: Unlocked Access (`HTTP 200 OK`)
The agent includes `Authorization: Bearer <l402_token>` on subsequent requests. PayShield AI validates the HMAC signature in constant time and returns structured telemetry.

---

## 5. Dispute Recovery Economics Model ($15.00 Fee)

PayPal assesses a non-refundable **$15.00 USD dispute fee** on every contested chargeback. Contesting an unrecoverable dispute results in compounding losses: the lost transaction value plus the $15.00 penalty.

### Expected Net Recovery Equation
$$\text{Expected Net Recovery} = (P_{\text{win}} \cdot \text{Dispute Amount}) - \$15.00$$

Where $P_{\text{win}} \in [0.0, 1.0]$ is estimated from historical claim types, carrier delivery validation, and AVS/CVV matching.

### Policy Boundaries

1. **Uneconomic Claims ($EV \le 0$):**
   - Action: `AUTO_WRITE_OFF_UNECONOMIC`
   - Example: A $14.50 charge with $P_{\text{win}} = 0.35$ yields $EV = (0.35 \times 14.50) - 15.00 = -\$9.925$.
   - Outcome: PayShield AI immediately concedes the dispute, saving the merchant the $15.00 fee.

2. **Actionable Recovery ($EV > 0$ and $P_{\text{win}} \ge 0.60$):**
   - Action: `PROCEED_DIRECT_DISPUTE`
   - Example: A $175.00 charge with verified USPS delivery confirmation yields $P_{\text{win}} = 0.78$ and $EV = (0.78 \times 175.00) - 15.00 = +\$121.50$.
   - Outcome: Autonomous dossier compiler packages carrier tracking scans and customer records, then calls `POST /v1/customer/disputes/{id}/provide-evidence`.

3. **Borderline Cases ($EV > 0$ and $0.40 \le P_{\text{win}} < 0.60$):**
   - Action: `ESCALATE_MANUAL_REVIEW`
   - Outcome: Enqueued to operator dashboard for human merchant determination.
