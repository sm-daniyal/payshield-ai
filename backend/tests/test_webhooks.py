"""
PayShield AI — PayPal Webhook Integration Tests

Webhook processing order (per webhooks.py):
  1. Read raw body. If empty → 400.
  2. Parse JSON. If malformed → 400.
     (PayPal's verify endpoint requires the parsed webhook_event, 
      so we cannot verify a malformed payload — rejecting with 400 
      is correct.)
  3. Check all 5 PAYPAL-* headers. If any missing → 401.
  4. Call PayPal /v1/notifications/verify-webhook-signature.
     If network error, timeout, or verification_status != "SUCCESS" 
     → 401.
  5. Check SQLite idempotency on transmission_id. If duplicate → 
     200 "DUPLICATE".
  6. Dispatch to pipeline + audit write.
"""
from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient

from app.db.audit_store import AuditStore
from app.main import app

client = TestClient(app)

MOCK_HEADERS = {
    "PAYPAL-TRANSMISSION-ID": "WH-TX-TEST-001",
    "PAYPAL-TRANSMISSION-TIME": "2026-10-16T12:00:00Z",
    "PAYPAL-TRANSMISSION-SIG": "mock_valid_signature_base64",
    "PAYPAL-CERT-URL": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-123",
    "PAYPAL-AUTH-ALGO": "SHA256withRSA",
}

ORDER_PAYLOAD = {
    "id": "WH-ORDER-EVT-01",
    "event_type": "CHECKOUT.ORDER.APPROVED",
    "resource": {
        "id": "ORD-LIVE-WEBHOOK-99",
        "amount": {"value": "89.50", "currency_code": "USD"},
        "payer": {"email_address": "safe.buyer@example.com"},
    },
}

DISPUTE_PAYLOAD = {
    "id": "WH-DSP-EVT-02",
    "event_type": "CUSTOMER.DISPUTE.CREATED",
    "resource": {
        "dispute_id": "PP-D-WEBHOOK-88",
        "dispute_amount": {"value": "160.00", "currency_code": "USD"},
        "disputed_transactions": [{"seller_transaction_id": "TXN-ORIG-88"}],
    },
}


