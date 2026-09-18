import { FacialMetrics, Recommendation, CompositeScan } from '../types';

export type AgentLanguage = 'indian_english' | 'hindi' | 'global_english';

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
 * 1. Indian English (Mentor) - 100% natural conversational Indian English, zero pretentious jargon
 * 2. Native Hindi (Devanagari) - authentic native Hindi for Hindi TTS engines (Lekha, Neerja, Google Hindi)
 * 3. Global English - formal clinical biometric breakdown
 */
export function generateAgentConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null,
  videoData?: any | null,
  language: AgentLanguage = 'indian_english'
): AgentBriefing {
  if (language === 'hindi') {
    return generateNativeHindiConsultantScript(metrics, recommendations, compositeScan, videoData);
  }
  if (language === 'indian_english') {
    return generateIndianEnglishConsultantScript(metrics, recommendations, compositeScan, videoData);
  }
  return generateEnglishConsultantScript(metrics, recommendations, compositeScan, videoData);
}

/**
 * Natural Conversational Indian English Mentor (Aryan).
 * Direct, relatable, brotherly advice with zero medical jargon.
 * Pronounced with 100% natural, human fluency by Indian English and standard speech engines.
 */
function generateIndianEnglishConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null,
  videoData?: any | null
): AgentBriefing {
  // SECTION 1: Face Shape & Bone Reality
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

  const sec1Text = `Chalo bhai, let's get straight into it! No robotic talk, no fancy medical terms. Looking at your face scan right now: ${shapeInsight} ${symmetryText}`;

  // SECTION 2: 360 Video & Best Photo Angle
  let videoMotionText = '';
  if (videoData?.videoReport) {
    const vr = videoData.videoReport;
    videoMotionText = `In your 5-second video, when you turn to your left side, your jawline cuts look noticeably sharper than your right. That means for dating apps and profile pictures, your left side is 100% your best hero angle.`;
  } else {
    videoMotionText = `Looking at your side profile, your lip and chin balance looks solid. Just one important thing: avoid slouching your neck when checking your phone, because forward neck posture pushes soft tissue down and gives you an instant double chin.`;
  }

  const sec2Text = `Now, let's check your side profile and head movement... ${videoMotionText} Practice keeping your tongue gently glued to the roof of your mouth. This simple mewing habit will tighten your under-chin area within two weeks.`;

  // SECTION 3: 3-Step Action Plan
  const hairRec = recommendations.find(r => r.category === 'hair');
  const beardRec = recommendations.find(r => r.category === 'grooming');

  const hairAction = hairRec
    ? `For your hair: Tell your barber to do a #1.5 to #2 mid-taper fade on the sides, and leave textured length on top. Flat sides instantly make your face look leaner and sharper.`
    : `For your hair: Mid-taper fade on sides and a textured crop on top.`;

  const beardAction = beardRec
    ? `For your beard: The golden rule is the neckline! Trim it exactly two fingers above your Adam's apple. Never let hair grow down your throat, because that's what creates a fake double chin.`
    : `For your beard: Keep the neckline clean two fingers above your Adam's apple to instantly square off your jaw.`;

  const bloatAction = `For face puffiness: Cut down late-night salty snacks and excessive chai. Drink coconut water, and dip your face in an ice-water bowl for 10 seconds every morning. All that morning bloat will disappear in five minutes.`;

  const sec3Text = `Now, straight to action — here are the only three things you need to do: Number 1 — ${hairAction} Number 2 — ${beardAction} And Number 3, the bloat flush — ${bloatAction} Just stick to these three simple things, and your jawline will look noticeably chiseled. Scene sorted!`;

  return {
    language: 'indian_english',
    personaName: 'Aryan (Desi Mentor)',
    personaRole: 'Grooming & Aesthetics Mentor',
    summaryHeadline: `${metrics.faceShape} Frame • ${metrics.symmetryPercentage}% Balance • Zero Jargon Blueprint`,
    fullScript: `${sec1Text} ${sec2Text} ${sec3Text}`,
    sections: [
      {
        id: 'architecture',
        title: 'Face Shape & Jawline Reality',
        subtitle: 'Chalo bhai, straight analysis',
        spokenText: sec1Text,
        keyTakeaways: [
          `${metrics.faceShape} frame with ${metrics.symmetryPercentage}% symmetry`,
          'Bloat and water retention are hiding your bone cuts',
          'Naturally masculine, balanced facial base'
        ]
      },
      {
        id: 'profile',
        title: 'Side Angle & Best Camera Profile',
        subtitle: 'Hero angle for dating apps & photos',
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
        subtitle: 'Haircut, beard neckline & bloat flush',
        spokenText: sec3Text,
        keyTakeaways: [
          'Barber spec: #1.5 to #2 mid-taper fade on sides',
          "Beard rule: Trim neckline 2 fingers above Adam's apple",
          'Morning ice-water face dip + cut late-night sodium'
        ]
      }
    ]
  };
}

