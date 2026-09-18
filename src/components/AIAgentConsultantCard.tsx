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
    <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 overflow-hidden">
      {/* Top subtle highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher & Cadence Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mr-1">
            <Languages className="w-4 h-4 text-amber-400" />
            <span>Voice Style:</span>
          </div>
          <div className="inline-flex p-1 rounded-xl bg-slate-950/80 border border-white/[0.08] flex-wrap gap-1">
            <button
              onClick={() => handleLanguageChange('hinglish')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                language === 'hinglish'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳 Hinglish (Desi Mentor)</span>
            </button>
            <button
              onClick={() => handleLanguageChange('indian_english')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                language === 'indian_english'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳 Indian English (Natural)</span>
            </button>
            <button
              onClick={() => handleLanguageChange('global_english')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                language === 'global_english'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐 Global English</span>
            </button>
          </div>
        </div>

        {/* Speed / Cadence Chips */}
        <div className="flex items-center gap-1.5 self-start lg:self-auto">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Speed:</span>
          {[
            { label: '0.85x Relaxed', val: 0.85 },
            { label: '0.92x Natural', val: 0.92 },
            { label: '1.05x Brisk', val: 1.05 }
          ].map((chip) => (
            <button
              key={chip.val}
              onClick={() => handleSpeedChange(chip.val)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                speechSpeed === chip.val
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection Dropdown if multiple voices found */}
      {filteredVoices.length > 1 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-slate-950/40 border border-white/[0.04]">
          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-slate-400 shrink-0">Speaker Voice:</span>
          <select
            value={selectedVoiceURI}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="bg-transparent text-amber-300 text-xs font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="" className="bg-slate-900 text-white">✨ Auto-Detect Best Natural Voice</option>
            {filteredVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI} className="bg-slate-900 text-white">
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}

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
                {language === 'global_english' ? 'Biometric Consultant' : 'Aesthetic Mentor'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {briefing.personaName}
              </span>
            </div>
            <h3 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif] mt-0.5">
              {language === 'hinglish' ? 'Aryan ki Personal Voice Advice' : language === 'indian_english' ? 'Personal Indian Mentor Audio' : 'Personalized Audio Consultation'}
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
                <span>{isPaused ? 'Resume Voice' : language === 'hinglish' ? 'Bhai Ki Advice Suno' : 'Listen to Mentor'}</span>
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
