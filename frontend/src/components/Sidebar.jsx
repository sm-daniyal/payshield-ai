import React from 'react';
import {
  Shield,
  Zap,
  DollarSign,
  Database,
  RotateCw,
  Copy,
  Briefcase
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({ activePortal, setActivePortal }) {
  const navItems = [
    {
      id: 'radar',
      label: 'Risk Radar',
      icon: Shield,
    },
    {
      id: 'terminal',
      label: 'L402 Tollgate',
      icon: Zap,
    },
    {
      id: 'disputes',
      label: 'Dispute Studio',
      icon: DollarSign,
    },
    {
      id: 'audit',
      label: 'Audit Vault',
      icon: Database,
    }
  ];

  return (
    <aside className="w-80 min-w-[320px] max-w-[320px] h-screen bg-[#F9FAFB] border-r border-gray-100 flex flex-col justify-between shrink-0 select-none z-20 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Top PayShield Logo */}
        <div className="pb-2">
          <Logo size="sm" />
        </div>

        {/* Phaigo Merchant Profile Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
          {/* Avatar Circle with Briefcase Icon */}
          <div className="w-20 h-20 rounded-full bg-phaigo-gradient text-white flex items-center justify-center shadow-md">
            <Briefcase className="w-8 h-8 text-white stroke-[2]" />
          </div>

          {/* Name & Username */}
          <div className="mt-4">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Nova Commerce
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <span>@nova_commerce</span>
              <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
          </div>

          {/* Available Balance Card */}
          <div className="w-full mt-5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                P
              </div>
              <div>
                <div className="text-sm font-extrabold text-gray-900 font-mono">
                  248,912.00 USD
                </div>
                <div className="text-[11px] text-gray-400 font-medium">
                  Available Balance
                </div>
              </div>
            </div>
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              title="Refresh Balance"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Buttons (Styled like Phaigo action buttons) */}
          <nav className="w-full mt-5 space-y-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePortal === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePortal(item.id)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md shadow-indigo-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Operational Status */}
      <div className="pt-4">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-700">
              PayPal Orders v2
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            CONNECTED
          </span>
        </div>
      </div>
    </aside>
  );
}
