import React, { useState } from 'react';
import { Recommendation } from '../types';
import { Scissors, Smile, Glasses, Activity, CheckCircle2, Check } from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ recommendations }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'hair' | 'beard' | 'eyewear' | 'lifestyle'>('all');

  const categories = [
    { id: 'all', label: 'All Protocols', icon: CheckCircle2 },
    { id: 'hair', label: 'Haircut & Volume', icon: Scissors },
    { id: 'beard', label: 'Beard & Jawline', icon: Smile },
    { id: 'eyewear', label: 'Eyewear Frame', icon: Glasses },
    { id: 'lifestyle', label: 'Debloat & Posture', icon: Activity }
  ];

  const filtered = activeCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === activeCategory);

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'hair': 
        return {
          icon: <Scissors className="w-5 h-5 text-amber-400" />,
          glow: 'from-amber-500/10 to-orange-500/5',
          tag: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        };
      case 'beard': 
        return {
          icon: <Smile className="w-5 h-5 text-emerald-400" />,
          glow: 'from-emerald-500/10 to-teal-500/5',
          tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'eyewear': 
        return {
          icon: <Glasses className="w-5 h-5 text-sky-400" />,
          glow: 'from-sky-500/10 to-blue-500/5',
          tag: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
        };
      default: 
        return {
          icon: <Activity className="w-5 h-5 text-rose-400" />,
          glow: 'from-rose-500/10 to-purple-500/5',
          tag: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/[0.08] w-fit">
        {categories.map(c => {
          const Icon = c.icon;
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(rec => {
          const theme = getCategoryTheme(rec.category);
          return (
            <div
              key={rec.id}
              className={`group relative rounded-3xl p-6 bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden`}
            >
              {/* Top subtle highlight shimmer */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              {/* Ambient background glow */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${theme.glow} rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      {theme.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors font-['Space_Grotesk',sans-serif]">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{rec.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${theme.tag}`}>
                    {rec.tag}
                  </span>
                </div>

                {/* Clinical Rationale Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.06] mb-4 leading-relaxed text-xs text-slate-300">
                  <span className="text-amber-400 font-bold">Biometric Rationale: </span>
                  {rec.reason}
                </div>

                {/* Actionable Points */}
                <div className="space-y-2 mb-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Implementation
                  </p>
                  {rec.actionPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-800/30 p-2 rounded-xl border border-white/[0.04]">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
