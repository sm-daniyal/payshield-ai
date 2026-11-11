# Schemas Component Contract

## Overview
Pydantic v2 data models defining the strict serialization, deserialization, and runtime type-safety contracts for PayShield AI across HTTP endpoints, feature extractors, and policy decision matrices.

## Interface
- `TransactionEvaluationRequest`: Inbound payload containing transaction metadata, payer telemetry, and prior velocity history.
- `TransactionEvaluationResponse`: Outbound decision payload containing calibrated risk score, bounded policy action, and SHAP explanations.
- `FeatureVector`: 7 leakage-safe feature inputs extracted from request and historical telemetry (`amount_zscore`, `velocity_1h`, `velocity_24h`, `geo_mismatch`, `fx_spread_deviation`, `account_risk_score`, `amount_log`).
- `ShapContribution`: Grounded feature-level SHAP attributions with directional sign.
- `AdditivityVerification`: Mathematical tolerance verification ensuring `base_bias + sum(shap) == raw_score`.
- `PolicyDecision`: Bounded action mapping (`ALLOW`, `ALLOW_WITH_MONITORING`, `STEP_UP_VERIFICATION`, `BLOCK_AND_FLAG_DISPUTE`).
- `DisputeRecord`: Schema for dispute webhook payloads, fee tier evaluations, and evidence dossiers.
- `L402Challenge`: Machine-readable payment challenge payload conforming to L402 HTTP 402 protocol specifications.

## Invariants
- Transaction amounts must be strictly positive floats with 2-decimal precision (`amount > 0`).
- Calibrated risk scores must strictly reside within the bounded interval `[0.0, 100.0]`.
- SHAP additivity tolerance must strictly satisfy `abs(delta) < 1e-4`.

## Side Effects
- None. Schemas are purely computational data contracts with zero external I/O or state mutation.

## Verification
- Run: `pytest tests/test_feature_pipeline.py tests/test_ml_and_policy.py`
