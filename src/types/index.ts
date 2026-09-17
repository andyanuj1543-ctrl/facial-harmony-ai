export interface Point2D {
  x: number;
  y: number;
  z?: number;
}

export type Gender = 'male' | 'female';
export type ViewMode = 'front' | 'profile';

export interface FacialMetrics {
  gender: Gender;
  viewMode: ViewMode;

  // Frontal Proportions
  upperThird: number;         // Hairline to Glabella %
  middleThird: number;        // Glabella to Subnasale %
  lowerThird: number;         // Subnasale to Menton %
  lowerThirdSubRatio: number; // Subnasale-Stomion vs Stomion-Menton
  
  // Horizontal Proportions
  fifthsRatio: number[];      // 5 segment ratios
  intercanthalRatio: number;  // Eye width to space between eyes (~1.0)
  
  // Structure & Angles
  symmetryStatus: 'High Symmetry' | 'Balanced Symmetry' | 'Natural Variation';
  symmetryPercentage: number; // Raw geometric match %
  canthalTiltAngle: number;   // In degrees
  canthalTiltType: 'positive' | 'neutral' | 'negative';
  fwhr: number;               // Facial Width to Height Ratio
  jawToCheekRatio: number;    // Bigonial width / Bizygomatic width
  chinProminence: 'balanced' | 'recessed' | 'prominent';
  
  // Profile Metrics (Side View)
  nasolabialAngle?: number;   // Angle under nose tip
  nasolabialStatus?: 'Optimal' | 'Acute' | 'Obtuse';
  eLineUpperLipDist?: number; // Distance in relative units to Ricketts E-line
  eLineLowerLipDist?: number;
  eLineStatus?: 'Balanced Profile' | 'Protrusive Lips' | 'Retrusive Profile';
  
  // Classification (Pure Diagnostic, Zero Arbitrary Scores)
  faceShape: 'Oval' | 'Square' | 'Round' | 'Oblong' | 'Diamond' | 'Heart';
  structuralProfile: string;  // e.g. "Balanced Oval Architecture"
}

export interface Recommendation {
  id: string;
  category: 'hair' | 'grooming' | 'eyewear' | 'lifestyle';
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
  showELine: boolean;
  showProfileAngles: boolean;
}
