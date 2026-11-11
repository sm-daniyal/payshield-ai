# Machine Learning Pipeline Contract

## Overview
Offline model training, Platt scaling calibration, and cost-matrix threshold optimization pipeline for PayShield AI. Benchmarks LightGBM against a Logistic Regression baseline across an empirical holdout dataset.

## Interface
- `train_and_evaluate.py`: End-to-end training and evaluation script.
  - `generate_synthetic_telemetry(n_samples=10000, seed=42)`: Synthesizes realistic transaction stream with 1.5% true positive fraud rate.
  - Stratified chronological train/validation/holdout split (8,000 train / 2,000 holdout).
  - Platt Calibration: Sigmoidal scaling mapping LightGBM leaf outputs to calibrated probabilities.
  - Cost Sweep: Evaluates thresholds from 0.10 to 0.90 against financial loss matrix:
    $$\text{Total Cost} = (FP \times \$50) + (FN \times 0.5 \times \text{Amount})$$
  - Exports: `evaluation/holdout_metrics.json`, `evaluation/chart_threshold_f1.png`, and `evaluation/chart_threshold_cost.png`.

## Invariants
- Cost-Optimal Boundary: Operating threshold is strictly selected at 0.20 (minimum expected cost point).
- Stratified Split: The 2,000-sample test set is held out prior to training and never used in hyperparameter tuning.
- Additivity Grounding: SHAP calculations are reproducible across the exported model artifact (`payshield_lgbm_v1.pkl`).

## Side Effects
- Reads and writes to `ml/evaluation/` directory and writes serialized model artifacts.

## Verification
- Run: `python ml/train_and_evaluate.py`
