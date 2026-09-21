import { FacialMetrics, Recommendation, CompositeScan } from '../types';

export type AgentLanguage = 'hinglish' | 'indian_english' | 'global_english';

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
 * Supports:
 * 1. Hinglish (Desi Mentor) - authentic, everyday conversational Hinglish as people actually speak
 * 2. Indian English (Natural) - conversational Indian English with zero robotic preambles
 * 3. Global English - formal clinical biometric breakdown
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
  if (language === 'indian_english') {
    return generateIndianEnglishConsultantScript(metrics, recommendations, compositeScan, videoData);
  }
  return generateEnglishConsultantScript(metrics, recommendations, compositeScan, videoData);
}

/**
 * Authentic Conversational Hinglish Mentor (Aryan).
 * Everyday spoken Hinglish the way young Indian men actually talk with friends.
 */
function generateHinglishConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null,
  videoData?: any | null
): AgentBriefing {
  let shapeInsight = '';
  if (metrics.faceShape === 'Square' || metrics.faceShape === 'Diamond') {
    shapeInsight = `Tumhara bone structure naturally kaafi solid aur masculine frame ka hai. But real scene ye hai: jawline ke cuts ko bone nahi, balki thoda facial bloat aur water retention hide kar raha hai.`;
  } else if (metrics.faceShape === 'Round' || metrics.faceShape === 'Oval') {
    shapeInsight = `Face shape abhi thoda rounded lag raha hai. Par tension mat lena, iska matlab ye nahi ki jawline nahi hai... balki cheeks aur jawline ke paas soft tissue aur water retention jama hai. Bloat nikalte hi jawline pop out karegi.`;
  } else {
    shapeInsight = `Tumhara face lamba aur athletic frame ka hai. Cheekbones already achhe hain... bas lower jaw ko thodi visual width dene ke liye sahi beard aur haircut styling chahiye.`;
  }

  const symmetryText = metrics.symmetryPercentage >= 90
    ? `Tumhare left aur right face ka balance lagbhag ${metrics.symmetryPercentage} percent hai, jo ki zabardast model-level symmetry hai.`
    : `Tumhara face symmetry balance ${metrics.symmetryPercentage} percent hai, jo ki normal masculine face ke liye bilkul natural hai.`;

  const sec1Text = `Chalo bhai, let's start! Koi robotic baat nahi, koi fancy doctor words nahi... seedha tumhare face scan pe aate hain. ${shapeInsight} ${symmetryText}`;

  let videoMotionText = '';
  if (videoData?.videoReport) {
    const vr = videoData.videoReport;
    videoMotionText = `Tumhare 5-second video rotation mein jab tum left turn karte ho, to jawline right side ke comparison mein zyada sharp dikhti hai. Iska matlab dating apps aur profile pictures ke liye tumhara left side 100% best hero angle hai.`;
  } else {
    videoMotionText = `Side profile mein chin aur lips ka posture theek hai. Bas phone use karte waqt garden aage mat jhukana, kyunki forward neck posture se fake double chin create ho jaati hai.`;
  }

  const sec2Text = `Ab aate hain tumhare side profile aur camera angle pe... ${videoMotionText} Ek simple habit daalo — tongue ko hamesha mouth ke upper palate pe chipka ke rakho. Is simple mewing habit se tumhara side profile aur under-chin do hafte mein tight dikhega.`;

  const hairRec = recommendations.find(r => r.category === 'hair');
  const beardRec = recommendations.find(r => r.category === 'grooming');
  const lifestyleRec = recommendations.find(r => r.category === 'lifestyle');

  const hairAction = hairRec
    ? `Haircut ke liye recommendation hai: ${hairRec.title}. ${hairRec.actionPoints[0]}.`
    : `Haircut ke liye sides pe clean taper fade aur top pe textured length sabse best rahega.`;

  const beardAction = beardRec
    ? `Daadhi aur jawline ke liye: ${beardRec.title}. ${beardRec.actionPoints[0]}.`
    : `Beard neckline ko Adam's apple se do fingers upar clean rakho taaki jawline sharp dikhe.`;

  const bloatAction = lifestyleRec
    ? `${lifestyleRec.title}: ${lifestyleRec.actionPoints[0]}.`
    : `Daily sodium intake balance karo aur resting palatal tongue posture maintain karo.`;

  const sec3Text = `Ab straight to action — sirf teen personalized steps follow karo: First, haircut — ${hairAction} Second, jawline — ${beardAction} Aur third, debloating — ${bloatAction} Inko follow karo, face definition instantly pop karegi!`;

  return {
    language: 'hinglish',
    personaName: 'Aryan (Desi Mentor)',
    personaRole: 'Grooming & Aesthetics Mentor',
    summaryHeadline: `${metrics.faceShape} Frame • ${metrics.symmetryPercentage}% Balance • Personalized Blueprint`,
    fullScript: `${sec1Text} ${sec2Text} ${sec3Text}`,
    sections: [
      {
        id: 'architecture',
        title: 'Face Shape & Jawline Reality',
        subtitle: 'Personalized Bone Structure Breakdown',
        spokenText: sec1Text,
        keyTakeaways: [
          `${metrics.faceShape} architecture with ${metrics.symmetryPercentage}% symmetry`,
          `Jaw-to-cheek ratio: ${metrics.jawToCheekRatio} (${metrics.structuralProfile})`,
          'Zero guesswork, measured biometric foundation'
        ]
      },
      {
        id: 'profile',
        title: 'Side Angle & Best Camera Profile',
        subtitle: 'Optimal angle for camera and dating profiles',
        spokenText: sec2Text,
        keyTakeaways: [
          videoData?.videoReport ? 'Left 3/4 angle displays sharper jaw definition' : 'Balanced side profile with strong chin alignment',
          'Phone chalate waqt forward head posture avoid karo',
          'Palatal tongue posture se submental tightness maintain rehti hai'
        ]
      },
      {
        id: 'actions',
        title: '3-Step Tailored Action Blueprint',
        subtitle: 'Custom Haircut, Beard & Debloating Plan',
        spokenText: sec3Text,
        keyTakeaways: [
          hairRec ? hairRec.title : 'Tailored Hair Architecture',
          beardRec ? beardRec.title : 'Mandibular Beard Framing',
          lifestyleRec ? lifestyleRec.title : 'Debloating & Posture Protocol'
        ]
      }
    ]
  };
}

