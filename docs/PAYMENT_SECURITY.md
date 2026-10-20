# PayShield AI — Payments Security Architecture

**Cryptographic Integrity, Idempotency, and Fail-Closed Security for FinTech Workflows.**

---

## 1. Security Overview

Payment gateways and autonomous agent platforms represent high-value targets for credential stuffing, replay attacks, webhook spoofing, and audit record tampering. PayShield AI enforces a **zero-trust, fail-closed security architecture** across all financial interfaces.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PAYSHIELD SECURITY INVARIANTS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Fail-Closed Webhook Verification                                        │
│     All state mutations require positive PayPal signature confirmation.     │
│                                                                             │
│  2. Request Idempotency (PayPal-Request-Id)                                 │
│     Every mutating POST includes a unique idempotency key to prevent double │
│     charging or duplicate dispute submissions.                              │
│                                                                             │
│  3. Cryptographic Append-Only Audit Chaining                                │
│     Every evaluation is committed to SQLite with SHA-256 hash chaining.     │
│                                                                             │
│  4. Constant-Time HMAC-SHA256 Token Verification                            │
│     L402 bearer tokens are validated with hmac.compare_digest() to prevent   │
│     timing attacks.                                                         │
│                                                                             │
│  5. Strict Secrets Isolation                                                │
│     Zero secrets in code, repositories, Docker layers, or git history.      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Inbound Webhook Verification & Fail-Closed Behavior

Attackers can attempt to spoof `PAYMENT.CAPTURE.COMPLETED` or `CUSTOMER.DISPUTE.CREATED` webhooks to trick the decision engine into releasing goods or auto-conceding funds.

### Verification Protocol

Every webhook received at `/api/v1/paypal/webhook` is verified against PayPal's verification service:

```
Inbound HTTP POST /api/v1/paypal/webhook
                    │
                    ▼
Extract Security Headers:
- paypal-transmission-id
- paypal-transmission-time
- paypal-cert-url
- paypal-auth-algo
- paypal-transmission-sig
                    │
                    ▼
Call PayPal REST API:
POST /v1/notifications/verify-webhook-signature
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
   [ SUCCESS ]               [ FAILURE / TIMEOUT ]
   Proceed to Event Routing  Immediate HTTP 401 Unauthorized
                             Write Security Alert to Audit Store
                             HALT: Zero State Mutation
```

### Security Invariants

1. **Certificate URL Validation:** `paypal-cert-url` is verified to originate strictly from `https://api.paypal.com` or `https://api.sandbox.paypal.com`. Arbitrary external URLs are rejected.
2. **Network Timeout Guard:** Network requests to PayPal's verification service are bounded by a strict 5.0-second timeout. If the request times out or PayPal returns a 5xx error, the webhook **fails closed** (returns HTTP 400/401).
3. **Zero Mutation Pre-Verification:** No transaction state, dispute queue, or audit record is updated before signature verification completes successfully.

---

## 3. Idempotency Key Architecture (`PayPal-Request-Id`)

Network instability, carrier retry loops, and distributed queuing systems can dispatch identical requests multiple times. Without idempotency, a single agent could be charged twice, or a dispute evidence dossier could be transmitted multiple times, triggering processor penalties.

### Implementation

Every outbound mutating request sent from PayShield AI to PayPal incorporates a unique `PayPal-Request-Id` header:

- **Orders v2 Creation & Capture:**
  ```python
  headers = {
      "Authorization": f"Bearer {access_token}",
      "Content-Type": "application/json",
      "PayPal-Request-Id": str(uuid.uuid4())
  }
  ```
  A unique UUIDv4 is assigned per agent transaction session. If a retry occurs due to network drop, PayPal recognizes the request ID and returns the cached transaction response without re-executing the capture.

- **Disputes v1 Evidence Submission:**
  ```python
  # Deterministic UUID prevents duplicate dossier submission
  evidence_request_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{dispute_id}-{status}"))
  headers["PayPal-Request-Id"] = evidence_request_id
  ```

---

## 4. Cryptographic Append-Only Audit Vault (SHA-256 Chaining)

In high-stakes financial operations, internal database logs can be vulnerable to rogue operators or compromised services modifying historical records to hide unauthorized actions.

PayShield AI implements **cryptographic hash chaining** within its SQLite audit vault (`app.db.audit_store`):

### Mathematical Formulation

Let $R_n$ be the $n$-th audit record comprising:

```math
R_n = (\text{tx}_{n}, \text{timestamp}_n, \text{amount}_n, P_{\text{fraud}, n}, \text{action}_n, \Delta_{\text{additivity}, n})
```

The cryptographic digest $H_n$ for record $n$ is defined recursively:

```math
H_0 = \text{SHA-256}(\text{"PAYSHIELD-GENESIS-BLOCK-2026"})
```
```math
H_n = \text{SHA-256}(H_{n-1} \parallel \text{CanonicalJSON}(R_n))
```

Where $\parallel$ denotes byte-level string concatenation and $\text{CanonicalJSON}$ guarantees deterministic key serialization without whitespace discrepancies.

### Tamper-Detection Algorithm

At any point, an external auditor or compliance service can verify the entire ledger in $O(N)$ time:

```python
def verify_audit_chain(records: list[AuditRecord]) -> bool:
    prev_hash = GENESIS_HASH
    for r in records:
        expected_hash = hashlib.sha256(f"{prev_hash}|{r.canonical_str()}".encode()).hexdigest()
        if r.record_hash != expected_hash:
            # Tampering detected: record has been altered, inserted, or deleted
            return False
        prev_hash = r.record_hash
    return True
```

If any single byte of a prior transaction score, rule action, or timestamp is modified, all subsequent hashes in the chain break immediately, alerting compliance monitors.

---

## 5. L402 Machine-to-Machine Authentication Security

The L402 gateway monetizes autonomous AI crawlers through cryptographic HMAC-SHA256 bearer tokens:

1. **HMAC Signing:**
   Tokens are minted using a server-side secret key $K_{\text{secret}}$:

```math
\text{Signature} = \text{HMAC-SHA256}(K_{\text{secret}}, \text{payment-context} \parallel \text{expiry-timestamp})
```
```math
\text{Bearer Token} = \text{l402} \parallel \text{Hex}(\text{Signature})
```

2. **Constant-Time Verification:**
   Token validation uses constant-time string comparison (`hmac.compare_digest`) to completely neutralize side-channel timing attacks:
   ```python
   is_valid = hmac.compare_digest(provided_token, expected_token)
   ```

3. **Time-Bounded Expiry (TTL):**
   Tokens enforce a strict 30-minute time-to-live (TTL). Expired tokens are immediately invalidated, forcing agents to purchase new micro-tokens ($0.05 USD).

---

## 6. Secret Isolation & Credential Sanitation

- **No Hardcoded Credentials:** The codebase contains zero production or sandbox client secrets. All authentication parameters (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`) are injected strictly via environment variables at runtime.
- **Docker Layer Protection:** `.dockerignore` excludes `.env`, `audit_data`, `.venv`, and `payshield_audit.db` to prevent secret leakage in container image layers.
- **Mock Fallback Isolation:** In test and demonstration environments, the system falls back to sandboxed mock runners without requiring live credentials.
