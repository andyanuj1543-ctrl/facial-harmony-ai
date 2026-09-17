import { FacialMetrics, Recommendation } from '../types';

export function generateRecommendations(metrics: FacialMetrics): Recommendation[] {
  const list: Recommendation[] = [];
  const isFemale = metrics.gender === 'female';

  // ==========================================
  // 1. HAIRSTYLE / HAIR VOLUME ADVICE
  // ==========================================
  if (isFemale) {
    // Female Hair Advice
    if (metrics.upperThird > 35) {
      list.push({
        id: 'hair-curtain-bangs',
        category: 'hair',
        title: 'Curtain Bangs / Soft Wispy Fringe',
        subtitle: 'Softly Frame Forehead & Accentuate Eyes',
        reason: `Your upper third is ${metrics.upperThird}% of your facial vertical length. Soft, center-parted curtain bangs break up forehead height while drawing attention directly to your cheekbones.`,
        actionPoints: [
          'Ask for curtain bangs starting at the bridge of your nose and tapering to your cheekbones',
          'Style with a round blow-dry brush away from the face for natural volume',
          'Use light texturizing spray instead of heavy oils'
        ],
        iconName: 'Scissors',
        tag: 'Face Framing'
      });
    } else if (metrics.faceShape === 'Round' || metrics.faceShape === 'Square') {
      list.push({
        id: 'hair-long-layers',
        category: 'hair',
        title: 'Long Face-Framing Layers & Textured Waves',
        subtitle: 'Elongate Proportions & Soften Jaw Angles',
        reason: `With a ${metrics.faceShape} bone structure, long layers starting below the chin visually elongate your face and soften wide angles.`,
        actionPoints: [
          'Keep layers below chin-length to avoid adding horizontal width to cheeks',
          'Opt for soft beach waves or subtle root lift',
          'Avoid blunt chin-length bobs which emphasize jaw width'
        ],
        iconName: 'Scissors',
        tag: 'Vertical Balance'
      });
    } else if (metrics.faceShape === 'Heart' || metrics.faceShape === 'Diamond') {
      list.push({
        id: 'hair-collarbone-lob',
        category: 'hair',
        title: 'Textured Collarbone Lob (Long Bob)',
        subtitle: 'Add Volume Around Jaw & Delicate Chin',
        reason: `Your jaw tapers delicately (${metrics.jawToCheekRatio} jaw/cheek). A collarbone-length lob adds fullness around the lower third, creating effortless equilibrium with your high cheekbones.`,
        actionPoints: [
          'Collarbone-length cut with subtle internal texture',
          'A soft side-part or textured ends adds body around the jawline',
          'Volumizing mousse at mid-lengths gives effortless bounce'
        ],
        iconName: 'Scissors',
        tag: 'Lower Third Harmony'
      });
    } else {
      list.push({
        id: 'hair-oval-layers',
        category: 'hair',
        title: 'Versatile Butterfly Layers / Mid-Length Cut',
        subtitle: 'Enhance Natural Facial Symmetry',
        reason: 'Your balanced oval proportions can wear almost any length. Butterfly layers maximize movement and frame your cheekbones naturally.',
        actionPoints: [
          'Ask for soft tiered layers framing from cheekbone to collarbone',
          'Blow-dry with a large barrel brush for polished blowout volume',
          'Preserve natural hairline symmetry with a soft middle or off-center part'
        ],
        iconName: 'Scissors',
        tag: 'Symmetrical Flow'
      });
    }

    // Female Eyebrow & Makeup Geometry
    list.push({
      id: 'female-brows',
      category: 'grooming',
      title: 'Arched Eyebrow Architecture & Lifting Contour',
      subtitle: 'Accentuate Orbital Rim & Cheekbone Projection',
      reason: 'Feminine facial harmony is maximized when the eyebrow apex peaks at the outer two-thirds, creating an optical lift for the eyes and midface.',
      actionPoints: [
        'Keep brow start aligned with inner eye corner, with the arch peaking above the outer iris',
        'Place blush higher on the outer cheekbones (swept upward toward temples) for an instant contour lift',
        'Overline only the central cupid’s bow slightly to balance upper-to-lower lip volume (1:1.6 ideal)'
      ],
      iconName: 'Sparkles',
      tag: 'Cheekbone Lift'
    });
  } else {
    // Male Hair Advice
    if (metrics.upperThird > 35) {
      list.push({
        id: 'hair-male-crop',
        category: 'hair',
        title: 'Textured French Crop / Forward Fringe',
        subtitle: 'Balance Upper Third Forehead Height',
        reason: `Your upper third is ${metrics.upperThird}%. A textured forward fringe visually shortens the forehead and draws immediate focus to your eyes and brow ridge.`,
        actionPoints: [
          'Ask barber for a French Crop or blunt textured fringe',
          'Keep sides at a mid-skin fade or low taper to maintain head proportions',
          'Use matte styling clay or sea salt spray for separation without grease'
        ],
        iconName: 'Scissors',
        tag: 'Forehead Balance'
      });
    } else if (metrics.faceShape === 'Square') {
      list.push({
        id: 'hair-male-square',
        category: 'hair',
        title: 'Classic Side-Part or Structured Buzz Cut',
        subtitle: 'Showcase Angular Mandible Structure',
        reason: 'Your square jawline and balanced proportions are ideal for clean, masculine cuts that highlight your natural bone definition.',
        actionPoints: [
          'Classic low taper with a crisp hard or soft side-part',
          'Keep temples squared off for sharp architectural contrast',
          'If hair is thick, a buzz cut with fade emphasizes cheekbone contours'
        ],
        iconName: 'Scissors',
        tag: 'Angular Definition'
      });
    } else if (metrics.faceShape === 'Round') {
      list.push({
        id: 'hair-male-round',
        category: 'hair',
        title: 'High Skin Fade with Textured Spikes / Quiff',
        subtitle: 'Create Vertical Lines & Slim Sides',
        reason: 'Round bone structures benefit from high contrast: tight, clipped sides remove horizontal width while textured height on top adds length.',
        actionPoints: [
          'High skin fade or drop fade to trim side width',
          'Avoid flat fringe or bowl cuts which widen the midface',
          'Style top upward in an angular faux-hawk or structured quiff'
        ],
        iconName: 'Scissors',
        tag: 'Face Slimming'
      });
    } else {
      list.push({
        id: 'hair-male-taper',
        category: 'hair',
        title: 'Low Taper Fade with Natural Flow',
        subtitle: 'Versatile Proportional Harmony',
        reason: 'Your balanced proportions are highly versatile. Maintaining natural flow with clean perimeter tapering keeps your facial thirds in optimal balance.',
        actionPoints: [
          'Medium-length scissor cut on top with low taper fade on neck and ears',
          'Layered texture allows easy switching between casual and professional styling',
          'Light grooming cream preserves natural movement'
        ],
        iconName: 'Scissors',
        tag: 'Natural Flow'
      });
    }

    // Male Beard & Jawline Contouring
    if (metrics.chinProminence === 'recessed' || metrics.lowerThird < 31) {
      list.push({
        id: 'beard-tapered',
        category: 'grooming',
        title: 'Tapered Chin-Heavy Stubble (6–12mm)',
        subtitle: 'Extend Lower Third & Chin Projection',
        reason: `Your lower third (${metrics.lowerThird}%) is slightly compact. Growing the beard longer at the chin creates immediate forward projection along the E-line.`,
        actionPoints: [
          'Fade cheeks short (2-3mm) and allow the chin/goatee zone to grow 8-12mm',
          'Shape chin beard into a rounded-square contour for a robust jawline silhouette',
          'Line up the moustache so it does not droop past the lip corners'
        ],
        iconName: 'Smile',
        tag: 'Chin Projection'
      });
    } else {
      list.push({
        id: 'beard-neckline',
        category: 'grooming',
        title: 'Sculpted Neckline & Designer Stubble (3–4mm)',
        subtitle: 'Sharpen Mandibular Angle & Jaw Border',
        reason: `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}. A crisp, sculpted neckline creates a permanent dark shadow along your jaw border, mimicking a sharp gonial angle.`,
        actionPoints: [
          'Set neckline exactly 1 to 1.5 fingers above the Adam’s apple',
          'Curve the neckline gently up towards the back corner of your jawbone',
          'Keep overall length at 3.5mm to 4.5mm for clean masculine shadow'
        ],
        iconName: 'Smile',
        tag: 'Jawline Sculpting'
      });
    }
  }

  // ==========================================
  // 2. EYEWEAR & ACCESSORIES GEOMETRY
  // ==========================================
  if (metrics.faceShape === 'Round' || metrics.faceShape === 'Oval') {
    list.push({
      id: 'glasses-angular',
      category: 'eyewear',
      title: isFemale ? 'Cat-Eye & Structured Square Frames' : 'Angular Square & Wayfarer Frames',
      subtitle: 'Introduce Sharp Geometric Contrast',
      reason: 'Curved and soft facial curves look best contrasted with angular, rectangular, or upswept frames that provide architectural definition.',
      actionPoints: [
        isFemale ? 'Subtle Cat-Eye or geometric acetate frames give an instant cheekbone lift' : 'Thick acetate square frames or classic Wayfarers',
        'Opt for frame width that matches your cheekbone width',
        'Avoid small circular lenses which exaggerate facial roundness'
      ],
      iconName: 'Glasses',
      tag: 'Geometric Contrast'
    });
  } else {
    list.push({
      id: 'glasses-curved',
      category: 'eyewear',
      title: isFemale ? 'Soft Oval & Rounded Wire Frames' : 'Soft Round Acetate or Classic Aviator Frames',
      subtitle: 'Soft Balance for Angular Bone Structure',
      reason: 'With your defined jawline and angular cheekbones, rounded or teardrop lenses soften harsh facial lines and provide effortless cinematic balance.',
      actionPoints: [
        'Round or teardrop lenses soften strong jawline corners',
        'Slim wire frames (gold/rose-gold for warm tones, silver for cool tones)',
        'Ensure the frame bridge sits comfortably at the nasion (nose root)'
      ],
      iconName: 'Glasses',
      tag: 'Soft Balance'
    });
  }

  // ==========================================
  // 3. PHYSIOLOGICAL DEBLOATING & POSTURE
  // ==========================================
  list.push({
    id: 'life-debloat',
    category: 'lifestyle',
    title: 'Facial Lymphatic Drainage & Debloating Protocol',
    subtitle: 'Reveal Natural Bone Contours & Cheekbone Hollows',
    reason: 'Subcutaneous facial water retention can blur even the strongest bone structure, rounding the jawline and obscuring zygomatic definition.',
    actionPoints: [
      'Drink 3L of water daily to prevent compensatory intracellular fluid holding',
      'Increase potassium (spinach, avocado, coconut water) and keep processed sodium low',
      'Morning ice-water face splash (20-30s) or light lymphatic drainage sweep from jaw to collarbone',
      'Maintain resting tongue posture: gently suction full tongue against the palate'
    ],
    iconName: 'Activity',
    tag: 'Bone Reveal'
  });

  return list;
}
