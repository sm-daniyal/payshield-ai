"""
PayShield AI — Transaction Schemas (Pydantic v2)

Strict input/output contracts for the /evaluate API endpoint.
All fields are typed and validated — no untyped dicts reach the ML pipeline.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Input: Incoming PayPal transaction event
# ---------------------------------------------------------------------------

class TransactionHistory(BaseModel):
    """Prior transaction history for a buyer — used for leakage-safe feature extraction."""
    amounts: list[float] = Field(
        default_factory=list,
        description="List of prior transaction amounts in USD for this buyer.",
    )
    timestamps: list[datetime] = Field(
        default_factory=list,
        description="UTC timestamps of prior transactions (same buyer email/IP).",
    )
    dispute_count: int = Field(
        default=0,
        ge=0,
        description="Number of prior disputes or chargebacks filed by this buyer.",
    )


class TransactionEvaluationRequest(BaseModel):
    """
    Payload submitted to /api/v1/evaluate for real-time risk assessment.
    Matches the structure of a normalized PayPal Order webhook event.
    """
    transaction_id: str = Field(..., description="PayPal order or capture ID.")
    amount_usd: float = Field(..., gt=0, description="Transaction amount in USD.")
    buyer_email: str = Field(..., description="PayPal buyer email address.")
    buyer_country: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 buyer country code.")
    shipping_country: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 shipping destination.")
    ip_country: str = Field(..., min_length=2, max_length=2, description="Resolved country from buyer IP address.")
    buyer_currency: str = Field(..., min_length=3, max_length=3, description="ISO 4217 currency code of buyer.")
    mid_market_rate_to_usd: float = Field(..., gt=0, description="Mid-market FX rate for buyer_currency to USD.")
    actual_rate_to_usd: float = Field(..., gt=0, description="Actual FX rate applied to this transaction.")
    paypal_account_age_days: int = Field(..., ge=0, description="Days since PayPal buyer account creation.")
    paypal_account_verified: bool = Field(..., description="True if buyer PayPal account is VERIFIED.")
    event_timestamp: datetime = Field(..., description="UTC timestamp of the triggering PayPal webhook event.")
    history: TransactionHistory = Field(
        default_factory=TransactionHistory,
        description="Strictly-prior transaction history for leakage-safe feature extraction.",
    )

    @field_validator("buyer_country", "shipping_country", "ip_country")
    @classmethod
    def uppercase_country(cls, v: str) -> str:
        return v.upper()

    @field_validator("buyer_currency")
    @classmethod
    def uppercase_currency(cls, v: str) -> str:
        return v.upper()


# ---------------------------------------------------------------------------
# Output: Risk evaluation result
# ---------------------------------------------------------------------------

class ShapContribution(BaseModel):
    """Single SHAP feature contribution with directional attribution."""
    feature: str
    value: float = Field(..., description="Raw feature value fed to the model.")
    shap_value: float = Field(..., description="SHAP contribution (positive = increases risk).")
    contribution_pct: float = Field(..., description="Absolute contribution as % of total attribution.")


class AdditivityVerification(BaseModel):
    """
    Mathematical proof that SHAP values are grounded — not hallucinated.
    Invariant: base_bias + sum(shap_values) == predicted_probability (delta < 1e-4)
    """
    base_bias: float
    shap_sum: float
    predicted_probability: float
    delta: float
    verified: bool


class PolicyDecision(BaseModel):
    """Bounded action from the deterministic 5-rule policy engine."""
    action: str = Field(
        ...,
        description="One of: ALLOW | ALLOW_WITH_MONITORING | STEP_UP_VERIFICATION | BLOCK_AND_FLAG_DISPUTE",
    )
    rule_triggered: str = Field(..., description="Human-readable rule description that produced this action.")
    cost_threshold_applied: float = Field(..., description="The cost-optimal threshold used.")


class TransactionEvaluationResponse(BaseModel):
    """Complete evaluation result returned by /api/v1/evaluate."""
    transaction_id: str
    risk_score: float = Field(..., ge=0, le=100, description="Calibrated risk score (0 = safe, 100 = high risk).")
    risk_probability: float = Field(..., ge=0, le=1, description="Raw calibrated probability from the model.")
    features: dict[str, float] = Field(..., description="Extracted feature vector used for inference.")
    shap_contributions: list[ShapContribution]
    additivity_verification: AdditivityVerification
    decision: PolicyDecision
    evaluation_timestamp: datetime
    audit_hash: Optional[str] = Field(default=None, description="SHA-256 hash in audit ledger.")
    audit_persisted: bool = Field(default=False, description="True if recorded in append-only audit store.")