class TestWebhookProcessingPipeline:
    @patch("httpx.AsyncClient.post", new_callable=AsyncMock)
    def test_valid_signature_accepted(self, mock_post, monkeypatch):
        monkeypatch.setattr("app.config.settings.paypal_webhook_id", "WH-CONFIG-ID-123")
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"verification_status": "SUCCESS"},
        )
        headers = {**MOCK_HEADERS, "PAYPAL-TRANSMISSION-ID": f"WH-TX-{uuid.uuid4().hex[:8]}"}
        res = client.post("/api/v1/paypal/webhook", json=ORDER_PAYLOAD, headers=headers)
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "PROCESSED"
        assert body["pipeline"] == "RISK_RADAR"

    @patch("httpx.AsyncClient.post", new_callable=AsyncMock)
    def test_invalid_signature_rejected_401(self, mock_post, monkeypatch):
        monkeypatch.setattr("app.config.settings.paypal_webhook_id", "WH-CONFIG-ID-123")
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"verification_status": "FAILURE"},
        )
        headers = {**MOCK_HEADERS, "PAYPAL-TRANSMISSION-ID": f"WH-TX-{uuid.uuid4().hex[:8]}"}
        res = client.post("/api/v1/paypal/webhook", json=ORDER_PAYLOAD, headers=headers)
        assert res.status_code == 401
        assert "Invalid PayPal webhook signature" in res.json()["detail"]

    def test_missing_signature_headers_rejected_401(self, monkeypatch):
        monkeypatch.setattr("app.config.settings.paypal_webhook_id", "WH-CONFIG-ID-123")
        # Only 4 of 5 headers provided (missing PAYPAL-CERT-URL)
        incomplete_headers = {
            "PAYPAL-TRANSMISSION-ID": f"WH-TX-{uuid.uuid4().hex[:8]}",
            "PAYPAL-TRANSMISSION-TIME": "2026-10-16T12:00:00Z",
            "PAYPAL-TRANSMISSION-SIG": "mock_sig_base64",
            "PAYPAL-AUTH-ALGO": "SHA256withRSA",
        }
        audit_store = AuditStore()
        initial_txs = len(audit_store.get_recent_transactions())

        res = client.post("/api/v1/paypal/webhook", json=ORDER_PAYLOAD, headers=incomplete_headers)
        assert res.status_code == 401
        assert "Missing required PayPal webhook signature headers" in res.json()["detail"]

        # Assert no state mutation
        after_txs = len(audit_store.get_recent_transactions())
        assert after_txs == initial_txs

    def test_malformed_payload_rejected_400(self):
        headers = {**MOCK_HEADERS, "Content-Type": "application/json"}
        res = client.post("/api/v1/paypal/webhook", content=b"not json at all", headers=headers)
        assert res.status_code == 400
        assert "Malformed JSON" in res.json()["detail"]

    @patch("httpx.AsyncClient.post", new_callable=AsyncMock)
    def test_paypal_verify_timeout_fails_closed(self, mock_post, monkeypatch):
        monkeypatch.setattr("app.config.settings.paypal_webhook_id", "WH-CONFIG-ID-123")
        mock_post.side_effect = httpx.TimeoutException("Connection timed out during verification")
        headers = {**MOCK_HEADERS, "PAYPAL-TRANSMISSION-ID": f"WH-TX-{uuid.uuid4().hex[:8]}"}
        res = client.post("/api/v1/paypal/webhook", json=ORDER_PAYLOAD, headers=headers)
        assert res.status_code == 401
        assert "network/timeout error" in res.json()["detail"]

    def test_empty_webhook_id_config_fails_closed(self, monkeypatch):
        monkeypatch.setattr("app.config.settings.paypal_webhook_id", "")
        headers = {**MOCK_HEADERS, "PAYPAL-TRANSMISSION-ID": f"WH-TX-{uuid.uuid4().hex[:8]}"}
        res = client.post("/api/v1/paypal/webhook", json=ORDER_PAYLOAD, headers=headers)
        assert res.status_code == 401
        assert "webhook_id is not configured" in res.json()["detail"]

    @patch("httpx.AsyncClient.post", new_callable=AsyncMock)
    def test_duplicate_transmission_id_returns_duplicate(self, mock_post, monkeypatch):
        monkeypatch.setattr("app.config.settings.paypal_webhook_id", "WH-CONFIG-ID-123")
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"verification_status": "SUCCESS"},
        )
        unique_tx_id = f"WH-TX-IDEMP-{uuid.uuid4().hex[:8]}"
        headers = {**MOCK_HEADERS, "PAYPAL-TRANSMISSION-ID": unique_tx_id}
        payload = {
            **ORDER_PAYLOAD,
            "resource": {**ORDER_PAYLOAD["resource"], "id": f"ORD-DEDUP-{uuid.uuid4().hex[:8]}"},
        }

        audit_store = AuditStore()
        initial_txs = len(audit_store.get_recent_transactions(limit=10000))

        # 1. First POST -> 200 PROCESSED
        res1 = client.post("/api/v1/paypal/webhook", json=payload, headers=headers)
        assert res1.status_code == 200
        assert res1.json()["status"] == "PROCESSED"

        # 2. Second POST -> 200 DUPLICATE
        res2 = client.post("/api/v1/paypal/webhook", json=payload, headers=headers)
        assert res2.status_code == 200
        assert res2.json()["status"] == "DUPLICATE"
        assert res2.json()["transmission_id"] == unique_tx_id

        # Assert audit log has exactly 1 new record
        after_txs = len(audit_store.get_recent_transactions(limit=10000))
        assert after_txs == initial_txs + 1

    @patch("httpx.AsyncClient.post", new_callable=AsyncMock)
    def test_checkout_order_approved_dispatches_to_risk_pipeline(self, mock_post, monkeypatch):
        monkeypatch.setattr("app.config.settings.paypal_webhook_id", "WH-CONFIG-ID-123")
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"verification_status": "SUCCESS"},
        )
        headers = {**MOCK_HEADERS, "PAYPAL-TRANSMISSION-ID": f"WH-TX-{uuid.uuid4().hex[:8]}"}
        res = client.post("/api/v1/paypal/webhook", json=ORDER_PAYLOAD, headers=headers)
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "PROCESSED"
        assert body["pipeline"] == "RISK_RADAR"
        assert "risk_score" in body
        assert len(body["audit_hash"]) == 64

    @patch("httpx.AsyncClient.post", new_callable=AsyncMock)
    def test_customer_dispute_created_dispatches_to_dispute_pipeline(self, mock_post, monkeypatch):
        monkeypatch.setattr("app.config.settings.paypal_webhook_id", "WH-CONFIG-ID-123")
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"verification_status": "SUCCESS"},
        )
        headers = {**MOCK_HEADERS, "PAYPAL-TRANSMISSION-ID": f"WH-TX-{uuid.uuid4().hex[:8]}"}
        res = client.post("/api/v1/paypal/webhook", json=DISPUTE_PAYLOAD, headers=headers)
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "PROCESSED"
        assert body["pipeline"] == "DISPUTE_RECOVERY"
        assert "win_probability" in body
        assert len(body["audit_hash"]) == 64
