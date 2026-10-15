import React from 'react';
import { Zap } from 'lucide-react';

export default function Simulator({
  isSimulating,
  onSimulate,
  onInspectRadar
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Live PayPal Fraud &amp; Attack Simulator
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Inject synthetic PayPal order payloads into the live <code className="text-gray-900 font-mono bg-gray-100 px-1 py-0.5 rounded">/api/v1/evaluate</code> backend pipeline to demonstrate
          calibrated Platt scoring, SHAP tree explainability, and deterministic policy boundaries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-emerald-700 text-sm">Scenario A: Normal Buyer</h3>
              <p className="text-xs text-gray-600 mt-2">
                Order: $75.00 USD. Verified account, matching shipping and IP countries, 0 prior disputes, normal baseline amount.
              </p>
            </div>
            <button
              onClick={() => {
                onSimulate('LEGIT');
                onInspectRadar();
              }}
              disabled={isSimulating}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded text-xs transition shadow-sm"
            >
              Simulate &amp; Inspect
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-rose-700 text-sm">Scenario B: High-Velocity Carding Burst</h3>
              <p className="text-xs text-gray-600 mt-2">
                Order: $480.00 USD. 7 transactions in last 60 minutes, IP geolocation in Nigeria vs US shipping, unverified account.
              </p>
            </div>
            <button
              onClick={() => {
                onSimulate('CARDING');
                onInspectRadar();
              }}
              disabled={isSimulating}
              className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded text-xs transition shadow-sm"
            >
              Simulate &amp; Block
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-amber-700 text-sm">Scenario C: Cross-Border FX Manipulation</h3>
              <p className="text-xs text-gray-600 mt-2">
                Order: $1,250.00 USD. Severe FX spread deviation (13.6% above mid-market benchmark), brand new account, 1 prior dispute.
              </p>
            </div>
            <button
              onClick={() => {
                onSimulate('FX_MANIP');
                onInspectRadar();
              }}
              disabled={isSimulating}
              className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded text-xs transition shadow-sm"
            >
              Simulate &amp; Step-Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
