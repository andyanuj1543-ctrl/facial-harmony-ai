import React from "react";
import { FacialMetrics, Recommendation } from "../types";
import { ArrowRight } from "lucide-react";

interface AIInterpretationCardProps {
  metrics: FacialMetrics;
  recommendations: Recommendation[];
  onExploreGrooming?: () => void;
}

export const AIInterpretationCard: React.FC<AIInterpretationCardProps> = ({
  metrics,
  recommendations,
  onExploreGrooming
}) => {
  // Generate concise clinical assessment based on metrics
  const getStructuralAnalysis = () => {
    const isHighSymmetry = metrics.symmetryPercentage >= 90;
    const isProminentJaw = metrics.jawToCheekRatio >= 0.76;

    let summary = `Your cranial-facial structure is classified under the ${metrics.faceShape.toUpperCase()} archetype with a ${metrics.structuralProfile.toLowerCase()}. `;
    
    if (isHighSymmetry) {
      summary += `Sagittal alignment is exceptionally well-balanced at ${metrics.symmetryPercentage}%, providing strong natural bilateral harmony across primary facial planes. `;
    } else {
      summary += `Sagittal alignment measures at ${metrics.symmetryPercentage}%, with standard biological micro-variance that can be seamlessly balanced via targeted grooming. `;
    }

    if (isProminentJaw) {
      summary += `Your mandibular ramus exhibits strong lateral definition (jaw-to-cheek ratio: ${metrics.jawToCheekRatio}), creating an athletic lower-third anchor.`;
    } else {
      summary += `Your lower third features a streamlined taper, where vertical elongation techniques will maximize mandibular presence.`;
    }

    return summary;
  };

  const topRecommendations = recommendations.slice(0, 2);

  return (
    <div className="relative rounded-2xl p-5 sm:p-6 bg-[#0d121c] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-5 overflow-hidden">
      {/* Subtle top hairline highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/25 to-transparent pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-mono">
              Clinical Intelligence Engine
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white font-['Space_Grotesk',sans-serif] tracking-tight">
            AI Architectural Interpretation
          </h3>
          <p className="text-xs text-slate-400">
            Biometric proportion synthesis & diagnostic observations
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
          v2.6 Synthesis
        </span>
      </div>

      {/* Synthesis Narrative Box */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.05] leading-relaxed text-xs sm:text-sm text-slate-300">
        <p>{getStructuralAnalysis()}</p>
      </div>

      {/* 3 Key Structural Observations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            Ramus Architecture
          </span>
          <span className="text-xs font-bold text-white block">
            {metrics.jawToCheekRatio >= 0.76 ? "Defined Mandible" : "Tapered Mandible"}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">Ratio {metrics.jawToCheekRatio}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            Bilateral Symmetry
          </span>
          <span className="text-xs font-bold text-white block">{metrics.symmetryStatus}</span>
          <span className="text-[10px] text-emerald-400 font-mono">{metrics.symmetryPercentage}% Match</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            Canthal Vector
          </span>
          <span className="text-xs font-bold text-white block capitalize">{metrics.canthalTiltType} Tilt</span>
          <span className="text-[10px] text-cyan-400 font-mono">{metrics.canthalTiltAngle}° Angle</span>
        </div>
      </div>

      {/* Strategic Focus Levers */}
      {topRecommendations.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Primary Optimization Protocols
            </span>
            {onExploreGrooming && (
              <button
                onClick={onExploreGrooming}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>View Full Blueprint</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {topRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-white/[0.04] text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="font-semibold text-slate-200 truncate">{rec.title}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono shrink-0">
                  {rec.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
