import { Point2D } from '../types';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  z: number; // depth after rotation
  rawIndex: number;
  scaleFactor: number;
}

/**
 * Key Anatomical & Clinical Landmarks for real-time inspection.
 */
export const ANATOMICAL_LANDMARKS_3D: Record<number, { name: string; clinicalRole: string; color: string }> = {
  10: { name: 'Trichion / Upper Forehead', clinicalRole: 'Upper facial third superior boundary', color: '#f59e0b' },
  168: { name: 'Glabella', clinicalRole: 'Midface upper landmark & brow midpoint', color: '#f59e0b' },
  4: { name: 'Pronasale (Nose Tip)', clinicalRole: 'Anterior nasal apex & Ricketts E-line origin', color: '#38bdf8' },
  2: { name: 'Subnasale', clinicalRole: 'Lower third border & Nasolabial angle vertex', color: '#38bdf8' },
  13: { name: 'Labrale Superius (Upper Lip)', clinicalRole: 'Upper lip vermilion apex', color: '#ec4899' },
  14: { name: 'Labrale Inferius (Lower Lip)', clinicalRole: 'Lower lip vermilion apex', color: '#ec4899' },
  152: { name: 'Menton (Chin Tip)', clinicalRole: 'Inferior soft-tissue chin boundary', color: '#10b981' },
  175: { name: 'Pogonion', clinicalRole: 'Most anterior point of chin projection', color: '#10b981' },
  234: { name: 'Right Zygion (Cheekbone)', clinicalRole: 'Maximum right bizygomatic facial width', color: '#a855f7' },
  454: { name: 'Left Zygion (Cheekbone)', clinicalRole: 'Maximum left bizygomatic facial width', color: '#a855f7' },
  58: { name: 'Right Gonion (Jaw Angle)', clinicalRole: 'Right mandibular angle definition', color: '#a855f7' },
  288: { name: 'Left Gonion (Jaw Angle)', clinicalRole: 'Left mandibular angle definition', color: '#a855f7' },
  33: { name: 'Right Exocanthion', clinicalRole: 'Outer right eye canthus (canthal tilt endpoint)', color: '#34d399' },
  133: { name: 'Right Endocanthion', clinicalRole: 'Inner right eye canthus (intercanthal width)', color: '#34d399' },
  362: { name: 'Left Endocanthion', clinicalRole: 'Inner left eye canthus', color: '#34d399' },
  263: { name: 'Left Exocanthion', clinicalRole: 'Outer left eye canthus (canthal tilt endpoint)', color: '#34d399' },
  70: { name: 'Right Brow Apex', clinicalRole: 'Right eyebrow arch crest', color: '#fbbf24' },
  300: { name: 'Left Brow Apex', clinicalRole: 'Left eyebrow arch crest', color: '#fbbf24' }
};

/**
 * Major anatomical contours defining human facial architecture.
 */
export const FACIAL_CONTOURS_3D: Record<string, number[]> = {
  faceOval: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
    400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
    54, 103, 67, 109, 10
  ],
  leftEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362],
  rightEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],
  leftEyebrow: [336, 296, 334, 293, 300, 276, 283, 282, 295, 285],
  rightEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
  lipsOuter: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61],
  lipsInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78],
  noseRidge: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2],
  noseBase: [98, 97, 2, 326, 327],
  midline: [
    10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 19, 94, 2,
    164, 0, 11, 12, 13, 14, 15, 16, 17, 18, 200, 199, 175, 152
  ],
  jawline: [
    234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152,
    377, 400, 378, 379, 365, 397, 288, 361, 323, 454
  ]
};

/**
 * Generates canonical structural cross-lattice wireframe edges for the 468 mesh points.
 */
export function buildMeshEdges(): [number, number][] {
  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];

  const addEdge = (a: number, b: number) => {
    if (a === b || a < 0 || b < 0) return;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([a, b]);
    }
  };

  // Add all contour consecutive pairs
  Object.values(FACIAL_CONTOURS_3D).forEach((loop) => {
    for (let i = 0; i < loop.length - 1; i++) {
      addEdge(loop[i], loop[i + 1]);
    }
  });

  // Cross-connections between facial zones
  const crossConnections: [number, number][] = [
    // Forehead to brows
    [10, 67], [10, 297], [109, 70], [338, 300], [67, 105], [297, 334],
    // Eyebrows to eyes
    [70, 33], [63, 160], [105, 159], [66, 158], [107, 157], [55, 173],
    [300, 263], [293, 387], [334, 386], [296, 385], [336, 384],
    // Eye corners to bridge
    [133, 168], [362, 168], [133, 197], [362, 197], [133, 6], [362, 6],
    // Nose bridge to cheekbones
    [197, 116], [197, 345], [195, 123], [195, 352], [5, 50], [5, 280],
    [4, 205], [4, 425], [2, 207], [2, 427],
    // Cheeks to jaw
    [234, 116], [454, 345], [116, 123], [345, 352], [123, 58], [352, 288],
    [50, 147], [280, 376], [147, 172], [376, 397],
    // Lips to chin
    [17, 18], [18, 200], [200, 199], [199, 175], [175, 152],
    [84, 148], [314, 377], [91, 176], [321, 400],
    // Lateral cheek arches
    [127, 234], [356, 454], [162, 127], [389, 356], [54, 21], [284, 251]
  ];

  crossConnections.forEach(([a, b]) => addEdge(a, b));

  return edges;
}

