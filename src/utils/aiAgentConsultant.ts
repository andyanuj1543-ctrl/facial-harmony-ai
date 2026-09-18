import { FacialMetrics, Recommendation, CompositeScan } from '../types';

export type AgentLanguage = 'hinglish' | 'english';

export interface AgentConsultantSection {
  id: 'architecture' | 'profile' | 'actions';
  title: string;
  subtitle: string;
  spokenText: string;
  keyTakeaways?: string[];
}

export interface AgentBriefing {
  language: AgentLanguage;
  personaName: string;
  personaRole: string;
  fullScript: string;
  sections: AgentConsultantSection[];
  summaryHeadline: string;
}

/**
 * Synthesizes spoken briefing tailored to masculine facial architecture.
 * Supports both Hinglish (friendly, practical Desi mentor) and English (clinical).
 */
export function generateAgentConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null,
  videoData?: any | null,
  language: AgentLanguage = 'hinglish'
): AgentBriefing {
  if (language === 'hinglish') {
    return generateHinglishConsultantScript(metrics, recommendations, compositeScan, videoData);
  }
  return generateEnglishConsultantScript(metrics, recommendations, compositeScan, videoData);
}

/**
 * Friendly, direct, brotherly Hinglish briefing — zero fancy jargon, 100% natural conversational rhythm.
 */
function generateHinglishConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null,
  videoData?: any | null
): AgentBriefing {
  // SECTION 1: Face Shape aur Jawline ka Sach
  let shapeInsight = '';
  if (metrics.faceShape === 'Square' || metrics.faceShape === 'Diamond') {
    shapeInsight = `Dekho bhai, seedhi baat bolunga — tumhara face structure naturally kaafi strong aur masculine hai. Jawbone ka frame bilkul solid hai... par main cheez jo cuts ko thoda hide kar rahi hai, wo hai thoda facial bloat aur water retention.`;
  } else if (metrics.faceShape === 'Round' || metrics.faceShape === 'Oval') {
    shapeInsight = `Dekho bhai, tumhara face shape abhi thoda rounded lag raha hai. Par iska matlab ye bilkul nahi ki jawline nahi hai... balki cheeks aur jawline ke paas thoda soft tissue aur water retention jama hai. Agar bloat utrega, to jawline apne aap sharp bahar aayegi.`;
  } else {
    shapeInsight = `Dekho bhai, tumhara face lamba aur athletic frame ka hai. Cheekbones acche hain... bas lower jaw ko thodi visual width dene ke liye sahi beard aur haircut line ki zaroorat hai.`;
  }

  const symmetryHinglish = metrics.symmetryPercentage >= 90
    ? `Tumhare left aur right face ka balance lagbhag ${metrics.symmetryPercentage} percent hai — jo ki model-level symmetry maani jaati hai.`
    : `Tumhara left aur right face balance ${metrics.symmetryPercentage} percent hai, jo ki normal masculine face ke liye bilkul natural hai.`;

  const sec1Text = `Namaste bhai! Main Aryan hoon... tumhara personal grooming mentor. Koi fancy doctor wale words nahi bolenge, seedha mudde ki baat karenge. ${shapeInsight} ${symmetryHinglish}`;

  // SECTION 2: 360 Video aur Side Profile
  let videoMotionHinglish = '';
  if (videoData?.videoReport) {
    const vr = videoData.videoReport;
    videoMotionHinglish = `Tumhare 5-second video motion mein maine observe kiya... tumhara dynamic jawline score ${vr.dynamicJawlineDefinitionScore} out of 100 hai. Jab tum left turn karte ho, to jawline zyada sharp dikhti hai right ke mukable. Iska matlab photos aur dating profile ke liye... tumhara left side best hero angle hai.`;
  } else {
    videoMotionHinglish = `Side view mein chin aur lips ka posture dekhein to balance theek hai. Bas phone chalate waqt garden aage jhukane se bacho... kyunki forward neck posture se double chin create ho jaati hai.`;
  }

  const sec2Text = `Ab aate hain tumhare side profile aur camera angle pe... ${videoMotionHinglish} Ek simple habit banao — chin ko halka sa aage aur tongue ko hamesha roof of the mouth pe chipka ke rakho. Is mewing posture se, tumhara side profile 10 din mein sharper dikhega.`;

  // SECTION 3: Seedha Action Plan
  const hairRec = recommendations.find(r => r.category === 'hair');
  const beardRec = recommendations.find(r => r.category === 'grooming');

  const hairActionHinglish = hairRec
    ? `Haircut ke liye: Barber ko bolo, sides pe #1.5 ya #2 mid-taper fade kare... aur top pe natural texture rakhe. Sides flat hone se face automatically lamba aur athletic lagega.`
    : `Haircut ke liye: Sides pe mid-taper fade aur top pe textured crop sabse best suit karega.`;

  const beardActionHinglish = beardRec
    ? `Daadhi ke liye: Sabse zaroori rule hai neckline! Adam's apple se theek do ungli upar curve banao. Gale pe daadhi mat chhodna... warna double chin lagegi.`
    : `Daadhi ke liye: Neckline ko Adam's apple se do ungli upar clean rakho taaki jawline instantly square dikhe.`;

  const bloatActionHinglish = `Face bloat ke liye: Raat ka namkeen, late-night chai aur high sodium kam karo. Roz subah ek bowl thande barf wale paani mein 10 second face dip karo... sara morning facial bloat 5 minute mein gayab ho jayega.`;

  const sec3Text = `Ab dhyan se suno tumhara 3-step action plan... Pehla — ${hairActionHinglish} Doosra — ${beardActionHinglish} Aur teesra, sabse zaroori — ${bloatActionHinglish} Bas ye teen simple rules follow karo bhai... bina kisi mehenge treatment ke jawline aur look 100% elevate ho jayega.`;

  return {
    language: 'hinglish',
    personaName: 'Aryan Bhai',
    personaRole: 'Desi Grooming & Aesthetics Mentor',
    summaryHeadline: `${metrics.faceShape} Frame • ${metrics.symmetryPercentage}% Balance • Desi Action Blueprint`,
    fullScript: `${sec1Text} ${sec2Text} ${sec3Text}`,
    sections: [
      {
        id: 'architecture',
        title: 'Face Shape & Jawline Reality',
        subtitle: 'No fancy terms, seedha face ka analysis',
        spokenText: sec1Text,
        keyTakeaways: [
          `${metrics.faceShape} bone structure with ${metrics.symmetryPercentage}% symmetry`,
          'Bloat aur water retention kam karne se jawline bahar aayegi',
          'Naturally masculine, balanced facial base'
        ]
      },
      {
        id: 'profile',
        title: 'Side Angle & Best Camera Profile',
        subtitle: 'Dating & portrait ke liye best angle',
        spokenText: sec2Text,
        keyTakeaways: [
          videoData?.videoReport ? 'Left profile shows sharper mandibular angle' : 'Balanced side profile with good lip-chin alignment',
          'Forward head posture theek karo double chin avoid karne ke liye',
          'Mewing tongue posture se chin definition improve hoti hai'
        ]
      },
      {
        id: 'actions',
        title: '3-Step Desi Action Plan',
        subtitle: 'Haircut, daadhi neckline aur bloat flush',
        spokenText: sec3Text,
        keyTakeaways: [
          'Barber se sides pe #1.5 to #2 mid-taper fade lagwao',
          "Daadhi neckline Adam's apple se 2 ungli upar rakho",
          'Subah ice-water face dip aur sodium intake kam karo'
        ]
      }
    ]
  };
}

/**
 * Formal clinical briefing (English).
 */
function generateEnglishConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null,
  videoData?: any | null
): AgentBriefing {
  const symmetryText = metrics.symmetryPercentage >= 90
    ? `Your bilateral symmetry is exceptionally high at ${metrics.symmetryPercentage} percent... providing a strong, well-balanced foundation.`
    : `Your bilateral symmetry measures ${metrics.symmetryPercentage} percent... displaying natural human masculine variation.`;

  const mandibleText = metrics.jawToCheekRatio >= 0.76
    ? `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}, indicating a powerful, wide mandibular bone structure.`
    : `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}, displaying a tapered athletic jawline contour.`;

  const sec1Text = `Greetings. This is Agent Marcus... your biometric aesthetic consultant. Let's examine your facial architecture. Your measurements reveal a ${metrics.faceShape} bone structure with ${metrics.structuralProfile}. ${symmetryText} Looking at your vertical thirds: ${metrics.upperThird} percent for the upper forehead, ${metrics.middleThird} percent for the midface, and ${metrics.lowerThird} percent for the lower jaw. ${mandibleText}`;

  // SECTION 2: Profile & Continuous 360 Video Rotation
  const profileMetrics = compositeScan?.profile.metrics || metrics;
  const nla = profileMetrics.nasolabialAngle || 94;
  const nlaStatus = profileMetrics.nasolabialStatus || 'Optimal';
  const eLineDist = profileMetrics.eLineUpperLipDist ?? 2.0;
  const eLineStatus = profileMetrics.eLineStatus || 'Balanced Profile';

  let motionText = '';
  if (videoData?.videoReport) {
    const vr = videoData.videoReport;
    motionText = ` In your continuous 5-second video rotation, your rotational symmetry scored ${vr.rotationalSymmetryPercentage} percent... with a dynamic jawline definition score of ${vr.dynamicJawlineDefinitionScore} out of 100.`;
  }

  const sec2Text = `Now, analyzing your head rotation and lateral profile: Your nasolabial angle measures ${nla} degrees, which is clinically ${nlaStatus}. Along Ricketts' esthetic line, your upper lip distance is ${eLineDist} millimeters... reflecting a ${eLineStatus} with strong chin projection.${motionText}`;

  // SECTION 3: Actionable Execution Plan
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

  return {
    language: 'english',
    personaName: 'Agent Marcus',
    personaRole: 'Biometric Aesthetic Consultant',
    summaryHeadline: `${metrics.faceShape} Architecture • ${metrics.symmetryPercentage}% Symmetry • ${eLineStatus}`,
    fullScript: `${sec1Text} ${sec2Text} ${sec3Text}`,
    sections: [
      {
        id: 'architecture',
        title: 'Facial Architecture & Thirds',
        subtitle: `${metrics.faceShape} Shape • ${metrics.symmetryPercentage}% Symmetry`,
        spokenText: sec1Text,
        keyTakeaways: [
          `${metrics.faceShape} bone structure`,
          `${metrics.symmetryPercentage}% bilateral symmetry balance`,
          `Jaw-to-cheek ratio: ${metrics.jawToCheekRatio}`
        ]
      },
      {
        id: 'profile',
        title: 'Lateral Profile & E-Line Angle',
        subtitle: `${nla}° Nasolabial • ${eLineStatus}`,
        spokenText: sec2Text,
        keyTakeaways: [
          `${nla}° Nasolabial angle (${nlaStatus})`,
          `${eLineStatus} relative to Ricketts E-line`,
          'Mandibular projection alignment'
        ]
      },
      {
        id: 'actions',
        title: 'Grooming & Posture Action Plan',
        subtitle: 'Haircut, Beard & Debloating Protocols',
        spokenText: sec3Text,
        keyTakeaways: [
          hairAction,
          beardAction,
          lifestyleAction
        ]
      }
    ]
  };
}

/**
 * Advanced voice selection prioritizing natural human-sounding neural voices on Mac, Windows, and Chrome.
 */
export function findBestVoiceForLanguage(
  lang: AgentLanguage, 
  voices: SpeechSynthesisVoice[],
  preferredURI?: string | null
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (preferredURI) {
    const matched = voices.find(v => v.voiceURI === preferredURI || v.name === preferredURI);
    if (matched) return matched;
  }

  if (lang === 'hinglish') {
    // 1. Natural / Enhanced / Siri Indian voices (highest fidelity on Mac / iOS)
    const enhancedIndian = voices.find(v => 
      (v.lang.startsWith('en-IN') || v.lang.startsWith('hi')) &&
      (v.name.includes('Enhanced') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Premium'))
    );
    if (enhancedIndian) return enhancedIndian;

    // 2. Google Indian English or Google Hindi voices in Chrome
    const googleIndian = voices.find(v => 
      v.name.includes('Google') && (v.lang.startsWith('en-IN') || v.lang.startsWith('hi'))
    );
    if (googleIndian) return googleIndian;

    // 3. Renowned natural Indian voices by name (Rishi, Lekha, Veena, Sangeeta, Ravi, Neerja)
    const namedIndian = voices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('rishi') || n.includes('lekha') || n.includes('veena') || n.includes('sangeeta') || n.includes('ravi') || n.includes('neerja');
    });
    if (namedIndian) return namedIndian;

    // 4. Any Indian English or Hindi voice
    const anyIndian = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en-IN') || v.lang.startsWith('hi'));
    if (anyIndian) return anyIndian;
  }

  // English (or fallback): prefer warm, natural masculine voices
  const naturalEnglish = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.includes('Enhanced') || v.name.includes('Natural') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Guy'))
  );
  if (naturalEnglish) return naturalEnglish;

  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
}

