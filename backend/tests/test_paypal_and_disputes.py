"""
PayShield AI — PayPal Client, Webhooks & Dispute Recovery Unit Tests

Tests cover:
  1. PayPal REST client token management and API mock responses.
  2. Vasuli dispute economics: Expected Net Recovery with $15 PayPal fee.
  3. Evidence dossier compilation and formatting.
  4. SQLite audit store write and tamper-evident SHA-256 verification.
  5. Asynchronous PayPal webhook ingestion for orders and disputes.
"""
from __future__ import annotations

import os
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.db.audit_store import AuditStore
from app.engine.dispute_recovery import (
    ACTION_AUTO_WRITE_OFF_UNECONOMIC,
    ACTION_ESCALATE_MANUAL_REVIEW,
    ACTION_PROCEED_DIRECT_DISPUTE,
    DisputeEvidenceInput,
    compute_win_probability,
    evaluate_dispute_recovery,
)
from app.main import app
from app.paypal.client import PayPalClient

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. PayPal REST Client Tests
# ---------------------------------------------------------------------------

class TestPayPalClient:
    @pytest.mark.asyncio
    async def test_unconfigured_fallback_token(self):
        pp = PayPalClient(client_id="", client_secret="")
        assert pp.is_configured is False
        token = await pp.get_access_token()
        assert "mock" in token

    @pytest.mark.asyncio
    async def test_get_order_mock(self):
        pp = PayPalClient()
        order = await pp.get_order("ORD-TEST-12345")
        assert order["id"] == "ORD-TEST-12345"
        assert order["status"] == "APPROVED"
        assert order["purchase_units"][0]["amount"]["currency_code"] == "USD"

    @pytest.mark.asyncio
    async def test_get_dispute_mock(self):
        pp = PayPalClient()
        dispute = await pp.get_dispute("PP-D-5501")
        assert dispute["dispute_id"] == "PP-D-5501"
        assert dispute["status"] == "OPEN"

    @pytest.mark.asyncio
    async def test_submit_evidence_mock(self):
        pp = PayPalClient()
        res = await pp.submit_dispute_evidence(
            dispute_id="PP-D-5501",
            evidence_type="PROOF_OF_DELIVERY",
            notes="Tracking verified via USPS",
        )
        assert res["status"] == "EVIDENCE_SUBMITTED_SUCCESS"
        assert res["dispute_id"] == "PP-D-5501"


# ---------------------------------------------------------------------------
# 2. Vasuli Dispute Recovery Economics Tests
# ---------------------------------------------------------------------------

class TestDisputeRecoveryEconomics:
    def test_negative_ev_auto_write_off(self):
        # Small $12 dispute where $15 PayPal fee exceeds dispute amount
        evidence = DisputeEvidenceInput(
            dispute_id="DSP-SMALL-01",
            transaction_id="TXN-001",
            dispute_amount_usd=12.00,
            has_carrier_delivery_proof=False,
            has_avs_cvv_match=False,
        )
        res = evaluate_dispute_recovery(evidence)
        assert res.expected_net_recovery <= 0.0
        assert res.action == ACTION_AUTO_WRITE_OFF_UNECONOMIC
        assert "Negative expected recovery" in res.reasoning

    def test_high_confidence_proceed_direct(self):
        # $250 dispute with carrier proof of delivery and AVS match
        evidence = DisputeEvidenceInput(
            dispute_id="DSP-STRONG-02",
            transaction_id="TXN-002",
            dispute_amount_usd=250.00,
            has_carrier_delivery_proof=True,
            has_avs_cvv_match=True,
            buyer_prior_disputes=0,
            has_customer_chat_history=True,
            tracking_number="9400111899562537684000",
            carrier_name="USPS",
        )
        res = evaluate_dispute_recovery(evidence)
        assert res.win_probability >= 0.60
        assert res.expected_net_recovery > 50.0
        assert res.action == ACTION_PROCEED_DIRECT_DISPUTE
        assert "EVIDENCE DOSSIER" in res.evidence_dossier
        assert "9400111899562537684000" in res.evidence_dossier

    def test_moderate_confidence_manual_review(self):
        # $80 dispute with partial evidence (moderate EV)
        evidence = DisputeEvidenceInput(
            dispute_id="DSP-MOD-03",
            transaction_id="TXN-003",
            dispute_amount_usd=80.00,
            has_carrier_delivery_proof=False,
            has_avs_cvv_match=True,
            buyer_prior_disputes=0,
            has_customer_chat_history=True,
        )
        res = evaluate_dispute_recovery(evidence)
        assert res.expected_net_recovery > 0.0
        assert res.action in [ACTION_ESCALATE_MANUAL_REVIEW, ACTION_PROCEED_DIRECT_DISPUTE]


