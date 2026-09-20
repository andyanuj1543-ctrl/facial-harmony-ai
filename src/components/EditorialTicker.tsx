import React from 'react';
import { Activity, ShieldCheck, Cpu, Sparkles, Binary } from 'lucide-react';

export const EditorialTicker: React.FC = () => {
  const tickerItems = [
    { icon: Activity, label: 'SYS_STATUS', val: 'CALIBRATED & ACTIVE' },
    { icon: Binary, label: 'LANDMARKS', val: '468 FACET VERTICES IDENTIFIED' },
    { icon: Cpu, label: 'PROPORTION', val: 'GOLDEN RATIO Φ = 1.618' },
    { icon: ShieldCheck, label: 'RICKETTS E-LINE', val: 'SAGITTAL HARMONY VERIFIED' },
    { icon: Sparkles, label: 'VOICE MENTOR', val: 'NEURAL AUDIO ONLINE' },
    { icon: Activity, label: 'SAMPLING', val: 'SUB-MILLIMETER DEPTH PRECISION' }
  ];

  return (
    <div className="w-full overflow-hidden border-y border-white/[0.06] bg-[#090d16]/70 backdrop-blur-md py-2 relative select-none">
      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#080b11] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#080b11] to-transparent z-10" />

      <div className="animate-marquee flex items-center gap-8 text-[11px] font-mono tracking-wider text-slate-400">
        {/* First copy */}
        {tickerItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={`ticker-1-${idx}`} className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
              <Icon className="w-3 h-3 text-amber-400/70" />
              <span className="text-slate-500 font-bold uppercase">{item.label}:</span>
              <span className="text-slate-200 font-medium">{item.val}</span>
              <span className="text-white/10 ml-4 font-normal">/</span>
            </div>
          );
        })}
        {/* Second identical copy for seamless loop */}
        {tickerItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={`ticker-2-${idx}`} className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
              <Icon className="w-3 h-3 text-amber-400/70" />
              <span className="text-slate-500 font-bold uppercase">{item.label}:</span>
              <span className="text-slate-200 font-medium">{item.val}</span>
              <span className="text-white/10 ml-4 font-normal">/</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
