import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  ideal: string;
  status: 'Optimal' | 'Balanced' | 'Moderate' | 'Variant' | 'Acute' | 'Obtuse';
  description: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  ideal,
  status,
  description
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Optimal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      case 'Balanced':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/25 shadow-[0_0_12px_rgba(56,189,248,0.15)]';
      case 'Moderate':
      case 'Acute':
      case 'Obtuse':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/25 shadow-[0_0_12px_rgba(168,85,247,0.15)]';
    }
  };

  const getIndicatorBar = () => {
    switch (status) {
      case 'Optimal':
        return 'from-emerald-500 to-teal-400 w-full';
      case 'Balanced':
        return 'from-sky-500 to-cyan-400 w-4/5';
      case 'Moderate':
      case 'Acute':
      case 'Obtuse':
        return 'from-amber-500 to-orange-400 w-3/5';
      default:
        return 'from-purple-500 to-indigo-400 w-1/2';
    }
  };

  return (
    <div className="relative group rounded-2xl p-4 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between overflow-hidden">
      {/* Top subtle highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {label}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${getBadgeStyle()}`}>
            {status}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-black text-white font-['Space_Grotesk',sans-serif] tracking-tight group-hover:text-amber-400 transition-colors">
            {value}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Target: {ideal}
          </span>
        </div>
      </div>

      <div className="space-y-2 mt-1">
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
          {description}
        </p>
        {/* Subtle geometric status bar */}
        <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${getIndicatorBar()}`} />
        </div>
      </div>
    </div>
  );
};
