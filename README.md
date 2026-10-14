# PayShield AI

> **PayPal AI Hackathon 2026 | $69,750 Prize Pool**

Real-time, zero-hallucination transaction-risk scoring and autonomous dispute recovery engine for PayPal merchants.

[![CI Pipeline](https://github.com/sm-daniyal/payshield-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/sm-daniyal/payshield-ai/actions)

---

## What It Does

PayShield AI protects PayPal merchants across the complete transaction lifecycle:

**1. Pre-Capture Risk Radar**
- Calibrated LightGBM model produces a 0–100 risk score on every PayPal checkout event.
- Grounded SHAP TreeExplainer provides mathematically verifiable feature attributions.
- Additivity invariant: `base_bias + sum(shap_values) == predicted_probability` (delta < 1e-4). Zero hallucinations.
- Deterministic 5-rule policy engine maps (risk_score, amount) to bounded actions.

**2. Autonomous Dispute Recovery Agent**
- Evaluates dispute viability: `Expected Net Recovery = (P_win × amount) - $15 PayPal fee`.
- Compiles evidence dossiers and submits directly to PayPal Disputes API.
- All irreversible actions staged for merchant approval (human-in-the-loop).

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
