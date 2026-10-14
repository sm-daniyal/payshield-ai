"""
PayShield AI — Copilot Unit Tests

Tests cover:
  1. Dispute recovery ROI inquiry explaining PayPal $15 dispute fee.
  2. Transaction risk explanation referencing SHAP additivity invariant.
  3. Live threat intelligence summary inquiry.
  4. General merchant fallback.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestCopilotApi:
    def test_dispute_writeoff_guidance(self):
        payload = {
            "query": "Should I write off a small $14 dispute or contest it?",
            "context_type": "DISPUTE",
        }
        res = client.post("/api/v1/copilot/query", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["action_suggestion"] == "AUTO_WRITE_OFF_UNECONOMIC"
        assert "$15.00" in data["answer"]
        assert len(data["grounded_evidence"]) >= 1

    def test_dispute_high_value_guidance(self):
        payload = {
            "query": "Can we contest an order with carrier delivery proof?",
            "context_type": "DISPUTE",
        }
        res = client.post("/api/v1/copilot/query", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["action_suggestion"] == "PROCEED_DIRECT_DISPUTE"
        assert "Disputes v1" in data["answer"]

    def test_transaction_risk_explanation(self):
        payload = {
            "query": "Why was this transaction assigned a critical fraud score?",
            "context_type": "TRANSACTION",
        }
        res = client.post("/api/v1/copilot/query", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "SHAP TreeExplainer" in data["answer"]
        assert "Additivity Seal" in data["answer"]
        assert data["confidence_score"] >= 0.90

    def test_threat_intelligence_query(self):
        payload = {
            "query": "What are the latest botnet attack vectors targeting checkout?",
            "context_type": "THREAT",
        }
        res = client.post("/api/v1/copilot/query", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "velocity" in data["answer"].lower()
        assert len(data["grounded_evidence"]) >= 1
