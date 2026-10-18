import React from 'react';
import {
  Shield,
  Zap,
  DollarSign,
  Database,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activePortal }) {
  const portalMeta = {
    radar: {
      title: 'Risk Radar',
      subtitle: 'Real-time PayPal order telemetry & calibrated ML trust scoring',
      icon: Shield,
      breadcrumb: 'PayShield / Risk Radar'
    },
    terminal: {
      title: 'L402 Tollgate',
      subtitle: 'Autonomous HTTP 402 machine-to-machine PayPal micro-settlement gateway',
      icon: Zap,
      breadcrumb: 'PayShield / L402 Tollgate'
    },
    disputes: {
      title: 'Dispute Studio',
      subtitle: 'Expected value recovery decision engine for PayPal disputes v1',
      icon: DollarSign,
      breadcrumb: 'PayShield / Dispute Studio'
    },
    audit: {
      title: 'Audit Vault',
      subtitle: 'Append-only ledger with SHA-256 tamper-evident integrity tracking',
      icon: Database,
      breadcrumb: 'PayShield / Audit Vault'
    }
  };

  const current = portalMeta[activePortal] || portalMeta.radar;
  const Icon = current.icon;

  return (
    <header className="bg-white border-b border-gray-200/80 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] px-8 py-3.5 flex items-center justify-between shrink-0">
      {/* Left Side: Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60 shadow-xs">
          <Icon className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          {current.title}
        </h1>
      </div>

      {/* Right Side: Phaigo Top Controls */}
      <div className="flex items-center gap-3">
        {/* Green Status Dot with Network Name */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>PayPal Sandbox</span>
        </div>

        {/* Network Selector Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white shadow-xs cursor-pointer hover:bg-gray-50">
          <span>Sandbox</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>

        {/* Mock Wallet / Merchant ID Pill */}
        <div className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-medium text-gray-700 bg-gray-50 shadow-xs">
          0x9Ac4...48C8
        </div>

        {/* Disconnect Button with Exit Icon */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 shadow-xs transition cursor-pointer"
          title="Disconnect Session"
        >
          <LogOut className="w-3.5 h-3.5 text-gray-500" />
          <span>Disconnect</span>
        </button>
      </div>
    </header>
  );
}
