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
 * Friendly, direct, brotherly Hinglish briefing — zero fancy jargon, 100% practical.
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
    shapeInsight = `Sun bhai, seedhi baat bolunga — tumhara face structure naturally kaafi strong aur masculine hai. Jawbone ka frame solid hai, par main cheez jo cuts ko thoda hide kar rahi hai wo hai facial bloat aur water retention.`;
  } else if (metrics.faceShape === 'Round' || metrics.faceShape === 'Oval') {
    shapeInsight = `Sun bhai, tumhara face shape thoda rounded lag raha hai. Iska matlab ye bilkul nahi ki jawline nahi hai, balki cheeks aur jaw ke paas extra soft tissue aur water retention hai. Agar bloat utrega to jaw apne aap pop out karegi.`;
  } else {
    shapeInsight = `Sun bhai, tumhara face lamba aur athletic frame ka hai. Cheekbones theek hain, bas lower jaw ko visual width dene ke liye sahi beard aur haircut line ki zaroorat hai.`;
  }

  const symmetryHinglish = metrics.symmetryPercentage >= 90
    ? `Tumhare left aur right face ka balance ${metrics.symmetryPercentage} percent hai — jo ki zabardast hai, model level symmetry hai.`
    : `Tumhara left aur right face balance ${metrics.symmetryPercentage} percent hai, jo ki normal masculine face ke liye bilkul natural hai.`;

  const sec1Text = `Namaste bhai! Main Aryan hoon, tumhara personal grooming aur aesthetics mentor. Koi fancy doctor wale words nahi bolunga, seedha point pe aate hain. ${shapeInsight} ${symmetryHinglish}`;

  // SECTION 2: 360 Video aur Side Profile
  const profileMetrics = compositeScan?.profile.metrics || metrics;
  const eLineStatus = profileMetrics.eLineStatus || 'Balanced Profile';
  
  let videoMotionHinglish = '';
  if (videoData?.videoReport) {
    const vr = videoData.videoReport;
    videoMotionHinglish = ` Tumhare 5-second video motion mein maine dekha ki tumhara dynamic jawline score ${vr.dynamicJawlineDefinitionScore} out of 100 hai. Jab tum left ghoomte ho to bone angle zyada sharp dikhta hai, iska matlab photos ke liye tumhara left profile best angle hai.`;
  } else {
    videoMotionHinglish = ` Side view mein chin aur lips ka posture dekhein to balance theek hai, bas desk pe ya phone chalate waqt garden aage jhukane se bacho, kyunki forward posture se double chin create ho jaati hai.`;
  }

  const sec2Text = `Ab aate hain tumhare side profile aur video motion pe: ${videoMotionHinglish} Agar chin ko halka sa aage aur tongue ko roof of mouth pe rakhne ki aadat daaloge, to side profile 10 din mein sharper dikhega.`;

  // SECTION 3: Seedha Action Plan
  const hairRec = recommendations.find(r => r.category === 'hair');
  const beardRec = recommendations.find(r => r.category === 'grooming');

  const hairActionHinglish = hairRec
    ? `Haircut ke liye: Salon jaake bolo sides pe #1.5 ya #2 mid-taper fade kare, aur upar thoda natural texture rakhe. Sides flat hone se face lamba aur athletic dikhega.`
    : `Haircut ke liye: Sides pe mid-taper fade aur top pe texture crop best rahega.`;

  const beardActionHinglish = beardRec
    ? `Daadhi ke liye: Sabse zaroori rule hai neckline! Adam's apple se theek do ungli upar beard trim karo. Gale pe daadhi mat chhodna, warna double chin lagegi.`
    : `Daadhi ke liye: Neckline ko Adam's apple se do ungli upar clean rakho taaki jawline instantly square dikhe.`;

  const bloatActionHinglish = `Face bloat ke liye: Raat ko namkeen, late-night chai aur sodium kam karo. Roz subah ek bowl thande barf wale paani mein 10 second face dip karo — sara puffy face 5 minute mein gayab ho jayega.`;

  const sec3Text = `Ab suno tumhara 3-step action plan: Pehla — ${hairActionHinglish} Doosra — ${beardActionHinglish} Aur teesra sabse important — ${bloatActionHinglish} Ye teen cheezein follow karo, bina kisi mehenge treatment ke jawline aur look 100% elevate ho jayega.`;

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
    ? `Your bilateral symmetry is exceptionally high at ${metrics.symmetryPercentage} percent, which provides a strong, well-balanced foundation.`
    : `Your bilateral symmetry measures ${metrics.symmetryPercentage} percent, displaying natural human masculine variation.`;

  const mandibleText = metrics.jawToCheekRatio >= 0.76
    ? `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}, indicating a powerful, wide mandibular bone structure.`
    : `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}, displaying a tapered athletic jawline contour.`;

  const sec1Text = `Greetings. This is Agent Marcus, your biometric aesthetic consultant. Let's examine your facial architecture. Your measurements reveal a ${metrics.faceShape} bone structure with ${metrics.structuralProfile}. ${symmetryText} Looking at your vertical balance, your thirds are divided into ${metrics.upperThird} percent for the upper forehead, ${metrics.middleThird} percent for the midface, and ${metrics.lowerThird} percent for the lower jaw. ${mandibleText}`;

  // SECTION 2: Profile & Continuous 360 Video Rotation
  const profileMetrics = compositeScan?.profile.metrics || metrics;
  const nla = profileMetrics.nasolabialAngle || 94;
  const nlaStatus = profileMetrics.nasolabialStatus || 'Optimal';
  const eLineDist = profileMetrics.eLineUpperLipDist ?? 2.0;
  const eLineStatus = profileMetrics.eLineStatus || 'Balanced Profile';

  let motionText = '';
  if (videoData?.videoReport) {
    const vr = videoData.videoReport;
    motionText = ` In your continuous 5-second video rotation, I examined your motion across every degree. Your rotational symmetry between left and right sweeps scored ${vr.rotationalSymmetryPercentage} percent, with a dynamic jawline definition score of ${vr.dynamicJawlineDefinitionScore} out of 100, showing strong soft-tissue contour retention.`;
  }

  const sec2Text = `Now, analyzing your head rotation and lateral profile: Your nasolabial angle measures ${nla} degrees, which is clinically ${nlaStatus} for masculine facial norms. Along Ricketts' esthetic line, your upper lip distance is ${eLineDist} millimeters, which reflects a ${eLineStatus} with strong chin projection.${motionText}`;

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
    const voices = window.speechSynthesis.getVoices();

    if (briefing.language === 'hinglish') {
      utterance.rate = 0.95; // Slightly measured cadence for clear Hinglish enunciation
      utterance.pitch = 0.95;
      utterance.lang = 'en-IN';

      // Look for Indian English or Hindi voices available on Mac / Chrome / Android / Windows
      const indianVoice = voices.find(v => 
        v.lang === 'en-IN' || 
        v.lang === 'hi-IN' || 
        v.name.toLowerCase().includes('india') || 
        v.name.toLowerCase().includes('rishi') || 
        v.name.toLowerCase().includes('lekha') ||
        v.name.toLowerCase().includes('veena') ||
        v.name.toLowerCase().includes('neerja')
      );

      if (indianVoice) {
        utterance.voice = indianVoice;
        utterance.lang = indianVoice.lang;
      }
    } else {
      utterance.rate = 1.0;
      utterance.pitch = 0.95; // Deep masculine consultant tone
      utterance.lang = 'en-US';

      // Prefer high quality English voices if available
      const preferredVoice = voices.find(v => 
        (v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Guy') || v.name.includes('David') || v.name.includes('Natural')) &&
        v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
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
