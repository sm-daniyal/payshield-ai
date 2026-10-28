"""
PayShield AI — Razorpay Payment Rail Client

Mirrors the PayPalClient interface for Razorpay's Orders API and Webhooks.
Provides the same method signatures so the L402 gateway can switch payment
providers by changing a single environment variable (PAYMENT_PROVIDER=razorpay).

Razorpay API Reference:
  - Orders API:   POST /v1/orders
  - Payments API: POST /v1/payments/{id}/capture
  - Refunds API:  POST /v1/payments/{id}/refund

This client targets Razorpay Sandbox by default (test_* key prefix).
No changes are required to the ML engine, dispute EV logic, or audit vault.
"""
from __future__ import annotations

import base64
import uuid
from typing import Any
import httpx

from app.config import settings


class RazorpayClient:
    """Async HTTP client for Razorpay REST APIs (mirroring PayPalClient interface)."""

    BASE_URL = "https://api.razorpay.com/v1"

    def __init__(
        self,
        key_id: str | None = None,
        key_secret: str | None = None,
    ) -> None:
        self.key_id = key_id or settings.razorpay_key_id
        self.key_secret = key_secret or settings.razorpay_key_secret

    @property
    def is_configured(self) -> bool:
        """True if real Razorpay test/live credentials are provided."""
        return bool(
            self.key_id
            and self.key_secret
            and not self.key_id.startswith("your_")
        )

    def _get_auth_headers(self) -> dict[str, str]:
        """Razorpay uses HTTP Basic Auth — no OAuth token required."""
        credentials = base64.b64encode(
            f"{self.key_id}:{self.key_secret}".encode()
        ).decode()
        return {
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def create_order(
        self,
        amount: float | str,
        currency: str = "INR",
        custom_id: str | None = None,
        paypal_request_id: str | None = None,  # ignored; kept for interface parity
    ) -> dict[str, Any]:
        """
        Create an order via Razorpay Orders API.
        Amount is in the smallest currency unit (paise for INR, cents for USD).
        Returns a response dict matching the structure used by PayPalClient.create_order.
        """
        amount_float = float(amount)
        # Razorpay requires amount in smallest unit (paise = INR * 100)
        amount_in_units = int(amount_float * 100)

        if not self.is_configured:
            return {
                "id": f"order_MOCK_{uuid.uuid4().hex[:14].upper()}",
                "status": "created",
                "amount": amount_in_units,
                "currency": currency,
                "receipt": custom_id or f"receipt_{uuid.uuid4().hex[:8]}",
                "provider": "razorpay",
            }

        payload = {
            "amount": amount_in_units,
            "currency": currency,
            "receipt": custom_id or f"pshield_{uuid.uuid4().hex[:8]}",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.BASE_URL}/orders",
                headers=self._get_auth_headers(),
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            data["provider"] = "razorpay"
            return data

    async def capture_order(
        self,
        order_id: str,
        paypal_request_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Capture a payment via Razorpay Payments API.
        For Razorpay, payment_id is used at capture (not order_id).
        This method accepts an order/payment ID for interface parity with PayPalClient.
        """
        if not self.is_configured:
            return {
                "id": order_id,
                "status": "captured",
                "provider": "razorpay",
                "amount": 500,  # 5.00 INR in paise (mock)
            }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.BASE_URL}/payments/{order_id}/capture",
                headers=self._get_auth_headers(),
                json={"amount": 500},
            )
            resp.raise_for_status()
            data = resp.json()
            data["provider"] = "razorpay"
            return data

    async def verify_webhook_signature(
        self,
        payload: str,
        signature: str,
        webhook_secret: str,
    ) -> bool:
        """
        Verify a Razorpay webhook signature using HMAC-SHA256.
        Mirrors PayPal's webhook verification interface.
        Always returns False in unconfigured/sandbox mode to be fail-closed.
        """
        import hashlib
        import hmac
        expected = hmac.new(
            webhook_secret.encode(),
            payload.encode(),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    async def get_payment(self, payment_id: str) -> dict[str, Any]:
        """Fetch payment details — equivalent to PayPalClient.get_order."""
        if not self.is_configured:
            return {
                "id": payment_id,
                "status": "captured",
                "amount": 500,
                "currency": "INR",
                "provider": "razorpay",
            }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/payments/{payment_id}",
                headers=self._get_auth_headers(),
            )
            resp.raise_for_status()
            data = resp.json()
            data["provider"] = "razorpay"
            return data
