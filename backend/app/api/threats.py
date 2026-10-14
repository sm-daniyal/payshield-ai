"""
PayShield AI — Threat Intelligence API Router

Exposes GET /api/v1/threats
Delivers categorized, severity-ranked PayPal fraud alerts and mitigation mappings.
"""
from __future__ import annotations

from fastapi import APIRouter, Query, status
from app.engine.threat_intel import (
    ThreatArticle,
    NewsletterSubscriptionRequest,
    NewsletterSubscriptionResponse,
    get_latest_threat_bulletins,
    register_newsletter_subscription,
)

router = APIRouter(prefix="/api/v1", tags=["Threat Intelligence"])


@router.get(
    "/threats",
    response_model=list[ThreatArticle],
    status_code=status.HTTP_200_OK,
    summary="Retrieve real-time PayPal fraud threat bulletins and mitigation mappings",
)
async def list_threat_bulletins(
    category: str | None = Query(default=None, description="Optional category filter (e.g. CARD_TESTING, CROSS_BORDER_FX)")
) -> list[ThreatArticle]:
    return get_latest_threat_bulletins(category=category)


@router.post(
    "/threats/newsletter/subscribe",
    response_model=NewsletterSubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subscribe merchant email to real-time PayPal threat bulletins",
)
async def subscribe_newsletter(req: NewsletterSubscriptionRequest) -> NewsletterSubscriptionResponse:
    return register_newsletter_subscription(req)

