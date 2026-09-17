import { FacialMetrics, Recommendation } from '../types';

export function generateRecommendations(metrics: FacialMetrics): Recommendation[] {
  const list: Recommendation[] = [];

  // ==========================================
  // 1. MEN'S HAIRSTYLE & VOLUME ARCHITECTURE
  // ==========================================
  if (metrics.upperThird > 35) {
    list.push({
      id: 'hair-textured-fringe',
      category: 'hair',
      title: 'Textured French Crop / Drop Fade',
      subtitle: 'Balance Upper Third & Frame Brow Ridge',
      reason: `Your upper third accounts for ${metrics.upperThird}% of your vertical facial height. A forward-styled textured crop with a low-to-mid fade shortens visual forehead height while accentuating your brow ridge and jawline.`,
      actionPoints: [
        'Ask barber for 1.5–2 inches on top with blunt point-cut texture',
        'Mid-to-low skin fade on sides to maintain masculine head taper',
        'Use matte styling clay or sea salt spray—avoid high-shine pomade'
      ],
      iconName: 'Scissors',
      tag: 'Forehead Balance'
    });
  } else if (metrics.faceShape === 'Round' || metrics.lowerThird < 31) {
    list.push({
      id: 'hair-voluminous-quiff',
      category: 'hair',
      title: 'Modern Textured Quiff / High Taper Fade',
      subtitle: 'Elongate Facial Height & Define Cheekbones',
      reason: `Your face structure benefits from vertical elongation (lower third is ${metrics.lowerThird}%). Adding 1.5–2 inches of brushed-up volume creates a leaner, more angular masculine silhouette.`,
      actionPoints: [
        'Keep sides tapered clean with a high skin fade to eliminate lateral bulk',
        'Blow-dry hair upward and back using a vented brush for root volume',
        'Finish with matte clay for strong hold without weighing hair down'
      ],
      iconName: 'Scissors',
      tag: 'Vertical Elongation'
    });
  } else if (metrics.faceShape === 'Square') {
    list.push({
      id: 'hair-classic-taper',
      category: 'hair',
      title: 'Classic Side-Part Fade / Ivy League',
      subtitle: 'Complements Strong Square Jawline',
      reason: `You have a strong, structured mandible (Jaw-to-Cheek ratio: ${metrics.jawToCheekRatio}). A sharp classic taper with clean perimeter edges showcases your natural angular bone structure without over-exaggerating it.`,
      actionPoints: [
        'Low-to-mid taper fade with scissor-cut top (2.5 to 3 inches)',
        'Comb natural side part slightly off-center with subtle volume at the front',
        'Keep temple points sharp to emphasize masculine cheekbones'
      ],
      iconName: 'Scissors',
      tag: 'Angular Mandible'
    });
  } else {
    list.push({
      id: 'hair-textured-crew',
      category: 'hair',
      title: 'Textured Crew Cut / Low Drop Fade',
      subtitle: 'Harmonious Proportions & Low Maintenance',
      reason: `Your ${metrics.faceShape} bone structure features balanced thirds (${metrics.upperThird}% : ${metrics.middleThird}% : ${metrics.lowerThird}%). A textured crew cut maintains natural masculine symmetry with zero visual distortion.`,
      actionPoints: [
        'Finger-length texture on top graduated shorter towards the crown',
        'Low skin drop fade behind the ear down to the nape of the neck',
        'Apply texture powder for effortless matte separation'
      ],
      iconName: 'Scissors',
      tag: 'Harmonic Proportion'
    });
  }

  // ==========================================
  // 2. BEARD & JAWLINE SCULPTING ARCHITECTURE
  // ==========================================
  if (metrics.jawToCheekRatio < 0.74 || metrics.chinProminence === 'recessed') {
    list.push({
      id: 'beard-heavy-stubble-chin',
      category: 'grooming',
      title: 'Full Boxed Stubble with Chin Projection',
      subtitle: 'Square Off Mandibular Angles & Extend Chin',
      reason: `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio}. Leaving extra density (5–7mm) at the chin while tapering the sideburns artificially extends chin prominence and squares off the lower third.`,
      actionPoints: [
        'Trim sides and cheeks to 3mm stubble, keep chin area 6–7mm long',
        'Define a sharp, crisp neckline exactly 1 finger above the Adam\'s apple',
        'Maintain a straight, sharp cheek line to create angular cheekbone shadow'
      ],
      iconName: 'Smile',
      tag: 'Jaw Enhancement'
    });
  } else if (metrics.jawToCheekRatio >= 0.78) {
    list.push({
      id: 'beard-designer-shadow',
      category: 'grooming',
      title: 'Designer 2mm–3mm Heavy Shadow',
      subtitle: 'Accentuate Powerful Natural Mandible',
      reason: `You already possess a wide, structured mandible (${metrics.jawToCheekRatio} ratio). Heavy 3mm shadow highlights the mandibular boundary and masseter muscles without hiding bone definition under bulk.`,
      actionPoints: [
        'Keep uniform 2.5–3mm stubble across the jawline and mustache',
        'Fade neck upward from clean skin to 2mm for seamless transition',
        'Use an exfoliating facial scrub twice weekly to keep skin tone tight and even'
      ],
      iconName: 'Smile',
      tag: 'Chiseled Definition'
    });
  } else {
    list.push({
      id: 'beard-tapered-stubble',
      category: 'grooming',
      title: 'Tapered Fade Stubble (3mm to 5mm)',
      subtitle: 'Sharp Lower Third Geometric Framing',
      reason: `With ${metrics.symmetryPercentage}% bilateral symmetry, a clean faded stubble frames your jawline evenly on both sides and reinforces masculine facial harmony.`,
      actionPoints: [
        'Fade sideburns smoothly into hair fade (0.5mm to 3mm transition)',
        'Shave stray cheek hairs with a safety razor for razor-sharp geometric borders',
        'Apply 2 drops of lightweight beard oil daily to prevent dry skin flake'
      ],
      iconName: 'Smile',
      tag: 'Symmetry Framing'
    });
  }

  // ==========================================
  // 3. FACIAL DEBLOATING & POSTURE PROTOCOLS
  // ==========================================
  list.push({
    id: 'lifestyle-debloat-mewing',
    category: 'lifestyle',
    title: 'Facial Debloating & Palatal Posture Protocol',
    subtitle: 'Maximize Soft Tissue Definition Over Bone',
    reason: `True bone structure is often hidden by fluid retention or neck posture. Tightening the submental triangle and balancing hydration immediately sharpens jawline and cheekbone visibility.`,
    actionPoints: [
      'Maintain resting palatal tongue posture (tongue resting flat against the roof of mouth)',
      'Balance sodium/potassium intake: drink 3L water daily and consume potassium-rich foods (avocados, spinach) to flush subcutaneous water',
      'Perform daily cervical spine chin tucks (3 sets of 12 reps) to correct forward head posture'
    ],
    iconName: 'Activity',
    tag: 'Chiseled Taper'
  });

  // ==========================================
  // 4. MASCULINE EYEWEAR ARCHITECTURE
  // ==========================================
  if (metrics.faceShape === 'Square' || metrics.faceShape === 'Round') {
    list.push({
      id: 'eyewear-angular-aviator',
      category: 'eyewear',
      title: 'Structured Navigator / Angular Clubmaster',
      subtitle: 'Contrast & Frame Facial Width',
      reason: `Your facial width-to-height ratio is ${metrics.fwhr}. A navigator frame with a strong masculine brow bar balances cheekbone width and sharpens eye aesthetics.`,
      actionPoints: [
        'Select dark matte acetate or brushed titanium frames',
        'Frame width should match your bizygomatic cheekbone width',
        'Square or hexagonal silhouettes contrast soft tissue contours'
      ],
      iconName: 'Glasses',
      tag: 'Brow Alignment'
    });
  } else {
    list.push({
      id: 'eyewear-classic-wayfarer',
      category: 'eyewear',
      title: 'Geometric Wayfarer / D-Frame',
      subtitle: 'Timeless Masculine Proportions',
      reason: `For your ${metrics.faceShape} structure, classic D-frames provide horizontal balance without overpowering vertical facial thirds.`,
      actionPoints: [
        'Choose matte black, dark tortoise, or gunmetal grey finishes',
        'Look for a keyhole bridge to accentuate the nasal bridge',
        'Ensure top frame aligns with the natural arch of your eyebrows'
      ],
      iconName: 'Glasses',
      tag: 'Proportional Balance'
    });
  }

  return list;
}
