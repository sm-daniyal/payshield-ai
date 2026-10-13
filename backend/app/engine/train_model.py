"""
PayShield AI — Model Training & Calibration Pipeline

Synthesizes a realistic distribution of PayPal transaction telemetry,
trains a LightGBM gradient-boosted decision tree classifier, applies
Platt sigmoidal probability calibration, and saves the production artifact.

Features:
  1. amount_zscore
  2. velocity_1h
  3. velocity_24h
  4. velocity_7d
  5. fx_spread
  6. geo_mismatch
  7. account_risk_score
"""
from __future__ import annotations

import os
import pickle
from pathlib import Path
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, brier_score_loss, log_loss

# Random seed for exact reproducibility across runs
SEED = 42
FEATURE_NAMES = [
    "amount_zscore",
    "velocity_1h",
    "velocity_24h",
    "velocity_7d",
    "fx_spread",
    "geo_mismatch",
    "account_risk_score",
]


def generate_synthetic_telemetry(n_samples: int = 20_000, seed: int = SEED) -> pd.DataFrame:
    """
    Generate realistic PayPal transaction distributions simulating both
    legitimate merchant activity and fraud/chargeback vectors.
    """
    rng = np.random.default_rng(seed)

    # 1. Amount z-scores: mostly near 0, occasional positive spikes
    amount_zscore = rng.normal(loc=0.0, scale=1.0, size=n_samples)
    amount_zscore = np.clip(amount_zscore, -3.0, 10.0)

    # 2. Velocities (card testing & burst activity)
    # Most buyers have 0-1 tx/hr; fraud bursts produce 4-15
    v1h_clean = rng.poisson(lam=0.05, size=n_samples)
    v24h_clean = v1h_clean + rng.poisson(lam=0.2, size=n_samples)
    v7d_clean = v24h_clean + rng.poisson(lam=0.8, size=n_samples)

    # 3. FX spread: mostly <= 0.015, rare manipulation >= 0.03
    fx_spread = rng.exponential(scale=0.008, size=n_samples)
    fx_spread = np.clip(fx_spread, 0.0, 0.35)

    # 4. Geolocation mismatch (shipping != IP country)
    geo_mismatch = rng.binomial(n=1, p=0.04, size=n_samples).astype(float)

    # 5. Account risk score: composite [0, 1]
    account_risk = rng.beta(a=1.5, b=6.0, size=n_samples)

    # Induce fraud patterns on a minority subset (~6.5% base fraud rate)
    is_fraud = np.zeros(n_samples, dtype=int)
    latent_risk = (
        0.35 * np.maximum(0, amount_zscore)
        + 0.55 * (v1h_clean > 2)
        + 0.40 * (v24h_clean > 5)
        + 0.50 * (fx_spread > 0.04)
        + 0.65 * geo_mismatch
        + 0.80 * account_risk
        - 1.40
    )

    # Sigmoid link to fraud probability
    fraud_prob = 1.0 / (1.0 + np.exp(-latent_risk))
    is_fraud = rng.binomial(n=1, p=np.clip(fraud_prob, 0.001, 0.999))

    # Add realistic correlated spikes for actual fraud cases
    fraud_idx = np.where(is_fraud == 1)[0]
    amount_zscore[fraud_idx] += rng.uniform(0.5, 4.0, size=len(fraud_idx))
    v1h_clean[fraud_idx] += rng.poisson(lam=2.5, size=len(fraud_idx))
    v24h_clean[fraud_idx] += v1h_clean[fraud_idx] + rng.poisson(lam=3.0, size=len(fraud_idx))
    v7d_clean[fraud_idx] += v24h_clean[fraud_idx] + rng.poisson(lam=4.0, size=len(fraud_idx))
    geo_mismatch[fraud_idx] = rng.binomial(n=1, p=0.45, size=len(fraud_idx)).astype(float)
    account_risk[fraud_idx] = np.clip(account_risk[fraud_idx] + rng.uniform(0.2, 0.6, size=len(fraud_idx)), 0.0, 1.0)

    df = pd.DataFrame({
        "amount_zscore": amount_zscore,
        "velocity_1h": v1h_clean.astype(float),
        "velocity_24h": v24h_clean.astype(float),
        "velocity_7d": v7d_clean.astype(float),
        "fx_spread": fx_spread,
        "geo_mismatch": geo_mismatch,
        "account_risk_score": account_risk,
        "is_fraud": is_fraud,
    })
    return df


def train_and_export(output_dir: Path | None = None) -> dict[str, float]:
    """Train LightGBM, apply Platt calibration, verify metrics, and export."""
    if output_dir is None:
        output_dir = Path(__file__).parent / "artifacts"
    output_dir.mkdir(parents=True, exist_ok=True)

    df = generate_synthetic_telemetry(n_samples=25_000, seed=SEED)
    X = df[FEATURE_NAMES]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=SEED, stratify=y
    )

    # Base LightGBM model
    base_lgbm = LGBMClassifier(
        n_estimators=120,
        learning_rate=0.04,
        max_depth=5,
        num_leaves=24,
        min_child_samples=30,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=SEED,
        verbose=-1,
    )

    # Calibrate probabilities using Platt scaling (sigmoid) with 5-fold CV
    calibrated_model = CalibratedClassifierCV(
        estimator=base_lgbm,
        method="sigmoid",
        cv=5,
    )
    calibrated_model.fit(X_train, y_train)

    # Also fit base_lgbm on full train set for TreeExplainer
    base_lgbm.fit(X_train, y_train)

    # Evaluate on holdout test set
    preds_prob = calibrated_model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, preds_prob)
    brier = brier_score_loss(y_test, preds_prob)
    logloss = log_loss(y_test, preds_prob)

    metrics = {
        "roc_auc": round(float(auc), 4),
        "brier_score": round(float(brier), 4),
        "log_loss": round(float(logloss), 4),
        "test_samples": int(len(y_test)),
        "base_fraud_rate": round(float(y.mean()), 4),
    }

    # Save artifacts bundle
    artifact_payload = {
        "model": calibrated_model,
        "base_estimator": base_lgbm,
        "feature_names": FEATURE_NAMES,
        "metrics": metrics,
    }

    model_path = output_dir / "payshield_lgbm_v1.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(artifact_payload, f, protocol=pickle.HIGHEST_PROTOCOL)

    return metrics


if __name__ == "__main__":
    results = train_and_export()
    print("Model Training & Calibration Complete:")
    for k, v in results.items():
        print(f"  {k}: {v}")
