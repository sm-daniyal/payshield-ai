import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Logo({ size = 'sm' }) {
  const isLg = size === 'lg';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon Badge with Phaigo Gradient */}
      <div
        className={`${
          isLg
            ? 'w-14 h-14 rounded-2xl shadow-md'
            : 'w-10 h-10 rounded-xl shadow-xs'
        } bg-phaigo-gradient flex items-center justify-center shrink-0 transition-all`}
      >
        <ShieldCheck
          className={`${
            isLg ? 'w-8 h-8' : 'w-5 h-5'
          } text-white stroke-[2.3]`}
        />
      </div>

      {/* Brand Text in Phaigo Lowercase Style */}
      <span
        className={`${
          isLg ? 'text-4xl md:text-5xl' : 'text-2xl'
        } font-extrabold tracking-tighter text-gray-900 leading-none`}
      >
        payshield
      </span>
    </div>
  );
}
