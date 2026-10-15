# PayShield AI

> **PayPal AI Hackathon 2026 | $69,750 Prize Pool**

Real-time, zero-hallucination transaction-risk scoring and autonomous dispute recovery engine for PayPal merchants.

[![CI Pipeline](https://github.com/sm-daniyal/payshield-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/sm-daniyal/payshield-ai/actions)

---

---

## The Problem: 3 Silent Drains on PayPal Merchants

Every online business accepting PayPal loses significant profit margins to three unaddressed problems:

1. **Checkout Fraud & Card Testing (Before Capture)**:
   Fraud rings buy stolen credit card lists and use automated bots to run rapid, low-dollar test purchases ($1–$2) on merchant checkouts. Traditional "AI wrappers" feed transactions into generative LLMs that **hallucinate** risk scores, violate financial compliance, and provide zero mathematical audit trails.

2. **The Non-Refundable $15.00 Dispute Fee Trap (After Capture)**:
   When a buyer files a claim (e.g. *Item Not Received*), PayPal assesses a **non-refundable $15.00 fee** on contested disputes—win or lose. 
   - Fighting a **$12.00 t-shirt** dispute is a guaranteed mathematical loss:
     $$\text{Expected Value} = (0.50 \times \$12.00) - \$15.00 = -\$9.00$$
     The merchant loses more money fighting than writing it off.
   - Conversely, for a **$200.00 order** where the merchant has carrier delivery proof, merchants often miss response deadlines and forfeit legitimate revenue.

3. **Unmonetized AI Bot & Scraper Traffic (The Data Drain)**:
   Autonomous AI crawlers and bots constantly scrape merchant catalogs and threat intelligence, draining server bandwidth for free. Traditional CAPTCHAs and credit card forms block bots entirely because bots cannot solve puzzles or type credit cards. Merchants lack a programmatic micropayment rail to monetize bot traffic.

---

## The Solution: PayShield AI

PayShield AI solves all three problems through a unified, mathematically certified architecture:

1. **Pre-Capture Risk Radar (Zero Hallucinations)**:
   - Platt-calibrated LightGBM model outputs certified probabilities $P(\text{fraud} \mid x) \in [0, 1]$ across 7 leakage-safe feature signals.
   - Grounded SHAP TreeExplainer certifies feature attributions with a mathematical **Additivity Seal** ($\Delta < 10^{-4}$).
   - Bounded by a deterministic 5-rule policy engine (`ALLOW`, `MONITOR`, `STEP_UP`, `BLOCK`).

2. **Autonomous Dispute Recovery Engine ($15 Fee Optimization)**:
   - Evaluates dispute viability: $\text{Expected Net Recovery} = (P_{\text{win}} \times \text{Amount}) - \$15.00$.
   - **Auto-writes off negative-EV claims** to save merchants from paying the non-refundable $15 fee.
   - **Autonomously compiles carrier tracking scans** (USPS/FedEx) and transmits defense dossiers directly to the **PayPal Disputes v1 API** for positive-EV claims.

3. **Threat Newsroom & L402 Agentic PayPal Paywall**:
   - Publishes real-time zero-day merchant fraud bulletins in a clean 4-column layout.
   - **Free browser access** for human merchants.
   - **HTTP 402 Payment Required paywall** for automated AI crawlers, programmatically charging **$0.05 USD micropayments via PayPal Orders v2 API** (`intent: CAPTURE`) to unlock the raw telemetry.


---

## Architecture

```
PayPal Checkout Webhook
        │
        ▼
Leakage-Safe Feature Pipeline (6 features)
        │
        ▼
LightGBM Inference (Calibrated Platt Sigmoidal)
        │
        ├──────────────────────────────────┐
        ▼                                  ▼
Risk Score (0–100)           Grounded SHAP Explanation
        │                                  │
        └──────────────────┬───────────────┘
                           ▼
           Deterministic 5-Rule Policy Engine
           (Cost-Optimal Threshold: 0.40)
                           │
              ┌────────────┴────────────────┐
              ▼                             ▼
       SQLite Audit Store         PayPal Disputes API
              │
              ▼
   React 19 Operator Dashboard
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Backend | Python 3.12, FastAPI, Pydantic v2 |
| ML | LightGBM, SHAP (TreeExplainer), Scikit-learn |
| Database | SQLite (audit log) |
| Frontend | React 19, Vite, Tailwind CSS |
| Testing | Pytest (100% passing) |
| CI/CD | GitHub Actions |
| APIs | PayPal Orders v2, Disputes v1, Transaction Search |

---

## Setup

```bash
# Clone and enter
git clone https://github.com/sm-daniyal/payshield-ai.git
cd payshield-ai

# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt

# Configure credentials
cp .env.example .env
# Fill in PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env

# Run tests
pytest tests/ -v

# Start API
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd ../frontend
npm install
npm run dev
```

---

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Full system architecture and pipeline specification.
- [`docs/DECISION_ENGINE.md`](docs/DECISION_ENGINE.md) — 5-rule policy table, boundary conditions, and fail-safe proofs.
- [`docs/EXPLAINABILITY.md`](docs/EXPLAINABILITY.md) — SHAP TreeExplainer math and additivity tolerance spec.
- [`docs/PAYPAL_INTEGRATION.md`](docs/PAYPAL_INTEGRATION.md) — PayPal Orders, Webhooks, and Disputes API mapping.
