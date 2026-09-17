import React, { useEffect, useState, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Mic, 
  UserCheck,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { FacialMetrics, Recommendation, CompositeScan } from '../types';
import { 
  generateAgentConsultantScript, 
  agentAudioController, 
  AgentBriefing 
} from '../utils/aiAgentConsultant';

interface AIAgentConsultantCardProps {
  metrics: FacialMetrics;
  recommendations: Recommendation[];
  compositeScan?: CompositeScan | null;
}

export const AIAgentConsultantCard: React.FC<AIAgentConsultantCardProps> = ({
  metrics,
  recommendations,
  compositeScan
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);

  const briefing: AgentBriefing = useMemo(() => {
    return generateAgentConsultantScript(metrics, recommendations, compositeScan);
  }, [metrics, recommendations, compositeScan]);

  useEffect(() => {
    agentAudioController.setCallback((state) => {
      setIsPlaying(state.isSpeaking);
      setIsPaused(state.isPaused);
      setActiveSection(state.activeSectionIndex);
    });

    return () => {
      agentAudioController.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    agentAudioController.togglePlay(briefing);
  };

  const handleSelectSection = (index: number) => {
    setActiveSection(index);
    agentAudioController.playSection(briefing, index);
  };

  const handleStop = () => {
    agentAudioController.stop();
  };

  return (
    <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 overflow-hidden">
      {/* Top subtle highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Avatar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-4">
          {/* Avatar Icon */}
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all ${
              isPlaying && !isPaused ? 'ring-2 ring-amber-400/60 scale-105' : ''
            }`}>
              <Mic className="w-7 h-7" />
            </div>
            {/* Live indicator dot */}
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${
              isPlaying && !isPaused ? 'bg-emerald-400' : 'bg-slate-700'
            }`}>
              {isPlaying && !isPaused && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              )}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                AI Aesthetic Consultant
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Agent Marcus
              </span>
            </div>
            <h3 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif] mt-0.5">
              Personalized Audio Consultation Briefing
            </h3>
            <p className="text-xs text-slate-400">
              {briefing.summaryHeadline}
            </p>
          </div>
        </div>

        {/* Playback Control Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Animated Waveform Visualizer */}
          {isPlaying && !isPaused && (
            <div className="flex items-center gap-1 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl mr-1">
              {[0.4, 0.8, 0.5, 1.0, 0.7, 0.9, 0.3].map((val, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.round(val * 18)}px`,
                    animationDelay: `${i * 120}ms`,
                    animationDuration: '600ms'
                  }}
                />
              ))}
            </div>
          )}

          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Voice</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isPaused ? 'Resume Briefing' : 'Listen to Agent'}</span>
              </>
            )}
          </button>

          {isPlaying && (
            <button
              onClick={handleStop}
              title="Stop Consultation"
              className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Section Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        {briefing.sections.map((sec, idx) => {
          const isCurrent = activeSection === idx;
          return (
            <button
              key={sec.id}
              onClick={() => handleSelectSection(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isCurrent && isPlaying
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : isCurrent
                  ? 'bg-slate-800/80 border-slate-700 text-white'
                  : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Part {idx + 1}
                </span>
                {isCurrent && isPlaying && !isPaused && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">
                {sec.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {sec.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Expandable Transcript Drawer */}
      <div className="pt-2 border-t border-white/[0.06]">
        <button
          onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-white py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>Consultation Transcript & Notes</span>
          </span>
          {isTranscriptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isTranscriptOpen && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-3 text-xs leading-relaxed text-slate-300 animate-in fade-in duration-200">
            {briefing.sections.map((sec, idx) => (
              <div 
                key={sec.id}
                className={`p-3 rounded-xl transition-all ${
                  activeSection === idx && isPlaying
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200 font-medium'
                    : 'bg-transparent text-slate-400'
                }`}
              >
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  {sec.title}
                </div>
                <p>{sec.spokenText}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