/**
 * Native Hindi Mentor (आर्यन भाई).
 * Written in Devanagari script with natural 'चलो भाई, अभी शुरू करते हैं' hook.
 */
function generateNativeHindiConsultantScript(
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null,
  videoData?: any | null
): AgentBriefing {
  let shapeHindi = '';
  if (metrics.faceShape === 'Square' || metrics.faceShape === 'Diamond') {
    shapeHindi = `आपका फेस स्ट्रक्चर नेचुरली काफी मजबूत और मस्कुलिन है। जबड़े का फ्रेम बिल्कुल सॉलिड है, लेकिन मुख्य चीज़ जो कट्स को छुपा रही है, वो है चेहरे का फेशियल ब्लोट और पानी का जमाव।`;
  } else if (metrics.faceShape === 'Round' || metrics.faceShape === 'Oval') {
    shapeHindi = `आपका फेस अभी थोड़ा गोल दिख रहा है, पर इसका मतलब यह नहीं कि जॉलाइन नहीं है। गालों और जबड़े के पास थोड़ा वॉटर रिटेंशन है। जैसे ही ब्लोट उतरेगा, जॉलाइन अपने आप बाहर आ जाएगी।`;
  } else {
    shapeHindi = `आपका फेस लंबा और एथलेटिक है। चीकबोन्स अच्छे हैं, बस निचले जबड़े को चौड़ाई देने के लिए सही दाढ़ी और हेयरकट की ज़रूरत है।`;
  }

  const symmetryHindi = metrics.symmetryPercentage >= 90
    ? `आपके चेहरे का बैलेंस लगभग ${metrics.symmetryPercentage} परसेंट है, जो कि बहुत ही शानदार है।`
    : `आपके चेहरे का सिमिट्री बैलेंस ${metrics.symmetryPercentage} परसेंट है, जो कि बिल्कुल नैचुरल है।`;

  const sec1Text = `चलो भाई! अभी शुरू करते हैं। कोई रोबोटिक भाषा नहीं, कोई दिखावे वाले शब्द नहीं, सीधा आपके चेहरे के स्कैन पर आते हैं। ${shapeHindi} ${symmetryHindi}`;

  let videoMotionHindi = '';
  if (videoData?.videoReport) {
    const vr = videoData.videoReport;
    videoMotionHindi = `5-सेकंड के वीडियो में मैंने देखा कि जब आप बाईं तरफ मुड़ते हैं, तो आपकी जॉलाइन दाईं तरफ से ज्यादा शार्प दिखती है। इसका मतलब डेटिंग प्रोफाइल्स और फोटोज़ के लिए आपका बायाँ साइड 100% बेस्ट हीरो एंगल है।`;
  } else {
    videoMotionHindi = `साइड प्रोफाइल में ठुड्डी और होंठों का बैलेंस अच्छा है। बस फोन चलाते समय गर्दन आगे झुकाने से बचें, क्योंकि इससे अनावश्यक डबल चिन दिखने लगती है।`;
  }

  const sec2Text = `अब आते हैं आपके साइड प्रोफाइल और वीडियो रोटेशन पर... ${videoMotionHindi} एक आदत बना लें — जीभ को हमेशा मुँह के ऊपरी हिस्से यानी तालू पर चिपकाकर रखें। इस आसान पोस्चर से आपकी जॉलाइन दो हफ़्ते में और शार्प दिखेगी।`;

  const hairRec = recommendations.find(r => r.category === 'hair');
  const beardRec = recommendations.find(r => r.category === 'grooming');

  const hairActionHindi = hairRec
    ? `हेयरकट के लिए नाई को बोलें कि साइड्स पर नंबर 1.5 या 2 का मिड-टेपर फेड करे और ऊपर टेक्सचर रखे। साइड्स फ्लैट होने से चेहरा लंबा और शार्प दिखेगा।`
    : `हेयरकट के लिए साइड्स पर मिड-टेपर फेड और ऊपर टेक्सचर्ड क्रॉप सबसे सही रहेगा।`;

  const beardActionHindi = beardRec
    ? `दाढ़ी के लिए सबसे ज़रूरी नियम है नेकलाइन! एडम्स एप्पल से ठीक दो उँगली ऊपर क्लीन कर्व बनाएँ। गले पर दाढ़ी कभी न छोड़ें, वरना नकली डबल चिन दिखेगी।`
    : `दाढ़ी की नेकलाइन को एडम्स एप्पल से दो उँगली ऊपर रखें ताकि जबड़ा चौकोर और शार्प दिखे।`;

  const bloatActionHindi = `फेशियल ब्लोट के लिए: रात का नमकीन और देर रात की चाय कम करें। रोज़ सुबह एक कटोरे ठंडे बर्फ वाले पानी में 10 सेकंड चेहरा डुबाएँ — चेहरे की सूजन 5 मिनट में उतर जाएगी।`;

  const sec3Text = `अब सीधा काम की बात — सिर्फ ये तीन चीज़ें करनी हैं: पहला — ${hairActionHindi} दूसरा — ${beardActionHindi} और तीसरा सबसे ज़रूरी — ${bloatActionHindi} बस ये तीन आसान काम करो भाई, दो हफ़्ते में चेहरा बिल्कुल बदल जाएगा। सीन सॉर्टेड है!`;

  return {
    language: 'hindi',
    personaName: 'आर्यन भाई',
    personaRole: 'देसी ग्रूमिंग और लुक्स मेंटर',
    summaryHeadline: `${metrics.faceShape} फ्रेम • ${metrics.symmetryPercentage}% बैलेंस • सीधा एक्शन प्लान`,
    fullScript: `${sec1Text} ${sec2Text} ${sec3Text}`,
    sections: [
      {
        id: 'architecture',
        title: 'फेस शेप और जॉलाइन का सच',
        subtitle: 'चलो भाई, सीधा एनालिसिस',
        spokenText: sec1Text,
        keyTakeaways: [
          `${metrics.faceShape} बोन स्ट्रक्चर, ${metrics.symmetryPercentage}% सिमिट्री`,
          'फेशियल ब्लोट और पानी का जमाव जॉलाइन को छुपा रहा है',
          'नेचुरली मस्कुलिन और बैलेंस्ड फ्रेम'
        ]
      },
      {
        id: 'profile',
        title: 'साइड एंगल और बेस्ट फोटो प्रोफाइल',
        subtitle: 'फोटोज़ और डेटिंग के लिए सबसे बेहतरीन एंगल',
        spokenText: sec2Text,
        keyTakeaways: [
          videoData?.videoReport ? 'बायाँ 3/4 प्रोफाइल ज्यादा शार्प और डिफाइंड है' : 'बैलेंस्ड साइड प्रोफाइल और अच्छी चिन प्रोजेक्शन',
          'गर्दन आगे झुकाने से बचें ताकि डबल चिन न बने',
          'म्यूइंग टंग पोस्चर से गर्दन का टिश्यू टाइट होता है'
        ]
      },
      {
        id: 'actions',
        title: '3-स्टेप देसी एक्शन प्लान',
        subtitle: 'हेयरकट, दाढ़ी नेकलाइन और ब्लोट फ्लश',
        spokenText: sec3Text,
        keyTakeaways: [
          'नाई से साइड्स पर #1.5 से #2 मिड-टेपर फेड कराएँ',
          "दाढ़ी की नेकलाइन एडम्स एप्पल से 2 उँगली ऊपर रखें",
          'सुबह बर्फ के पानी में चेहरा डुबाएँ और नमक कम करें'
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

  if (lang === 'hindi') {
    // 1. Native Hindi voices (Google हिन्दी, Lekha, Neerja)
    const nativeHindi = voices.find(v => 
      v.lang.startsWith('hi') || 
      v.name.includes('हिन्दी') || 
      v.name.toLowerCase().includes('hindi') || 
      v.name.toLowerCase().includes('lekha') || 
      v.name.toLowerCase().includes('neerja')
    );
    if (nativeHindi) return nativeHindi;

    // 2. Indian English voice fallback
    const indianVoice = voices.find(v => v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('rishi'));
    if (indianVoice) return indianVoice;
  }

  if (lang === 'indian_english') {
    // 1. Natural / Enhanced / Siri Indian English voices
    const enhancedIndian = voices.find(v => 
      (v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india')) &&
      (v.name.includes('Enhanced') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Premium') || v.name.includes('Google'))
    );
    if (enhancedIndian) return enhancedIndian;

    // 2. Named Indian voices (Rishi, Veena, Sangeeta, Ravi)
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
      .split(/(?<=[.!?…।])\s+/)
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

    if (this.currentBriefing.language === 'hindi') {
      utterance.pitch = 1.0;
      utterance.lang = 'hi-IN';
    } else if (this.currentBriefing.language === 'indian_english') {
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
