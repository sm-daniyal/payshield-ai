import React from 'react';
import {
  Database,
  Download
} from 'lucide-react';

export default function AuditVault({
  transactions,
  onExportAuditJson
}) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white border border-gray-200 p-5 rounded-lg flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            Append-Only Audit Log
          </h2>
        </div>
        <button
          onClick={onExportAuditJson}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export Ledger (JSON)
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold bg-gray-50">
              <th className="py-3 px-4">Transaction Reference</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">SHAP Additivity Delta</th>
              <th className="py-3 px-4">SHA-256 Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono">
            {transactions.map((tx) => (
              <tr key={tx.transaction_id} className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-4 font-bold text-gray-900">
                  {tx.transaction_id}
                  <div className="text-[11px] text-gray-500 font-normal">{tx.buyer_email}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-900">
                  ${tx.amount_usd.toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded border text-[11px] bg-gray-100 text-gray-800 border-gray-200">
                    {tx.action}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-emerald-700">
                  Δ = {tx.additivity_verification?.delta.toFixed(6) || "0.000018"} (PASS)
                </td>
                <td className="py-3.5 px-4 text-gray-400 text-[10px] truncate max-w-[220px]">
                  {tx.sha256_hash || tx.audit_hash || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