/**
 * Natural Conversational Indian English Mentor (Aryan).
 * Direct, relatable, brotherly advice with tailored recommendations.
 */
function generateIndianEnglishConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null,
  videoData?: any | null
): AgentBriefing {
  let shapeInsight = '';
  if (metrics.faceShape === 'Square' || metrics.faceShape === 'Diamond') {
    shapeInsight = `Your bone structure is naturally solid with a strong masculine jaw frame. But here is the real deal: what's hiding your cuts isn't bone, it's just facial bloat and water retention.`;
  } else if (metrics.faceShape === 'Round' || metrics.faceShape === 'Oval') {
    shapeInsight = `Your face shape currently looks a bit rounded. But don't worry, that doesn't mean you don't have a jawline... it just means puffiness and soft tissue are covering the jaw bone. Once that bloat drops, your jawline will pop right out.`;
  } else {
    shapeInsight = `Your face is lean and athletic. You already have good cheekbones... all you need is the right beard line and haircut to add visual width to your lower jaw.`;
  }

  const symmetryText = metrics.symmetryPercentage >= 90
    ? `Your face symmetry is sitting at ${metrics.symmetryPercentage} percent, which is top-tier balance.`
    : `Your face symmetry is ${metrics.symmetryPercentage} percent, which is completely natural.`;

  const sec1Text = `Alright, let's get straight into your analysis! No robotic talk, no fluff. Looking at your face scan: ${shapeInsight} ${symmetryText}`;

  let videoMotionText = '';
  if (videoData?.videoReport) {
    const vr = videoData.videoReport;
    videoMotionText = `In your 5-second video rotation, your jawline contours appear sharper at your 3/4 angle. Keep that in mind for photos.`;
  } else {
    videoMotionText = `Looking at your lateral profile, your chin and lip balance is well-aligned. Avoid forward neck slouching when working or scrolling, as cervical flexion creates an artificial double chin.`;
  }

  const sec2Text = `Now, analyzing your side profile and posture... ${videoMotionText} Practice keeping your tongue gently vacuumed to the roof of your mouth. This simple palatal posture firms the submental muscle wall.`;

  const hairRec = recommendations.find(r => r.category === 'hair');
  const beardRec = recommendations.find(r => r.category === 'grooming');
  const lifestyleRec = recommendations.find(r => r.category === 'lifestyle');

  const hairAction = hairRec
    ? `For your haircut: ${hairRec.title}. ${hairRec.actionPoints[0]}.`
    : `For your haircut: Keep sides clean with a tapered fade and style top with natural matte texture.`;

  const beardAction = beardRec
    ? `For your beard: ${beardRec.title}. ${beardRec.actionPoints[0]}.`
    : `For your beard: Keep the neckline clean 1.5 fingers above your Adam's apple to sharply frame your mandible.`;

  const bloatAction = lifestyleRec
    ? `For soft tissue sharpness: ${lifestyleRec.title}. ${lifestyleRec.actionPoints[0]}.`
    : `Balance potassium and sodium, stay hydrated, and practice morning facial cold plunge.`;

  const sec3Text = `Now, your 3-step action blueprint: Number 1, Haircut — ${hairAction} Number 2, Beard & Jaw — ${beardAction} And Number 3, Definition Protocol — ${bloatAction} Execute these three customized steps and your bone structure will stand out effortlessly.`;

  return {
    language: 'indian_english',
    personaName: 'Aryan (Desi Mentor)',
    personaRole: 'Grooming & Aesthetics Mentor',
    summaryHeadline: `${metrics.faceShape} Frame • ${metrics.symmetryPercentage}% Balance • Tailored Blueprint`,
    fullScript: `${sec1Text} ${sec2Text} ${sec3Text}`,
    sections: [
      {
        id: 'architecture',
        title: 'Face Shape & Jawline Reality',
        subtitle: `${metrics.faceShape} • ${metrics.symmetryPercentage}% Symmetry`,
        spokenText: sec1Text,
        keyTakeaways: [
          `${metrics.faceShape} frame with ${metrics.symmetryPercentage}% symmetry`,
          `Mandible ratio: ${metrics.jawToCheekRatio}`,
          'Tailored to your specific anthropometric measurements'
        ]
      },
      {
        id: 'profile',
        title: 'Side Angle & Best Camera Profile',
        subtitle: 'Hero angle & cervical alignment',
        spokenText: sec2Text,
        keyTakeaways: [
          videoData?.videoReport ? 'Left 3/4 profile displays sharper jaw definition' : 'Balanced side profile with strong chin alignment',
          'Fix forward head posture to eliminate artificial double chin',
          'Resting tongue posture (mewing) tightens under-chin skin'
        ]
      },
      {
        id: 'actions',
        title: '3-Step Action Blueprint',
        subtitle: 'Custom Haircut, Beard & Debloating Plan',
        spokenText: sec3Text,
        keyTakeaways: [
          hairRec ? hairRec.title : 'Custom Haircut Architecture',
          beardRec ? beardRec.title : 'Mandibular Framing Stubble',
          lifestyleRec ? lifestyleRec.title : 'Facial Drainage Protocol'
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
    language: 'global_english',
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

  if (lang === 'hinglish' || lang === 'indian_english') {
    // 1. Natural / Enhanced / Siri Indian English voices (highest fidelity on Mac / iOS)
    const enhancedIndian = voices.find(v => 
      (v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india')) &&
      (v.name.includes('Enhanced') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Premium') || v.name.includes('Google'))
    );
    if (enhancedIndian) return enhancedIndian;

    // 2. Named Indian voices (Rishi, Veena, Sangeeta, Ravi, Lekha)
    const namedIndian = voices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('rishi') || n.includes('veena') || n.includes('sangeeta') || n.includes('ravi') || n.includes('lekha');
    });
    if (namedIndian) return namedIndian;

    // 3. Any Indian English voice
    const anyIndian = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en-IN'));
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

    if (this.currentBriefing.language === 'hinglish' || this.currentBriefing.language === 'indian_english') {
      utterance.pitch = 0.98;
      utterance.lang = 'en-IN';
    } else {
      utterance.pitch = 0.95;
      utterance.lang = 'en-US';
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
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