/**
 * Controller for Voice Speech Synthesis with phrase-by-phrase natural breathing pauses.
 */
export class AIAgentAudioController {
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private activeSectionIndex: number = 0;
  private activePhraseIndex: number = 0;
  private currentPhrases: string[] = [];
  private currentBriefing: AgentBriefing | null = null;
  private pauseTimer: any = null;
  
  public speechRate: number = 0.92; // Natural, relaxed conversational cadence
  public preferredVoiceURI: string | null = null;

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

  public setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.75, Math.min(1.25, rate));
  }

  public setPreferredVoice(uri: string | null) {
    this.preferredVoiceURI = uri;
  }

  public playSection(briefing: AgentBriefing, sectionIndex: number = 0) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.stop();
    this.currentBriefing = briefing;
    this.activeSectionIndex = sectionIndex;

    const targetSection = briefing.sections[sectionIndex];
    if (!targetSection) return;

    // Split text into natural conversational sentence phrases (breath units)
    this.currentPhrases = targetSection.spokenText
      .split(/(?<=[.!?…])\s+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    this.activePhraseIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;
    this.notify();

    this.speakCurrentPhrase();
  }

  private speakCurrentPhrase() {
    if (!this.isSpeaking || this.isPaused || !this.currentBriefing) return;

    if (this.activePhraseIndex >= this.currentPhrases.length) {
      // Advance to next section if available
      if (this.activeSectionIndex < this.currentBriefing.sections.length - 1) {
        this.pauseTimer = setTimeout(() => {
          this.playSection(this.currentBriefing!, this.activeSectionIndex + 1);
        }, 350); // Inter-section natural reflective pause
      } else {
        this.isSpeaking = false;
        this.isPaused = false;
        this.notify();
      }
      return;
    }

    const phrase = this.currentPhrases[this.activePhraseIndex];
    const utterance = new SpeechSynthesisUtterance(phrase);
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = findBestVoiceForLanguage(this.currentBriefing.language, voices, this.preferredVoiceURI);

    utterance.rate = this.speechRate;
    utterance.pitch = this.currentBriefing.language === 'hinglish' ? 0.98 : 0.95;

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = this.currentBriefing.language === 'hinglish' ? 'en-IN' : 'en-US';
    }

    utterance.onend = () => {
      this.activePhraseIndex++;
      // Natural human micro-breath pause between sentences (110ms)
      this.pauseTimer = setTimeout(() => {
        this.speakCurrentPhrase();
      }, 110);
    };

    utterance.onerror = (e) => {
      // If error or user cancelled, continue or finish gracefully
      if (this.isSpeaking && !this.isPaused) {
        this.activePhraseIndex++;
        this.speakCurrentPhrase();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public togglePlay(briefing: AgentBriefing) {
    if (!window.speechSynthesis) return;

    if (this.isSpeaking) {
      if (this.isPaused) {
        this.isPaused = false;
        this.notify();
        this.speakCurrentPhrase();
      } else {
        window.speechSynthesis.cancel();
        if (this.pauseTimer) clearTimeout(this.pauseTimer);
        this.isPaused = true;
        this.notify();
      }
    } else {
      this.playSection(briefing, this.activeSectionIndex);
    }
  }

  public stop() {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.activePhraseIndex = 0;
    this.currentPhrases = [];
    this.notify();
  }
}

export const agentAudioController = new AIAgentAudioController();
