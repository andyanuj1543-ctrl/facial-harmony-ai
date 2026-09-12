import React, { useState } from 'react';
import { Recommendation } from '../types';
import { Scissors, Smile, Glasses, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

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

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'hair': return <Scissors className="w-5 h-5 text-amber-400" />;
      case 'beard': return <Smile className="w-5 h-5 text-emerald-400" />;
      case 'eyewear': return <Glasses className="w-5 h-5 text-sky-400" />;
      default: return <Activity className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {categories.map(c => {
          const Icon = c.icon;
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(rec => (
          <div
            key={rec.id}
            className="group bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center">
                    {getIcon(rec.category)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-400">{rec.subtitle}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-amber-400">
                  {rec.tag}
                </span>
              </div>

              {/* Rationale */}
              <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 mb-4 leading-relaxed">
                <strong className="text-amber-400 font-medium">Why this works: </strong>
                {rec.reason}
              </p>

              {/* Action Checklist */}
              <div className="space-y-2 mb-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Actionable Steps
                </p>
                {rec.actionPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
