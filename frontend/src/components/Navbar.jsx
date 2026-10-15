import React from 'react';
import {
  ShieldAlert,
  Newspaper,
  Shield,
  ShieldCheck,
  DollarSign,
  Zap,
  Mail,
  Activity,
  Terminal,
  Bot,
  Database,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function Navbar({
  activePortal,
  setActivePortal,
  activeProblemId,
  setActiveProblemId,
  onSimulate,
  isSimulating
}) {
  const problemTabs = [
    { id: 'MERCHANT_CHRONICLES', label: 'Merchant Chronicles', icon: Shield },
    { id: 'SHIPPING_LOGISTICS', label: 'Shipping & Logistics', icon: ShieldCheck },
    { id: 'PAYMENTS_RAILS', label: 'Payments & Rails', icon: DollarSign },
    { id: 'BOT_WAVE', label: 'The Bot Wave', icon: Zap }
  ];

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
      {/* Top Newspaper Masthead Bar (Dark Charcoal #1f242d) */}
      <div className="bg-[#1f242d] text-white px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-gray-800 text-blue-400 border border-gray-700">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-sans uppercase">
                PayShield Information Hub
              </h1>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded font-mono font-medium">
                Live Telemetry
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Autonomous Merchant Threat Intelligence &amp; PayPal Disputes v1 Protocol Defense
            </p>
          </div>
        </div>

        {/* Quick Attack Simulator Bar */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 text-[11px] font-sans">Quick Attack Injection:</span>
          <button
            onClick={() => onSimulate('LEGIT')}
            disabled={isSimulating}
            className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium px-2.5 py-1 rounded transition"
            title="Inject clean $75.00 order"
          >
            Normal Order
          </button>
          <button
            onClick={() => onSimulate('CARDING')}
            disabled={isSimulating}
            className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-medium px-2.5 py-1 rounded transition"
            title="Inject $480.00 high-velocity carding burst"
          >
            Carding Burst
          </button>
          <button
            onClick={() => onSimulate('FX_MANIP')}
            disabled={isSimulating}
            className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-medium px-2.5 py-1 rounded transition"
            title="Inject $1,250.00 FX spread arbitrage order"
          >
            Cross-Border FX
          </button>
        </div>
      </div>

      {/* Main Umbrella Navigation Bar */}
      <div className="px-6 py-2 bg-white flex flex-wrap items-center justify-between gap-2 border-t border-gray-100">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {/* Desk Overview */}
          <button
            onClick={() => {
              setActivePortal('hub');
              setActiveProblemId(null);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activePortal === 'hub' && !activeProblemId
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            All Issues Desk
          </button>

          <span className="text-gray-300 px-1 font-mono">|</span>

          {/* Issue Pages */}
          {problemTabs.map((p) => {
            const Icon = p.icon;
            const isSelected = activePortal === 'problem' && activeProblemId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActiveProblemId(p.id);
                  setActivePortal('problem');
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
            );
          })}

          <span className="text-gray-300 px-1 font-mono">|</span>

          {/* Dedicated Newsletter Edition */}
          <button
            onClick={() => {
              setActivePortal('newsletter');
              setActiveProblemId(null);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activePortal === 'newsletter'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            PayShield Dispatch (Newsletter)
          </button>
        </div>

        {/* Operational Portals */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActivePortal('radar')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'radar'
                ? 'bg-gray-900 text-white shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Risk Radar
          </button>
          <button
            onClick={() => setActivePortal('disputes')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'disputes'
                ? 'bg-gray-900 text-white shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            $15 Fee Disputes
          </button>
          <button
            onClick={() => setActivePortal('terminal')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'terminal'
                ? 'bg-purple-700 text-white shadow-sm font-semibold'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            L402 Bot Tollgate
          </button>
          <button
            onClick={() => setActivePortal('copilot')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'copilot'
                ? 'bg-gray-900 text-white font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            Copilot
          </button>
          <button
            onClick={() => setActivePortal('audit')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'audit'
                ? 'bg-gray-900 text-white font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Audit Vault
          </button>
          <button
            onClick={() => setActivePortal('simulator')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activePortal === 'simulator'
                ? 'bg-gray-900 text-white font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulator
          </button>
        </div>
      </div>
    </header>
  );
}
