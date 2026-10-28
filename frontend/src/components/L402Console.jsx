import React, { useState } from 'react';
import {
  Check,
  Copy,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const PROVIDERS = [
  { id: 'paypal',   label: 'PayPal',   badge: 'Orders v2',  color: 'bg-blue-50 border-blue-300 text-blue-700' },
  { id: 'razorpay', label: 'Razorpay', badge: 'Orders API', color: 'bg-indigo-50 border-indigo-300 text-indigo-700' },
];

export default function L402Console({
  l402Step,
  l402Challenge,
  l402PaymentResult,
  l402UnlockedData,
  l402TerminalLoading,
  l402Copied,
  setL402Copied,
  onFetchChallenge,
  onSettlePayment,
  onUnlockFeed,
  onReset
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provider, setProvider] = useState('paypal');
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const activeProvider = PROVIDERS.find(p => p.id === provider);
  const bulletins = Array.isArray(l402UnlockedData?.data)
    ? l402UnlockedData.data
    : (Array.isArray(l402UnlockedData) ? l402UnlockedData : []);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* L402 Header Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 font-mono px-3 py-1 rounded-full font-bold">
            L402 Protocol
          </span>
          {/* Provider toggle */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full p-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Settle via:</span>
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => { setProvider(p.id); onReset(); }}
                className={"px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer " + (
                  provider === p.id ? p.color + ' shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-600 font-mono bg-gray-50 px-3 py-1 rounded-full border border-gray-200 font-medium">
            {activeProvider?.badge}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`curl -i ${API_BASE}/api/v1/l402/threat-feed -H "User-Agent: PayShield-AgentBot/1.0"`);
              setL402Copied(true);
              setTimeout(() => setL402Copied(false), 3000);
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {l402Copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {l402Copied ? "cURL Copied" : "Copy cURL"}
          </button>
          <button
            onClick={() => {
              setIsModalOpen(false);
              onReset();
            }}
            className="text-gray-600 hover:text-gray-900 text-xs px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition cursor-pointer font-medium"
          >
            Reset Console
          </button>
        </div>
      </div>

      {/* Step Action Pipeline Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={onFetchChallenge}
          disabled={l402TerminalLoading}
          className={`p-4 rounded-lg border text-left transition flex items-start gap-3 shadow-sm ${
            l402Step === 1
              ? 'bg-purple-50/70 border-purple-400'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-mono text-xs font-bold shrink-0">
            1
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              Test Bot Query
              <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded border border-purple-200">
                HTTP 402
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Query feed without bearer token. Server returns HTTP 402 challenge with PayPal offers.
            </p>
          </div>
        </button>

        <button
          onClick={onSettlePayment}
          disabled={l402TerminalLoading || l402Step < 1}
          className={`p-4 rounded-lg border text-left transition flex items-start gap-3 shadow-sm ${
            l402Step === 2
              ? 'bg-blue-50/70 border-blue-400'
              : l402Step < 1
              ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-mono text-xs font-bold shrink-0">
            2
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              Settle $0.05 Micropayment
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                PayPal Orders v2
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Autonomous capture via PayPal Orders API. Returns HMAC-SHA256 bearer token.
            </p>
          </div>
        </button>

        <button
          onClick={onUnlockFeed}
          disabled={l402TerminalLoading || l402Step < 2}
          className={`p-4 rounded-lg border text-left transition flex items-start gap-3 shadow-sm ${
            l402Step === 3
              ? 'bg-emerald-50/70 border-emerald-400'
              : l402Step < 2
              ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono text-xs font-bold shrink-0">
            3
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              Query with Bearer Token
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                HTTP 200 UNLOCKED
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Transmit token in Authorization header. Feed unlocks and streams premium telemetry.
            </p>
          </div>
        </button>
      </div>

      {/* Interactive Terminal Screen - Mac Terminal Style */}
      <div className="bg-[#0D1117] border border-slate-800 rounded-2xl overflow-hidden font-mono shadow-2xl">
        {/* Terminal Window Header (macOS style) */}
        <div className="bg-[#161B22] px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block"></span>
            <span className="ml-2 font-mono text-slate-300 font-medium">
              agent-client@payshield: ~/l402-protocol-gateway
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">FastAPI + PayPal v2 Orders</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        </div>

        {/* Terminal Viewport */}
        <div className="p-5 space-y-4 min-h-[320px] text-xs leading-relaxed overflow-x-auto text-slate-300 bg-[#0D1117]">
          {/* Initial State / Prompt */}
          <div className="text-slate-400">
            <span className="text-emerald-400">agent@crawler-host:~$</span> # Interactive L402 Machine-to-Machine PayPal Sandbox
            <br />
            <span className="text-slate-500">
              Click Step 1 above to simulate an autonomous crawler attempting to read the threat feed.
            </span>
          </div>

          {/* Step 1 Output */}
          {l402Step >= 1 && (
            <div className="space-y-2 border-l-2 border-purple-500/60 pl-3">
              <div className="text-purple-300 font-bold">
                <span className="text-emerald-400">agent@crawler-host:~$</span> curl -i -X GET {API_BASE}/api/v1/l402/threat-feed \
                <br />
                &nbsp;&nbsp;-H "User-Agent: AutonomousRiskCrawler/1.0"
              </div>
              <div className="text-amber-400">
                HTTP/1.1 402 Payment Required
                <br />
                WWW-Authenticate: L402 token_url='{API_BASE}/api/v1/l402/payment-request'
                <br />
                Content-Type: application/json
              </div>
              <pre className="text-slate-300 bg-[#161B22] p-3.5 rounded-xl border border-slate-800 overflow-x-auto">
                {JSON.stringify(l402Challenge, null, 2)}
              </pre>
            </div>
          )}

          {/* Step 2 Output */}
          {l402Step >= 2 && (
            <div className="space-y-2 border-l-2 border-blue-500/60 pl-3">
              <div className="text-blue-300 font-bold">
                <span className="text-emerald-400">agent@crawler-host:~$</span> curl -X POST {API_BASE}/api/v1/l402/payment-request \
                <br />
                &nbsp;&nbsp;-H "Content-Type: application/json" \
                <br />
                &nbsp;&nbsp;-d '{"{"}"payment_context_token": "{l402Challenge?.payment_context_token || '62f1f983-589c...'}", "offer_id": "single_bulletin"{"}"}'
              </div>
              <div className="text-emerald-400 font-semibold">
                [PayPal Orders v2] Transaction CAPTURE Completed • Status: 200 OK
              </div>
              <pre className="text-slate-300 bg-[#161B22] p-3.5 rounded-xl border border-slate-800 overflow-x-auto">
                {JSON.stringify(l402PaymentResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Step 3 Output */}
          {l402Step >= 3 && (
            <div className="space-y-3 border-l-2 border-emerald-500/60 pl-3">
              <div className="text-emerald-300 font-bold">
                <span className="text-emerald-400">agent@crawler-host:~$</span> curl -i -X GET {API_BASE}/api/v1/l402/threat-feed \
                <br />
                &nbsp;&nbsp;-H "Authorization: Bearer {l402PaymentResult?.bearer_token || 'l402_9f81a7b4...'}"
              </div>
              <div className="text-emerald-400 font-semibold flex items-center justify-between flex-wrap gap-2">
                <span>HTTP/1.1 200 OK • ACCESS UNLOCKED VIA PAYPAL L402 HMAC BEARER TOKEN</span>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
                  Micro-Settled: {l402PaymentResult?.amount_usd ? `$${l402PaymentResult.amount_usd} USD` : '$0.05 USD'}
                </span>
              </div>
              <div className="text-slate-400 text-xs font-mono">
                [L402 Gateway] Decrypted {bulletins.length} zero-day threat bulletins into agent memory buffer.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3 Reveal Action Button */}
      {l402Step >= 3 && (
        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-phaigo-gradient text-white font-bold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="text-white !text-white">View Unlocked Premium Intelligence ({bulletins.length} Dispatches)</span>
            <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* Full-Screen Premium Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-white max-w-6xl w-full rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 relative border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-phaigo-gradient flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    L402 Premium Threat Intelligence
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    PayPal Micro-Settled Zero-Day Bulletins • {bulletins.length} Dispatches Active
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sleek Black Badge with Gold Text */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-amber-500/40 shadow-md flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-300">
                  L402 PAYMENT CONFIRMED — PREMIUM ACCESS GRANTED
                </span>
              </div>
              <span className="text-xs text-amber-400 font-mono font-bold bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-500/30">
                {bulletins.length} Decrypted Intelligence Bulletins
              </span>
            </div>

            {/* 3-Column Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bulletins.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
                >
                  <div>
                    {/* Meta Category Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-serif text-xl font-bold border-b border-gray-200 pb-2 text-gray-900 tracking-tight w-full">
                        {(item.category || 'THREAT_FEED').replace(/_/g, ' ')}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          item.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.severity === 'ELEVATED'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.severity}
                      </span>
                      {item.published_at && (
                        <span className="text-xs text-gray-400 font-sans">
                          {new Date(item.published_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>

                    {/* Editorial Headline */}
                    <h4 className="text-base font-serif font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-snug mb-2.5">
                      {item.headline}
                    </h4>

                    {/* Clean Sans-serif Summary */}
                    <p className="text-xs font-sans text-gray-700 leading-relaxed mb-4">
                      {item.summary}
                    </p>
                  </div>

                  {/* Monospace Mitigation Rule in bg-gray-50 box */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 font-mono font-semibold mb-1.5">
                      Active Mitigation Rule:
                    </div>
                    <div className="bg-gray-50 border border-gray-200 font-mono text-xs text-gray-800 rounded-lg p-3 break-words leading-tight">
                      <code>{item.mitigation_rule}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
