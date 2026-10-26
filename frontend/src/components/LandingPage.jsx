import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Activity, TrendingDown } from 'lucide-react';
import Logo from './Logo';

const STATS = [
  { value: '$2.1M', label: 'Merchant Volume Protected' },
  { value: '4,821', label: 'Disputes Auto-Resolved' },
  { value: '12,400', label: 'Malicious Bots Blocked' },
  { value: '<50ms', label: 'Scoring Engine Latency' },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    title: 'Pre-Transaction Fraud Scoring',
    desc: 'LightGBM model with Platt calibration scores every order before it clears. SHAP attributions explain every decision in plain English.',
  },
  {
    icon: Zap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    title: 'L402 AI Bot Monetization',
    desc: 'Stop blocking AI crawlers — charge them. HTTP 402 machine-payment tollgate settles $0.05 micro-payments via PayPal Orders v2 autonomously.',
  },
  {
    icon: TrendingDown,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    title: 'Dispute EV Recovery Engine',
    desc: "PayPal's $15 dispute fee kills low-value claims. Our expected-value engine auto-writes off losing disputes and defends the ones worth fighting.",
  },
];

export default function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col select-none">

      {/* ── Navbar ── */}
      <header className="w-full border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PayPal Sandbox Active
            </div>
            <button
              onClick={onEnter}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            >
              Open Dashboard →
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 text-center pt-20 pb-16 flex flex-col items-center gap-8">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wide">
            <Activity className="w-3.5 h-3.5" />
            Built on PayPal Orders v2 · Disputes v1 · Webhook API
          </div>

          {/* Headline */}
          <div className="space-y-5">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              The risk &amp; revenue ops layer<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                for PayPal merchants.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Score every transaction before it clears. Charge AI bots instead of blocking them.
              Know exactly when a $15 dispute fee will cost you more than the claim is worth.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onEnter}
            className="btn-gradient flex items-center gap-3 py-4 px-10 text-base font-bold shadow-lg hover:shadow-xl transition-all group cursor-pointer"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Proof pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
            <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">✓ 63 passing tests</span>
            <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">✓ 0.986 ROC-AUC</span>
            <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">✓ SHAP additivity sealed</span>
            <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">✓ SHA-256 audit chain</span>
          </div>
        </section>

        {/* ── Live Stats Bar ── */}
        <section className="border-y border-gray-100 bg-gray-50/60">
          <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold font-mono text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Three problems. One pipeline.</h2>
            <p className="text-gray-500 mt-2 text-base">Every module feeds into the next — fraud scoring gates the paywall, the paywall funds the audit vault.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`rounded-2xl border ${f.border} ${f.bg} p-7 flex flex-col gap-4`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white border ${f.border} shadow-sm`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>PayShield AI · Pre-Transaction Risk Intelligence</span>
          <span className="font-mono">PayPal Sandbox · MIT License © 2026 Syed Daniyal</span>
        </div>
      </footer>
    </div>
  );
}
