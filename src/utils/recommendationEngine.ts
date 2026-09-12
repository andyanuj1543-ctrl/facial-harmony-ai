import { FacialMetrics, Recommendation } from '../types';

export function generateRecommendations(metrics: FacialMetrics): Recommendation[] {
  const list: Recommendation[] = [];

  // ==========================================
  // 1. HAIRCUT SUGGESTIONS
  // ==========================================
  if (metrics.upperThird > 35) {
    list.push({
      id: 'hair-fringe',
      category: 'hair',
      title: 'Textured Crop / Forward Fringe',
      subtitle: 'Balance Upper Third & Forehead Height',
      reason: `Your upper third is slightly elongated (${metrics.upperThird}% vs ideal 33%). A forward-falling textured fringe effectively cuts visual forehead length and focuses attention on your eyes.`,
      actionPoints: [
        'Ask barber for a French Crop or messy textured fringe',
        'Keep sides at a mid-skin fade or low taper to maintain head proportions',
        'Use matte styling clay or sea salt spray for separation without grease'
      ],
      iconName: 'Scissors',
      tag: 'High Forehead Balance'
    });
  } else if (metrics.upperThird < 31) {
    list.push({
      id: 'hair-pompadour',
      category: 'hair',
      title: 'Modern Quiff or Brushed-Back Volume',
      subtitle: 'Add Vertical Lift to Upper Face',
      reason: `Your upper third is compact (${metrics.upperThird}%). Adding vertical volume at the front hairline expands your vertical proportions and balances your facial thirds.`,
      actionPoints: [
        'Blow-dry hair backwards and upward with a round brush',
        'Ask for 3-4 inches on top with tapered natural temples',
        'Finish with a medium-hold pomade or texture powder'
      ],
      iconName: 'Scissors',
      tag: 'Vertical Elongation'
    });
  } else if (metrics.faceShape === 'Square') {
    list.push({
      id: 'hair-square',
      category: 'hair',
      title: 'Classic Side-Part or Structured Buzz',
      subtitle: 'Showcase Angular Mandible Structure',
      reason: 'Your square jawline and balanced proportions are ideal for clean, masculine cuts that emphasize bone definition rather than hiding it.',
      actionPoints: [
        'Classic low taper with a crisp hard or soft side-part',
        'If hair is thick, an Ivy League cut or textured buzz cut highlights cheekbones',
        'Keep temples squared off for sharp architectural contrast'
      ],
      iconName: 'Scissors',
      tag: 'Angular Definition'
    });
  } else if (metrics.faceShape === 'Round') {
    list.push({
      id: 'hair-round',
      category: 'hair',
      title: 'High Skin Fade with Textured Spikes',
      subtitle: 'Create Angular Contours & Height',
      reason: 'Round face shapes benefit from maximum contrast: tight, clipped sides remove horizontal width while textured height on top adds length.',
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
      id: 'hair-oval',
      category: 'hair',
      title: 'Taper Fade with Flow or Slicked Back',
      subtitle: 'Versatile Proportional Harmony',
      reason: 'Your oval proportions are highly versatile. Maintaining natural flow with clean perimeter tapering keeps your facial thirds in optimal balance.',
      actionPoints: [
        'Medium-length scissor cut on top with low taper fade on neck and ears',
        'Layered texture allows easy switching between casual and professional styling',
        'Light grooming cream preserves natural movement'
      ],
      iconName: 'Scissors',
      tag: 'Natural Flow'
    });
  }

  // ==========================================
  // 2. BEARD & FACIAL HAIR CONTOURING
  // ==========================================
  if (metrics.chinProminence === 'recessed' || metrics.lowerThird < 31) {
    list.push({
      id: 'beard-tapered',
      category: 'beard',
      title: 'Tapered Chin-Heavy Beard (5–12mm)',
      subtitle: 'Extend Lower Third & Chin Projection',
      reason: `Your lower third (${metrics.lowerThird}%) is slightly compact relative to the midface. Growing the beard slightly longer at the chin creates immediate forward projection and length.`,
      actionPoints: [
        'Fade cheeks short (2-3mm) and allow the chin/goatee zone to grow 8-12mm',
        'Shape chin beard into a rounded-square contour for a robust jawline silhouette',
        'Line up the moustache so it does not droop past the lip corners'
      ],
      iconName: 'Smile',
      tag: 'Chin Projection'
    });
  } else if (metrics.jawToCheekRatio < 0.74) {
    list.push({
      id: 'beard-sharp-neckline',
      category: 'beard',
      title: 'Contoured Heavy Stubble with Crisp Neckline',
      subtitle: 'Sharpen Mandibular Angle & Jaw Border',
      reason: `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}. A crisp, sculpted neckline creates a permanent dark shadow along your jaw border, mimicking a sharp gonial angle.`,
      actionPoints: [
        'Set neckline exactly 1 to 1.5 fingers above the Adam’s apple',
        'Curve the neckline gently up towards the back corner of your jawbone',
        'Keep overall length at 3.5mm to 5mm for heavy masculine shadow'
      ],
      iconName: 'Smile',
      tag: 'Jawline Sculpting'
    });
  } else {
    list.push({
      id: 'beard-stubble',
      category: 'beard',
      title: 'Designer 3-Day Stubble (2–3mm)',
      subtitle: 'Clean Bone Structure Accents',
      reason: `Your lower third and jaw proportions (${metrics.jawToCheekRatio} jaw/cheek) are already well-defined. Uniform short stubble adds rugged texture without hiding bone lines.`,
      actionPoints: [
        'Trim every 3 to 4 days with a 2mm guard',
        'Shave stray cheek hairs above the natural cheekbone line',
        'Hydrate skin beneath the stubble with light jojoba or squalane oil'
      ],
      iconName: 'Smile',
      tag: 'Chiseled Definition'
    });
  }

  // ==========================================
  // 3. EYEWEAR & SUNGLASSES
  // ==========================================
  if (metrics.faceShape === 'Round' || metrics.faceShape === 'Oval') {
    list.push({
      id: 'glasses-angular',
      category: 'eyewear',
      title: 'Angular Square & Wayfarer Frames',
      subtitle: 'Introduce Sharp Geometric Contrast',
      reason: 'Curved and soft facial curves look best contrasted with angular, rectangular, or flat-top frames that provide architectural definition.',
      actionPoints: [
        'Look for thick acetate square frames or classic Wayfarers',
        'Opt for frame width that matches or slightly exceeds your cheekbones',
        'Avoid small circular lenses which exaggerate facial roundness'
      ],
      iconName: 'Glasses',
      tag: 'Geometric Contrast'
    });
  } else {
    list.push({
      id: 'glasses-curved',
      category: 'eyewear',
      title: 'Soft Round Acetate or Classic Aviator Frames',
      subtitle: 'Soft Balance for Angular Bone Structure',
      reason: 'With your strong bone structure and angular jawline, rounded or teardrop lenses soften harsh facial lines and provide effortless cinematic balance.',
      actionPoints: [
        'Classic metal Aviator frames or rounded P3 keyhole bridge acetate',
        'Dark tortoise or gunmetal finishes complement warm masculine skin tones',
        'Ensure the frame bridge sits comfortably at the nasion (nose root)'
      ],
      iconName: 'Glasses',
      tag: 'Soft Harmony'
    });
  }

  // ==========================================
  // 4. PHYSIOLOGICAL & LIFESTYLE OPTIMIZATION
  // ==========================================
  list.push({
    id: 'life-debloat',
    category: 'lifestyle',
    title: 'Electrolyte Balance & Facial Debloating Protocol',
    subtitle: 'Reveal Buried Bone Structure & Cheekbone Hollows',
    reason: 'Subcutaneous facial water retention can obscure even the strongest bone structure, rounding the jawline and blurring the zygomatic arches.',
    actionPoints: [
      'Drink 3.5L of water daily to prevent compensatory intracellular fluid holding',
      'Increase potassium (spinach, avocado, coconut water) and keep processed sodium low',
      'Perform morning ice-water face plunges (20-30s) or light lymphatic drainage massage',
      'Benchmark: Visible hollow cheeks and sharp jaw contours peak at 10%–14% body fat'
    ],
    iconName: 'HeartPulse',
    tag: 'Bone Reveal'
  });

  list.push({
    id: 'life-posture',
    category: 'lifestyle',
    title: 'Cervical Posture & Proper Resting Tongue Alignment',
    subtitle: 'Maximize Mandibular Definition & Neck Contour',
    reason: 'Forward head posture ("tech neck") pulls the submental skin backward and slackens the hyoid muscles, creating an artificial double-chin even at low body fat.',
    actionPoints: [
      'Perform 3 sets of 10 chin tucks daily to align cervical vertebrae',
      'Maintain resting tongue posture: gently suction full tongue against the roof of the mouth',
      'Breathe strictly through the nose during rest and sleep to maintain proper midface tone'
    ],
    iconName: 'Activity',
    tag: 'Posture & Airway'
  });

  return list;
}