/**
 * Computes 3D centroid of landmarks to rotate around face center.
 */
export function computeCentroid(landmarks: Point2D[]): Point3D {
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  const count = landmarks.length;

  for (let i = 0; i < count; i++) {
    const p = landmarks[i];
    sumX += p.x;
    sumY += p.y;
    sumZ += p.z ?? 0;
  }

  return {
    x: sumX / count,
    y: sumY / count,
    z: sumZ / count
  };
}

/**
 * Projects a 3D point onto a 2D canvas with Euler rotation (yaw, pitch, roll)
 * and perspective foreshortening.
 */
export function projectPoint3D(
  pt: Point2D,
  rawIndex: number,
  centroid: Point3D,
  rotX: number, // Pitch (radians)
  rotY: number, // Yaw (radians)
  rotZ: number, // Roll (radians)
  scale: number,
  centerX: number,
  centerY: number,
  focalLength: number = 650
): ProjectedPoint {
  let x = (pt.x - centroid.x) * scale;
  let y = (pt.y - centroid.y) * scale;
  let z = ((pt.z ?? 0) - centroid.z) * scale;

  // 1. Rotation around Y-axis (Yaw)
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = x * cosY + z * sinY;
  const y1 = y;
  const z1 = -x * sinY + z * cosY;

  // 2. Rotation around X-axis (Pitch)
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const x2 = x1;
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;

  // 3. Rotation around Z-axis (Roll)
  const cosZ = Math.cos(rotZ);
  const sinZ = Math.sin(rotZ);
  const x3 = x2 * cosZ - y2 * sinZ;
  const y3 = x2 * sinZ + y2 * cosZ;
  const z3 = z2;

  // 4. Perspective projection
  const depth = focalLength + z3;
  const perspectiveFactor = depth > 10 ? focalLength / depth : 1;

  const projX = centerX + x3 * perspectiveFactor;
  const projY = centerY + y3 * perspectiveFactor;

  return {
    x: projX,
    y: projY,
    z: z3,
    rawIndex,
    scaleFactor: perspectiveFactor
  };
}

/**
 * Converts a normalized z-depth into a spectral heatmap hex color.
 * Anterior (closer) = bright amber/emerald; Posterior (further) = deep cyan/violet.
 */
export function getDepthColor(z: number, minZ: number, maxZ: number): string {
  const range = maxZ - minZ || 1;
  const norm = Math.max(0, Math.min(1, (z - minZ) / range));

  if (norm < 0.25) {
    return '#10b981'; // anterior chin / nose tip (emerald)
  } else if (norm < 0.55) {
    return '#f59e0b'; // midface & lips (amber)
  } else if (norm < 0.8) {
    return '#38bdf8'; // orbital rim & cheeks (sky)
  } else {
    return '#818cf8'; // mandibular ramus & ears (indigo)
  }
}

/**
 * Canonical Facial Triangular Facets for Volumetric 3D Solid Shading.
 */
export const FACIAL_TRIANGLES_3D: [number, number, number][] = [
  // Forehead Facets
  [10, 67, 109], [10, 109, 338], [10, 338, 297], [67, 105, 109],
  [109, 338, 336], [297, 334, 338], [105, 66, 107], [334, 293, 300],
  [107, 55, 65], [300, 276, 283], [10, 21, 54], [10, 251, 284],
  [21, 54, 103], [251, 284, 389], [54, 103, 67], [284, 389, 297],
  [67, 109, 168], [297, 338, 168], [109, 336, 168],

  // Nose Bridge, Dorsum & Alar Facets
  [168, 6, 197], [197, 195, 5], [5, 4, 1], [4, 19, 94], [94, 2, 164],
  [168, 197, 133], [168, 362, 197], [197, 5, 116], [197, 345, 5],
  [5, 4, 123], [5, 352, 4], [4, 2, 98], [4, 327, 2], [98, 2, 164],
  [327, 2, 164], [4, 98, 19], [4, 327, 19],

  // Cheekbone / Malar Prominence Facets
  [234, 116, 123], [454, 352, 345], [116, 50, 123], [345, 352, 280],
  [123, 58, 172], [352, 397, 288], [234, 127, 162], [454, 389, 356],
  [127, 162, 93], [356, 389, 323], [93, 132, 58], [323, 361, 288],
  [133, 116, 197], [362, 345, 197], [116, 123, 5], [345, 352, 5],
  [127, 234, 116], [356, 454, 345],

  // Upper & Lower Perioral / Lips Facets
  [164, 0, 11], [0, 37, 12], [0, 267, 12], [37, 39, 13], [267, 269, 13],
  [39, 40, 185], [269, 270, 409], [14, 17, 18], [18, 200, 199],
  [199, 175, 152], [17, 84, 18], [17, 314, 18], [18, 148, 200],
  [18, 377, 200], [200, 176, 199], [200, 400, 199], [199, 149, 175],
  [199, 378, 175], [175, 150, 152], [175, 379, 152],

  // Mandibular Jawline & Gonial Angle Facets
  [58, 172, 136], [288, 365, 397], [172, 136, 150], [397, 365, 379],
  [136, 150, 149], [365, 379, 378], [150, 149, 176], [379, 378, 400],
  [149, 176, 148], [378, 400, 377], [176, 148, 152], [400, 377, 152],
  [50, 147, 172], [280, 376, 397], [147, 172, 136], [376, 397, 365]
];

