"""
PayShield AI — PayPal Sandbox REST API Client

Integrates directly with PayPal Sandbox endpoints:
  - OAuth 2.0 Token Management (/v1/oauth2/token) with in-memory TTL caching
  - Orders v2 (/v2/checkout/orders)
  - Disputes v1 (/v1/customer/disputes)
  - Reporting & Transaction Search (/v1/reporting/transactions)

Designed for resilience: If sandbox credentials are unconfigured or in development,
provides structured mock payloads to ensure testability without blocking.
"""
from __future__ import annotations

import base64
import time
import uuid
from typing import Any
import httpx

from app.config import settings


class PayPalClient:
    """Async HTTP client for PayPal Sandbox REST APIs."""

    def __init__(
        self,
        client_id: str | None = None,
        client_secret: str | None = None,
        base_url: str | None = None,
    ) -> None:
        self.client_id = client_id or settings.paypal_client_id
        self.client_secret = client_secret or settings.paypal_client_secret
        self.base_url = (base_url or settings.paypal_base_url).rstrip("/")
        self._cached_token: str | None = None
        self._token_expires_at: float = 0.0

    @property
    def is_configured(self) -> bool:
        """True if real client credentials are provided."""
        return bool(
            self.client_id
            and self.client_secret
            and not self.client_id.startswith("your_")
        )

    async def get_access_token(self) -> str:
        """
        Retrieve OAuth 2.0 Bearer token via client credentials grant.
        Caches token until 60 seconds before expiration.
        """
        now = time.time()
        if self._cached_token and now < (self._token_expires_at - 60):
            return self._cached_token

        if not self.is_configured:
            # Fallback mock token for sandbox dev/testing
            self._cached_token = "mock_paypal_sandbox_token_access"
            self._token_expires_at = now + 3600
            return self._cached_token

        auth_header = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()

        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded",
            "PayPal-Request-Id": str(uuid.uuid4()),
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.base_url}/v1/oauth2/token",
                headers=headers,
                data=data,
            )
            resp.raise_for_status()
            payload = resp.json()
            token = payload["access_token"]
            expires_in = payload.get("expires_in", 3600)
            self._cached_token = token
            self._token_expires_at = now + expires_in
            return token

    async def _get_auth_headers(self) -> dict[str, str]:
        token = await self.get_access_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def create_order(
        self,
        amount: float | str,
        currency: str = "USD",
        custom_id: str | None = None,
        paypal_request_id: str | None = None,
    ) -> dict[str, Any]:
        """Create an order via PayPal Orders v2 API."""
        amount = float(amount)
        if not self.is_configured:
            return {
                "id": f"ORD-MOCK-{uuid.uuid4().hex[:6].upper()}",
                "status": "CREATED",
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {"currency_code": currency, "value": f"{amount:.2f}"},
                        "custom_id": custom_id or "",
                    }
                ],
            }

        headers = await self._get_auth_headers()
        headers["PayPal-Request-Id"] = paypal_request_id or str(uuid.uuid4())
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {"currency_code": currency, "value": f"{amount:.2f}"},
                    "custom_id": custom_id or "",
                }
            ],
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/checkout/orders",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()

    async def capture_order(
        self,
        order_id: str,
        paypal_request_id: str | None = None,
    ) -> dict[str, Any]:
        """Capture an approved order via PayPal Orders v2 API."""
        if not self.is_configured:
            return {
                "id": order_id,
                "status": "COMPLETED",
                "purchase_units": [
                    {
                        "payments": {
                            "captures": [
                                {
                                    "id": f"CAP-MOCK-{uuid.uuid4().hex[:6].upper()}",
                                    "status": "COMPLETED",
                                }
                            ]
                        }
                    }
                ],
            }

        headers = await self._get_auth_headers()
        headers["PayPal-Request-Id"] = paypal_request_id or str(uuid.uuid4())
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.base_url}/v2/checkout/orders/{order_id}/capture",
                headers=headers,
            )
            resp.raise_for_status()
            return resp.json()

    async def get_order(self, order_id: str) -> dict[str, Any]:
        """Fetch details of an order from PayPal Orders v2 API."""
        if not self.is_configured:
            return {
                "id": order_id,
                "status": "APPROVED",
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {"currency_code": "USD", "value": "125.00"},
                        "shipping": {
                            "address": {"country_code": "US", "admin_area_2": "San Jose"}
                        },
                    }
                ],
                "payer": {
                    "email_address": "sb-buyer@business.example.com",
                    "payer_id": "BUYER-MOCK-ID-99",
                    "address": {"country_code": "US"},
                },
            }

        headers = await self._get_auth_headers()
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.base_url}/v2/checkout/orders/{order_id}",
                headers=headers,
            )
            resp.raise_for_status()
            return resp.json()

    async def get_dispute(self, dispute_id: str) -> dict[str, Any]:
        """Fetch dispute details from PayPal Disputes v1 API."""
        if not self.is_configured:
            return {
                "dispute_id": dispute_id,
                "status": "OPEN",
                "dispute_amount": {"currency_code": "USD", "value": "150.00"},
                "dispute_reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
                "dispute_life_cycle_stage": "CHARGEBACK",
                "seller_response_due_date": "2026-11-01T12:00:00Z",
                "disputed_transactions": [
                    {
                        "seller_transaction_id": "TXN-8821039",
                        "buyer": {"name": "Alex Mercer", "email": "alex.m@example.com"},
                    }
                ],
            }

        headers = await self._get_auth_headers()
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.base_url}/v1/customer/disputes/{dispute_id}",
                headers=headers,
            )
            resp.raise_for_status()
            return resp.json()

    async def submit_dispute_evidence(
        self,
        dispute_id: str,
        evidence_type: str,
        notes: str,
        paypal_request_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Submit proof/evidence to contest a dispute via PayPal Disputes v1 API:
        POST /v1/customer/disputes/{dispute_id}/provide-evidence
        """
        if not self.is_configured:
            return {
                "status": "EVIDENCE_SUBMITTED_SUCCESS",
                "dispute_id": dispute_id,
                "evidence_type": evidence_type,
                "notes_length": len(notes),
                "timestamp": "2026-10-13T14:45:00Z",
            }

        headers = await self._get_auth_headers()
        headers["PayPal-Request-Id"] = paypal_request_id or str(uuid.uuid4())
        payload = {
            "evidence_type": evidence_type,
            "evidence_info": {"tracking_info": []},
            "notes": notes,
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                f"{self.base_url}/v1/customer/disputes/{dispute_id}/provide-evidence",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()
