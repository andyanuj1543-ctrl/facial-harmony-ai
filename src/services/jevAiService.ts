import { FacialMetrics } from '../types';

export interface JevAIDecisionResult {
  isLive: boolean;
  priorityFocus: 'jawline_sculpting' | 'hair_volume' | 'midface_balance' | 'cervical_posture';
  confidenceScore: number; // 1 to 10
  needsVerticalElongation: boolean;
  elongationProbability: number; // 0.0 to 1.0
  rawResponse?: any;
  error?: string;
}

const JEV_API_URL = 'https://thejevai.com/v1/systemone';
const DEFAULT_MODEL = 'typesafe/jev-1.13';

/**
 * Executes a fast System One decision analysis using Jev AI.
 * Falls back seamlessly to calibrated anthropometric logic if Jev AI is unreachable or unauthorized.
 */
export async function queryJevAIDecisions(
  metrics: FacialMetrics,
  customApiKey?: string
): Promise<JevAIDecisionResult> {
  const apiKey = (customApiKey || import.meta.env.VITE_JEV_API_KEY || '').trim();

  // Create a structured representation of the facial state for Jev AI
  const stateSummary = `Masculine Facial Anthropometrics:
- Face Shape: ${metrics.faceShape}
- Upper Third: ${metrics.upperThird}%
- Middle Third: ${metrics.middleThird}%
- Lower Third: ${metrics.lowerThird}%
- Jaw-to-Cheek Ratio: ${metrics.jawToCheekRatio}
- Bilateral Symmetry: ${metrics.symmetryPercentage}%
- Canthal Tilt: ${metrics.canthalTiltAngle}° (${metrics.canthalTiltType})
- Chin Prominence: ${metrics.chinProminence}
- Profile: ${metrics.structuralProfile}`;

  if (!apiKey) {
    return computeFallbackDecision(metrics, 'JEV_API_KEY not configured.');
  }

  try {
    const payload = {
      model: DEFAULT_MODEL,
      state: stateSummary,
      questions: {
        priority_focus: {
          type: 'choice',
          instructions: 'What is the primary aesthetic and structural focus area for this facial structure?',
          options: ['jawline_sculpting', 'hair_volume', 'midface_balance', 'cervical_posture']
        },
        calibration_score: {
          type: 'score',
          instructions: 'Rate the overall baseline structural masculine harmony on a scale of 1 to 10.',
          scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        elongation_needed: {
          type: 'noul',
          instructions: 'Does this face require hairstyle or beard techniques for vertical elongation?'
        }
      }
    };

    const response = await fetch(JEV_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.message || errText;
      } catch (_) {}
      return computeFallbackDecision(metrics, `Jev AI API HTTP ${response.status}: ${parsedErr}`);
    }

    const data = await response.json();

    // Parse Jev AI structured decision outputs
    const priorityFocus = data.answers?.priority_focus?.choice || 
                          data.answers?.priority_focus?.answer || 
                          getFallbackPriority(metrics);

    const confidenceScore = Number(data.answers?.calibration_score?.score || 
                                   data.answers?.calibration_score?.answer || 
                                   Math.round(metrics.symmetryPercentage / 10));

    const elongationProb = Number(data.answers?.elongation_needed?.probability ?? 
                                  data.answers?.elongation_needed?.noul ?? 
                                  (metrics.lowerThird < 31 || metrics.faceShape === 'Round' ? 0.85 : 0.25));

    return {
      isLive: true,
      priorityFocus,
      confidenceScore: Math.min(10, Math.max(1, confidenceScore)),
      needsVerticalElongation: elongationProb >= 0.5,
      elongationProbability: elongationProb,
      rawResponse: data
    };
  } catch (err: any) {
    return computeFallbackDecision(metrics, err?.message || 'Network error while contacting Jev AI.');
  }
}

function getFallbackPriority(
  metrics: FacialMetrics
): 'jawline_sculpting' | 'hair_volume' | 'midface_balance' | 'cervical_posture' {
  if (metrics.chinProminence === 'recessed' || metrics.lowerThird < 31) {
    return 'cervical_posture';
  }
  if (metrics.upperThird > 35 || metrics.faceShape === 'Round') {
    return 'hair_volume';
  }
  if (metrics.middleThird > 36) {
    return 'midface_balance';
  }
  return 'jawline_sculpting';
}

function computeFallbackDecision(metrics: FacialMetrics, errorReason: string): JevAIDecisionResult {
  const priorityFocus = getFallbackPriority(metrics);
  const needsVerticalElongation = metrics.lowerThird < 31 || metrics.faceShape === 'Round';
  const confidenceScore = Math.min(10, Math.max(7, Math.round(metrics.symmetryPercentage / 10)));

  return {
    isLive: false,
    priorityFocus,
    confidenceScore,
    needsVerticalElongation,
    elongationProbability: needsVerticalElongation ? 0.88 : 0.18,
    error: errorReason
  };
}
