import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Lock, Activity } from 'lucide-react';
import Logo from './Logo';

export default function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between p-6 md:p-12 select-none">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            PayPal Sandbox Active
          </div>
          <button
            onClick={onEnter}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Centered Hero */}
      <main className="max-w-4xl mx-auto w-full text-center py-12 md:py-20 space-y-8 flex flex-col items-center">
        {/* Centered Large Logo */}
        <div className="p-2">
          <Logo size="lg" />
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Payments Made Secure
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            The pre-transaction trust layer for agentic commerce. Block malicious bots, monetize AI crawlers with HTTP 402, and optimize PayPal disputes.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-4">
          <button
            onClick={onEnter}
            style={{ color: '#FFFFFF' }}
            className="bg-phaigo-gradient text-white !text-white rounded-xl py-4 px-10 text-lg font-bold shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span style={{ color: '#FFFFFF' }} className="text-white !text-white font-bold tracking-wide">
              Launch Dashboard
            </span>
            <ArrowRight className="w-5 h-5 text-white !text-white group-hover:translate-x-1 transition-transform" style={{ color: '#FFFFFF' }} />
          </button>
        </div>

        {/* Feature Highlights Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
          <span className="px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Calibrated LightGBM
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            L402 Machine Tollgate
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            Deterministic SHAP Proofs
          </span>
        </div>
      </main>

      {/* 3 Bottom Stat Cards */}
      <footer className="max-w-5xl mx-auto w-full pt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <div className="text-3xl font-extrabold font-mono text-gray-900">99.98%</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">Uptime &amp; Ledger Integrity</div>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <div className="text-3xl font-extrabold font-mono text-gray-900">&lt;50ms</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">Scoring Engine Latency</div>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
            <div className="text-3xl font-extrabold font-mono text-gray-900">100%</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">Deterministic Policy Bounds</div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-6 font-mono">
          PayShield AI Protocol • Pre-Transaction Risk Intelligence
        </div>
      </footer>
    </div>
  );
}
