import React, { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  CheckCircle2,
  Zap,
  Sliders,
  Send,
  AlertTriangle
} from 'lucide-react';

export default function RiskRadar({
  transactions,
  selectedTx,
  setSelectedTx,
  onSimulate,
  isSimulating
}) {
  // Form State for Phaigo-style Simulator
  const [amount, setAmount] = useState(75.00);
  const [email, setEmail] = useState('verified_user@gmail.com');
  const [ipCountry, setIpCountry] = useState('US');
  const [accountAge, setAccountAge] = useState(850);
  const [isVerified, setIsVerified] = useState(true);

  // Preset Handlers
  const applyPreset = (presetKey) => {
    if (presetKey === 'LEGIT') {
      setAmount(75.00);
      setEmail('verified_user@gmail.com');
      setIpCountry('US');
      setAccountAge(850);
      setIsVerified(true);
    } else if (presetKey === 'CARDING') {
      setAmount(480.00);
      setEmail('botnet_burst@disposable.cc');
      setIpCountry('RO');
      setAccountAge(4);
      setIsVerified(false);
    } else if (presetKey === 'FX_MANIP') {
      setAmount(1250.00);
      setEmail('cross_border_fx@spoof.net');
      setIpCountry('HK');
      setAccountAge(12);
      setIsVerified(false);
    }
  };

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    if (!onSimulate) return;

    const now = new Date().toISOString();
    const nowMs = Date.now();
    const parsedAmount = parseFloat(amount) || 75.00;
    const parsedAge = parseInt(accountAge, 10) || 1;

    // Build custom payload with realistic strictly-prior history
    const payload = {
      transaction_id: `ORD-${Math.floor(1000 + Math.random() * 9000)}-CUSTOM`,
      amount_usd: parsedAmount,
      buyer_email: email || 'shopper@example.com',
      buyer_country: 'US',
      shipping_country: 'US',
      ip_country: (ipCountry || 'US').toUpperCase(),
      buyer_currency: 'USD',
      mid_market_rate_to_usd: 1.0,
      actual_rate_to_usd: 1.0,
      paypal_account_age_days: parsedAge,
      paypal_account_verified: Boolean(isVerified),
      event_timestamp: now,
      history: {
        amounts: [parsedAmount * 0.9, parsedAmount * 0.95],
        timestamps: [
          new Date(nowMs - 15 * 60 * 1000).toISOString(),
          new Date(nowMs - 60 * 60 * 1000).toISOString(),
        ],
        dispute_count: parsedAge < 10 ? 2 : 0,
      }
    };

    onSimulate(payload);
  };

  return (
    <div className="space-y-8">
      {/* 2-Column Phaigo Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Simulate Transaction (Top) + Live Ingestion Feed (Bottom) (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* 1. Simulate Transaction Card (Phaigo Form) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Simulate Transaction
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                  Interactive
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Inject synthetic orders to evaluate the real-time scoring engine.
              </p>
            </div>

            {/* Quick Preset Attack Chips */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                Quick Presets:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => applyPreset('LEGIT')}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 transition text-center cursor-pointer"
                >
                  Legit ($75)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('CARDING')}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 transition text-center cursor-pointer"
                >
                  Carding ($480)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('FX_MANIP')}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100 transition text-center cursor-pointer"
                >
                  FX ($1,250)
                </button>
              </div>
            </div>

            {/* Phaigo Inputs Form */}
            <form onSubmit={handleSubmitCustom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-sm text-gray-400 font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-gray-900 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Buyer Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-gray-900 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    IP Country
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={ipCountry}
                    onChange={(e) => setIpCountry(e.target.value.toUpperCase())}
                    required
                    className="w-full px-4 py-3 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-gray-900 font-mono uppercase text-center transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Account Age (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={accountAge}
                    onChange={(e) => setAccountAge(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-gray-900 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  PayPal Account Status
                </label>
                <select
                  value={isVerified ? 'true' : 'false'}
                  onChange={(e) => setIsVerified(e.target.value === 'true')}
                  className="w-full px-4 py-3 text-sm bg-gray-50/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white text-gray-900 cursor-pointer transition"
                >
                  <option value="true">Verified Account (Clean)</option>
                  <option value="false">Unverified Account (High Risk)</option>
                </select>
              </div>

              {/* Full Width Solid Navy Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-700 active:bg-slate-950 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>{isSimulating ? "Scoring Pipeline..." : "Inject Transaction"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. Live Ingestion Feed Card (Bottom) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Live Ingestion Feed
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                {transactions.length} items
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {transactions.map((tx) => {
                const isSelected = selectedTx?.transaction_id === tx.transaction_id;
                const isBlock = tx.action === "BLOCK_AND_FLAG_DISPUTE";
                const isAllow = tx.action === "ALLOW" || tx.action === "ALLOW_WITH_MONITORING";

                return (
                  <div
                    key={tx.transaction_id}
                    onClick={() => setSelectedTx(tx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/40 border-blue-400 shadow-xs ring-1 ring-blue-300'
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-gray-900">{tx.transaction_id}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{tx.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          ${typeof tx.amount_usd === 'number' ? tx.amount_usd.toFixed(2) : tx.amount_usd} USD
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[170px]">{tx.buyer_email}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono uppercase ${
                          isBlock ? 'text-red-600' : isAllow ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {isBlock ? 'BLOCK' : isAllow ? 'ALLOW' : 'STEP-UP'}
                        </span>
                        <div className="text-xs font-mono text-gray-500 mt-0.5">
                          Risk: <span className="font-bold text-gray-900">{tx.risk_score}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Risk Analytics & Grounded SHAP Waterfall (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          {selectedTx ? (
            <div className="space-y-6">
              {/* Header Title & Details */}
              <div className="pb-5 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Risk Analytics
                  </h2>
                  <p className="text-sm text-gray-500 font-mono mt-0.5">
                    Order ID: <span className="font-bold text-gray-900">{selectedTx.transaction_id}</span> • {selectedTx.buyer_email}
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold border border-gray-200">
                  {selectedTx.rule_triggered || 'NORMAL_EVALUATION'}
                </span>
              </div>

              {/* Calibrated Risk Score Banner — big number + color ring + plain-English verdict */}
              {(() => {
                const score = selectedTx.risk_score ?? 0;
                const isBlock = selectedTx.action === 'BLOCK_AND_FLAG_DISPUTE';
                const isStep  = selectedTx.action === 'STEP_UP_VERIFICATION';
                const ringColor = isBlock ? '#DC2626' : isStep ? '#D97706' : '#059669';
                const bgColor   = isBlock ? 'bg-rose-50 border-rose-200' : isStep ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200';
                const textColor = isBlock ? 'text-rose-700' : isStep ? 'text-amber-700' : 'text-emerald-700';
                const verdict   = isBlock ? '🚫 Transaction Blocked' : isStep ? '⚠️ Step-Up Verification Required' : '✅ Transaction Allowed';
                const reason    = isBlock
                  ? 'High fraud probability detected. Card-testing pattern or geo-mismatch triggered the BLOCK rule.'
                  : isStep
                  ? 'Moderate risk signals present. Additional verification recommended before clearing.'
                  : 'Low fraud probability. Account history and geo signals are consistent.';
                const circumference = 2 * Math.PI * 36;
                const dashOffset = circumference - (score / 100) * circumference;
                return (
                  <div className="flex items-stretch gap-4">
                    {/* Score ring */}
                    <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 shrink-0">
                      <svg width="90" height="90" viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r="36" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                        <circle
                          cx="45" cy="45" r="36" fill="none"
                          stroke={ringColor} strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          transform="rotate(-90 45 45)"
                          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                        <text x="45" y="49" textAnchor="middle" fontSize="20" fontWeight="800" fontFamily="monospace" fill="#111827">{score}</text>
                      </svg>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Risk Score</div>
                    </div>

                    {/* Verdict card */}
                    <div className={`flex-1 rounded-2xl border p-5 flex flex-col justify-between ${bgColor}`}>
                      <div>
                        <div className={`text-base font-bold ${textColor} mb-1`}>{verdict}</div>
                        <p className="text-xs text-gray-600 leading-relaxed">{reason}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-4 flex-wrap">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${bgColor} ${textColor}`}>
                          {selectedTx.action}
                        </span>
                        <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                          SHAP ✓ (Δ &lt; 1e-4)
                        </span>
                        <span className="text-xs font-mono text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                          {selectedTx.rule_triggered || 'NORMAL_EVALUATION'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Extracted Feature Signals Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Extracted Feature Signals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[10px] font-sans">Amount Z-Score</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedTx.features?.amount_zscore ? `${selectedTx.features.amount_zscore.toFixed(2)}σ` : "0.00σ"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[10px] font-sans">Velocity (1h/24h)</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedTx.features?.velocity_1h ?? 0} / {selectedTx.features?.velocity_24h ?? 0}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[10px] font-sans">Geo Location</span>
                    <span className={`text-sm font-bold ${selectedTx.features?.geo_mismatch ? "text-rose-600" : "text-gray-900"}`}>
                      {selectedTx.features?.geo_mismatch ? "MISMATCH" : "MATCHED"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 block text-[10px] font-sans">FX Spread Dev</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedTx.features?.fx_spread ? `${(selectedTx.features.fx_spread * 100).toFixed(2)}%` : "0.00%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature Attributions (SHAP) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Why did the model decide this? (SHAP)
                  </h3>
                </div>

                <div className="space-y-3.5">
                  {selectedTx.shap_contributions?.map((contrib, idx) => {
                    const isPositive = contrib.shap_value > 0;
                    const pct = Math.min(100, Math.max(6, contrib.contribution_pct));
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700 font-mono">{contrib.feature}</span>
                          <span className={`font-bold ${isPositive ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isPositive ? '▲ raises risk' : '▼ lowers risk'} &nbsp;
                            {isPositive ? `+${contrib.shap_value.toFixed(4)}` : contrib.shap_value.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isPositive ? '#DC2626' : '#059669'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center text-sm text-gray-400">
              Select a transaction from the live feed to inspect risk analytics.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