# ---------------------------------------------------------------------------
# 3. SQLite Audit Store Tests
# ---------------------------------------------------------------------------

class TestAuditStore:
    def test_record_and_retrieve_audit(self, tmp_path):
        db_file = tmp_path / "test_audit.db"
        audit = AuditStore(db_path=db_file)

        tx_hash = audit.record_transaction_evaluation(
            transaction_id="TXN-AUDIT-TEST-1",
            amount_usd=99.00,
            buyer_email="tester@example.com",
            risk_score=15.0,
            risk_probability=0.15,
            action="ALLOW",
            rule_triggered="RULE_1_PROB_BELOW_0_20_LOW_RISK",
            features={"amount_zscore": 0.1},
            shap_contributions=[{"feature": "amount_zscore", "shap_value": 0.01}],
            additivity_delta=0.00001,
        )
        assert len(tx_hash) == 64  # SHA-256 length

        records = audit.get_recent_transactions(limit=10)
        assert len(records) == 1
        assert records[0]["transaction_id"] == "TXN-AUDIT-TEST-1"
        assert records[0]["sha256_hash"] == tx_hash

        dsp_hash = audit.record_dispute_recovery(
            dispute_id="DSP-AUDIT-TEST-1",
            transaction_id="TXN-AUDIT-TEST-1",
            amount_usd=99.00,
            win_probability=0.75,
            expected_net_recovery=59.25,
            action=ACTION_PROCEED_DIRECT_DISPUTE,
            reasoning="Positive return",
            evidence_dossier="Proof Attached",
        )
        assert len(dsp_hash) == 64
        disputes = audit.get_recent_disputes(limit=10)
        assert len(disputes) == 1
        assert disputes[0]["dispute_id"] == "DSP-AUDIT-TEST-1"


# ---------------------------------------------------------------------------
# 4. Webhook & Dispute Endpoints Integration Tests
# ---------------------------------------------------------------------------

class TestWebhookAndDisputeEndpoints:
    def test_order_webhook_trigger(self):
        payload = {
            "id": "WH-ORDER-EVT-01",
            "event_type": "CHECKOUT.ORDER.APPROVED",
            "resource": {
                "id": "ORD-LIVE-WEBHOOK-99",
                "amount": {"value": "89.50", "currency_code": "USD"},
                "payer": {"email_address": "buyer_wh@example.com"},
            },
        }
        res = client.post("/api/v1/paypal/webhook", json=payload)
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "PROCESSED"
        assert body["pipeline"] == "RISK_RADAR"
        assert "risk_score" in body
        assert len(body["audit_hash"]) == 64

    def test_dispute_webhook_trigger(self):
        payload = {
            "id": "WH-DSP-EVT-02",
            "event_type": "CUSTOMER.DISPUTE.CREATED",
            "resource": {
                "dispute_id": "PP-D-WEBHOOK-88",
                "dispute_amount": {"value": "160.00", "currency_code": "USD"},
                "disputed_transactions": [{"seller_transaction_id": "TXN-ORIG-88"}],
            },
        }
        res = client.post("/api/v1/paypal/webhook", json=payload)
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "PROCESSED"
        assert body["pipeline"] == "DISPUTE_RECOVERY"
        assert body["action"] in [ACTION_PROCEED_DIRECT_DISPUTE, ACTION_ESCALATE_MANUAL_REVIEW]

    def test_dispute_evaluate_and_audit_query(self):
        eval_payload = {
            "dispute_id": "PP-D-MANUAL-77",
            "transaction_id": "TXN-MANUAL-77",
            "dispute_amount_usd": 130.00,
            "has_carrier_delivery_proof": True,
            "has_avs_cvv_match": True,
            "buyer_prior_disputes": 0,
            "has_customer_chat_history": True,
            "tracking_number": "1Z9999999999999999",
            "carrier_name": "UPS",
        }
        res = client.post("/api/v1/disputes/evaluate", json=eval_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["dispute_id"] == "PP-D-MANUAL-77"
        assert data["action"] == ACTION_PROCEED_DIRECT_DISPUTE

        # Query audit endpoints
        tx_res = client.get("/api/v1/audit/transactions")
        assert tx_res.status_code == 200
        assert isinstance(tx_res.json(), list)

        dsp_res = client.get("/api/v1/audit/disputes")
        assert dsp_res.status_code == 200
        assert isinstance(dsp_res.json(), list)
