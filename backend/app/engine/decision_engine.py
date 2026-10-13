"""
PayShield AI — Deterministic 5-Rule Decision Engine

Core Principle: Separation of Concerns.
The ML model predicts strictly a risk probability in [0, 1].
This policy engine deterministically maps (probability, amount_usd) to a bounded action.
The ML model and LLMs are structurally incapable of altering financial policy decisions.

Cost-Optimal Decision Boundary:
Operating threshold is set to 0.40 derived from minimizing merchant expected loss:
Loss = (FP_count * merchant_friction_cost) + (FN_count * (order_value + paypal_dispute_fee))
Where paypal_dispute_fee = $15.00 USD.

Decision Actions:
  - ALLOW: Low risk transaction (< 0.20)
  - ALLOW_WITH_MONITORING: Mild anomalies (0.20 <= p < 0.40)
  - STEP_UP_VERIFICATION: Elevated risk (0.40 <= p < 0.65)
  - BLOCK_AND_FLAG_DISPUTE: High risk (p >= 0.65)
"""
from __future__ import annotations

from typing import NamedTuple


class DecisionResult(NamedTuple):
    action: str
    rule_triggered: str
    cost_threshold_applied: float
    risk_level: str


# Permitted bounded actions
ACTION_ALLOW = "ALLOW"
ACTION_ALLOW_WITH_MONITORING = "ALLOW_WITH_MONITORING"
ACTION_STEP_UP_VERIFICATION = "STEP_UP_VERIFICATION"
ACTION_BLOCK_AND_FLAG_DISPUTE = "BLOCK_AND_FLAG_DISPUTE"

# Cost-optimal operating threshold
DEFAULT_COST_OPTIMAL_THRESHOLD = 0.40


def evaluate_policy(
    probability: float,
    amount_usd: float,
    threshold: float = DEFAULT_COST_OPTIMAL_THRESHOLD,
) -> DecisionResult:
    """
    Apply deterministic policy rules to (probability, amount_usd).

    Rule matrix:
    Rule 1: p < 0.20 -> ALLOW (Low Risk)
    Rule 2: 0.20 <= p < 0.40 -> ALLOW_WITH_MONITORING (Moderate Risk)
    Rule 3: 0.40 <= p < 0.65 -> STEP_UP_VERIFICATION (High Friction Risk)
    Rule 4: p >= 0.65 and amount < 500.00 -> BLOCK_AND_FLAG_DISPUTE (Standard High Risk)
    Rule 5: p >= 0.65 and amount >= 500.00 -> BLOCK_AND_FLAG_DISPUTE (Priority High Value Escalation)

    Invariant: Guaranteed to return exactly one DecisionResult with an action
    from the bounded enum set.
    """
    # Enforce input bounds
    prob = max(0.0, min(1.0, float(probability)))
    amount = max(0.0, float(amount_usd))

    if prob < 0.20:
        return DecisionResult(
            action=ACTION_ALLOW,
            rule_triggered="RULE_1_PROB_BELOW_0_20_LOW_RISK",
            cost_threshold_applied=threshold,
            risk_level="LOW",
        )

    if prob < threshold:
        return DecisionResult(
            action=ACTION_ALLOW_WITH_MONITORING,
            rule_triggered="RULE_2_PROB_BELOW_THRESHOLD_MONITORING",
            cost_threshold_applied=threshold,
            risk_level="MEDIUM",
        )

    if prob < 0.65:
        return DecisionResult(
            action=ACTION_STEP_UP_VERIFICATION,
            rule_triggered="RULE_3_PROB_ELEVATED_STEP_UP_AUTH",
            cost_threshold_applied=threshold,
            risk_level="HIGH",
        )

    # High probability fraud cases (p >= 0.65)
    if amount < 500.00:
        return DecisionResult(
            action=ACTION_BLOCK_AND_FLAG_DISPUTE,
            rule_triggered="RULE_4_PROB_CRITICAL_STANDARD_BLOCK",
            cost_threshold_applied=threshold,
            risk_level="CRITICAL",
        )

    return DecisionResult(
        action=ACTION_BLOCK_AND_FLAG_DISPUTE,
        rule_triggered="RULE_5_PROB_CRITICAL_HIGH_VALUE_BLOCK",
        cost_threshold_applied=threshold,
        risk_level="CRITICAL_HIGH_VALUE",
    )
