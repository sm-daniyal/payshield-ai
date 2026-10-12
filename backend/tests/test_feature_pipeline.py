"""
PayShield AI — Feature Pipeline Unit Tests

Tests cover:
  1. Amount z-score correctness and edge cases
  2. Transaction velocity window accuracy
  3. FX spread calculation and bounding
  4. Geo mismatch binary flag
  5. Account risk composite score components
  6. Full feature vector extraction end-to-end
  7. Leakage guard: event_timestamp transaction is excluded from velocity
"""
from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

import pytest

from app.engine.feature_pipeline import (
    FeatureVector,
    _compute_account_risk_score,
    _compute_amount_zscore,
    _compute_fx_spread,
    _count_in_window,
    extract_features,
)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

NOW = datetime(2026, 10, 12, 10, 0, 0, tzinfo=timezone.utc)


def make_timestamps(offsets_seconds: list[int]) -> list[datetime]:
    """Create timestamps relative to NOW by subtracting given second offsets."""
    return [NOW - timedelta(seconds=s) for s in offsets_seconds]


# ---------------------------------------------------------------------------
# 1. Amount Z-Score
# ---------------------------------------------------------------------------

class TestAmountZScore:
    def test_normal_deviation(self):
        prior = [10.0, 12.0, 11.0, 10.5, 11.5]
        z = _compute_amount_zscore(100.0, prior)
        assert z > 0, "High outlier amount should produce positive z-score."

    def test_below_baseline(self):
        prior = [100.0, 110.0, 105.0, 108.0, 102.0]
        z = _compute_amount_zscore(5.0, prior)
        assert z < 0, "Low outlier amount should produce negative z-score."

    def test_insufficient_history_returns_zero(self):
        assert _compute_amount_zscore(50.0, []) == 0.0
        assert _compute_amount_zscore(50.0, [50.0]) == 0.0

    def test_constant_history_returns_zero(self):
        prior = [50.0, 50.0, 50.0, 50.0]
        assert _compute_amount_zscore(50.0, prior) == 0.0

    def test_cap_at_positive_10(self):
        # Varied prior with small std so that z >> 10 -> capped at 10.0
        prior = [1.0, 1.1, 0.9, 1.05, 0.95]
        z = _compute_amount_zscore(1_000_000.0, prior)
        assert z == 10.0, "Z-score must be capped at +10.0."

    def test_cap_at_negative_10(self):
        # Varied prior with small std so that z << -10 -> capped at -10.0
        prior = [1_000_000.0, 1_000_001.0, 999_999.0, 1_000_002.0, 999_998.0]
        z = _compute_amount_zscore(0.01, prior)
        assert z == -10.0, "Z-score must be capped at -10.0."


# ---------------------------------------------------------------------------
# 2. Transaction Velocity Windows
# ---------------------------------------------------------------------------

class TestVelocityWindows:
    def test_1h_window_counts_correctly(self):
        # 3 transactions in the past 1 hour, 2 older
        ts = make_timestamps([100, 600, 3000, 4000, 90000])
        count = _count_in_window(ts, NOW, 3_600)
        assert count == 3

    def test_24h_window(self):
        ts = make_timestamps([3600, 7200, 43200, 86401])
        count = _count_in_window(ts, NOW, 86_400)
        assert count == 3  # 86401s ago is outside the 24h window

    def test_7d_window(self):
        ts = make_timestamps([86400, 259200, 604800, 604801])
        count = _count_in_window(ts, NOW, 604_800)
        assert count == 3  # 604801s ago is outside 7d

    def test_leakage_guard_excludes_event_timestamp(self):
        # A transaction exactly at NOW should NOT be counted (< not <=)
        ts = [NOW]
        count = _count_in_window(ts, NOW, 3_600)
        assert count == 0, "Event timestamp itself must not be counted (no data leakage)."

    def test_empty_history_returns_zero(self):
        assert _count_in_window([], NOW, 3_600) == 0


# ---------------------------------------------------------------------------
# 3. FX Spread
# ---------------------------------------------------------------------------

