"""
PayShield AI — Append-Only SQLite Audit Store

Records every transaction evaluation, policy decision, and dispute recovery event.
Every entry includes a SHA-256 integrity hash to guarantee
tamper-evident auditability in the append-only audit log.
"""
from __future__ import annotations

import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent.parent.parent / "payshield_audit.db"


class AuditStore:
    """Thread-safe SQLite storage for transaction audits and dispute decisions."""

    def __init__(self, db_path: Path | None = None) -> None:
        self.db_path = db_path or DB_PATH
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # 1. Transaction Risk Evaluations Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS transaction_audits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    transaction_id TEXT UNIQUE NOT NULL,
                    amount_usd REAL NOT NULL,
                    buyer_email TEXT NOT NULL,
                    risk_score REAL NOT NULL,
                    risk_probability REAL NOT NULL,
                    action TEXT NOT NULL,
                    rule_triggered TEXT NOT NULL,
                    features_json TEXT NOT NULL,
                    shap_json TEXT NOT NULL,
                    additivity_delta REAL NOT NULL,
                    sha256_hash TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)

            # 2. Dispute Recovery Records Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dispute_audits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    dispute_id TEXT UNIQUE NOT NULL,
                    transaction_id TEXT NOT NULL,
                    amount_usd REAL NOT NULL,
                    win_probability REAL NOT NULL,
                    expected_net_recovery REAL NOT NULL,
                    action TEXT NOT NULL,
                    reasoning TEXT NOT NULL,
                    evidence_dossier TEXT NOT NULL,
                    sha256_hash TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.commit()

    @staticmethod
    def _compute_hash(data: dict[str, Any]) -> str:
        serialized = json.dumps(data, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def record_transaction_evaluation(
        self,
        transaction_id: str,
        amount_usd: float,
        buyer_email: str,
        risk_score: float,
        risk_probability: float,
        action: str,
        rule_triggered: str,
        features: dict[str, float],
        shap_contributions: list[dict[str, Any]],
        additivity_delta: float,
    ) -> str:
        ts = datetime.now(timezone.utc).isoformat()
        payload = {
            "transaction_id": transaction_id,
            "amount_usd": amount_usd,
            "risk_score": risk_score,
            "action": action,
            "timestamp": ts,
        }
        record_hash = self._compute_hash(payload)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO transaction_audits (
                    transaction_id, amount_usd, buyer_email, risk_score,
                    risk_probability, action, rule_triggered, features_json,
                    shap_json, additivity_delta, sha256_hash, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                transaction_id,
                amount_usd,
                buyer_email,
                risk_score,
                risk_probability,
                action,
                rule_triggered,
                json.dumps(features),
                json.dumps(shap_contributions),
                additivity_delta,
                record_hash,
                ts,
            ))
            conn.commit()
        return record_hash

    def record_dispute_recovery(
        self,
        dispute_id: str,
        transaction_id: str,
        amount_usd: float,
        win_probability: float,
        expected_net_recovery: float,
        action: str,
        reasoning: str,
        evidence_dossier: str,
    ) -> str:
        ts = datetime.now(timezone.utc).isoformat()
        payload = {
            "dispute_id": dispute_id,
            "transaction_id": transaction_id,
            "amount_usd": amount_usd,
            "action": action,
            "timestamp": ts,
        }
        record_hash = self._compute_hash(payload)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO dispute_audits (
                    dispute_id, transaction_id, amount_usd, win_probability,
                    expected_net_recovery, action, reasoning, evidence_dossier,
                    sha256_hash, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                dispute_id,
                transaction_id,
                amount_usd,
                win_probability,
                expected_net_recovery,
                action,
                reasoning,
                evidence_dossier,
                record_hash,
                ts,
            ))
            conn.commit()
        return record_hash

    def get_recent_transactions(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM transaction_audits
                ORDER BY id DESC LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_recent_disputes(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM dispute_audits
                ORDER BY id DESC LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
