# PayShield AI — Design Document

## 1. Problem
PayPal merchants cannot distinguish legitimate AI agents from malicious bots
at checkout. This creates three compounding losses:

| Drain | Where | Cost |
|---|---|---|
| Card-testing fraud | Pre-capture | 175% YoY increase; bots = 80% of attacks |
| Dispute fee trap | Post-capture | $15 non-refundable; $30 high-volume; $20 chargeback |
| Unmonetized bot traffic | Between | 42% of web traffic; 65% malicious |

Root cause: no unified trust layer scores agent traffic, blocks the bad,
and monetizes the good — before the transaction executes.

## 2. Thesis
PayShield AI is the pre-transaction trust layer for agentic commerce.
One pipeline. Three causal stages. Remove stage 1, and nothing else works.

## 3. Pipeline

```mermaid
flowchart TD
    A[Inbound Agent Request<br/>User-Agent, IP, amount, history] --> B[Feature Pipeline<br/>7 leakage-safe signals]
    B --> C[LightGBM Trust Scorer<br/>Platt-calibrated P_fraud]
    C --> D[SHAP Explainer<br/>additivity sanity check]
    D --> E{Deterministic Policy<br/>5 rules, threshold 0.40}

    E -->|BLOCK| F[Audit + 403]
    E -->|STEP_UP| G[Audit + challenge]
    E -->|ALLOW| H[L402 Paywall check]
    E -->|MONITOR| H

    H -->|No token| I[HTTP 402 Payment Required<br/>PayPal Orders v2 offer]
    I --> J[Agent settles 0.05 USD<br/>PayPal Orders v2 CAPTURE]
    J --> K[HMAC-signed bearer token]
    K --> L[Unlock premium feed]

    H -->|Valid token| L

    L --> M[(Audit Vault<br/>append-only SQLite)]
    F --> M
    G --> M

    M --> N[React Dashboard<br/>4 tabs only]

    O[Inbound Dispute] --> P[EV Engine<br/>P_win × Amount - 15]
    P -->|EV ≤ 0| Q[Auto write-off]
    P -->|EV > 0 + confidence| R[Compile dossier]
    R --> S[PayPal Disputes v1<br/>provide-evidence]
    Q --> M
    S --> M