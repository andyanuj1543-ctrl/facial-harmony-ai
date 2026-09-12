import { Point2D, FacialMetrics } from '../types';

export function dist(p1: Point2D, p2: Point2D): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function angleDegrees(p1: Point2D, p2: Point2D): number {
  // Angle from horizontal in degrees
  const dy = p2.y - p1.y;
  const dx = p2.x - p1.x;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export function computeFacialMetrics(landmarks: Point2D[], imageWidth: number, imageHeight: number): FacialMetrics {
  // Convert normalized landmarks to absolute pixel coordinates
  const pts = landmarks.map(p => ({
    x: p.x * imageWidth,
    y: p.y * imageHeight,
    z: p.z
  }));

  // Key Landmarks:
  // 10: Forehead top / trichion approximation
  // 9 / 168: Glabella (between eyebrows)
  // 2: Subnasale (base of nose)
  // 13 / 14: Stomion (mouth opening / lip junction)
  // 152: Menton (bottom of chin)
  const foreheadTop = pts[10];
  const glabella = pts[168] || pts[9];
  const subnasale = pts[2];
  const stomion = {
    x: (pts[13].x + pts[14].x) / 2,
    y: (pts[13].y + pts[14].y) / 2
  };
  const menton = pts[152];

  // 1. VERTICAL THIRDS
  const upperH = Math.abs(glabella.y - foreheadTop.y);
  const midH = Math.abs(subnasale.y - glabella.y);
  const lowerH = Math.abs(menton.y - subnasale.y);
  const totalH = upperH + midH + lowerH || 1;

  const upperThird = Math.round((upperH / totalH) * 100);
  const middleThird = Math.round((midH / totalH) * 100);
  const lowerThird = Math.round((lowerH / totalH) * 100);

  // Sub-ratio of lower third (ideal is 1:2 = 0.5)
  const noseToMouth = Math.abs(stomion.y - subnasale.y);
  const mouthToChin = Math.abs(menton.y - stomion.y) || 1;
  const lowerThirdSubRatio = Number((noseToMouth / mouthToChin).toFixed(2));

  // 2. HORIZONTAL & EYES
  // 33: right outer canthus, 133: right inner canthus
  // 362: left inner canthus, 263: left outer canthus
  const rOuter = pts[33];
  const rInner = pts[133];
  const lInner = pts[362];
  const lOuter = pts[263];

  const rEyeWidth = dist(rOuter, rInner);
  const lEyeWidth = dist(lInner, lOuter);
  const avgEyeWidth = (rEyeWidth + lEyeWidth) / 2 || 1;
  const intercanthalDist = dist(rInner, lInner);
  const intercanthalRatio = Number((intercanthalDist / avgEyeWidth).toFixed(2));

  // Fifths
  const faceLeftEdge = pts[234];
  const faceRightEdge = pts[454];
  const seg1 = Math.abs(rOuter.x - faceLeftEdge.x);
  const seg2 = rEyeWidth;
  const seg3 = intercanthalDist;
  const seg4 = lEyeWidth;
  const seg5 = Math.abs(faceRightEdge.x - lOuter.x);
  const totalFifths = seg1 + seg2 + seg3 + seg4 + seg5 || 1;
  const fifthsRatio = [
    Math.round((seg1 / totalFifths) * 100),
    Math.round((seg2 / totalFifths) * 100),
    Math.round((seg3 / totalFifths) * 100),
    Math.round((seg4 / totalFifths) * 100),
    Math.round((seg5 / totalFifths) * 100),
  ];

  // 3. CANTHAL TILT
  // Right eye angle (outer to inner)
  // In image coordinates, y increases downward.
  // A positive canthal tilt means outer eye corner is higher (smaller y) than inner corner.
  const rTilt = (rInner.y - rOuter.y) / (rInner.x - rOuter.x);
  const lTilt = (lInner.y - lOuter.y) / (lOuter.x - lInner.x);
  const avgTiltSlope = (rTilt + lTilt) / 2;
  const tiltDegrees = Number((Math.atan(avgTiltSlope) * (180 / Math.PI)).toFixed(1));
  
  let canthalTiltType: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (tiltDegrees > 1.5) canthalTiltType = 'positive';
  else if (tiltDegrees < -1.5) canthalTiltType = 'negative';

  // 4. JAW & CHEEKBONES
  // 234: right zygion, 454: left zygion (Cheekbones)
  // 172: right gonion, 397: left gonion (Jaw corners)
  const bizygomaticWidth = dist(pts[234], pts[454]) || 1;
  const bigonialWidth = dist(pts[172], pts[397]) || dist(pts[132], pts[361]) || 1;
  const jawToCheekRatio = Number((bigonialWidth / bizygomaticWidth).toFixed(2));

  // Facial Width to Height Ratio (fWHR) = Cheekbone width / midface height (glabella to upper lip)
  const midfaceH = Math.abs(stomion.y - glabella.y) || 1;
  const fwhr = Number((bizygomaticWidth / midfaceH).toFixed(2));

  // Chin prominence
  let chinProminence: 'balanced' | 'recessed' | 'prominent' = 'balanced';
  if (lowerThird < 30) chinProminence = 'recessed';
  else if (lowerThird > 36) chinProminence = 'prominent';

  // 5. BILATERAL SYMMETRY SCORE
  // Calculate symmetry across midline (glabella, subnasale, menton)
  const midX = (glabella.x + subnasale.x + menton.x) / 3;
  const pairedLandmarks = [
    [33, 263],   // outer eyes
    [133, 362], // inner eyes
    [70, 300],  // outer brows
    [107, 336], // inner brows
    [61, 291],  // mouth corners
    [234, 454], // cheekbones
    [172, 397], // jaw angles
  ];

  let totalDeviations = 0;
  let totalSpan = 0;

  pairedLandmarks.forEach(([rIdx, lIdx]) => {
    if (pts[rIdx] && pts[lIdx]) {
      const rDist = Math.abs(midX - pts[rIdx].x);
      const lDist = Math.abs(pts[lIdx].x - midX);
      totalDeviations += Math.abs(rDist - lDist);
      totalSpan += (rDist + lDist);
    }
  });

  const rawSymmetry = totalSpan > 0 ? (1 - totalDeviations / totalSpan) : 0.9;
  // Calibrate symmetry score to standard percentage (typically 80-98%)
  const symmetryScore = Math.min(99, Math.max(70, Math.round(rawSymmetry * 100)));

  // 6. FACE SHAPE CLASSIFICATION
  // Ratio of total face height to bizygomatic width
  const faceLengthToWidth = totalH / bizygomaticWidth;
  let faceShape: FacialMetrics['faceShape'] = 'Oval';

  if (faceLengthToWidth > 1.55) {
    faceShape = 'Oblong';
  } else if (faceLengthToWidth < 1.25 && jawToCheekRatio > 0.78) {
    faceShape = 'Square';
  } else if (faceLengthToWidth < 1.25 && jawToCheekRatio <= 0.78) {
    faceShape = 'Round';
  } else if (jawToCheekRatio > 0.82) {
    faceShape = 'Square';
  } else if (jawToCheekRatio < 0.68) {
    faceShape = 'Heart';
  } else if (bizygomaticWidth > bigonialWidth * 1.35) {
    faceShape = 'Diamond';
  } else {
    faceShape = 'Oval';
  }

  // 7. OVERALL HARMONY INDEX (0 - 100)
  // Penalties for deviations from classical ideals
  let penalty = 0;
  // Vertical Thirds ideal is 33.3 each
  penalty += Math.abs(upperThird - 33.3) * 0.8;
  penalty += Math.abs(middleThird - 33.3) * 0.8;
  penalty += Math.abs(lowerThird - 33.3) * 0.8;
  // Intercanthal ratio ideal is 1.0
  penalty += Math.abs(intercanthalRatio - 1.0) * 15;
  // Symmetry penalty
  penalty += (100 - symmetryScore) * 0.4;
  // Jaw to cheek ratio ideal ~ 0.78
  penalty += Math.abs(jawToCheekRatio - 0.78) * 20;

  const rawHarmony = Math.round(98 - penalty);
  const harmonyScore = Math.max(65, Math.min(96, rawHarmony));

  return {
    upperThird,
    middleThird,
    lowerThird,
    lowerThirdSubRatio,
    fifthsRatio,
    intercanthalRatio,
    symmetryScore,
    canthalTiltAngle: tiltDegrees,
    canthalTiltType,
    fwhr,
    jawToCheekRatio,
    chinProminence,
    faceShape,
    harmonyScore
  };
}
