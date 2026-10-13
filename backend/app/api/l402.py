"""
PayShield AI — L402 Agentic Paywall Router

Exposes:
  - GET  /api/v1/l402/threat-feed: Protected by HTTP 402 L402 Protocol.
  - POST /api/v1/l402/payment-request: Handles programmatic PayPal micro-settlement.
  - GET  /api/v1/l402/challenge: Fetches active payment offers.
"""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Header, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse

from app.engine.l402_gateway import (
    L402PaymentChallenge,
    L402PaymentRequest,
    L402PaymentResponse,
    generate_l402_challenge,
    issue_l402_token,
    verify_l402_token,
)
from app.engine.threat_intel import get_latest_threat_bulletins

router = APIRouter(prefix="/api/v1/l402", tags=["L402 Agentic Commerce"])


@router.get(
    "/threat-feed",
    summary="Agentic Threat Intelligence Feed (Protected by L402 Paywall)",
    description=(
        "If called without a valid Bearer token, returns HTTP 402 Payment Required "
        "with L402 PayPal payment challenge. Once paid, unlocks zero-day fraud bulletins."
    ),
)
async def get_l402_protected_feed(
    request: Request,
    authorization: str | None = Header(default=None),
) -> Any:
    # 1. Check if caller provided valid L402 token
    if authorization and verify_l402_token(authorization):
        bulletins = get_latest_threat_bulletins()
        return {
            "status": "UNLOCKED",
            "protocol": "L402",
            "access_granted": True,
            "data": bulletins,
            "message": "Authorized via PayPal L402 cryptographic token.",
        }

    # 2. Return HTTP 402 Payment Required with L402 Challenge
    server_base = str(request.base_url).rstrip("/")
    challenge = generate_l402_challenge(server_url=server_base)
    return JSONResponse(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        content=challenge.model_dump(),
        headers={"WWW-Authenticate": f"L402 token_url='{challenge.payment_request_url}'"},
    )


@router.post(
    "/payment-request",
    response_model=L402PaymentResponse,
    status_code=status.HTTP_200_OK,
    summary="Settle L402 micro-payment via PayPal Sandbox and obtain Bearer token",
)
async def process_l402_payment(payload: L402PaymentRequest) -> L402PaymentResponse:
    # Simulates instant PayPal order creation & capture for agent micro-settlement
    token_response = issue_l402_token(
        offer_id=payload.offer_id,
        agent_id=payload.agent_id,
    )
    return token_response


@router.get(
    "/challenge",
    response_model=L402PaymentChallenge,
    summary="Retrieve current L402 challenge parameters and payment offers",
)
async def get_challenge_parameters(request: Request) -> L402PaymentChallenge:
    server_base = str(request.base_url).rstrip("/")
    return generate_l402_challenge(server_url=server_base)
