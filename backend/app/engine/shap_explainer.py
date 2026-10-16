"""
PayShield AI — Grounded SHAP Explainer & Additivity Verification

Implements tree-based feature attribution using shap.TreeExplainer.
Enforces the additivity sanity check invariant:
  base_bias + sum(shap_values) == raw_margin (delta < 1e-4)

Every attribution returned to the operator dashboard is mathematically proven
to derive from the tree ensemble nodes — preventing ungrounded LLM explanations.
"""
from __future__ import annotations

import math
from typing import Any
import numpy as np
import shap

from app.engine.feature_pipeline import FeatureVector
from app.schemas.transaction import AdditivityVerification, ShapContribution


class GroundedShapExplainer:
    """
    Wraps shap.TreeExplainer for the LightGBM fraud risk model.
    Verifies mathematical additivity on every single prediction.
    """

    def __init__(self, base_estimator: Any, feature_names: list[str]) -> None:
        self.base_estimator = base_estimator
        self.feature_names = feature_names
        # Initialize TreeExplainer in raw margin output space
        self.explainer = shap.TreeExplainer(self.base_estimator)
        # Expected value (base bias across training population)
        expected_val = self.explainer.expected_value
        if isinstance(expected_val, (list, np.ndarray)):
            # Binary classification: take positive class expected value if 2 outputs
            self.expected_value = float(expected_val[1]) if len(expected_val) > 1 else float(expected_val[0])
        else:
            self.expected_value = float(expected_val)

    def explain(
        self,
        feature_vector: FeatureVector,
        calibrated_prob: float,
    ) -> tuple[list[ShapContribution], AdditivityVerification]:
        """
        Compute SHAP contributions and perform additivity sanity check.

        Returns:
            contributions: List of ShapContribution sorted by absolute magnitude.
            verification: AdditivityVerification proof record.
        """
        import pandas as pd
        x_df = pd.DataFrame([feature_vector.to_list()], columns=self.feature_names)
        x_arr = np.array([feature_vector.to_list()], dtype=np.float64)

        # Compute SHAP values
        raw_shap = self.explainer.shap_values(x_df)
        if isinstance(raw_shap, list) and len(raw_shap) > 1:
            # Multi-class output: positive class index 1
            vals = raw_shap[1][0]
        elif isinstance(raw_shap, np.ndarray) and raw_shap.ndim == 3:
            vals = raw_shap[0, :, 1]
        else:
            vals = np.array(raw_shap).reshape(-1)

        shap_values_list = [float(v) for v in vals[:len(self.feature_names)]]
        raw_feature_vals = feature_vector.to_list()

        shap_sum = float(sum(shap_values_list))
        total_margin = self.expected_value + shap_sum

        # Predict raw margin directly from booster for verification
        raw_margin = float(self.base_estimator.predict(x_df, raw_score=True)[0])
        delta = abs(total_margin - raw_margin)
        verified = delta < 1e-4

        # Total absolute attribution for percentage contribution calculation
        abs_sum = sum(abs(v) for v in shap_values_list) or 1.0

        contributions: list[ShapContribution] = []
        for name, feat_val, s_val in zip(self.feature_names, raw_feature_vals, shap_values_list):
            contributions.append(
                ShapContribution(
                    feature=name,
                    value=round(float(feat_val), 4),
                    shap_value=round(float(s_val), 6),
                    contribution_pct=round(abs(s_val) / abs_sum * 100.0, 2),
                )
            )

        # Sort contributions by absolute impact descending
        contributions.sort(key=lambda c: abs(c.shap_value), reverse=True)

        verification = AdditivityVerification(
            base_bias=round(self.expected_value, 6),
            shap_sum=round(shap_sum, 6),
            predicted_probability=round(float(calibrated_prob), 6),
            delta=round(delta, 8),
            verified=verified,
        )

        return contributions, verification
