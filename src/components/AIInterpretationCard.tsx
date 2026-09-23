import React, { useState, useEffect } from "react";
import { FacialMetrics, Recommendation } from "../types";
import { ArrowRight, Cpu, Sparkles } from "lucide-react";
import { SpotlightCard } from "./SpotlightCard";
import { queryJevAIDecisions, JevAIDecisionResult } from "../services/jevAiService";

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
  const [jevResult, setJevResult] = useState<JevAIDecisionResult | null>(null);

  useEffect(() => {
    let active = true;
    queryJevAIDecisions(metrics).then((res) => {
      if (active) setJevResult(res);
    });
    return () => { active = false; };
  }, [metrics]);
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
    <SpotlightCard
      spotlightColor="rgba(245, 158, 11, 0.14)"
      borderColor="rgba(255, 255, 255, 0.08)"
      className="p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-5"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-mono">
              [02 // ARCHITECTURAL SYNTHESIS]
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white font-['Space_Grotesk',sans-serif] tracking-tight">
            AI Architectural Interpretation
          </h3>
          <p className="text-xs text-slate-400">
            Biometric proportion synthesis & diagnostic observations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-amber-400" />
            <span>Jev AI: {jevResult?.isLive ? 'Live System One' : 'Calibrated Engine'}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0 hidden sm:inline-block">
            v2.6 Synthesis
          </span>
        </div>
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

      {/* Jev AI System One Decision Matrix */}
      {jevResult && (
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                Jev AI System One Decision Matrix
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Engine: <strong className="text-cyan-400">{jevResult.isLive ? 'typesafe/jev-1.13' : 'Calibrated Anthropometrics'}</strong>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Priority Focus</span>
              <span className="font-bold text-white font-mono capitalize">
                {jevResult.priorityFocus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Harmony Score</span>
              <span className="font-bold text-cyan-400 font-mono">
                {jevResult.confidenceScore} / 10
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Vertical Lift</span>
              <span className={`font-bold font-mono ${jevResult.needsVerticalElongation ? 'text-amber-400' : 'text-emerald-400'}`}>
                {jevResult.needsVerticalElongation ? 'Required' : 'Neutral'}
              </span>
            </div>
          </div>
        </div>
      )}

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
    </SpotlightCard>
  );
};
