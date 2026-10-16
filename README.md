# PayShield AI

> **PayPal AI Hackathon 2026**

PayShield AI is the pre-transaction trust layer for agentic commerce on PayPal. It scores AI agent traffic as legitimate or malicious, blocks card-testing bots, charges legitimate agents via an L402 PayPal paywall, and recovers disputed revenue through a policy-bounded expected value (EV) engine.

---

## The Problem: 3 Compounding Drains on PayPal Merchants

PayPal merchants cannot distinguish a legitimate AI agent from a malicious bot at checkout. This creates three compounding losses:

1. **Card-Testing Fraud (Pre-Capture)**:
   Fraudsters run rapid micro-purchases ($1–$2) through real merchant checkouts to validate stolen card numbers. Automated bots drive ~80% of these attacks. Traditional systems fail to score agent behavior deterministically before capture.

2. **The Non-Refundable $15.00 Dispute Fee Trap (Post-Capture)**:
   PayPal assesses a non-refundable $15.00 fee per contested dispute (doubling to $30 for high-volume merchants, with chargeback fees on top). Fighting a $12.00 dispute is a guaranteed loss:
   $$\text{Expected Value} = (0.50 \times \$12.00) - \$15.00 = -\$9.00$$
   Merchants lose capital fighting low-ticket claims out of principle, while forfeiting defensible high-ticket claims with valid carrier proof.

3. **Unmonetized AI Bot Traffic (Between)**:
   Autonomous AI agents scrape merchant catalogs and endpoints for free. Traditional CAPTCHAs fail because multimodal LLMs bypass visual challenges. Merchants have lacked a frictionless, programmatic micropayment rail to turn legitimate bot traffic into revenue.

**Root Cause**: No unified trust layer scores agent traffic, blocks malicious bots, and monetizes legitimate agents—before the transaction executes.

---

## The Solution: Causal 3-Stage Pipeline

PayShield AI operates as a unified, sequential trust pipeline. Remove Stage 1, and nothing else works.

```
Inbound Agent Request
        │
        ▼
[Stage 1: Trust Verdict] ──► LightGBM Scorer ──► Platt-Calibrated P_fraud ──► SHAP Sanity Check ──► Deterministic 5-Rule Policy
        │
        ├──► BLOCK    (Audit + HTTP 403)
        ├──► STEP_UP  (Audit + Challenge)
        └──► ALLOW / MONITOR
                 │
                 ▼
[Stage 2: L402 Paywall] ────► HTTP 402 Payment Required ──► Settle $0.05 USD (PayPal Orders v2 CAPTURE) ──► HMAC-Signed Bearer Token ──► Unlock Premium Feed
                 │
                 ▼
[Stage 3: Dispute EV Engine] (Post-Capture Inbound Disputes)
                 │
                 ├──► EV ≤ 0: (P_win × Amount - $15.00 ≤ 0) ──► Automatic Write-Off (Saves $15 Fee)
                 └──► EV > 0: (P_win × Amount - $15.00 > 0) ──► Compile Evidence Dossier ──► PayPal Disputes v1 provide-evidence
                 │
                 ▼
[(Append-Only Audit Log: SQLite with SHA-256 Chaining)]
```

### Stage 1 — Trust Verdict (The Entry Gate)
- **7 Leakage-Safe Features**: Extracted strictly from prior customer history (amount z-score, 1h/24h/7d velocity, FX spread deviation, geo-mismatch, composite account risk).
- **LightGBM Scorer**: Platt-calibrated probability $P(\text{fraud} \mid x) \in [0, 1]$.
- **SHAP Additivity Sanity Check**: TreeExplainer feature attributions mathematically checked against raw margin ($\Delta < 10^{-4}$).
- **Deterministic 5-Rule Policy Engine**: Outputting `ALLOW`, `MONITOR`, `STEP_UP`, or `BLOCK`. **No LLM in the decision path.**

### Stage 2 — L402 Paywall (The Differentiator)
- Gated entry: Only agents passing Stage 1 reach the paywall.
- Returns `HTTP 402 Payment Required` with PayPal payment context.
- Autonomous agent programmatically settles \$0.05 USD via **PayPal Orders v2 API** (`intent: CAPTURE`).
- Server validates settlement and issues an HMAC-signed bearer token, converting bot traffic into net-new merchant revenue.

### Stage 3 — Dispute EV Engine (The Financial Engine)
- Evaluates dispute viability: $\text{Expected Net Recovery} = (P_{\text{win}} \times \text{Amount}) - \$15.00$.
- **Negative EV**: Automatically written off to protect the merchant from the $15 non-refundable fee.
- **Positive EV**: Automatically compiles carrier delivery tracking and submits evidence dossiers directly to the **PayPal Disputes v1 API**.

### Append-Only Audit Log
- SQLite ledger recording all evaluations, policy verdicts, and dispute decisions.
- Records are signed with SHA-256 integrity hashes.

---

## React Dashboard (4 Tabs Only)

The operator console strictly mirrors the product thesis across four focused tabs:
1. **Risk Radar**: Real-time order telemetry, Platt-calibrated probabilities, SHAP attribution waterfalls, and policy decisions.
2. **L402 Tollgate**: Interactive machine-to-machine sandbox simulating autonomous HTTP 402 challenge, PayPal Orders v2 settlement, and HMAC bearer token issuance.
3. **$15 Disputes**: Financial dispute queue evaluating $(P_{\text{win}} \times \text{Amount}) - \$15.00$, automated write-offs, and one-click PayPal Disputes v1 submission.
4. **Audit Vault**: Append-only log of all transaction evaluations and dispute recovery events with SHA-256 verification.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, HTTPX |
| **ML Engine** | LightGBM (Platt-calibrated), SHAP (TreeExplainer), Scikit-Learn |
| **Storage** | SQLite (Append-only audit log) |
| **PayPal APIs** | Orders v2, Disputes v1, Webhook Signature Verification |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons |
| **Testing** | Pytest (Full suite passing) |

---

## Setup & Running Locally

### Backend Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows (.venv/bin/activate on Unix)
pip install -r requirements.txt

# Environment configuration
cp .env.example .env

# Run test suite
pytest tests/ -v

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
Accessible at `http://localhost:5173`.
