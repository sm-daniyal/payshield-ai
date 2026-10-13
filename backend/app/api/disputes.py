"""
PayShield AI — Dispute Recovery & Audit Query Router

Endpoints:
  - POST /api/v1/disputes/evaluate: Evaluate recovery ROI for an incoming dispute
  - POST /api/v1/disputes/{dispute_id}/submit: Contest dispute via PayPal Disputes API
  - GET /api/v1/audit/transactions: Retrieve recent evaluated transactions
  - GET /api/v1/audit/disputes: Retrieve recent dispute assessments
"""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.db.audit_store import AuditStore
from app.engine.dispute_recovery import (
    DisputeAssessmentResult,
    DisputeEvidenceInput,
    evaluate_dispute_recovery,
)
from app.paypal.client import PayPalClient

router = APIRouter(prefix="/api/v1", tags=["Disputes & Audit"])


class SubmitEvidenceRequest(BaseModel):
    evidence_type: str = "PROOF_OF_DELIVERY"
    notes: str


@router.post(
    "/disputes/evaluate",
    response_model=dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Evaluate dispute recovery economics and generate evidence dossier",
)
async def evaluate_dispute(evidence: DisputeEvidenceInput) -> dict[str, Any]:
    res = evaluate_dispute_recovery(evidence)
    audit = AuditStore()
    record_hash = audit.record_dispute_recovery(
        dispute_id=res.dispute_id,
        transaction_id=evidence.transaction_id,
        amount_usd=res.dispute_amount_usd,
        win_probability=res.win_probability,
        expected_net_recovery=res.expected_net_recovery,
        action=res.action,
        reasoning=res.reasoning,
        evidence_dossier=res.evidence_dossier,
    )
    return {
        "dispute_id": res.dispute_id,
        "dispute_amount_usd": res.dispute_amount_usd,
        "win_probability": res.win_probability,
        "expected_net_recovery": res.expected_net_recovery,
        "action": res.action,
        "reasoning": res.reasoning,
        "evidence_dossier": res.evidence_dossier,
        "audit_hash": record_hash,
    }


@router.post(
    "/disputes/{dispute_id}/submit",
    status_code=status.HTTP_200_OK,
    summary="Submit evidence dossier to PayPal Disputes API",
)
async def submit_dispute_evidence_endpoint(
    dispute_id: str,
    payload: SubmitEvidenceRequest,
) -> dict[str, Any]:
    client = PayPalClient()
    try:
        res = await client.submit_dispute_evidence(
            dispute_id=dispute_id,
            evidence_type=payload.evidence_type,
            notes=payload.notes,
        )
        return res
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit evidence to PayPal: {str(exc)}",
        ) from exc


@router.get(
    "/audit/transactions",
    summary="Query recent transaction risk evaluation audit records",
)
async def get_audit_transactions(limit: int = 50) -> list[dict[str, Any]]:
    audit = AuditStore()
    return audit.get_recent_transactions(limit=limit)


@router.get(
    "/audit/disputes",
    summary="Query recent dispute recovery audit records",
)
async def get_audit_disputes(limit: int = 50) -> list[dict[str, Any]]:
    audit = AuditStore()
    return audit.get_recent_disputes(limit=limit)
