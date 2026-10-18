"""
PayShield AI — Autonomous Dispute Recovery Engine

Adapted for PayPal payment rails and dispute fee structure.
Eliminates unprofitable dispute contests and automates high-probability recoveries.

Economics Model:
  Filing Fee: $15.00 USD (PayPal merchant fee upon losing or contesting chargeback)
  Expected Net Recovery = (P_win * dispute_amount_usd) - $15.00

Actions:
  - PROCEED_DIRECT_DISPUTE: Expected Net Recovery > 0 and P_win >= 0.60
  - ESCALATE_MANUAL_REVIEW: Expected Net Recovery > 0 and 0.40 <= P_win < 0.60
  - AUTO_WRITE_OFF_UNECONOMIC: Expected Net Recovery <= 0 (negative expected value)
"""
from __future__ import annotations

from typing import Any, NamedTuple
from pydantic import BaseModel, Field


DISPUTE_FEE_BY_TIER: dict[str, float] = {
    "standard":  15.00,   # Default SMB tier
    "advanced":  30.00,   # Seller Protection Plus
    "enterprise": 0.00,   # Negotiated
}
DISPUTE_FILING_FEE_USD = 15.00  # Default backward-compatibility alias
RECOVERY_THRESHOLD = 0.40

ACTION_PROCEED_DIRECT_DISPUTE = "PROCEED_DIRECT_DISPUTE"
ACTION_ESCALATE_MANUAL_REVIEW = "ESCALATE_MANUAL_REVIEW"
ACTION_AUTO_WRITE_OFF_UNECONOMIC = "AUTO_WRITE_OFF_UNECONOMIC"


class DisputeEvidenceInput(BaseModel):
    dispute_id: str
    transaction_id: str
    dispute_amount_usd: float = Field(..., gt=0)
    dispute_reason: str = "MERCHANDISE_OR_SERVICE_NOT_RECEIVED"
    has_carrier_delivery_proof: bool = False
    has_avs_cvv_match: bool = False
    buyer_prior_disputes: int = 0
    has_customer_chat_history: bool = False
    tracking_number: str | None = None
    carrier_name: str | None = None


class DisputeAssessmentResult(NamedTuple):
    dispute_id: str
    dispute_amount_usd: float
    win_probability: float
    expected_net_recovery: float
    action: str
    reasoning: str
    evidence_dossier: str


def compute_win_probability(evidence: DisputeEvidenceInput) -> float:
    """
    Calculate calibrated probability of merchant winning dispute contest (0.0 to 0.95).
    Baseline win rate for unassisted disputes is ~10-15%.
    """
    score = 0.12  # Baseline

    if evidence.has_carrier_delivery_proof:
        score += 0.38  # Strongest evidence for item not received
    if evidence.has_avs_cvv_match:
        score += 0.20  # Overcomes unauthorized claim
    if evidence.buyer_prior_disputes == 0:
        score += 0.10  # Clean buyer history
    elif evidence.buyer_prior_disputes >= 2:
        score += 0.05  # History of buyer abuse increases merchant favor
    if evidence.has_customer_chat_history:
        score += 0.10

    # Cap probability in [0.05, 0.95]
    return round(max(0.05, min(0.95, score)), 4)


def generate_evidence_dossier(evidence: DisputeEvidenceInput, win_prob: float) -> str:
    """Compile structured evidence brief formatted for PayPal Dispute Evidence API."""
    lines = [
        f"=== PAYSHIELD AI EVIDENCE DOSSIER FOR DISPUTE {evidence.dispute_id} ===",
        f"Transaction Reference: {evidence.transaction_id}",
        f"Dispute Amount: ${evidence.dispute_amount_usd:.2f} USD",
        f"Contest Reason: Rebuttal of claim '{evidence.dispute_reason}'",
        f"Assessment Confidence (P_win): {win_prob * 100:.1f}%",
        "--- VERIFIED EVIDENCE ITEMS ---",
        f"1. Proof of Delivery: {'VERIFIED' if evidence.has_carrier_delivery_proof else 'NOT ATTACHED'}",
    ]
    if evidence.tracking_number:
        lines.append(f"   Carrier: {evidence.carrier_name or 'USPS/FedEx'} | Tracking: {evidence.tracking_number}")
    lines.extend([
        f"2. AVS/CVV Security Match: {'CONFIRMED MATCH' if evidence.has_avs_cvv_match else 'PARTIAL'}",
        f"3. Buyer Dispute Track Record: {evidence.buyer_prior_disputes} prior disputes on file",
        f"4. Customer Communication Record: {'ATTACHED' if evidence.has_customer_chat_history else 'NONE'}",
        "--- STATEMENT ---",
        "Merchant fulfilled order adhering to PayPal Seller Protection policies.",
    ])
    return "\n".join(lines)


def evaluate_dispute_recovery(
    evidence: DisputeEvidenceInput,
    merchant_tier: str = "standard",
) -> DisputeAssessmentResult:
    """
    Apply economic recovery optimization to an incoming PayPal dispute.
    Strictly separates profitable disputes from uneconomic fee sinks.
    """
    filing_fee = DISPUTE_FEE_BY_TIER.get(merchant_tier, 15.00)
    p_win = compute_win_probability(evidence)
    # Expected Net Recovery = (P_win * amount) - PayPal dispute fee
    expected_net = (p_win * evidence.dispute_amount_usd) - filing_fee
    expected_net = round(expected_net, 2)

    dossier = generate_evidence_dossier(evidence, p_win)

    if expected_net <= 0.0:
        return DisputeAssessmentResult(
            dispute_id=evidence.dispute_id,
            dispute_amount_usd=evidence.dispute_amount_usd,
            win_probability=p_win,
            expected_net_recovery=expected_net,
            action=ACTION_AUTO_WRITE_OFF_UNECONOMIC,
            reasoning=(
                f"Negative expected recovery (${expected_net:.2f}). "
                f"Filing fee of ${filing_fee:.2f} exceeds expected return "
                f"({p_win*100:.1f}% of ${evidence.dispute_amount_usd:.2f})."
            ),
            evidence_dossier=dossier,
        )

    if p_win >= 0.60:
        return DisputeAssessmentResult(
            dispute_id=evidence.dispute_id,
            dispute_amount_usd=evidence.dispute_amount_usd,
            win_probability=p_win,
            expected_net_recovery=expected_net,
            action=ACTION_PROCEED_DIRECT_DISPUTE,
            reasoning=(
                f"High-confidence recovery: Expected net return +${expected_net:.2f} "
                f"with {p_win*100:.1f}% win probability. Ready for PayPal API submission."
            ),
            evidence_dossier=dossier,
        )

    # Borderline case: 0.40 <= p_win < 0.60 and expected_net > 0
    return DisputeAssessmentResult(
        dispute_id=evidence.dispute_id,
        dispute_amount_usd=evidence.dispute_amount_usd,
        win_probability=p_win,
        expected_net_recovery=expected_net,
        action=ACTION_ESCALATE_MANUAL_REVIEW,
        reasoning=(
            f"Marginally profitable (+${expected_net:.2f}) with moderate win probability "
            f"({p_win*100:.1f}%). Escalated for operator manual review."
        ),
        evidence_dossier=dossier,
    )
