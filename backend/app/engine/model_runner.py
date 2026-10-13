"""
PayShield AI — Model Runner & Inference Pipeline

Loads the calibrated LightGBM model and SHAP explainer.
Coordinates the end-to-end evaluation flow:
  FeatureVector -> Model Inference (Calibrated Prob) -> Grounded SHAP -> Policy Decision
"""
from __future__ import annotations

import os
import pickle
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import numpy as np

from app.engine.decision_engine import evaluate_policy
from app.engine.feature_pipeline import FeatureVector, extract_features
from app.engine.shap_explainer import GroundedShapExplainer
from app.schemas.transaction import (
    PolicyDecision,
    TransactionEvaluationRequest,
    TransactionEvaluationResponse,
)

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"
MODEL_FILE = ARTIFACTS_DIR / "payshield_lgbm_v1.pkl"


class ModelRunner:
    """Singleton service for fraud risk scoring and explainability."""

    _instance: ModelRunner | None = None

    def __init__(self) -> None:
        self.model: Any = None
        self.base_estimator: Any = None
        self.feature_names: list[str] = []
        self.metrics: dict[str, float] = {}
        self.explainer: GroundedShapExplainer | None = None
        self._load_or_train()

    @classmethod
    def get_instance(cls) -> ModelRunner:
        if cls._instance is None:
            cls._instance = ModelRunner()
        return cls._instance

    def _load_or_train(self) -> None:
        """Load artifact from disk, or train a fresh one if missing."""
        if not MODEL_FILE.exists():
            from app.engine.train_model import train_and_export
            train_and_export(output_dir=ARTIFACTS_DIR)

        with open(MODEL_FILE, "rb") as f:
            data = pickle.load(f)

        self.model = data["model"]
        self.base_estimator = data["base_estimator"]
        self.feature_names = data["feature_names"]
        self.metrics = data.get("metrics", {})
        self.explainer = GroundedShapExplainer(
            base_estimator=self.base_estimator,
            feature_names=self.feature_names,
        )

    def evaluate(self, request: TransactionEvaluationRequest) -> TransactionEvaluationResponse:
        """
        Execute end-to-end risk evaluation for an incoming PayPal transaction.
        Strict separation of concerns maintained throughout.
        """
        # 1. Leakage-safe feature extraction
        fv = extract_features(
            current_amount_usd=request.amount_usd,
            prior_amounts=request.history.amounts,
            prior_timestamps=request.history.timestamps,
            event_timestamp=request.event_timestamp,
            mid_market_rate_to_usd=request.mid_market_rate_to_usd,
            actual_rate_to_usd=request.actual_rate_to_usd,
            shipping_country=request.shipping_country,
            ip_country=request.ip_country,
            paypal_account_age_days=request.paypal_account_age_days,
            paypal_account_verified=request.paypal_account_verified,
            prior_dispute_count=request.history.dispute_count,
        )

        # 2. Calibrated LightGBM inference
        import pandas as pd
        x_input = pd.DataFrame([fv.to_list()], columns=self.feature_names)
        prob_arr = self.model.predict_proba(x_input)[0]
        # Calibrated probability of fraud (positive class = index 1)
        risk_probability = float(prob_arr[1])
        risk_probability = max(0.0, min(1.0, risk_probability))
        risk_score = round(risk_probability * 100.0, 2)

        # 3. Grounded SHAP explainability & additivity check
        contributions, verification = self.explainer.explain(fv, risk_probability)

        # 4. Deterministic policy decision mapping
        decision_result = evaluate_policy(
            probability=risk_probability,
            amount_usd=request.amount_usd,
        )

        decision = PolicyDecision(
            action=decision_result.action,
            rule_triggered=decision_result.rule_triggered,
            cost_threshold_applied=decision_result.cost_threshold_applied,
        )

        return TransactionEvaluationResponse(
            transaction_id=request.transaction_id,
            risk_score=risk_score,
            risk_probability=round(risk_probability, 6),
            features=fv.to_dict(),
            shap_contributions=contributions,
            additivity_verification=verification,
            decision=decision,
            evaluation_timestamp=datetime.now(timezone.utc),
        )
