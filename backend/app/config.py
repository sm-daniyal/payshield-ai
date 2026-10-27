"""
PayShield AI — Application Configuration
Pydantic v2 settings loaded from environment variables.
All sensitive values (PayPal credentials) are read from .env — never hardcoded.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # PayPal Sandbox
    paypal_client_id: str = ""
    paypal_client_secret: str = ""
    paypal_base_url: str = "https://api-m.sandbox.paypal.com"
    paypal_webhook_id: str = ""

    # Application
    app_env: str = "development"
    log_level: str = "INFO"
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ]

    # ML Decision Engine — cost-optimal threshold from threshold sweep
    cost_optimal_threshold: float = 0.40
    dispute_filing_fee_usd: float = 15.00

    # Database
    database_url: str = "sqlite:///./payshield_audit.db"


settings = Settings()
