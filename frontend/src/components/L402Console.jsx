import React from 'react';
import {
  Check,
  Copy
} from 'lucide-react';

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
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* L402 Banner Overview */}
      <div className="bg-white border border-purple-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 font-mono px-2 py-0.5 rounded-full font-bold">
              L402 Protocol • RFC 402 Specification
            </span>
            <span className="text-xs text-gray-500 font-mono">PayPal Orders v2 Micro-Settlement</span>
          </div>
          <h3 className="text-sm font-bold text-gray-900">Autonomous Machine-to-Machine Threat Intelligence Licensing</h3>
          <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
            AI crawlers, risk bots, and merchant subagents cannot click buttons or fill out forms. The L402 protocol enables programmatic access: servers return <code className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded font-mono">HTTP 402 Payment Required</code>, bots execute instant PayPal micro-captures ($0.05 USD), receive cryptographically signed HMAC bearer tokens, and ingest zero-day threat feeds without human friction.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              navigator.clipboard.writeText('curl -i https://payshield-ai.onrender.com/api/v1/l402/threat-feed -H "User-Agent: PayShield-AgentBot/1.0"');
              setL402Copied(true);
              setTimeout(() => setL402Copied(false), 3000);
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            {l402Copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {l402Copied ? "cURL Copied" : "Copy cURL"}
          </button>
          <button
            onClick={onReset}
            className="text-gray-600 hover:text-gray-900 text-xs px-2.5 py-1.5 rounded bg-gray-100 border border-gray-200 transition"
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
              : l402Step >= 1
              ? 'bg-white border-gray-200 hover:border-gray-300'
              : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-mono text-xs font-bold shrink-0">
            2
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              Settle PayPal Micropayment
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                $0.05 USD
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Agent executes PayPal Orders v2 CAPTURE and receives HMAC signed Bearer token.
            </p>
          </div>
        </button>

        <button
          onClick={onUnlockFeed}
          disabled={l402TerminalLoading || l402Step < 2}
          className={`p-4 rounded-lg border text-left transition flex items-start gap-3 shadow-sm ${
            l402Step === 3
              ? 'bg-emerald-50/70 border-emerald-400'
              : l402Step >= 2
              ? 'bg-white border-gray-200 hover:border-gray-300'
              : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
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

      {/* Interactive Terminal Screen */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-lg overflow-hidden font-mono shadow-md">
        {/* Terminal Window Header */}
        <div className="bg-[#1e293b] px-4 py-2.5 border-b border-gray-700 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="ml-2 font-semibold text-gray-200">
              agent-client@payshield: ~/l402-protocol-gateway
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400">FastAPI + PayPal v2 Orders</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        </div>

        {/* Terminal Viewport */}
        <div className="p-4 space-y-4 min-h-[360px] text-xs leading-relaxed overflow-x-auto text-gray-300">
          {/* Initial State / Prompt */}
          <div className="text-gray-400">
            <span className="text-emerald-400">agent@crawler-host:~$</span> # Interactive L402 Machine-to-Machine PayPal Sandbox
            <br />
            <span className="text-gray-500">
              Click Step 1 above to simulate an autonomous crawler attempting to read the threat feed.
            </span>
          </div>

          {/* Step 1 Output */}
          {l402Step >= 1 && (
            <div className="space-y-2 border-l-2 border-purple-500/60 pl-3">
              <div className="text-purple-300 font-bold">
                <span className="text-emerald-400">agent@crawler-host:~$</span> curl -i -X GET https://payshield-ai.onrender.com/api/v1/l402/threat-feed \
                <br />
                &nbsp;&nbsp;-H "User-Agent: AutonomousRiskCrawler/1.0"
              </div>
              <div className="text-amber-400">
                HTTP/1.1 402 Payment Required
                <br />
                WWW-Authenticate: L402 token_url='https://payshield-ai.onrender.com/api/v1/l402/payment-request'
                <br />
                Content-Type: application/json
              </div>
              <pre className="text-gray-300 bg-black/60 p-3 rounded-lg border border-purple-900/30 overflow-x-auto">
                {JSON.stringify(l402Challenge, null, 2)}
              </pre>
            </div>
          )}

          {/* Step 2 Output */}
          {l402Step >= 2 && (
            <div className="space-y-2 border-l-2 border-blue-500/60 pl-3">
              <div className="text-blue-300 font-bold">
                <span className="text-emerald-400">agent@crawler-host:~$</span> curl -X POST https://payshield-ai.onrender.com/api/v1/l402/payment-request \
                <br />
                &nbsp;&nbsp;-H "Content-Type: application/json" \
                <br />
                &nbsp;&nbsp;-d '{"{"}"payment_context_token": "{l402Challenge?.payment_context_token || '62f1f983-589c...'}", "offer_id": "single_bulletin"{"}"}'
              </div>
              <div className="text-emerald-400 font-semibold">
                [PayPal Orders v2] Transaction CAPTURE Completed • Status: 200 OK
              </div>
              <pre className="text-gray-300 bg-black/60 p-3 rounded-lg border border-blue-900/30 overflow-x-auto">
                {JSON.stringify(l402PaymentResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Step 3 Output */}
          {l402Step >= 3 && (
            <div className="space-y-2 border-l-2 border-emerald-500/60 pl-3">
              <div className="text-emerald-300 font-bold">
                <span className="text-emerald-400">agent@crawler-host:~$</span> curl -i -X GET https://payshield-ai.onrender.com/api/v1/l402/threat-feed \
                <br />
                &nbsp;&nbsp;-H "Authorization: Bearer {l402PaymentResult?.bearer_token || 'l402_9f81a7b4...'}"
              </div>
              <div className="text-emerald-400 font-semibold">
                HTTP/1.1 200 OK • ACCESS UNLOCKED VIA PAYPAL L402 CRYPTOGRAPHIC TOKEN
              </div>
              <pre className="text-gray-300 bg-black/60 p-3 rounded-lg border border-emerald-900/30 overflow-x-auto max-h-64">
                {JSON.stringify(l402UnlockedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
