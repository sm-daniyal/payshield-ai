"""
PayShield AI — Leakage-Safe Feature Engineering Pipeline

Core principle: All features are computed EXCLUSIVELY from strictly-prior
transaction history. The current transaction's label is never visible at
feature extraction time — identical to production inference conditions.

This directly replicates the MerchantShield AI leakage prevention standard.

Features extracted (6 total):
  1. amount_zscore            — Amount deviation from buyer's historical baseline
  2. velocity_1h              — Transaction count in the past 1 hour (same buyer)
  3. velocity_24h             — Transaction count in the past 24 hours (same buyer)
  4. velocity_7d              — Transaction count in the past 7 days (same buyer)
  5. fx_spread                — Percentage deviation from mid-market FX rate
  6. geo_mismatch             — Shipping country != IP-resolved country (binary)
  7. account_risk_score       — Composite: account age + verification status + prior disputes
"""
from __future__ import annotations

import math
import statistics
from datetime import datetime, timezone
from typing import NamedTuple


# ---------------------------------------------------------------------------
# Feature vector output type
# ---------------------------------------------------------------------------

class FeatureVector(NamedTuple):
    """
    Ordered, typed feature vector passed directly to the LightGBM model.
    Named tuple ensures feature order is deterministic and cannot be silently reordered.
    """
    amount_zscore: float
    velocity_1h: float
    velocity_24h: float
    velocity_7d: float
    fx_spread: float
    geo_mismatch: float
    account_risk_score: float

    def to_dict(self) -> dict[str, float]:
        return self._asdict()

    def to_list(self) -> list[float]:
        return list(self)


# ---------------------------------------------------------------------------
# Helper: rolling velocity count
# ---------------------------------------------------------------------------

def _count_in_window(timestamps: list[datetime], reference: datetime, window_seconds: int) -> int:
    """
    Count prior transactions within a rolling time window before `reference`.
    Only strictly-prior timestamps are counted (< reference, not <=) to prevent leakage.
    """
    cutoff = reference.timestamp() - window_seconds
    ref_ts = reference.timestamp()
    return sum(1 for ts in timestamps if cutoff <= ts.timestamp() < ref_ts)


# ---------------------------------------------------------------------------
# Helper: amount z-score
# ---------------------------------------------------------------------------

def _compute_amount_zscore(current_amount: float, prior_amounts: list[float]) -> float:
    """
    Compute the z-score of the current transaction amount relative to the buyer's
    historical baseline. Capped at +/- 10.0 to prevent unbounded outlier influence.

    If fewer than 2 prior transactions exist, returns 0.0 (insufficient baseline).
    """
    if len(prior_amounts) < 2:
        return 0.0

    mean = statistics.mean(prior_amounts)
    stdev = statistics.stdev(prior_amounts)

    if stdev < 1e-9:
        # All prior transactions were the same amount — current deviation is zero.
        return 0.0

    z = (current_amount - mean) / stdev
    return max(-10.0, min(10.0, round(z, 4)))


# ---------------------------------------------------------------------------
# Helper: FX spread
# ---------------------------------------------------------------------------

def _compute_fx_spread(mid_market_rate: float, actual_rate: float) -> float:
    """
    Percentage deviation of the applied FX rate from the mid-market benchmark.
    A high spread (> 3%) indicates potential currency manipulation.

    spread = |actual - mid_market| / mid_market
    Capped at 1.0 (100%) to handle extreme outliers.
    """
    if mid_market_rate < 1e-9:
        return 0.0

    spread = abs(actual_rate - mid_market_rate) / mid_market_rate
    return round(min(spread, 1.0), 6)


# ---------------------------------------------------------------------------
# Helper: account risk composite score
# ---------------------------------------------------------------------------