class TestFXSpread:
    def test_zero_spread(self):
        assert _compute_fx_spread(1.0, 1.0) == 0.0

    def test_positive_spread(self):
        spread = _compute_fx_spread(1.0, 1.04)
        assert abs(spread - 0.04) < 1e-6

    def test_capped_at_one(self):
        # An extreme spread should be capped at 1.0
        spread = _compute_fx_spread(1.0, 1000.0)
        assert spread == 1.0

    def test_zero_mid_market_returns_zero(self):
        assert _compute_fx_spread(0.0, 1.0) == 0.0


# ---------------------------------------------------------------------------
# 4. Account Risk Score
# ---------------------------------------------------------------------------

class TestAccountRiskScore:
    def test_brand_new_unverified_account_with_disputes_is_max_risk(self):
        score = _compute_account_risk_score(0, False, 3)
        assert score == 1.0, "New, unverified, multi-dispute account should score 1.0."

    def test_old_verified_clean_account_is_low_risk(self):
        score = _compute_account_risk_score(1095, True, 0)
        assert score < 0.15, "3-year-old verified clean account should score near 0."

    def test_verification_penalty_applied(self):
        verified = _compute_account_risk_score(365, True, 0)
        unverified = _compute_account_risk_score(365, False, 0)
        assert unverified > verified, "Unverified should score higher than verified."

    def test_dispute_penalty_capped(self):
        score_3 = _compute_account_risk_score(365, True, 3)
        score_100 = _compute_account_risk_score(365, True, 100)
        assert score_3 == score_100, "Dispute penalty must be capped at 3 disputes."

    def test_score_bounded_between_zero_and_one(self):
        for age in [0, 30, 365, 1095]:
            for verified in [True, False]:
                for disputes in [0, 1, 5]:
                    score = _compute_account_risk_score(age, verified, disputes)
                    assert 0.0 <= score <= 1.0


# ---------------------------------------------------------------------------
# 5. End-to-End Feature Extraction
# ---------------------------------------------------------------------------

class TestExtractFeatures:
    def _base_call(self, **overrides):
        defaults = dict(
            current_amount_usd=50.0,
            prior_amounts=[45.0, 52.0, 48.0, 50.0, 47.0],
            prior_timestamps=make_timestamps([3700, 90000, 200000]),
            event_timestamp=NOW,
            mid_market_rate_to_usd=1.0,
            actual_rate_to_usd=1.0,
            shipping_country="US",
            ip_country="US",
            paypal_account_age_days=365,
            paypal_account_verified=True,
            prior_dispute_count=0,
        )
        defaults.update(overrides)
        return extract_features(**defaults)

    def test_returns_feature_vector(self):
        fv = self._base_call()
        assert isinstance(fv, FeatureVector)

    def test_geo_mismatch_flagged(self):
        fv = self._base_call(shipping_country="US", ip_country="NG")
        assert fv.geo_mismatch == 1.0

    def test_geo_match_not_flagged(self):
        fv = self._base_call(shipping_country="US", ip_country="US")
        assert fv.geo_mismatch == 0.0

    def test_high_velocity_detected(self):
        # 5 transactions in the last 30 minutes
        ts = make_timestamps([300, 600, 900, 1200, 1500])
        fv = self._base_call(prior_timestamps=ts)
        assert fv.velocity_1h == 5.0

    def test_to_dict_has_all_keys(self):
        fv = self._base_call()
        d = fv.to_dict()
        expected_keys = {
            "amount_zscore", "velocity_1h", "velocity_24h",
            "velocity_7d", "fx_spread", "geo_mismatch", "account_risk_score",
        }
        assert expected_keys == set(d.keys())

    def test_to_list_length(self):
        fv = self._base_call()
        assert len(fv.to_list()) == 7

    def test_fx_spread_propagated(self):
        fv = self._base_call(mid_market_rate_to_usd=1.0, actual_rate_to_usd=1.05)
        assert abs(fv.fx_spread - 0.05) < 1e-5
