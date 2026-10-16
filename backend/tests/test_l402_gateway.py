"""
PayShield AI — L402 Protocol & Agentic Commerce Unit Tests

Tests cover:
  1. HTTP 402 Payment Required challenge on unauthenticated request.
  2. L402 payment offer structure conforming to L402 specification.
  3. Programmatic PayPal micropayment settlement & cryptographic token issuance.
  4. Authenticated request successfully unlocking premium threat intelligence.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestL402AgenticGateway:
    def test_unauthenticated_request_triggers_http_402(self):
        """AI agent hitting feed without token must receive HTTP 402 Payment Required."""
        res = client.get("/api/v1/l402/threat-feed")
        assert res.status_code == 402
        body = res.json()
        assert body["version"] == "0.2.3"
        assert "payment_context_token" in body
        assert "payment_request_url" in body
        assert len(body["offers"]) >= 1
        assert body["offers"][0]["payment_methods"] == ["paypal"]
        assert "WWW-Authenticate" in res.headers

    def test_l402_challenge_endpoint(self):
        res = client.get("/api/v1/l402/challenge")
        assert res.status_code == 200
        body = res.json()
        assert body["version"] == "0.2.3"
        assert len(body["offers"]) >= 1

    def test_settle_payment_and_unlock_feed(self):
        """Full agentic flow: Challenge -> Payment -> Token -> Unlocked Data."""
        # 1. Fetch challenge
        chal_res = client.get("/api/v1/l402/threat-feed")
        assert chal_res.status_code == 402
        context_token = chal_res.json()["payment_context_token"]

        # 2. Agent settles PayPal micropayment
        pay_payload = {
            "payment_context_token": context_token,
            "offer_id": "single_bulletin",
            "agent_id": "test_risk_crawler_01",
        }
        pay_res = client.post("/api/v1/l402/payment-request", json=pay_payload)
        assert pay_res.status_code == 200
        pay_body = pay_res.json()
        assert pay_body["status"] == "PAYMENT_CONFIRMED"
        assert "PP-L402-" in pay_body["paypal_order_id"]
        token = pay_body["bearer_token"]
        assert token.startswith("l402_")

        # 3. Agent re-requests with Bearer token -> HTTP 200 UNLOCKED
        auth_res = client.get(
            "/api/v1/l402/threat-feed",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert auth_res.status_code == 200
        auth_body = auth_res.json()
        assert auth_body["status"] == "UNLOCKED"
        assert auth_body["access_granted"] is True
        assert len(auth_body["data"]) >= 1

    def test_threat_bulletins_filter_by_category(self):
        """Threat intelligence endpoint supports category filtering."""
        all_res = client.get("/api/v1/threats")
        assert all_res.status_code == 200
        assert len(all_res.json()) >= 4

        cat_res = client.get("/api/v1/threats?category=MERCHANT_CHRONICLES")
        assert cat_res.status_code == 200
        items = cat_res.json()
        assert len(items) >= 1
        assert all(i["category"] == "MERCHANT_CHRONICLES" for i in items)

