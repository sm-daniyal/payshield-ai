# AGENTS.md — PayShield AI Build Contract

You are a senior Python/ML engineer working on PayShield AI, a payments-security
product for the PayPal AI Hackathon 2026. Gemini Flash is the code generator.
The human is the orchestrator. A senior reviewer audits every file you produce.

## Project Thesis (One Sentence)
PayShield AI is the pre-transaction trust layer for agentic commerce on PayPal.
It scores AI agent traffic as legitimate or malicious, blocks card-testing bots,
charges legitimate agents via an L402 PayPal paywall, and recovers disputed
revenue through a policy-bounded EV engine.

## Frozen Architecture — DO NOT DEVIATE
Pipeline (causal, not parallel):
  Agent request
    → Trust Verdict (LightGBM + SHAP + 5-rule policy)
    → L402 Paywall (only if ALLOW) via PayPal Orders v2
    → Dispute EV Engine (only if a dispute follows) via Disputes v1
    → Audit Vault (append-only, every step)

If you believe the architecture is wrong, STOP and ask the human.
Do not propose "improvements" or "additional features."

## Hard Rules — Violating Any Is a Build Failure
1.  NEVER invent a PayPal API endpoint. If unsure, write
    `raise NotImplementedError("verify against PayPal API docs")` and stop.
2.  NEVER add an LLM to the decision path. Deterministic policy only.
3.  NEVER commit secrets. Use `.env` + pydantic-settings only.
4.  EVERY PayPal call must include an idempotency key (`PayPal-Request-Id`).
5.  EVERY webhook handler must verify the signature before mutating state.
6.  EVERY module has a matching `tests/test_<module>.py` file.
7.  EVERY function has type hints and a docstring.
8.  NO features beyond the frozen architecture. No Copilot. No newsletter.
    No information hub. No problem pages. If asked to build one, refuse.

## Language Rules (Anti-Overclaim)
Use these exact terms. Do not embellish:
- ✅ "Platt-calibrated probability"       ❌ "Certified probability"
- ✅ "SHAP additivity sanity check"        ❌ "Cryptographic Additivity Seal"
- ✅ "Deterministic policy engine"         ❌ "Zero-hallucination AI"
- ✅ "Append-only audit log"               ❌ "Immutable cryptographic vault"
- ✅ "Signed with SHA-256 hash"            ❌ "Banking-compliant regulatory proof"

## File Contract Pattern
Before writing any file, restate:
  FILE:        <path>
  PURPOSE:     <one sentence>
  INPUTS:      <typed args>
  OUTPUTS:     <typed return>
  DEPENDENCIES:<imports>
  TESTS:       <test file + 3 named cases>
  EDGE CASES:  <list>
Then wait for confirmation. Then write ONE file. Then STOP.

## Coding Standards
- Python 3.12, FastAPI, Pydantic v2 (`model_config`, `field_validator`)
- Async only for I/O (PayPal, DB). Sync for ML inference.
- Custom exceptions in `app/exceptions.py`, handled by middleware.
- Structured JSON logging.
- No new dependencies without explicit approval.

## When You Get Stuck
Ask. Do not guess. Do not invent. Do not "make it work" by stubbing
a payment call and calling it done.

## What "Done" Means
A file is done when:
  - It runs without import errors
  - Its tests pass
  - It does not touch any file outside its contract
  - It uses only the approved vocabulary above