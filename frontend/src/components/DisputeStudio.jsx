import React from 'react';
import {
  DollarSign,
  Bot,
  Send,
  CheckCircle2
} from 'lucide-react';

export default function DisputeStudio({
  disputes,
  onDisputeSubmit,
  onAskCopilot
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <div className="text-[11px] text-gray-500 uppercase font-semibold">PayPal Dispute Fee Standard</div>
          <div className="text-2xl font-bold font-mono text-gray-900 mt-1">$15.00 USD</div>
          <p className="text-xs text-gray-500 mt-1">Non-refundable fee assessed by PayPal on contested claims.</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <div className="text-[11px] text-gray-500 uppercase font-semibold">Autonomous Recovery Model</div>
          <div className="text-base font-bold font-mono text-emerald-700 mt-1">
            Expected EV = (P_win × Amount) - $15.00
          </div>
          <p className="text-xs text-gray-500 mt-1">Automatically writes off negative EV disputes to protect merchant funds.</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <div className="text-[11px] text-gray-500 uppercase font-semibold">Net Active Recovery ROI</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">+$147.30 Net EV</div>
          <p className="text-xs text-gray-500 mt-1">3 disputes analyzed; 1 auto-written off, 2 defended.</p>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            PayPal Disputes Recovery Queue (Autonomous $15 Fee Engine)
          </h3>
          <span className="text-xs text-gray-500 font-mono">Cost Optimal Cutoff: 0.40</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold bg-gray-50">
                <th className="py-3 px-4">Dispute ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Win Prob (P_win)</th>
                <th className="py-3 px-4">Expected Net EV</th>
                <th className="py-3 px-4">Optimized Action</th>
                <th className="py-3 px-4">Evidence Status</th>
                <th className="py-3 px-4 text-right">PayPal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {disputes.map((d) => {
                const isNegative = d.expected_net_recovery <= 0;
                return (
                  <tr key={d.dispute_id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {d.dispute_id}
                      <div className="text-[11px] text-gray-500 font-normal">{d.reason}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-900 font-semibold">
                      ${d.amount_usd.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${d.win_probability >= 0.6 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {(d.win_probability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${isNegative ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {isNegative ? '' : '+'}${d.expected_net_recovery.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[11px] ${
                        d.action === 'PROCEED_DIRECT_DISPUTE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : d.action === 'AUTO_WRITE_OFF_UNECONOMIC'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {d.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-sans text-xs">
                      {d.tracking}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            onAskCopilot(
                              `Evaluate the recovery economics for PayPal dispute ${d.dispute_id} (Claim Amount: $${d.amount_usd.toFixed(2)}, Reason: "${d.reason}", P_win: ${(d.win_probability * 100).toFixed(0)}%). Why did PayShield prescribe ${d.action} against the $15.00 non-refundable dispute fee?`
                            )
                          }
                          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 p-1.5 rounded transition flex items-center gap-1 text-[11px]"
                          title="Ask Copilot for mathematical breakdown"
                        >
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden sm:inline">Copilot</span>
                        </button>
                        {d.action === 'PROCEED_DIRECT_DISPUTE' && d.status !== 'SUBMITTED_TO_PAYPAL' ? (
                          <button
                            onClick={() => onDisputeSubmit(d)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded transition inline-flex items-center gap-1.5 text-xs shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            Submit
                          </button>
                        ) : d.status === 'SUBMITTED_TO_PAYPAL' ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            Transmitted
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            Closed (Saved $15)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
