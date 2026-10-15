import React from 'react';
import {
  Bot,
  Send,
  RefreshCw
} from 'lucide-react';

export default function Copilot({
  copilotQuery,
  setCopilotQuery,
  copilotHistory,
  copilotLoading,
  onCopilotSubmit
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              PayShield Grounded Copilot
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-medium">
                Mathematical Precision
              </span>
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Ask questions about risk scores, SHAP feature attributions, and dispute ROI against PayPal's $15 fee equation.
            </p>
          </div>
        </div>

        {/* Sample Quick Questions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
          <span className="text-[11px] text-gray-500 font-medium self-center mr-1">Quick Inquiries:</span>
          <button
            onClick={() => onCopilotSubmit("Why was transaction ORD-9430 assigned a critical fraud block?")}
            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition"
          >
            Why was ORD-9430 blocked?
          </button>
          <button
            onClick={() => onCopilotSubmit("Should I contest small dispute PP-D-441029 or write it off?")}
            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition"
          >
            Dispute $15 Fee ROI calculation
          </button>
          <button
            onClick={() => onCopilotSubmit("What active carding botnet threats are detected on PayPal checkout?")}
            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition"
          >
            Active Botnet Threat Bulletins
          </button>
        </div>
      </div>

      {/* Chat History Messages */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4 shadow-sm">
        {copilotHistory.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'copilot' && (
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`p-4 rounded-xl text-xs max-w-xl leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white font-medium ml-12 shadow-sm'
                : 'bg-gray-50 border border-gray-200 text-gray-900'
            }`}>
              <p>{msg.text}</p>
              {msg.evidence && (
                <div className="mt-3 pt-2.5 border-t border-gray-200 space-y-1">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    Grounded Mathematical Evidence:
                  </span>
                  {msg.evidence.map((ev, i) => (
                    <div key={i} className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      {ev}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {copilotLoading && (
          <div className="flex gap-3 items-center text-xs text-gray-500 italic">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            Analyzing transaction features and economic recovery bounds...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={copilotQuery}
          onChange={(e) => setCopilotQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCopilotSubmit()}
          placeholder="Ask about risk features, SHAP additivity, or PayPal dispute viability..."
          className="flex-1 bg-white border border-gray-300 text-xs text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
        />
        <button
          onClick={() => onCopilotSubmit()}
          disabled={copilotLoading}
          className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-lg text-xs font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          Ask Copilot
        </button>
      </div>
    </div>
  );
}
