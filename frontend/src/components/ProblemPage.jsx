import React from 'react';
import {
  ShieldCheck,
  Bot,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingDown,
  TrendingUp,
  FileCode,
  Layers
} from 'lucide-react';

export default function ProblemPage({
  category,
  allCategories,
  threatNews,
  onSelectProblem,
  onBackToDesk,
  onDeployMitigation,
  onAskCopilot
}) {
  if (!category) return null;

  const Icon = category.icon;
  const articles = threatNews.filter((n) => n.category === category.id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Problem Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <button
          onClick={onBackToDesk}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to 4-Column Newsroom Desk
        </button>

        {/* Issue Fast Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-400 font-sans">Jump to Issue:</span>
          {allCategories.map((c) => {
            const isCurrent = c.id === category.id;
            const CIcon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => onSelectProblem(c.id)}
                className={`text-xs px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <CIcon className="w-3 h-3" />
                {c.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Problem Executive Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  {category.badge}
                </span>
                <span className="text-xs text-gray-400 font-sans">{articles.length} In-Depth Bulletins Published</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                {category.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Executive Overview Narrative */}
        <div className="text-sm text-gray-700 leading-relaxed max-w-4xl">
          <p>{category.detailedOverview || category.description}</p>
        </div>

        {/* Key Metrics Row */}
        {category.keyMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {category.keyMetrics.map((m, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 p-3.5 rounded-lg">
                <div className="text-xs text-gray-500 font-medium">{m.label}</div>
                <div
                  className={`text-lg font-bold font-mono mt-0.5 ${
                    m.tone === 'negative'
                      ? 'text-rose-700'
                      : m.tone === 'positive'
                      ? 'text-emerald-700'
                      : 'text-gray-900'
                  }`}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Article Docket for this Problem */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Operational Threat Bulletins &amp; Merchant Investigations ({articles.length})
          </h2>
          <span className="text-xs text-gray-400 font-mono">Real-Time Telemetry Feed</span>
        </div>

        <div className="space-y-4">
          {articles.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:border-gray-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : item.severity === 'ELEVATED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="font-mono text-xs text-gray-400">{item.id}</span>
                </div>
                <span className="text-xs text-gray-400 font-sans">{item.published_at}</span>
              </div>

              {/* Headline & Full Summary */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{item.headline}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.summary}</p>
              </div>

              {/* Impacted Channels */}
              {item.impacted_channels && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-gray-400 font-medium">Impacted Systems:</span>
                  {item.impacted_channels.map((ch, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 font-mono text-[11px]"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              )}

              {/* Mitigation Rule & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    <FileCode className="w-3.5 h-3.5" />
                    PayShield Defense Protocol:
                  </div>
                  <div className="font-mono text-xs text-gray-900 leading-tight">
                    {item.mitigation_rule}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Actionable Store Policy:
                  </div>
                  <div className="text-xs text-gray-600 leading-snug">
                    {item.actionable_recommendation}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enforceable via PayPal Disputes v1 Webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeployMitigation(item.mitigation_rule)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Deploy to Decision Engine
                  </button>
                  <button
                    onClick={() =>
                      onAskCopilot(
                        `Explain threat vector "${item.headline}" in issue "${category.name}". How does PayShield's rule "${item.mitigation_rule}" protect merchant funds?`
                      )
                    }
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    Consult Copilot
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
