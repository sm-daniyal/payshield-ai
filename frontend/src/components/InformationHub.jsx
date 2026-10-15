import React from 'react';
import {
  ShieldCheck,
  Bot,
  ArrowRight,
  ExternalLink,
  Mail,
  Columns3,
  List
} from 'lucide-react';

export default function InformationHub({
  threatNews,
  threatCategories,
  threatViewMode,
  setThreatViewMode,
  selectedThreatCategory,
  setSelectedThreatCategory,
  onDeployMitigation,
  onAskCopilot,
  onSelectProblem,
  onOpenNewsletter
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Editorial Desk Header */}
      <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
              PayShield Information Hub • 4-Column Editorial Desk
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-mono font-medium">
                Live Merchant Wire
              </span>
            </h2>
          </div>
          <p className="text-xs text-gray-600">
            Click into any column header to access dedicated deep-dive problem pages with full mitigation telemetry and case studies.
          </p>
        </div>

        {/* View Switchers & Newsletter Quick-Link */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenNewsletter}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition flex items-center gap-1.5"
            title="Read The PayShield Dispatch Print Edition"
          >
            <Mail className="w-3.5 h-3.5 text-amber-700" />
            Read Newsletter Edition →
          </button>

          <div className="flex items-center bg-gray-100 border border-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setThreatViewMode('columns')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                threatViewMode === 'columns'
                  ? 'bg-white text-gray-900 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              4 Columns
            </button>
            <button
              onClick={() => setThreatViewMode('stream')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                threatViewMode === 'stream'
                  ? 'bg-white text-gray-900 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Stream Feed
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: 4-COLUMN NEWSPAPER DESK */}
      {threatViewMode === 'columns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {threatCategories.map((cat) => {
            const Icon = cat.icon;
            const catArticles = threatNews.filter((n) => n.category === cat.id);

            return (
              <div
                key={cat.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col min-h-[750px]"
              >
                {/* Newspaper Column Heading */}
                <div className="pb-3 mb-4 border-b-2 border-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-900" />
                      <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                        {cat.shortName}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                      {catArticles.length} Bulletins
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-snug">
                    {cat.description}
                  </p>

                  {/* Dedicated Page Button */}
                  <button
                    onClick={() => onSelectProblem(cat.id)}
                    className="mt-2 text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                  >
                    Dedicated Issue Page <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Column Articles Stacked List */}
                <div className="divide-y divide-gray-100 space-y-4 flex-1 overflow-y-auto pr-1">
                  {catArticles.length > 0 ? (
                    catArticles.map((news, idx) => (
                      <article
                        key={news.id}
                        className={`flex flex-col justify-between ${idx > 0 ? 'pt-4' : ''} space-y-2.5`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                news.severity === 'CRITICAL'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : news.severity === 'ELEVATED'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {news.severity}
                            </span>
                            <span className="text-[11px] text-gray-400 font-sans">
                              {news.published_at.includes('T') ? news.published_at.substring(0, 10) : news.published_at}
                            </span>
                          </div>
                          <h4
                            onClick={() => onSelectProblem(cat.id)}
                            className="text-sm font-bold text-gray-900 leading-snug hover:text-blue-600 transition cursor-pointer"
                          >
                            {news.headline}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {news.summary}
                          </p>
                        </div>

                        {/* Impacted Channels */}
                        {news.impacted_channels && (
                          <div className="flex flex-wrap gap-1">
                            {news.impacted_channels.map((ch, i) => (
                              <span
                                key={i}
                                className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono border border-gray-200"
                              >
                                {ch}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Active PayShield Mitigation */}
                        <div className="bg-gray-50 border border-gray-200 p-2.5 rounded text-xs space-y-1">
                          <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">
                            Mitigation Protocol:
                          </div>
                          <div className="font-mono text-gray-800 text-[11px] leading-tight">
                            {news.mitigation_rule}
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                          <button
                            onClick={() => onDeployMitigation(news.mitigation_rule)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1"
                            title="Deploy to Live Decision Radar"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Deploy Rule
                          </button>
                          <button
                            onClick={() =>
                              onAskCopilot(
                                `Analyze threat vector "${news.headline}" (${news.category}, Severity: ${news.severity}). How does PayShield's mitigation rule "${news.mitigation_rule}" protect merchant margins and prevent PayPal chargebacks?`
                              )
                            }
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2 py-1 rounded text-[10px] font-medium transition flex items-center gap-1"
                            title="Analyze with AI Risk Copilot"
                          >
                            <Bot className="w-3 h-3" />
                            Copilot
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400 p-4 text-center">
                      No active zero-day alerts for this vector.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: STREAM FEED */}
      {threatViewMode === 'stream' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-gray-200">
            <button
              onClick={() => setSelectedThreatCategory('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedThreatCategory === 'ALL'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              All Vectors ({threatNews.length})
            </button>
            {threatCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedThreatCategory(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedThreatCategory === c.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                }`}
              >
                {c.shortName}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {threatNews
              .filter((n) => selectedThreatCategory === 'ALL' || n.category === selectedThreatCategory)
              .map((news) => (
                <div
                  key={news.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:border-gray-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          news.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : news.severity === 'ELEVATED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {news.severity} • {news.category}
                      </span>
                      <span className="text-[11px] text-gray-400 font-sans">
                        {news.published_at.includes('T') ? news.published_at.substring(0, 10) : news.published_at}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{news.headline}</h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{news.summary}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                    <div className="text-xs">
                      <span className="text-gray-500 font-semibold">Active Mitigation: </span>
                      <span className="text-blue-700 font-mono">{news.mitigation_rule}</span>
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200">
                      <span className="font-semibold text-gray-800">Defense Protocol: </span>
                      {news.actionable_recommendation}
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => onDeployMitigation(news.mitigation_rule)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Deploy to Decision Engine
                      </button>
                      <button
                        onClick={() =>
                          onAskCopilot(
                            `Analyze threat vector "${news.headline}" (${news.category}). Explain how PayShield mitigates this and protects merchant funds under PayPal seller protection.`
                          )
                        }
                        className="text-gray-600 hover:text-gray-900 text-xs flex items-center gap-1 transition"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        Analyze with Copilot
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
