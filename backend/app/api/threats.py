"""
PayShield AI — Threat Intelligence API Router

Exposes GET /api/v1/threats
Delivers categorized, severity-ranked PayPal fraud alerts and mitigation mappings.
"""
from __future__ import annotations

from fastapi import APIRouter, Query, status
from app.engine.threat_intel import (
    ThreatArticle,
    get_latest_threat_bulletins,
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
