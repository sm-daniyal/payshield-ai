"""
PayShield AI — Transaction Evaluation Router

Exposes POST /api/v1/evaluate
Accepts normalized PayPal order events, extracts features, performs
calibrated LightGBM inference, computes grounded SHAP tree attributions,
and executes deterministic bounded policy mapping.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from app.engine.model_runner import ModelRunner
from app.schemas.transaction import (
    TransactionEvaluationRequest,
    TransactionEvaluationResponse,
)

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
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction risk evaluation failed: {str(exc)}",
        ) from exc
