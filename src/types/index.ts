export interface Point2D {
  x: number;
  y: number;
  z?: number;
}

export interface FacialMetrics {
  // Proportions
  upperThird: number;      // Hairline to Glabella %
  middleThird: number;     // Glabella to Subnasale %
  lowerThird: number;      // Subnasale to Menton %
  lowerThirdSubRatio: number; // Subnasale-Stomion vs Stomion-Menton
  
  // Horizontal
  fifthsRatio: number[];   // 5 segment ratios
  intercanthalRatio: number; // Eye width to space between eyes (ideally ~1.0)
  
  // Structure & Angles
  symmetryScore: number;   // 0 - 100%
  canthalTiltAngle: number; // in degrees (positive or negative)
  canthalTiltType: 'positive' | 'neutral' | 'negative';
  fwhr: number;            // Facial Width to Height Ratio (~1.8 - 2.0)
  jawToCheekRatio: number; // Bigonial width / Bizygomatic width (~0.75 - 0.80)
  chinProminence: 'balanced' | 'recessed' | 'prominent';
  
  // Classification
  faceShape: 'Oval' | 'Square' | 'Round' | 'Oblong' | 'Diamond' | 'Heart';
  harmonyScore: number;    // Overall 0 - 100
}

export interface Recommendation {
  id: string;
  category: 'hair' | 'beard' | 'eyewear' | 'lifestyle';
  title: string;
  subtitle: string;
  reason: string;
  actionPoints: string[];
  iconName: string;
  tag: string;
}

export interface OverlayOptions {
  showThirds: boolean;
  showFifths: boolean;
  showMidline: boolean;
  showTilt: boolean;
  showLandmarks: boolean;
  showJawline: boolean;
}
