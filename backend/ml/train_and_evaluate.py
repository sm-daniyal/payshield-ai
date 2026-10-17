"""
PayShield AI — ML Training, Calibration, and Benchmark Reporting

Industry-standard model comparison and threshold optimization pipeline.
1. Generates synthetic transaction dataset (10,000 samples, 1.5% fraud rate).
2. Trains Logistic Regression baseline and LightGBM classifier on identical stratified splits.
3. Applies Platt scaling calibration (CalibratedClassifierCV, sigmoid).
4. Evaluates both models against financial cost: (FP * $50) + (FN * Avg_Fraud * 0.5).
5. Sweeps thresholds from 0.10 to 0.90 to find the cost-optimal decision point.
6. Generates two standalone charts:
   - chart_threshold_f1.png (Threshold vs F1, Precision, Recall)
   - chart_threshold_cost.png (Threshold vs Total Cost, FP Cost, FN Cost)
7. Outputs holdout_metrics.json and prints a formatted Markdown comparison table.
"""
from __future__ import annotations

import json
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss, log_loss, roc_auc_score
from sklearn.model_selection import train_test_split

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


def generate_synthetic_dataset(
    n_samples: int = 10_000,
    fraud_rate: float = 0.015,
    seed: int = SEED,
) -> pd.DataFrame:
    """Generate realistic transaction telemetry with non-linear fraud signals and noise."""
    rng = np.random.default_rng(seed)

    amount_zscore = rng.normal(loc=0.0, scale=0.9, size=n_samples)
    amount_zscore = np.clip(amount_zscore, -2.5, 7.0)

    v1h = rng.poisson(lam=0.10, size=n_samples).astype(float)
    v24h = (v1h + rng.poisson(lam=0.30, size=n_samples)).astype(float)
    v7d = (v24h + rng.poisson(lam=0.90, size=n_samples)).astype(float)

    fx_spread = np.clip(rng.exponential(scale=0.008, size=n_samples), 0.0, 0.35)
    geo_mismatch = rng.binomial(n=1, p=0.05, size=n_samples).astype(float)
    account_risk = rng.beta(a=1.5, b=5.0, size=n_samples)

    # Latent non-linear risk model
    latent = (
        0.70 * np.maximum(0, amount_zscore)
        + 0.80 * (v1h > 1)
        + 0.60 * (v24h > 3)
        + 0.75 * (fx_spread > 0.03)
        + 1.10 * geo_mismatch
        + 1.30 * account_risk
        + rng.normal(0, 0.30, size=n_samples)
    )

    n_fraud = int(round(n_samples * fraud_rate))
    top_fraud_indices = np.argsort(latent)[-n_fraud:]
    is_fraud = np.zeros(n_samples, dtype=int)
    is_fraud[top_fraud_indices] = 1

    # Correlated transaction amounts: clean ~$85, fraud ~$480
    amount_usd = np.where(
        is_fraud == 1,
        rng.uniform(320.0, 680.0, size=n_samples),
        rng.uniform(25.0, 160.0, size=n_samples),
    )

    return pd.DataFrame({
        "amount_usd": amount_usd,
        "amount_zscore": amount_zscore,
        "velocity_1h": v1h,
        "velocity_24h": v24h,
        "velocity_7d": v7d,
        "fx_spread": fx_spread,
        "geo_mismatch": geo_mismatch,
        "account_risk_score": account_risk,
        "is_fraud": is_fraud,
    })


def evaluate_at_threshold(y_true, probs, threshold: float, avg_fraud_amt: float) -> dict:
    preds = (probs >= threshold).astype(int)
    tp = int(np.sum((preds == 1) & (y_true == 1)))
    fp = int(np.sum((preds == 1) & (y_true == 0)))
    fn = int(np.sum((preds == 0) & (y_true == 1)))
    tn = int(np.sum((preds == 0) & (y_true == 0)))

    prec = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    rec = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1 = float((2 * prec * rec) / (prec + rec)) if (prec + rec) > 0 else 0.0

    cost_fp = float(fp * 50.0)
    cost_fn = float(fn * avg_fraud_amt * 0.5)
    total_cost = float(cost_fp + cost_fn)

    return {
        "threshold": round(threshold, 2),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "total_cost": round(total_cost, 2),
        "cost_fp": round(cost_fp, 2),
        "cost_fn": round(cost_fn, 2),
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "tn": tn,
    }


