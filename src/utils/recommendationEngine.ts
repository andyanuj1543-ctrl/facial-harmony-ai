import { FacialMetrics, Recommendation } from '../types';

/**
 * Clinical Grooming & Facial Architecture Recommendation Engine.
 * Grounded in:
 * 1. Craniofacial Anthropometry (Leslie Farkas, MD, PhD - Facial Thirds & Fifths)
 * 2. Cephalometric Aesthetics (Dr. Robert Ricketts - Sagittal Esthetic Plane)
 * 3. Optical Proportion Counter-balancing (Master Barbering & Frame Geometry)
 * 4. Myofunctional Biomechanics & Cervical Posture (Submental-Cervical Platysma Tone)
 */
export function generateRecommendations(metrics: FacialMetrics): Recommendation[] {
  const list: Recommendation[] = [];

  // =========================================================================
  // 1. MEN'S HAIRSTYLE & VOLUME ARCHITECTURE (Counter-balancing Face Proportions)
  // =========================================================================
  if (metrics.upperThird > 35) {
    // High forehead / dominant upper third
    list.push({
      id: 'hair-textured-fringe',
      category: 'hair',
      title: 'Textured French Crop / Low Drop Fade',
      subtitle: 'Visually Shorten Forehead & Frame Brow Ridge',
      reason: `Your upper third accounts for ${metrics.upperThird}% of your vertical facial height (ideal is ~33%). A forward-styled textured crop with a blunt or micro-fringe visually lowers your perceived hairline while focusing optical attention onto your brow ridge and eyes.`,
      actionPoints: [
        'Ask your barber for 1.5–2 inches on top point-cut for messy, layered texture',
        'Keep the fringe falling naturally just above mid-forehead—never combed straight down',
        'Low-to-mid skin drop fade on the sides to prevent creating vertical head height',
        'Style with matte clay or sea salt spray—avoid high-shine gels which expose scalp spacing'
      ],
      iconName: 'Scissors',
      tag: 'Forehead Balancing'
    });
  } else if (metrics.middleThird > 36) {
    // Elongated midface (longer nose / eye-to-mouth span)
    list.push({
      id: 'hair-mid-flow',
      category: 'hair',
      title: 'Medium Textured Flow / Soft Taper Curtains',
      subtitle: 'Add Lateral Width & Break Midface Elongation',
      reason: `Your midface represents ${metrics.middleThird}% of vertical cranial height. Very short buzzed sides exaggerate midface verticality. Allowing medium length (3–4 inches) on the sides with soft ear tapers provides horizontal visual balance.`,
      actionPoints: [
        'Leave 3.5–4.5 inches on top and upper sides with textured scissor graduation',
        'Style with a natural off-center parting, allowing hair to sweep outward across temples',
        'Keep sideburns tapered at mid-ear to anchor facial width',
        'Use lightweight styling paste or cream for natural flow with zero stiff helmet look'
      ],
      iconName: 'Scissors',
      tag: 'Midface Harmony'
    });
  } else if (metrics.faceShape === 'Round' || metrics.lowerThird < 31) {
    // Round face or compact lower jaw
    list.push({
      id: 'hair-voluminous-quiff',
      category: 'hair',
      title: 'Modern Textured Quiff / High Taper Fade',
      subtitle: 'Elongate Facial Height & Define Cheekbones',
      reason: `Your lower third is compact (${metrics.lowerThird}%) with a ${metrics.faceShape} contour. Adding 1.5 to 2 inches of upward brushed vertical volume creates the optical illusion of an elongated, chiseled masculine profile.`,
      actionPoints: [
        'High skin taper fade on sides to completely eliminate lateral temple bulge',
        'Blow-dry hair upward and back with a vented brush to build root volume',
        'Maintain 2.5–3.5 inches on top styled into a textured, matte quiff',
        'Finish with a strong-hold matte clay to maintain structural lift throughout the day'
      ],
      iconName: 'Scissors',
      tag: 'Vertical Elongation'
    });
  } else if (metrics.faceShape === 'Oblong') {
    // Long face / Narrow vertical silhouette
    list.push({
      id: 'hair-classic-side-sweep',
      category: 'hair',
      title: 'Low-Volume Side Part / Low Taper',
      subtitle: 'Prevent Over-Elongation & Maintain Compact Silhouette',
      reason: `Your face has an oblong vertical silhouette with an fWHR of ${metrics.fwhr}. Avoid high pompadours or spike-quiffs which add unnecessary vertical length. A low-profile, clean scissor-taper maintains balanced proportions.`,
      actionPoints: [
        'Keep top hair under 2 inches combed neatly with minimal vertical volume',
        'Ask barber for a classic low taper rather than a high shaved skin fade',
        'Style with a defined diagonal part line to create horizontal visual interest',
        'Use medium-hold styling pomade or cream with a natural semi-matte finish'
      ],
      iconName: 'Scissors',
      tag: 'Proportion Control'
    });
  } else if (metrics.faceShape === 'Diamond') {
    // Wide cheekbones with narrower jaw and forehead
    list.push({
      id: 'hair-textured-fringe-diamond',
      category: 'hair',
      title: 'Fringe with Tapered Temples / Scissor Crop',
      subtitle: 'Widen Forehead to Balance Prominent Zygomatic Arches',
      reason: `With your Diamond architecture, your cheekbones are the widest facial plane. Leaving soft volume over the temples while keeping a textured messy fringe widens your upper third to achieve classic golden-ratio symmetry.`,
      actionPoints: [
        'Scissor-cut sides with a soft #2–#3 taper—never shave down to the bone at temples',
        'Keep 2.5 inches on top with feathered fringe styled forward and slightly angled',
        'Texturize edges around the ears to blend cheekbone projection smoothly',
        'Apply texture powder for root fullness without oily residue'
      ],
      iconName: 'Scissors',
      tag: 'Zygoma Balance'
    });
  } else if (metrics.faceShape === 'Square' || metrics.jawToCheekRatio >= 0.78) {
    // Wide, prominent mandible
    list.push({
      id: 'hair-classic-ivy',
      category: 'hair',
      title: 'Classic Ivy League / Executive Mid Fade',
      subtitle: 'Showcase Angular Mandible with Architectural Discipline',
      reason: `You possess a naturally wide, structured mandible (Jaw-to-Cheek ratio: ${metrics.jawToCheekRatio}). A sharp, disciplined Ivy League cut showcases your natural bone angles without overwhelming your head proportions.`,
      actionPoints: [
        'Mid taper fade transitioning from skin to scissor blend at the parietal ridge',
        'Top length: 2 inches at front, tapering to 1 inch at the crown',
        'Brush front hairline slightly up and to the side for subtle masculine height',
        'Keep temple points and edge lines razor-sharp'
      ],
      iconName: 'Scissors',
      tag: 'Mandibular Framing'
    });
  } else {
    // Balanced Oval or Natural Proportion
    list.push({
      id: 'hair-textured-crew',
      category: 'hair',
      title: 'Textured Crew Cut / Low Taper Fade',
      subtitle: 'Harmonious Proportions & Low Maintenance',
      reason: `Your ${metrics.faceShape} bone structure features well-balanced thirds (${metrics.upperThird}% : ${metrics.middleThird}% : ${metrics.lowerThird}%). A textured crew cut maintains your natural masculine symmetry with zero visual distortion.`,
      actionPoints: [
        'Finger-length texture on top graduated shorter towards the crown',
        'Low skin drop fade behind the ear down to the nape of the neck',
        'Apply texture powder for effortless matte separation',
        'Touch up perimeter line every 3 weeks to preserve crisp edge geometry'
      ],
      iconName: 'Scissors',
      tag: 'Harmonic Proportion'
    });
  }

  // Asymmetry specific adjustment if bilateral symmetry is noticeably deviating
  if (metrics.symmetryPercentage < 88) {
    list[0].actionPoints.push(
      `Symmetry Note (${metrics.symmetryPercentage}%): Avoid symmetrical center parts or buzzcuts; an asymmetrical 70/30 side sweep or angled fringe naturally balances biological micro-asymmetry.`
    );
  }

  // =========================================================================
  // 2. BEARD & JAWLINE ARCHITECTURE (Mandibular Edge Definition)
  // =========================================================================
  if (metrics.chinProminence === 'recessed' || metrics.jawToCheekRatio < 0.73) {
    // Recessed chin or narrow lower third
    list.push({
      id: 'beard-extended-goatee-stubble',
      category: 'grooming',
      title: 'Graduated Boxed Beard with Chin Extension',
      subtitle: 'Project Pogonion & Square Off Mandibular Angles',
      reason: `Your jaw-to-cheek ratio is ${metrics.jawToCheekRatio} with a recessed sagittal chin alignment. Leaving longer hair density (6–8mm) at the chin while fading sideburns down to 2mm artificially projects your chin forward and widens the mandibular corners.`,
      actionPoints: [
        'Keep chin hair and soul patch at 6–8mm length to project profile forward',
        'Fade cheek hair and sideburns tightly down to 2–3mm stubble',
        'Set your neckline precisely 1 finger above the Adam\'s apple in a square U-shape',
        'Line up the lower chin border horizontally to create a flat, chiseled jaw shelf'
      ],
      iconName: 'Smile',
      tag: 'Chin Projection'
    });
  } else if (metrics.jawToCheekRatio >= 0.78) {
    // Naturally chiseled, wide jaw
    list.push({
      id: 'beard-designer-shadow',
      category: 'grooming',
      title: 'Designer 2mm–3mm Heavy Shadow',
      subtitle: 'Highlight Powerful Mandibular Bone Structure',
      reason: `You already have an athletic, prominent jaw structure (${metrics.jawToCheekRatio} ratio). Growing a heavy bushy beard would bury your natural bone definition. A crisp 2–3mm heavy shadow outlines the masseter muscle and jawline bone without adding unwanted bulk.`,
      actionPoints: [
        'Maintain uniform 2.5mm stubble length using a precision guard twice weekly',
        'Shave stray hairs high on the cheeks with a safety razor for a crisp diagonal border',
        'Fade neck upward from clean skin below the hyoid bone to 2mm at the jaw line',
        'Use an exfoliating facial scrub twice weekly to keep skin tone tight and even'
      ],
      iconName: 'Smile',
      tag: 'Bone Definition'
    });
  } else if (metrics.faceShape === 'Round') {
    // Round face requiring angular lower definition
    list.push({
      id: 'beard-angular-taper',
      category: 'grooming',
      title: 'Angular Tapered Stubble with Crisp Jaw Shelf',
      subtitle: 'Carve Mandibular Shadow & Eliminate Soft Curves',
      reason: `On a round face, soft subcutaneous tissue blends the chin into the neck. A razor-sharp linear beard boundary creates dark optical shadow lines, immediately chiseling the jaw angle into an athletic V-taper.`,
      actionPoints: [
        'Carve straight, sharp cheek lines connecting sideburn to mouth corner',
        'Keep chin area 4mm and sides at 2mm for forward elongation',
        'Never curve the neckline into an oval—cut a sharp 90-degree corner at the gonial angle',
        'Moisturize skin with non-comedogenic gel to prevent dullness'
      ],
      iconName: 'Smile',
      tag: 'Angular Sculpting'
    });
  } else {
    // Balanced or Oval structure
    list.push({
      id: 'beard-tapered-stubble',
      category: 'grooming',
      title: 'Precision Tapered Stubble (3mm to 4mm)',
      subtitle: 'Reinforce Lower Third Bilateral Framing',
      reason: `With ${metrics.symmetryPercentage}% bilateral symmetry and balanced ${metrics.faceShape} proportions, uniform faded stubble sharpens the perimeter of your lower face and balances your natural lip-to-chin ratio.`,
      actionPoints: [
        'Fade sideburns smoothly into hair fade (0.5mm to 3mm seamless transition)',
        'Shave stray neck hairs clean exactly 1.5 fingers above the Adam\'s apple',
        'Apply 2 drops of lightweight beard oil daily to prevent dry skin flake',
        'Brush daily with a boar-bristle brush to train hair growth direction flush against skin'
      ],
      iconName: 'Smile',
      tag: 'Symmetry Framing'
    });
  }

  // =========================================================================
  // 3. FACIAL DEBLOATING & ANATOMICAL POSTURE (Fine-Tuned to Measurements)
  // =========================================================================
  if (metrics.chinProminence === 'recessed' || metrics.lowerThird < 31) {
    // Recessed or compact chin -> Cervical spine & submental platysma protocol
    list.push({
      id: 'lifestyle-submental-cervical',
      category: 'lifestyle',
      title: 'Cervical Spine Retraction & Submental Platysma Protocol',
      subtitle: 'Restore 90° Submental Angle & Eliminate Postural Fullness',
      reason: `Forward head carriage (tech neck) drops your hyoid bone and slacks the platysma muscle, creating an artificial double chin even at sub-12% body fat. Aligning cervical vertebrae immediately restores your sharp 90°–105° jaw-to-neck angle.`,
      actionPoints: [
        'Perform daily cervical chin tucks: 3 sets of 12 reps against a flat wall, holding for 3 seconds each',
        'Practice resting palatal tongue posture (mewing): keep the posterior third of your tongue suctioned flat to the roof of your mouth',
        'Elevate phone and computer monitor to eye level to prevent constant 45-degree cervical flexion',
        'Sleep on an orthopedic low-loft pillow to avoid chronic forward neck extension during the night'
      ],
      iconName: 'Activity',
      tag: 'Cervical Alignment'
    });
  } else if (metrics.faceShape === 'Round' || metrics.jawToCheekRatio < 0.74) {
    // Water retention & buccal fat drainage protocol
    list.push({
      id: 'lifestyle-debloat-lymphatic',
      category: 'lifestyle',
      title: 'Subcutaneous Water Flushing & Lymphatic Drainage Protocol',
      subtitle: 'Uncover Hidden Bone Definition via Electrolyte & Fluid Reset',
      reason: `Buccal soft tissue and water retention easily mask underlying mandibular angles. Optimizing sodium-potassium balance and morning lymphatic drainage can visibly increase cheekbone and jawline definition within 72 hours.`,
      actionPoints: [
        'Consume 3.5 to 4 liters of clean water daily with 4,000mg dietary potassium (spinach, avocados, coconut water) to flush subcutaneous sodium',
        'Perform a 30-second ice-water facial immersion every morning to constrict facial micro-vessels and reduce peri-orbital puffiness',
        'Eliminate high-sodium and processed carbohydrates 3 hours prior to sleep to prevent nocturnal fluid accumulation',
        'Conduct 2 minutes of gentle lymphatic massage down the neck sternocleidomastoid lymph nodes after morning cleansing'
      ],
      iconName: 'Activity',
      tag: 'Debloat & Flush'
    });
  } else if (metrics.symmetryPercentage < 88) {
    // Asymmetry compensation protocol
    list.push({
      id: 'lifestyle-masseter-balance',
      category: 'lifestyle',
      title: 'Bilateral Masseter Balance & Unilateral Chewing Correction',
      subtitle: 'Correct Muscular Jaw Micro-Variance',
      reason: `Your facial symmetry measures ${metrics.symmetryPercentage}%. In over 85% of men, lower facial asymmetry is caused by unilateral mastication (habitually chewing food on only one side) and one-sided stomach sleeping, which hypertrophies one masseter muscle.`,
      actionPoints: [
        'Consciously chew all food evenly on both sides of your jaw, alternating bites',
        'Sleep on your back or use an anti-compression cervical pillow to prevent unilateral facial deformation during deep sleep',
        'Perform masseter trigger point release: gently massage the tight mandibular jaw corners with knuckles for 60 seconds before bed',
        'Avoid chronic daytime teeth clenching (keep teeth slightly apart with lips closed and tongue on palate)'
      ],
      iconName: 'Activity',
      tag: 'Symmetry Realignment'
    });
  } else {
    // High symmetry & athletic baseline
    list.push({
      id: 'lifestyle-vascular-toning',
      category: 'lifestyle',
      title: 'Myofunctional Toning & Submental Firmness Protocol',
      subtitle: 'Preserve Maximum Angularity & Tight Skin Elasticity',
      reason: `You already possess strong natural symmetry (${metrics.symmetryPercentage}%) and a structured ${metrics.faceShape} framework. Maintaining resting palatal tongue pressure and optimizing lean body composition keeps bone landmarks crisp throughout aging.`,
      actionPoints: [
        'Maintain automatic nasal breathing during all daily tasks and cardiovascular exercise',
        'Maintain consistent resting palatal tongue suction to tone the digastric and mylohyoid muscle group',
        'Prioritize 7.5–8.5 hours of uninterrupted sleep for optimal human growth hormone and collagen production',
        'Apply SPF 50 daily to maintain dermal elastin and prevent premature skin laxity around jawline edges'
      ],
      iconName: 'Activity',
      tag: 'Peak Toning'
    });
  }

  // =========================================================================
  // 4. MASCULINE EYEWEAR ARCHITECTURE (Grounded in Canthal Tilt & Face Width)
  // =========================================================================
  if (metrics.canthalTiltType === 'negative') {
    // Negative canthal tilt: eyes angle slightly downwards laterally
    list.push({
      id: 'eyewear-browline-uplift',
      category: 'eyewear',
      title: 'Structured Browline / Angular Clubmaster',
      subtitle: 'Visually Lift Lateral Canthus & Frame Eye Plane',
      reason: `Your canthal tilt angle is ${metrics.canthalTiltAngle}° (${metrics.canthalTiltType} vector). A bold, straight browline frame with high upper acetate rims counteracts downward lateral eye slope, restoring an alert, masculine eye aesthetic.`,
      actionPoints: [
        'Choose frames with a prominent, dark acetate upper brow bar and lightweight metal lower rim',
        'Ensure the outer top frame angle flares slightly upward at the temple pins',
        'Avoid tear-drop aviators which slope downward and exaggerate negative tilt',
        'Match frame width precisely to your bizygomatic cheekbone span'
      ],
      iconName: 'Glasses',
      tag: 'Canthal Lift'
    });
  } else if (metrics.faceShape === 'Square' || metrics.fwhr > 1.9) {
    // Wide or heavy square face
    list.push({
      id: 'eyewear-curved-navigator',
      category: 'eyewear',
      title: 'Soft-Hexagonal Navigator / Rounded Acetate',
      subtitle: 'Contrast Strong Angularity without Boxiness',
      reason: `Your facial width-to-height ratio is ${metrics.fwhr} with a wide ${metrics.faceShape} bone structure. Fully square glasses make a square face look overly blocky. Soft-hexagonal or navigator silhouettes with curved lower borders soften harsh corners while reinforcing masculine presence.`,
      actionPoints: [
        'Look for navigator frames with a high double bridge in gunmetal or matte black',
        'Avoid tiny narrow rectangular frames which make wide cheekbones appear bloated',
        'Opt for a frame width that aligns flush with your temporal bone boundaries',
        'Smoked or dark polarized lenses complement strong masseter angles'
      ],
      iconName: 'Glasses',
      tag: 'Width Balance'
    });
  } else if (metrics.faceShape === 'Round' || metrics.faceShape === 'Oval') {
    // Round or oval face needing angularity
    list.push({
      id: 'eyewear-geometric-wayfarer',
      category: 'eyewear',
      title: 'Sharp Geometric Wayfarer / D-Frame',
      subtitle: 'Inject Architectural Chisel to Softer Contours',
      reason: `On a ${metrics.faceShape} face, round glasses amplify circular soft-tissue lines. Sharp, angular D-frames with beveled acetate edges inject chiseled masculine geometry directly into the upper facial third.`,
      actionPoints: [
        'Select thick-gauge matte black or dark tortoiseshell acetate frames',
        'Square or trapezoidal lens silhouettes sharpen cheekbone visibility',
        'Ensure the bridge features a keyhole or high saddle cut to lengthen the nasal bridge',
        'Avoid round Harry Potter style or thin oval wire frames completely'
      ],
      iconName: 'Glasses',
      tag: 'Geometric Contrast'
    });
  } else {
    // Oblong or default
    list.push({
      id: 'eyewear-classic-d-frame',
      category: 'eyewear',
      title: 'Tall Lens Aviator / Deep D-Frame',
      subtitle: 'Break Vertical Facial Span & Frame Nasal Bridge',
      reason: `For an elongated or ${metrics.faceShape} structure, deep, taller lenses break the vertical length of the face in half, creating optimal golden-ratio proportion across the midface.`,
      actionPoints: [
        'Select frames with deeper lens height (40mm–45mm vertical span)',
        'Bold horizontal top bar draws optical focus horizontally rather than vertically',
        'Matte titanium or brushed carbon finishes offer understated masculine polish',
        'Ensure frame arms fit comfortably without pinching the temples'
      ],
      iconName: 'Glasses',
      tag: 'Proportional Balance'
    });
  }

  return list;
}

