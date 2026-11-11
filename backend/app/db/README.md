# Audit & Persistence Vault Contract

## Overview
Cryptographic append-only SQLite audit vault implementing SHA-256 hash-chaining across all transaction risk evaluations, policy decisions, and dispute recovery submissions for regulatory non-repudiation.

## Interface
- `AuditStore`: Primary database client initialized with SQLite file path and WAL mode pragmas.
  - `record_transaction_evaluation(tx_id, payload, decision, shap_factors)`: Commits transaction inference and policy output with SHA-256 block hash.
  - `record_dispute_recovery(dispute_id, assessment, dossier)`: Commits autonomous dispute EV evaluation and submission metadata.
  - `get_recent_transactions(limit=50)`: Retrieves chronologically ordered transaction audit records.
  - `get_recent_disputes(limit=50)`: Retrieves historical dispute recovery records.
  - `_compute_hash(data)`: Computes SHA-256 digest linking current block to prior row hash.

## Invariants
- Append-Only: No `UPDATE` or `DELETE` SQL operations are permitted on the audit ledger.
- Hash Chaining: Row $N$ hash is strictly computed over `(prev_hash + timestamp + record_data)`, forming an immutable merkle-like chain.
- Idempotency: Duplicate transaction IDs or PayPal transmission IDs are rejected.

## Side Effects
- Writes to local SQLite database file `payshield_audit.db` using Write-Ahead Logging (`PRAGMA journal_mode=WAL`).

## Verification
- Run: `pytest tests/test_paypal_and_disputes.py`
