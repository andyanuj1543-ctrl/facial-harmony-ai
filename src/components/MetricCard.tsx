import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  ideal: string;
  status: 'Optimal' | 'Balanced' | 'Moderate' | 'Variant';
  description: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  ideal,
  status,
  description,
  color = 'amber'
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Optimal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Balanced':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/90 shadow-lg">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
          {status}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">{value}</span>
        <span className="text-xs text-slate-400">Target: {ideal}</span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
};
