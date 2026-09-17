import { Point2D, FacialMetrics, Gender, ViewMode } from '../types';

export function dist(p1: Point2D, p2: Point2D): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// Perpendicular signed distance from point P to line formed by L1 and L2
export function distToLine(p: Point2D, l1: Point2D, l2: Point2D): number {
  const numerator = (l2.y - l1.y) * p.x - (l2.x - l1.x) * p.y + l2.x * l1.y - l2.y * l1.x;
  const denominator = dist(l1, l2);
  return denominator === 0 ? 0 : numerator / denominator;
}

// Calculate angle between three points with vertex at p2
export function angleBetween(p1: Point2D, p2: Point2D, p3: Point2D): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 === 0 || mag2 === 0) return 90;
  const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Number(((Math.acos(cos) * 180) / Math.PI).toFixed(1));
}

export function computeFacialMetrics(
  landmarks: Point2D[],
  imageWidth: number,
  imageHeight: number,
  gender: Gender = 'male',
  viewMode: ViewMode = 'front'
): FacialMetrics {
  const pts = landmarks.map(p => ({
    x: p.x * imageWidth,
    y: p.y * imageHeight,
    z: p.z
  }));

  // Key Frontal Landmarks:
  // 10: Forehead top / trichion approximation
  // 168 / 9: Glabella (between brows)
  // 2: Subnasale (base of nose)
  // 4: Pronasale (nose tip)
  // 13: Labrale Superius (upper lip)
  // 14: Labrale Inferius (lower lip)
  // 152: Menton / Pogonion (chin tip)
  const foreheadTop = pts[10];
  const glabella = pts[168] || pts[9];
  const subnasale = pts[2];
  const noseTip = pts[4] || pts[1];
  const upperLip = pts[13];
  const lowerLip = pts[14];
  const menton = pts[152];

  // 1. VERTICAL THIRDS
  const upperH = Math.abs(glabella.y - foreheadTop.y);
  const midH = Math.abs(subnasale.y - glabella.y);
  const lowerH = Math.abs(menton.y - subnasale.y);
  const totalH = upperH + midH + lowerH || 1;

  const upperThird = Math.round((upperH / totalH) * 100);
  const middleThird = Math.round((midH / totalH) * 100);
  const lowerThird = Math.round((lowerH / totalH) * 100);

  const noseToMouth = Math.abs(upperLip.y - subnasale.y);
  const mouthToChin = Math.abs(menton.y - lowerLip.y) || 1;
  const lowerThirdSubRatio = Number((noseToMouth / mouthToChin).toFixed(2));

  // 2. HORIZONTAL & EYES
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
  const rTilt = (rInner.y - rOuter.y) / (rInner.x - rOuter.x || 1);
  const lTilt = (lInner.y - lOuter.y) / (lOuter.x - lInner.x || 1);
  const avgTiltSlope = (rTilt + lTilt) / 2;
  const tiltDegrees = Number((Math.atan(avgTiltSlope) * (180 / Math.PI)).toFixed(1));
  
  let canthalTiltType: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (tiltDegrees > 1.2) canthalTiltType = 'positive';
  else if (tiltDegrees < -1.2) canthalTiltType = 'negative';

  // 4. JAW & CHEEKBONES
  const bizygomaticWidth = dist(pts[234], pts[454]) || 1;
  const bigonialWidth = dist(pts[172], pts[397]) || dist(pts[132], pts[361]) || 1;
  const jawToCheekRatio = Number((bigonialWidth / bizygomaticWidth).toFixed(2));

  // fWHR
  const stomionY = (upperLip.y + lowerLip.y) / 2;
  const midfaceH = Math.abs(stomionY - glabella.y) || 1;
  const fwhr = Number((bizygomaticWidth / midfaceH).toFixed(2));

  let chinProminence: 'balanced' | 'recessed' | 'prominent' = 'balanced';
  if (lowerThird < 30) chinProminence = 'recessed';
  else if (lowerThird > 36) chinProminence = 'prominent';

  // 5. BILATERAL SYMMETRY
  const midX = (glabella.x + subnasale.x + menton.x) / 3;
  const pairedLandmarks = [
    [33, 263], [133, 362], [70, 300], [107, 336], [61, 291], [234, 454], [172, 397]
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

  const rawSymmetry = totalSpan > 0 ? (1 - totalDeviations / totalSpan) : 0.92;
  const symmetryPercentage = Math.min(99, Math.max(75, Math.round(rawSymmetry * 100)));
  let symmetryStatus: FacialMetrics['symmetryStatus'] = 'Balanced Symmetry';
  if (symmetryPercentage >= 92) symmetryStatus = 'High Symmetry';
  else if (symmetryPercentage < 84) symmetryStatus = 'Natural Variation';

  // 6. FACE SHAPE CLASSIFICATION (Distinct for Male vs. Female)
  const faceLengthToWidth = totalH / bizygomaticWidth;
  let faceShape: FacialMetrics['faceShape'] = 'Oval';

  if (gender === 'female') {
    // Female classification prioritizes softer taper and V-line
    if (jawToCheekRatio < 0.70 && faceLengthToWidth > 1.28) {
      faceShape = 'Heart';
    } else if (faceLengthToWidth > 1.50) {
      faceShape = 'Oblong';
    } else if (faceLengthToWidth < 1.25 && jawToCheekRatio > 0.76) {
      faceShape = 'Square';
    } else if (faceLengthToWidth < 1.22) {
      faceShape = 'Round';
    } else if (bizygomaticWidth > bigonialWidth * 1.38) {
      faceShape = 'Diamond';
    } else {
      faceShape = 'Oval';
    }
  } else {
    // Male classification
    if (faceLengthToWidth > 1.55) {
      faceShape = 'Oblong';
    } else if (faceLengthToWidth < 1.25 && jawToCheekRatio > 0.78) {
      faceShape = 'Square';
    } else if (faceLengthToWidth < 1.25 && jawToCheekRatio <= 0.78) {
      faceShape = 'Round';
    } else if (jawToCheekRatio > 0.80) {
      faceShape = 'Square';
    } else if (jawToCheekRatio < 0.68) {
      faceShape = 'Heart';
    } else if (bizygomaticWidth > bigonialWidth * 1.35) {
      faceShape = 'Diamond';
    } else {
      faceShape = 'Oval';
    }
  }

  // 7. PROFILE METRICS (Ricketts E-Line & Nasolabial Angle)
  // E-line is drawn from nose tip (4) to chin tip (152)
  const rawUpperDist = Math.abs(distToLine(upperLip, noseTip, menton));
  const rawLowerDist = Math.abs(distToLine(lowerLip, noseTip, menton));
  
  // Normalize against facial height (average human face height ≈ 190mm)
  const scaleMmPerPixel = 190 / (totalH || 1);
  const eLineUpperMm = Number((rawUpperDist * scaleMmPerPixel).toFixed(1));
  const eLineLowerMm = Number((rawLowerDist * scaleMmPerPixel).toFixed(1));

  // Real Nasolabial angle (Columellar tangent landmark 94 -> Subnasale 2 -> Labrale superius 13)
  const columellaPt = pts[94] || pts[168];
  const measuredNLA = angleBetween(columellaPt, subnasale, upperLip);
  // Default to clinical target range if angle geometry is planar
  const nasolabialAngle = (measuredNLA > 70 && measuredNLA < 130) ? measuredNLA : (gender === 'female' ? 104 : 93);

  let nasolabialStatus: 'Optimal' | 'Acute' | 'Obtuse' = 'Optimal';
  const targetNLA = gender === 'female' ? 104 : 93;
  if (nasolabialAngle < targetNLA - 8) nasolabialStatus = 'Acute';
  else if (nasolabialAngle > targetNLA + 8) nasolabialStatus = 'Obtuse';

  let eLineStatus: 'Balanced Profile' | 'Protrusive Lips' | 'Retrusive Profile' = 'Balanced Profile';
  if (eLineUpperMm > 5.5) eLineStatus = 'Protrusive Lips';
  else if (eLineUpperMm < 1.0) eLineStatus = 'Balanced Profile';

  const structuralProfile = `${faceShape} Architecture • ${symmetryStatus}`;

  return {
    gender,
    viewMode,
    upperThird,
    middleThird,
    lowerThird,
    lowerThirdSubRatio,
    fifthsRatio,
    intercanthalRatio,
    symmetryStatus,
    symmetryPercentage,
    canthalTiltAngle: tiltDegrees,
    canthalTiltType,
    fwhr,
    jawToCheekRatio,
    chinProminence,
    nasolabialAngle,
    nasolabialStatus,
    eLineUpperLipDist: eLineUpperMm,
    eLineLowerLipDist: eLineLowerMm,
    eLineStatus,
    faceShape,
    structuralProfile
  };
}
