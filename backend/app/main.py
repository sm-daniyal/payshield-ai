"""
PayShield AI — FastAPI Application Entry Point

Registers all routers and exposes the application health check.
The /evaluate endpoint (Phase 2) will be wired in here once the ML model is ready.
"""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.engine.model_runner import ModelRunner

logger = logging.getLogger("payshield.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan handler: Pre-warm ModelRunner on startup to prevent cold-start latency."""
    logger.info("Pre-warming LightGBM model runner and SHAP explainer...")
    try:
        runner = ModelRunner.get_instance()
        logger.info("ModelRunner pre-warmed successfully (%d features loaded)", len(runner.feature_names))
    except Exception as exc:
        logger.error("Failed to pre-warm ModelRunner on startup: %s", exc)
    yield


app = FastAPI(
    title="PayShield AI",
    description=(
        "Pre-transaction trust layer for agentic commerce on PayPal: "
        "agent risk scoring, L402 monetization, and dispute EV recovery."
    ),
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.api.evaluate import router as evaluate_router
from app.api.webhooks import router as webhooks_router
from app.api.disputes import router as disputes_router
from app.api.threats import router as threats_router
from app.api.l402 import router as l402_router

app.include_router(evaluate_router)
app.include_router(webhooks_router)
app.include_router(disputes_router)
app.include_router(threats_router)
app.include_router(l402_router)


@app.get("/api/health", tags=["System"])
async def health_check():
    """System health check — confirms the API is running."""
    return {"status": "ok", "service": "payshield-ai"}
