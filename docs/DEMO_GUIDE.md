# PayShield AI — 3-Minute Demo Video Guide

This guide provides the exact click-by-click flow, timing cues, and spoken talking points for recording the hackathon demo submission video.

---

## Video Specifications
- **Target Duration:** 2:45 to 3:00 minutes (strict).
- **Resolution:** 1080p (1920x1080) at 60 FPS.
- **Audio:** Clear voiceover with zero background noise.
- **Prerequisites:**
  - Backend running: `uvicorn app.main:app --reload --port 8000`
  - Frontend running: `npm run dev` at `http://localhost:5173`
  - PayPal Sandbox active.

---

## Timeline & Script Breakdown

### 0:00 – 0:30 | The Hook & Problem Statement
* **Screen:** Landing page (`http://localhost:5173`) showing stats bar and headline.
* **Voiceover:**
  > "PayPal merchants lose billions to three silent revenue leaks:
  > 1. Automated card-testing bots that probe stolen cards on checkout endpoints.
  > 2. AI scrapers and web crawlers that consume server bandwidth without paying.
  > 3. The non-refundable $15 PayPal dispute fee, which turns low-value chargeback defense into guaranteed losses.
  > PayShield AI solves all three in a single autonomous pipeline on PayPal rails."
* **Action:** Click **"Launch Dashboard"** to enter the app.

---

### 0:30 – 1:15 | Module 1: Risk Radar (Pre-Transaction Trust Scoring)
* **Screen:** Risk Radar view with preset cards and live SHAP analytics.
* **Voiceover:**
  > "First, our pre-transaction Risk Radar. Every incoming order is scored by a calibrated LightGBM model in under 50 milliseconds before payment clearing."
* **Action:** Click **"Carding ($480)"** preset and hit **"Inject Transaction"**.
* **Voiceover:**
  > "Notice the result: A calibrated risk score of 98.7, triggering an immediate BLOCK decision. 
  > More importantly, our model isn't a black box. Below, we generate mathematical SHAP feature attributions with guaranteed additivity proof, showing the merchant exactly why the order was blocked — extreme velocity and geo-mismatch."

---

### 1:15 – 1:55 | Module 2: L402 Tollgate (Agentic Monetization)
* **Screen:** Navigate to **L402 Tollgate** in the sidebar.
* **Voiceover:**
  > "Next, instead of blocking legitimate AI agents, PayShield monetizes them using the HTTP 402 protocol adapted for PayPal Orders v2."
* **Action:** Click **"Simulate Unauthenticated Request"**.
* **Voiceover:**
  > "The crawler hits our threat bulletin API without a token and receives an HTTP 402 Payment Required challenge with a PayPal order offer."
* **Action:** Click **"Execute Autonomous PayPal Capture"**.
* **Voiceover:**
  > "The agent programmatically calls PayPal Orders v2, captures a 5-cent micropayment in the Sandbox, and receives an HMAC-SHA256 signed bearer token."
* **Action:** Click **"Unlock Protected Telemetry"**.
* **Voiceover:**
  > "The agent presents the bearer token and unlocks premium machine-readable data with zero human intervention."

---

### 1:55 – 2:35 | Module 3: Dispute Studio ($15 Fee Recovery Engine)
* **Screen:** Navigate to **Dispute Studio** in the sidebar.
* **Voiceover:**
  > "Third is our Autonomous Dispute Recovery Studio. PayPal assesses a mandatory $15 fee on contested claims. Fighting a $12 dispute with a 50% win probability guarantees a $9 loss."
* **Action:** Point to the low-value claim ($12.00).
* **Voiceover:**
  > "Our expected-value engine calculates the net recovery. For this $12 claim, EV is negative, so the system auto-writes it off, protecting merchant cash flow from the fee trap."
* **Action:** Point to the high-value dispute ($185.00) and click **"Generate Evidence Dossier & Transmit"**.
* **Voiceover:**
  > "For this $185 claim, EV is strongly positive with an 85% win rate. The engine autonomously compiles tracking numbers, carrier timestamps, and AVS matches, transmitting it directly to PayPal's Disputes v1 API."

---

### 2:35 – 3:00 | Audit Vault & Closing
* **Screen:** Navigate to **Audit Vault** in the sidebar.
* **Voiceover:**
  > "Finally, every single risk score, policy decision, and dispute submission is committed to an append-only ledger with cryptographic SHA-256 hash chaining for banking compliance.
  > PayShield AI is backed by 63 automated tests passing in CI, full PayPal Orders v2 and Disputes v1 integration, and is completely open source. Thank you!"

---

## Pro Tips for Recording
1. **Pacing:** Keep mouse movements smooth and intentional; don't jerk the cursor around.
2. **Zoom:** Use browser zoom at 100% or 110% for crisp, readable typography.
3. **Audio Quality:** Use a decent mic with low latency. Do a 15-second test recording first to verify levels.
