"""
PayShield AI — FastAPI Application Entry Point

Registers all routers and exposes the application health check.
The /evaluate endpoint (Phase 2) will be wired in here once the ML model is ready.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="PayShield AI",
    description=(
        "Real-time, zero-hallucination transaction-risk scoring and autonomous "
        "dispute recovery engine for PayPal merchants."
    ),
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
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