/**
 * Aesthetic Facial Planes for anatomical analysis.
 */
export interface FacialPlane3D {
  id: string;
  name: string;
  clinicalSignificance: string;
  color: string;
  indices: number[];
}

export const AESTHETIC_FACIAL_PLANES_3D: FacialPlane3D[] = [
  {
    id: 'forehead',
    name: 'Frontal Forehead Plane',
    clinicalSignificance: 'Evaluates frontal bossing and supraorbital ridge projection.',
    color: '#f59e0b',
    indices: [10, 338, 297, 334, 293, 300, 168, 70, 66, 105, 67, 109]
  },
  {
    id: 'leftCheek',
    name: 'Left Malar (Cheekbone) Plane',
    clinicalSignificance: 'Assesses left zygomatic arch projection and midface contour.',
    color: '#38bdf8',
    indices: [454, 356, 389, 362, 345, 352, 280, 425, 427, 288, 361, 323]
  },
  {
    id: 'rightCheek',
    name: 'Right Malar (Cheekbone) Plane',
    clinicalSignificance: 'Assesses right zygomatic arch projection and midface contour.',
    color: '#38bdf8',
    indices: [234, 127, 162, 133, 116, 123, 50, 205, 207, 58, 132, 93]
  },
  {
    id: 'nasalDorsum',
    name: 'Nasal Dorsum & Tip Plane',
    clinicalSignificance: 'Evaluates dorsal line straightness and pronasale projection.',
    color: '#34d399',
    indices: [168, 197, 195, 5, 4, 1, 19, 94, 2, 98, 327]
  },
  {
    id: 'leftMandible',
    name: 'Left Mandibular / Jawline Plane',
    clinicalSignificance: 'Left gonial angle sharpness, ramus height, and jawline definition.',
    color: '#a855f7',
    indices: [288, 397, 365, 379, 378, 400, 377, 152, 175, 199, 200, 376]
  },
  {
    id: 'rightMandible',
    name: 'Right Mandibular / Jawline Plane',
    clinicalSignificance: 'Right gonial angle sharpness, ramus height, and jawline definition.',
    color: '#a855f7',
    indices: [58, 172, 136, 150, 149, 176, 148, 152, 175, 199, 200, 147]
  },
  {
    id: 'mentalis',
    name: 'Mentalis / Chin Projection Plane',
    clinicalSignificance: 'Anterior pogonion projection relative to lower lip and nasion.',
    color: '#f43f5e',
    indices: [17, 18, 200, 199, 175, 152, 148, 377, 176, 400]
  }
];

/**
 * Computes directional specular lighting for a 3D facet.
 */
export function computeFacetLighting(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number },
  p3: { x: number; y: number; z: number },
  lightDir: { x: number; y: number; z: number } = { x: 0.35, y: -0.55, z: 0.75 }
): { intensity: number; isBackfacing: boolean } {
  // Vector A: p2 - p1
  const ax = p2.x - p1.x;
  const ay = p2.y - p1.y;
  const az = p2.z - p1.z;
  // Vector B: p3 - p1
  const bx = p3.x - p1.x;
  const by = p3.y - p1.y;
  const bz = p3.z - p1.z;

  // Cross product
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;

  const len = Math.hypot(nx, ny, nz) || 1;
  const normX = nx / len;
  const normY = ny / len;
  const normZ = nz / len;

  // Dot product with normalized light direction
  const lightLen = Math.hypot(lightDir.x, lightDir.y, lightDir.z) || 1;
  const lx = lightDir.x / lightLen;
  const ly = lightDir.y / lightLen;
  const lz = lightDir.z / lightLen;

  const dot = normX * lx + normY * ly + normZ * lz;
  // Ambient (0.25) + Diffuse (0.75 * max(0, dot))
  const intensity = Math.max(0.2, Math.min(1.0, 0.25 + 0.75 * Math.max(0, dot)));

  return {
    intensity,
    isBackfacing: normZ < -0.15
  };
}
