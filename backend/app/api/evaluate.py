"""
PayShield AI — Transaction Evaluation Router

Exposes POST /api/v1/evaluate
Accepts normalized PayPal order events, extracts features, performs
calibrated LightGBM inference, computes grounded SHAP tree attributions,
executes deterministic bounded policy mapping, and writes a tamper-evident
SHA-256 record to the append-only audit store.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException, status
from app.db.audit_store import AuditStore
from app.engine.model_runner import ModelRunner
from app.schemas.transaction import (
    TransactionEvaluationRequest,
    TransactionEvaluationResponse,
)

logger = logging.getLogger("payshield.evaluate")
router = APIRouter(prefix="/api/v1", tags=["Evaluation"])


@router.post(
    "/evaluate",
    response_model=TransactionEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate transaction risk with grounded SHAP explainability and deterministic policy resolution",
)
async def evaluate_transaction(
    request: TransactionEvaluationRequest,
) -> TransactionEvaluationResponse:
    try:
        runner = ModelRunner.get_instance()
        response = runner.evaluate(request)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction risk evaluation failed: {str(exc)}",
        ) from exc

    # Persist decision to append-only audit store
    audit_hash = None
    audit_persisted = False
    try:
        audit_store = AuditStore()
        audit_hash = audit_store.record_transaction_evaluation(
            transaction_id=response.transaction_id,
            amount_usd=request.amount_usd,
            buyer_email=getattr(request, "buyer_email", "unknown"),
            risk_score=response.risk_score,
            risk_probability=response.risk_probability,
            action=response.decision.action,
            rule_triggered=response.decision.rule_triggered,
            features=response.features,
            shap_contributions=[c.model_dump() for c in response.shap_contributions],
            additivity_delta=response.additivity_verification.delta,
        )
        audit_persisted = True
    except Exception as exc:
        logger.warning(
            "Audit store persistence failed for transaction %s: %s",
            request.transaction_id,
            exc,
        )

    response.audit_hash = audit_hash
    response.audit_persisted = audit_persisted
    return response
