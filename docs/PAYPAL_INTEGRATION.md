# PayShield AI — PayPal Integration Specification

## 1. Scope of PayPal Platform Integration

PayShield AI integrates natively with three primary PayPal REST API resources and Webhook streaming:

| Resource | Version | Endpoints Used | Operational Purpose |
| :--- | :--- | :--- | :--- |
| **OAuth 2.0 Auth** | `v1` | `POST /v1/oauth2/token` | Secure bearer token issuance with TTL caching. |
| **Orders API** | `v2` | `GET /v2/checkout/orders/{id}` | Telemetry extraction for pre-capture risk scoring. |
| **Disputes API** | `v1` | `GET /v1/customer/disputes/{id}`, `POST /v1/customer/disputes/{id}/provide-evidence` | Autonomous evidence compilation & submission. |
| **Webhooks** | `v1` | `POST /api/v1/paypal/webhook` | Asynchronous ingestion of order approvals and chargeback events. |

---

## 2. Webhook Event Routing

PayShield AI's listener processes incoming events:

```
                          PayPal Webhook Event
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   CHECKOUT.ORDER.APPROVED                   CUSTOMER.DISPUTE.CREATED
   PAYMENT.CAPTURE.COMPLETED                 PAYMENT.SALE.REVERSED
              │                                         │
              ▼                                         ▼
   Pre-Capture Risk Radar                    Autonomous Recovery Agent
   (LightGBM + SHAP + Policy)                (Vasuli Dispute Economics)
              │                                         │
              ▼                                         ▼
   Action: ALLOW / BLOCK / STEP-UP           Action: PROCEED / WRITE-OFF
              │                                         │
              └────────────────────┬────────────────────┘
                                   ▼
                       SQLite Tamper-Proof Audit
                         (SHA-256 Record Hash)
```

---

## 3. Dispute Recovery Economics (Vasuli Pattern)

PayPal assesses a non-refundable dispute fee of **$15.00 USD** on contested chargebacks. Contesting an unrecoverable dispute results in double loss: lost transaction amount + $15.00 dispute penalty.

### Economic Formulation:
$$\text{Expected Net Recovery} = (P_{\text{win}} \cdot \text{Dispute Amount}) - \$15.00$$

### Decision Boundaries:
1. **$P_{\text{win}} \ge 0.60 \land \text{Expected Net Recovery} > 0$:**
   Action: `PROCEED_DIRECT_DISPUTE`
   PayShield AI automatically constructs a structured evidence dossier containing carrier proof of delivery, AVS/CVV matching, and customer logs, then submits via `POST /v1/customer/disputes/{id}/provide-evidence`.

2. **$0.40 \le P_{\text{win}} < 0.60 \land \text{Expected Net Recovery} > 0$:**
   Action: `ESCALATE_MANUAL_REVIEW`
   Borderline recovery is placed into the operator queue for human approval.

3. **$\text{Expected Net Recovery} \le 0$:**
   Action: `AUTO_WRITE_OFF_UNECONOMIC`
   Protects merchant capital by rejecting unrecoverable disputes immediately, avoiding administrative overhead and subsequent penalties.