def _compute_account_risk_score(
    account_age_days: int,
    is_verified: bool,
    prior_dispute_count: int,
) -> float:
    """
    Composite [0.0, 1.0] score representing the structural risk of the PayPal account itself.
    Higher value = higher risk.

    Components:
      - Age decay: New accounts (<30 days) score 1.0; decays logarithmically to ~0.0 at 3 years.
      - Verification penalty: Unverified accounts receive +0.30 penalty.
      - Dispute penalty: Each prior dispute adds +0.15, capped at +0.45.
    """
    # Age component: ln-based decay (new accounts are high-risk)
    if account_age_days <= 0:
        age_score = 1.0
    else:
        # log10(1) = 0 -> score 1.0 at day 0; log10(1095) ~= 3.04 -> score ~0.0 at 3 years
        age_score = max(0.0, 1.0 - math.log10(account_age_days + 1) / math.log10(1096))

    verification_penalty = 0.0 if is_verified else 0.30
    dispute_penalty = min(prior_dispute_count * 0.15, 0.45)

    composite = age_score + verification_penalty + dispute_penalty
    return round(min(composite, 1.0), 4)


# ---------------------------------------------------------------------------
# Main public interface
# ---------------------------------------------------------------------------

def extract_features(
    current_amount_usd: float,
    prior_amounts: list[float],
    prior_timestamps: list[datetime],
    event_timestamp: datetime,
    mid_market_rate_to_usd: float,
    actual_rate_to_usd: float,
    shipping_country: str,
    ip_country: str,
    paypal_account_age_days: int,
    paypal_account_verified: bool,
    prior_dispute_count: int,
) -> FeatureVector:
    """
    Extract the 7-dimensional leakage-safe feature vector from a PayPal transaction event.

    All features are computed using ONLY data available at inference time from
    prior transactions. The current transaction's outcome is never used.

    Parameters
    ----------
    current_amount_usd        : Amount of the transaction being evaluated (USD).
    prior_amounts             : Historical transaction amounts for this buyer (USD).
    prior_timestamps          : UTC timestamps of prior transactions for this buyer.
    event_timestamp           : UTC timestamp of the current PayPal webhook event.
    mid_market_rate_to_usd    : Mid-market FX rate for buyer's currency to USD.
    actual_rate_to_usd        : Actual FX rate applied by PayPal for this transaction.
    shipping_country          : ISO 3166-1 alpha-2 shipping destination country.
    ip_country                : ISO 3166-1 alpha-2 country resolved from buyer's IP.
    paypal_account_age_days   : Days since buyer's PayPal account was created.
    paypal_account_verified   : True if buyer's PayPal account status is VERIFIED.
    prior_dispute_count       : Number of prior disputes or chargebacks from this buyer.

    Returns
    -------
    FeatureVector — ordered, typed, ready for LightGBM inference.
    """
    # Normalize event_timestamp to UTC for consistent window comparisons
    if event_timestamp.tzinfo is None:
        event_timestamp = event_timestamp.replace(tzinfo=timezone.utc)

    normalized_timestamps = [
        ts.replace(tzinfo=timezone.utc) if ts.tzinfo is None else ts
        for ts in prior_timestamps
    ]

    amount_zscore = _compute_amount_zscore(current_amount_usd, prior_amounts)

    velocity_1h = float(_count_in_window(normalized_timestamps, event_timestamp, 3_600))
    velocity_24h = float(_count_in_window(normalized_timestamps, event_timestamp, 86_400))
    velocity_7d = float(_count_in_window(normalized_timestamps, event_timestamp, 604_800))

    fx_spread = _compute_fx_spread(mid_market_rate_to_usd, actual_rate_to_usd)

    geo_mismatch = 0.0 if shipping_country.upper() == ip_country.upper() else 1.0

    account_risk_score = _compute_account_risk_score(
        paypal_account_age_days,
        paypal_account_verified,
        prior_dispute_count,
    )

    return FeatureVector(
        amount_zscore=amount_zscore,
        velocity_1h=velocity_1h,
        velocity_24h=velocity_24h,
        velocity_7d=velocity_7d,
        fx_spread=fx_spread,
        geo_mismatch=geo_mismatch,
        account_risk_score=account_risk_score,
    )
