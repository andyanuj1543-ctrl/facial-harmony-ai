import { FacialMetrics, Recommendation, CompositeScan } from '../types';

export interface AgentConsultantSection {
  id: 'architecture' | 'profile' | 'actions';
  title: string;
  subtitle: string;
  spokenText: string;
}

export interface AgentBriefing {
  fullScript: string;
  sections: AgentConsultantSection[];
  summaryHeadline: string;
}

/**
 * Synthesizes a clinical spoken briefing tailored to masculine facial architecture.
 */
export function generateAgentConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null
): AgentBriefing {
  // SECTION 1: Architecture & Facial Thirds
  const symmetryText = metrics.symmetryPercentage >= 90
    ? `Your bilateral symmetry is exceptionally high at ${metrics.symmetryPercentage} percent, which provides a strong, well-balanced foundation.`
    : `Your bilateral symmetry measures ${metrics.symmetryPercentage} percent, displaying natural human masculine variation.`;

  const mandibleText = metrics.jawToCheekRatio >= 0.76
    ? `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}, indicating a powerful, wide mandibular bone structure.`
    : `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}, displaying a tapered athletic jawline contour.`;

  const sec1Text = `Greetings. This is Agent Marcus, your biometric aesthetic consultant. Let's examine your facial architecture. Your measurements reveal a ${metrics.faceShape} bone structure with ${metrics.structuralProfile}. ${symmetryText} Looking at your vertical balance, your thirds are divided into ${metrics.upperThird} percent for the upper forehead, ${metrics.middleThird} percent for the midface, and ${metrics.lowerThird} percent for the lower jaw. ${mandibleText}`;

  // SECTION 2: Profile & 360 Rotation
  const profileMetrics = compositeScan?.profile.metrics || metrics;
  const nla = profileMetrics.nasolabialAngle || 94;
  const nlaStatus = profileMetrics.nasolabialStatus || 'Optimal';
  const eLineDist = profileMetrics.eLineUpperLipDist ?? 2.0;
  const eLineStatus = profileMetrics.eLineStatus || 'Balanced Profile';

  const sec2Text = `Now, analyzing your lateral side profile from your head rotation: Your nasolabial angle measures ${nla} degrees, which is clinically ${nlaStatus} for masculine facial norms. Along Ricketts' esthetic line, your upper lip distance is ${eLineDist} millimeters, which reflects a ${eLineStatus} with strong chin projection.`;

  // SECTION 3: Actionable Execution Plan ("What he should do")
  const hairRec = recommendations.find(r => r.category === 'hair');
  const beardRec = recommendations.find(r => r.category === 'grooming');
  const lifestyleRec = recommendations.find(r => r.category === 'lifestyle');

  const hairAction = hairRec 
    ? `For your haircut: ${hairRec.title}. ${hairRec.actionPoints[0]}.` 
    : 'Maintain a clean textured crop with a low taper fade.';

  const beardAction = beardRec 
    ? `For your beard and jawline: ${beardRec.title}. ${beardRec.actionPoints[0]}.` 
    : 'Keep defined stubble to reinforce the lower mandibular angle.';

  const lifestyleAction = lifestyleRec 
    ? `For facial debloating and posture: ${lifestyleRec.actionPoints[0]} and ${lifestyleRec.actionPoints[1]}.` 
    : 'Maintain resting palatal tongue posture and hydrate consistently to reduce facial water retention.';

  const sec3Text = `Here is your strategic action plan to maximize your masculine aesthetics: First, for hair: ${hairAction} Second, for your jawline: ${beardAction} Third, for skin and soft-tissue sharpness: ${lifestyleAction} Following these steps will bring out your natural bone definition with zero guesswork.`;

  const fullScript = `${sec1Text} ${sec2Text} ${sec3Text}`;

  return {
    fullScript,
    summaryHeadline: `${metrics.faceShape} Architecture • ${metrics.symmetryPercentage}% Symmetry • ${eLineStatus}`,
    sections: [
      {
        id: 'architecture',
        title: 'Facial Architecture & Thirds',
        subtitle: `${metrics.faceShape} Shape • ${metrics.symmetryPercentage}% Symmetry`,
        spokenText: sec1Text
      },
      {
        id: 'profile',
        title: 'Lateral Profile & E-Line Angle',
        subtitle: `${nla}° Nasolabial • ${eLineStatus}`,
        spokenText: sec2Text
      },
      {
        id: 'actions',
        title: 'Grooming & Posture Action Plan',
        subtitle: 'Haircut, Beard & Debloating Protocols',
        spokenText: sec3Text
      }
    ]
  };
}

/**
 * Controller for Voice Speech Synthesis with progress and state tracking.
 */
export class AIAgentAudioController {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private activeSectionIndex: number = 0;
  private currentBriefing: AgentBriefing | null = null;

  private onStateChangeCb: ((state: { isSpeaking: boolean; isPaused: boolean; activeSectionIndex: number }) => void) | null = null;

  public setCallback(cb: (state: { isSpeaking: boolean; isPaused: boolean; activeSectionIndex: number }) => void) {
    this.onStateChangeCb = cb;
  }

  private notify() {
    if (this.onStateChangeCb) {
      this.onStateChangeCb({
        isSpeaking: this.isSpeaking,
        isPaused: this.isPaused,
        activeSectionIndex: this.activeSectionIndex
      });
    }
  }

  public playSection(briefing: AgentBriefing, sectionIndex: number = 0) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.stop();
    this.currentBriefing = briefing;
    this.activeSectionIndex = sectionIndex;

    const targetSection = briefing.sections[sectionIndex];
    if (!targetSection) return;

    const utterance = new SpeechSynthesisUtterance(targetSection.spokenText);
    utterance.rate = 1.0;
    utterance.pitch = 0.95; // Deep masculine consultant tone
    utterance.lang = 'en-US';

    // Prefer high quality English voices if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Guy') || v.name.includes('David') || v.name.includes('Natural')) &&
      v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      // Advance to next section if available
      if (this.currentBriefing && this.activeSectionIndex < this.currentBriefing.sections.length - 1) {
        this.playSection(this.currentBriefing, this.activeSectionIndex + 1);
      } else {
        this.isSpeaking = false;
        this.isPaused = false;
        this.notify();
      }
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.notify();
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public togglePlay(briefing: AgentBriefing) {
    if (!window.speechSynthesis) return;

    if (this.isSpeaking) {
      if (this.isPaused) {
        window.speechSynthesis.resume();
        this.isPaused = false;
        this.notify();
      } else {
        window.speechSynthesis.pause();
        this.isPaused = true;
        this.notify();
      }
    } else {
      this.playSection(briefing, this.activeSectionIndex);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.notify();
  }
}

export const agentAudioController = new AIAgentAudioController();
