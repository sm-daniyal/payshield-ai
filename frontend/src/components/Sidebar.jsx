import React from 'react';
import {
  Shield,
  Zap,
  DollarSign,
  Database,
  TrendingUp,
} from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { id: 'radar',     label: 'Risk Radar',     sub: 'Fraud scoring',       icon: Shield,    dot: 'bg-indigo-500' },
  { id: 'terminal',  label: 'L402 Tollgate',  sub: 'Bot monetization',    icon: Zap,       dot: 'bg-purple-500' },
  { id: 'disputes',  label: 'Dispute Studio', sub: 'EV recovery',         icon: DollarSign,dot: 'bg-amber-500'  },
  { id: 'audit',     label: 'Audit Vault',    sub: 'SHA-256 ledger',      icon: Database,  dot: 'bg-emerald-500'},
];

const SIDEBAR_STATS = [
  { label: 'Blocked Today',   value: '14',       color: 'text-rose-600'   },
  { label: 'Fees Saved',      value: '$312',      color: 'text-emerald-600'},
  { label: 'Bots Monetized',  value: '3',         color: 'text-purple-600' },
];

export default function Sidebar({ activePortal, setActivePortal }) {
  return (
    <aside className="w-64 min-w-[256px] max-w-[256px] h-screen bg-white border-r border-gray-100 flex flex-col shrink-0 select-none z-20 overflow-y-auto">

      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <Logo size="sm" />
      </div>

      {/* Merchant Identity Strip */}
      <div className="mx-4 mt-4 mb-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-gray-900 truncate">Nova Commerce</div>
          <div className="text-[11px] text-gray-400 font-mono truncate">Sandbox · Demo</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 pt-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-1.5">Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePortal === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePortal(item.id)}
              className={`w-full py-2.5 px-3 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer group ${
                isActive
                  ? 'bg-indigo-600 shadow-md shadow-indigo-200/60'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>
                  {item.label}
                </div>
                <div className={`text-[11px] truncate ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {item.sub}
                </div>
              </div>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* ROI Stats Summary */}
      <div className="mx-4 mt-4 mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2.5">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">This Session</div>
        {SIDEBAR_STATS.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{s.label}</span>
            <span className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mx-4 mb-5">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-800">PayPal Orders v2</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            LIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
