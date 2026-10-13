"""
PayShield AI — ML Inference, SHAP Explainability & Policy Unit Tests

Tests cover:
  1. Deterministic 5-rule decision policy boundary conditions.
  2. Bounded action invariance across entire probability spectrum.
  3. Grounded SHAP additivity invariant (delta < 1e-4).
  4. End-to-end ModelRunner transaction evaluation.
  5. FastAPI POST /api/v1/evaluate integration endpoint.
"""
from __future__ import annotations

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient

from app.engine.decision_engine import (
    ACTION_ALLOW,
    ACTION_ALLOW_WITH_MONITORING,
    ACTION_BLOCK_AND_FLAG_DISPUTE,
    ACTION_STEP_UP_VERIFICATION,
    evaluate_policy,
)
from app.engine.model_runner import ModelRunner
from app.main import app
from app.schemas.transaction import (
    TransactionEvaluationRequest,
    TransactionHistory,
)

client = TestClient(app)
NOW = datetime(2026, 10, 13, 14, 0, 0, tzinfo=timezone.utc)


# ---------------------------------------------------------------------------
# 1. Deterministic Decision Engine Tests
# ---------------------------------------------------------------------------

class TestDecisionEngine:
    def test_rule_1_allow_low_risk(self):
        res = evaluate_policy(probability=0.08, amount_usd=120.00)
        assert res.action == ACTION_ALLOW
        assert "RULE_1" in res.rule_triggered
        assert res.risk_level == "LOW"

    def test_rule_2_monitoring_under_threshold(self):
        res = evaluate_policy(probability=0.28, amount_usd=75.00)
        assert res.action == ACTION_ALLOW_WITH_MONITORING
        assert "RULE_2" in res.rule_triggered
        assert res.risk_level == "MEDIUM"

    def test_rule_3_step_up_verification(self):
        res = evaluate_policy(probability=0.52, amount_usd=300.00)
        assert res.action == ACTION_STEP_UP_VERIFICATION
        assert "RULE_3" in res.rule_triggered
        assert res.risk_level == "HIGH"

    def test_rule_4_standard_block_under_500(self):
        res = evaluate_policy(probability=0.82, amount_usd=150.00)
        assert res.action == ACTION_BLOCK_AND_FLAG_DISPUTE
        assert "RULE_4" in res.rule_triggered
        assert res.risk_level == "CRITICAL"

    def test_rule_5_critical_high_value_block_over_500(self):
        res = evaluate_policy(probability=0.89, amount_usd=2500.00)
        assert res.action == ACTION_BLOCK_AND_FLAG_DISPUTE
        assert "RULE_5" in res.rule_triggered
        assert res.risk_level == "CRITICAL_HIGH_VALUE"

    def test_bounded_actions_invariant(self):
        valid_actions = {
            ACTION_ALLOW,
            ACTION_ALLOW_WITH_MONITORING,
            ACTION_STEP_UP_VERIFICATION,
            ACTION_BLOCK_AND_FLAG_DISPUTE,
        }
        for p in [0.0, 0.19, 0.20, 0.39, 0.40, 0.64, 0.65, 0.99, 1.0]:
            for amt in [10.0, 499.99, 500.0, 10000.0]:
                res = evaluate_policy(probability=p, amount_usd=amt)
                assert res.action in valid_actions


# ---------------------------------------------------------------------------
# 2. ModelRunner & SHAP Additivity Seal Tests
# ---------------------------------------------------------------------------

class TestModelRunnerAndExplainability:
    @pytest.fixture(autouse=True)
    def setup_runner(self):
        self.runner = ModelRunner.get_instance()

    def test_model_loaded(self):
        assert self.runner.model is not None
        assert self.runner.explainer is not None
        assert len(self.runner.feature_names) == 7

    def test_evaluation_additivity_invariant(self):
        payload = TransactionEvaluationRequest(
            transaction_id="TXN-PAYPAL-TEST-001",
            amount_usd=85.00,
            buyer_email="buyer_safe@example.com",
            buyer_country="US",
            shipping_country="US",
            ip_country="US",
            buyer_currency="USD",
            mid_market_rate_to_usd=1.0,
            actual_rate_to_usd=1.0,
            paypal_account_age_days=720,
            paypal_account_verified=True,
            event_timestamp=NOW,
            history=TransactionHistory(
                amounts=[80.0, 85.0, 90.0],
                timestamps=[NOW],
                dispute_count=0,
            ),
        )

        resp = self.runner.evaluate(payload)
        assert 0.0 <= resp.risk_probability <= 1.0
        assert 0.0 <= resp.risk_score <= 100.0

        # Cryptographic additivity invariant: delta < 1e-4
        assert resp.additivity_verification.verified is True
        assert resp.additivity_verification.delta < 1e-4

        # Contributions structure
        assert len(resp.shap_contributions) == 7
        total_pct = sum(c.contribution_pct for c in resp.shap_contributions)
        assert abs(total_pct - 100.0) < 0.5

    def test_high_risk_suspicious_transaction(self):
        payload = TransactionEvaluationRequest(
            transaction_id="TXN-PAYPAL-FRAUD-999",
            amount_usd=1500.00,
            buyer_email="suspicious_carding@example.com",
            buyer_country="US",
            shipping_country="US",
            ip_country="NG",  # Geo mismatch
            buyer_currency="USD",
            mid_market_rate_to_usd=1.0,
            actual_rate_to_usd=1.12,  # Severe FX manipulation
            paypal_account_age_days=1,  # Brand new account
            paypal_account_verified=False,
            event_timestamp=NOW,
            history=TransactionHistory(
                amounts=[20.0, 25.0],
                timestamps=[NOW],
                dispute_count=3,
            ),
        )

        resp = self.runner.evaluate(payload)
        # Suspicious pattern should yield high risk and critical block
        assert resp.risk_probability >= 0.40
        assert resp.decision.action in {ACTION_STEP_UP_VERIFICATION, ACTION_BLOCK_AND_FLAG_DISPUTE}
        assert resp.additivity_verification.verified is True


# ---------------------------------------------------------------------------
# 3. FastAPI Endpoint Integration Tests
# ---------------------------------------------------------------------------

class TestApiEndpoints:
    def test_health_check(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_evaluate_endpoint(self):
        data = {
            "transaction_id": "ORD-LIVE-77123",
            "amount_usd": 125.50,
            "buyer_email": "consumer@example.com",
            "buyer_country": "US",
            "shipping_country": "US",
            "ip_country": "US",
            "buyer_currency": "USD",
            "mid_market_rate_to_usd": 1.0,
            "actual_rate_to_usd": 1.0,
            "paypal_account_age_days": 400,
            "paypal_account_verified": True,
            "event_timestamp": "2026-10-13T14:00:00Z",
            "history": {
                "amounts": [110.0, 120.0],
                "timestamps": ["2026-10-10T10:00:00Z"],
                "dispute_count": 0,
            },
        }
        response = client.post("/api/v1/evaluate", json=data)
        assert response.status_code == 200
        body = response.json()
        assert body["transaction_id"] == "ORD-LIVE-77123"
        assert "risk_score" in body
        assert "shap_contributions" in body
        assert body["additivity_verification"]["verified"] is True
        assert body["decision"]["action"] in [
            ACTION_ALLOW,
            ACTION_ALLOW_WITH_MONITORING,
            ACTION_STEP_UP_VERIFICATION,
            ACTION_BLOCK_AND_FLAG_DISPUTE,
        ]
