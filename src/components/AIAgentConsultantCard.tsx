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
  CheckCircle2,
  Languages
} from 'lucide-react';
import { FacialMetrics, Recommendation, CompositeScan } from '../types';
import { 
  generateAgentConsultantScript, 
  agentAudioController, 
  AgentBriefing,
  AgentLanguage
} from '../utils/aiAgentConsultant';

interface AIAgentConsultantCardProps {
  metrics: FacialMetrics;
  recommendations: Recommendation[];
  compositeScan?: CompositeScan | null;
  videoData?: any;
}

export const AIAgentConsultantCard: React.FC<AIAgentConsultantCardProps> = ({
  metrics,
  recommendations,
  compositeScan,
  videoData
}) => {
  const [language, setLanguage] = useState<AgentLanguage>('hinglish');
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.92);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);

  const briefing: AgentBriefing = useMemo(() => {
    return generateAgentConsultantScript(metrics, recommendations, compositeScan, videoData, language);
  }, [metrics, recommendations, compositeScan, videoData, language]);

  // Load and refresh browser voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const v = window.speechSynthesis.getVoices();
        setAvailableVoices(v);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    agentAudioController.setCallback((state) => {
      setIsPlaying(state.isSpeaking);
      setIsPaused(state.isPaused);
      setActiveSection(state.activeSectionIndex);
    });

    return () => {
      agentAudioController.stop();
    };
  }, []);

  const handleLanguageChange = (newLang: AgentLanguage) => {
    if (newLang === language) return;
    agentAudioController.stop();
    setLanguage(newLang);
  };

  const handleSpeedChange = (speed: number) => {
    setSpeechSpeed(speed);
    agentAudioController.setSpeechRate(speed);
    if (isPlaying) {
      // restart current section at new speed
      agentAudioController.playSection(briefing, activeSection);
    }
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri);
    agentAudioController.setPreferredVoice(uri || null);
    if (isPlaying) {
      agentAudioController.playSection(briefing, activeSection);
    }
  };

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

  // Filter voices relevant to current language
  const filteredVoices = useMemo(() => {
    if (language === 'hinglish' || language === 'indian_english') {
      return availableVoices.filter(v => 
        v.lang.startsWith('en-IN') || 
        v.lang.startsWith('hi') || 
        v.name.toLowerCase().includes('india') || 
        v.name.toLowerCase().includes('rishi') || 
        v.name.toLowerCase().includes('veena') ||
        v.name.toLowerCase().includes('lekha') ||
        v.name.toLowerCase().includes('sangeeta')
      );
    }
    return availableVoices.filter(v => v.lang.startsWith('en'));
  }, [availableVoices, language]);

  return (
    <div className="relative rounded-2xl bg-[#0d121c] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.25)] p-4 sm:p-5 overflow-hidden space-y-3.5">
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none" />

      {/* Header: Title + Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 transition-transform ${
            isPlaying && !isPaused ? 'scale-105 ring-1 ring-amber-400/50' : ''
          }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-['Space_Grotesk',sans-serif]">
                Voice Mentor Consultation
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {briefing.personaName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Audio explanation calibrated to your facial scan
            </p>
          </div>
        </div>

        {/* Compact Language Selector Chips */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 rounded-xl border border-white/[0.06] self-start sm:self-auto">
          <button
            onClick={() => handleLanguageChange('hinglish')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              language === 'hinglish'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇮🇳 Hinglish
          </button>
          <button
            onClick={() => handleLanguageChange('indian_english')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              language === 'indian_english'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Indian EN
          </button>
          <button
            onClick={() => handleLanguageChange('global_english')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              language === 'global_english'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Global EN
          </button>
        </div>
      </div>

      {/* Audio Playback Deck */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-white/[0.05]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-black transition-transform active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0"
            title={isPlaying && !isPaused ? 'Pause' : 'Play'}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">
                {briefing.sections[activeSection]?.title || 'Diagnostic Briefing'}
              </span>
              {isPlaying && !isPaused && (
                <span className="text-[10px] text-amber-400 font-mono animate-pulse">Playing</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {briefing.sections[activeSection]?.subtitle || briefing.summaryHeadline}
            </p>
          </div>
        </div>

        {/* Speed & Stop */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { label: '0.85x', val: 0.85 },
            { label: '0.92x', val: 0.92 },
            { label: '1.05x', val: 1.05 }
          ].map((chip) => (
            <button
              key={chip.val}
              onClick={() => handleSpeedChange(chip.val)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                speechSpeed === chip.val
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {chip.label}
            </button>
          ))}

          {isPlaying && (
            <button
              onClick={handleStop}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Stop"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Section Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
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
                  {language === 'hinglish' ? `Step ${idx + 1}` : `Part ${idx + 1}`}
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
            <span>{language === 'hinglish' ? 'Transcript aur Direct Actions dekho' : 'Consultation Transcript & Notes'}</span>
          </span>
          {isTranscriptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isTranscriptOpen && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-4 text-xs leading-relaxed text-slate-300 animate-in fade-in duration-200">
            {briefing.sections.map((sec, idx) => (
              <div 
                key={sec.id}
                className={`p-3.5 rounded-2xl transition-all ${
                  activeSection === idx && isPlaying
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200 font-medium'
                    : 'bg-slate-900/40 border border-white/[0.04] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {sec.title}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {sec.subtitle}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed mb-3">
                  {sec.spokenText}
                </p>

                {/* Key Takeaways Badges */}
                {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{language === 'hinglish' ? 'Direct Action Steps:' : 'Key Direct Takeaways:'}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {sec.keyTakeaways.map((tip, i) => (
                        <div key={i} className="flex items-start gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