def run_training_and_evaluation() -> dict:
    base_dir = Path(__file__).resolve().parent
    eval_dir = base_dir / "evaluation"
    eval_dir.mkdir(parents=True, exist_ok=True)

    # 1. Dataset Generation & Stratified Split
    df = generate_synthetic_dataset(n_samples=10_000, fraud_rate=0.015, seed=SEED)
    X = df[FEATURE_NAMES]
    y = df["is_fraud"]
    amounts = df["amount_usd"]

    X_train, X_holdout, y_train, y_holdout, amounts_train, amounts_holdout = train_test_split(
        X, y, amounts, test_size=0.20, random_state=SEED, stratify=y
    )

    fraud_holdout_amounts = amounts_holdout[y_holdout == 1]
    avg_fraud_amount = float(fraud_holdout_amounts.mean())

    # 2. Train & Calibrate Logistic Regression Baseline
    lr_pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000, random_state=SEED))
    calibrated_lr = CalibratedClassifierCV(estimator=lr_pipe, method="sigmoid", cv=5)
    calibrated_lr.fit(X_train, y_train)
    probs_lr = calibrated_lr.predict_proba(X_holdout)[:, 1]
    auc_lr = float(roc_auc_score(y_holdout, probs_lr))

    # 3. Train & Calibrate LightGBM Model
    base_lgbm = LGBMClassifier(
        n_estimators=100,
        learning_rate=0.04,
        max_depth=5,
        num_leaves=20,
        min_child_samples=25,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=SEED,
        verbose=-1,
    )
    calibrated_lgbm = CalibratedClassifierCV(estimator=base_lgbm, method="sigmoid", cv=5)
    calibrated_lgbm.fit(X_train, y_train)
    probs_lgbm = calibrated_lgbm.predict_proba(X_holdout)[:, 1]
    auc_lgbm = float(roc_auc_score(y_holdout, probs_lgbm))

    # 4. Sweep Thresholds on LightGBM [0.10 to 0.90]
    thresholds = [round(t, 2) for t in np.arange(0.10, 0.91, 0.05)]
    sweep_results = [
        evaluate_at_threshold(y_holdout, probs_lgbm, t, avg_fraud_amount)
        for t in thresholds
    ]

    optimal_lgbm = min(sweep_results, key=lambda x: x["total_cost"])
    opt_t = optimal_lgbm["threshold"]

    # Evaluate Logistic Regression at the same operating threshold
    eval_lr = evaluate_at_threshold(y_holdout, probs_lr, opt_t, avg_fraud_amount)

    # 5. Generate Chart 1: Threshold vs Precision, Recall, F1
    chart1_path = eval_dir / "chart_threshold_f1.png"
    plt.figure(figsize=(9, 5.5), dpi=300)

    thresh_vals = [r["threshold"] for r in sweep_results]
    prec_vals = [r["precision"] for r in sweep_results]
    rec_vals = [r["recall"] for r in sweep_results]
    f1_vals = [r["f1"] for r in sweep_results]

    plt.plot(thresh_vals, prec_vals, color="#2563eb", linewidth=2.2, label="Precision")
    plt.plot(thresh_vals, rec_vals, color="#059669", linewidth=2.2, label="Recall")
    plt.plot(thresh_vals, f1_vals, color="#9333ea", linewidth=2.0, linestyle="--", label="F1 Score")

    plt.axvline(x=opt_t, color="#dc2626", linestyle=":", linewidth=2.0, label=f"Chosen threshold ({opt_t})")
    plt.axvline(x=0.50, color="#9ca3af", linestyle=":", linewidth=1.5, label="Default (0.50)")

    plt.title("Precision / Recall / F1 vs. Threshold (Holdout Set)", fontsize=12, fontweight="bold", pad=12)
    plt.xlabel("Probability Threshold", fontsize=10, fontweight="bold")
    plt.ylabel("Score", fontsize=10, fontweight="bold")
    plt.ylim(0.0, 1.05)
    plt.xlim(0.08, 0.92)
    plt.grid(True, linestyle="--", alpha=0.35)
    plt.legend(loc="lower left", framealpha=0.95)
    plt.savefig(chart1_path, dpi=300, bbox_inches="tight")
    plt.close()

    # 6. Generate Chart 2: Threshold vs Financial Cost
    chart2_path = eval_dir / "chart_threshold_cost.png"
    plt.figure(figsize=(9, 5.5), dpi=300)

    total_costs = [r["total_cost"] for r in sweep_results]
    fp_costs = [r["cost_fp"] for r in sweep_results]
    fn_costs = [r["cost_fn"] for r in sweep_results]

    plt.plot(thresh_vals, total_costs, color="#111827", linewidth=2.5, label="Total expected cost")
    plt.plot(thresh_vals, fp_costs, color="#f97316", linewidth=1.8, linestyle="--", label="FP cost component")
    plt.plot(thresh_vals, fn_costs, color="#06b6d4", linewidth=1.8, linestyle="--", label="FN cost component")

    plt.axvline(x=opt_t, color="#dc2626", linestyle=":", linewidth=2.0, label=f"Chosen threshold ({opt_t})")
    plt.axvline(x=0.50, color="#9ca3af", linestyle=":", linewidth=1.5, label="Default (0.50)")

    plt.title("Cost vs. Threshold (Holdout Set)", fontsize=12, fontweight="bold", pad=12)
    plt.xlabel("Probability Threshold", fontsize=10, fontweight="bold")
    plt.ylabel("Estimated Cost ($)", fontsize=10, fontweight="bold")
    plt.xlim(0.08, 0.92)
    plt.grid(True, linestyle="--", alpha=0.35)
    plt.legend(loc="upper right", framealpha=0.95)
    plt.savefig(chart2_path, dpi=300, bbox_inches="tight")
    plt.close()

    # 7. Build Markdown Comparison Table
    md_table = (
        "| Model | Precision | Recall | F1 | ROC-AUC | FP | FN | Est. Cost (Holdout) |\n"
        "|---|---|---|---|---|---|---|---|\n"
        f"| Logistic Regression (baseline) | {eval_lr['precision']:.3f} | {eval_lr['recall']:.3f} | {eval_lr['f1']:.3f} | {auc_lr:.3f} | {eval_lr['fp']} | {eval_lr['fn']} | ${eval_lr['total_cost']:,.2f} |\n"
        f"| LightGBM (selected) | {optimal_lgbm['precision']:.3f} | {optimal_lgbm['recall']:.3f} | {optimal_lgbm['f1']:.3f} | {auc_lgbm:.3f} | {optimal_lgbm['fp']} | {optimal_lgbm['fn']} | ${optimal_lgbm['total_cost']:,.2f} |"
    )

    # 8. Save Metrics JSON
    metrics_payload = {
        "dataset_summary": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "holdout_samples": len(X_holdout),
            "fraud_rate_pct": round(float(y.mean() * 100), 2),
            "holdout_avg_fraud_amount_usd": round(avg_fraud_amount, 2),
            "cost_parameters": {
                "fp_penalty_usd": 50.0,
                "fn_loss_multiplier": 0.5,
            },
        },
        "operating_threshold": opt_t,
        "model_comparison": [
            {
                "model": "Logistic Regression (baseline)",
                "precision": eval_lr["precision"],
                "recall": eval_lr["recall"],
                "f1": eval_lr["f1"],
                "roc_auc": round(auc_lr, 4),
                "fp": eval_lr["fp"],
                "fn": eval_lr["fn"],
                "estimated_cost_usd": eval_lr["total_cost"],
            },
            {
                "model": "LightGBM (selected)",
                "precision": optimal_lgbm["precision"],
                "recall": optimal_lgbm["recall"],
                "f1": optimal_lgbm["f1"],
                "roc_auc": round(auc_lgbm, 4),
                "fp": optimal_lgbm["fp"],
                "fn": optimal_lgbm["fn"],
                "estimated_cost_usd": optimal_lgbm["total_cost"],
            },
        ],
        "threshold_sweep_lgbm": sweep_results,
    }

    json_path = eval_dir / "holdout_metrics.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    # 9. Print outputs to console
    print("\n" + "=" * 80)
    print("MODEL & EVALUATION RESULTS (HOLDOUT TEST SET)")
    print("=" * 80)
    print(md_table)
    print("=" * 80)
    print(f"Selected operating threshold: {opt_t} — chosen by minimising expected cost on holdout")
    print(f"Generated Chart 1: {chart1_path.resolve()}")
    print(f"Generated Chart 2: {chart2_path.resolve()}")
    print(f"Generated JSON:    {json_path.resolve()}\n")

    return metrics_payload


if __name__ == "__main__":
    run_training_and_evaluation()
