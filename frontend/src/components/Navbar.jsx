import React from 'react';
import {
  Shield,
  Zap,
  DollarSign,
  Database,
  LogOut,
} from 'lucide-react';

const portalMeta = {
  radar: {
    title: 'Risk Radar',
    subtitle: 'Real-time fraud scoring · LightGBM + SHAP',
    icon: Shield,
    iconBg: 'bg-indigo-50 border-indigo-100',
    iconColor: 'text-indigo-600',
  },
  terminal: {
    title: 'L402 Tollgate',
    subtitle: 'HTTP 402 machine-payment gateway · PayPal Orders v2',
    icon: Zap,
    iconBg: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-600',
  },
  disputes: {
    title: 'Dispute Studio',
    subtitle: 'Expected-value recovery engine · PayPal Disputes v1',
    icon: DollarSign,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
  },
  audit: {
    title: 'Audit Vault',
    subtitle: 'Append-only ledger · SHA-256 tamper-evident hash chain',
    icon: Database,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
  },
};

export default function Navbar({ activePortal }) {
  const current = portalMeta[activePortal] || portalMeta.radar;
  const Icon = current.icon;

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0 h-[60px]">
      {/* Left: Page context */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${current.iconBg}`}>
          <Icon className={`w-4 h-4 ${current.iconColor}`} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900 leading-tight">{current.title}</div>
          <div className="text-[11px] text-gray-400 leading-tight hidden sm:block">{current.subtitle}</div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Live status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sandbox Live
        </div>

        {/* Environment badge */}
        <div className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-medium text-gray-600 bg-gray-50">
          api-m.sandbox.paypal.com
        </div>

        {/* Exit */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer"
          title="Exit Dashboard"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}
