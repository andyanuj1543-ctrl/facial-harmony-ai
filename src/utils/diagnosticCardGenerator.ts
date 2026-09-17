import { FacialMetrics, Recommendation, CompositeScan } from '../types';

/**
 * Renders a high-resolution (1200 x 1600) clinical diagnostic card
 * to an offscreen canvas and triggers an instant PNG download.
 * 100% client-side, zero external libraries.
 */
export async function generateAndDownloadDiagnosticCard(
  frontImageUrl: string,
  metrics: FacialMetrics,
  recommendations: Recommendation[],
  compositeScan?: CompositeScan | null
): Promise<void> {
  const width = 1200;
  const height = 1600;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Helper to load image
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image for card'));
      img.src = src;
    });
  };

  // 1. Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#0d1527');
  bgGrad.addColorStop(1, '#080c14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border & Glow
  ctx.strokeStyle = '#f59e0b33';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // 2. Header Section
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 18px "Space Grotesk", sans-serif';
  ctx.fillText('FACIAL HARMONY AI • ANTHROPOMETRIC DIAGNOSTIC', 70, 95);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillText('Clinical Facial Architecture Report', 70, 145);

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 16px sans-serif';
  ctx.fillText(
    `Anthropometric Baselines: ${metrics.gender.toUpperCase()} • Generated: ${dateStr} • Pure Geometry`,
    70,
    180
  );

  // Horizontal Divider
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, 205);
  ctx.lineTo(width - 70, 205);
  ctx.stroke();

  // 3. Photo Showcase (Front & Profile if composite, or centered front)
  let frontImg: HTMLImageElement | null = null;
  let profileImg: HTMLImageElement | null = null;

  try {
    frontImg = await loadImage(compositeScan?.front.imageUrl || frontImageUrl);
  } catch {
    // Ignore error
  }

  if (compositeScan?.profile.imageUrl) {
    try {
      profileImg = await loadImage(compositeScan.profile.imageUrl);
    } catch {
      // Ignore error
    }
  }

  const photoY = 230;
  const photoH = 380;

  if (profileImg && frontImg) {
    // Dual Photos Side-by-Side
    const photoW = 500;

    // Front photo card
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(70, photoY, photoW, photoH, 16);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.drawImage(frontImg, 70, photoY, photoW, photoH);
    ctx.restore();

    // Front label pill
    ctx.fillStyle = '#0f172acc';
    ctx.beginPath();
    ctx.roundRect(85, photoY + photoH - 45, 180, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Frontal Symmetry (0°)', 100, photoY + photoH - 25);

    // Profile photo card
    const profileX = width - 70 - photoW;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(profileX, photoY, photoW, photoH, 16);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.drawImage(profileImg, profileX, photoY, photoW, photoH);
    ctx.restore();

    // Profile label pill
    ctx.fillStyle = '#0f172acc';
    ctx.beginPath();
    ctx.roundRect(profileX + 15, photoY + photoH - 45, 210, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText("Ricketts' Profile (~60°)", profileX + 30, photoY + photoH - 25);
  } else if (frontImg) {
    // Single centered photo
    const photoW = 460;
    const photoX = (width - photoW) / 2;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 16);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.drawImage(frontImg, photoX, photoY, photoW, photoH);
    ctx.restore();

    ctx.fillStyle = '#0f172acc';
    ctx.beginPath();
    ctx.roundRect(photoX + 15, photoY + photoH - 45, 200, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Anthropometric Scan', photoX + 30, photoY + photoH - 25);
  }

  // 4. Primary Metrics Cards (3 Pillars)
  const statsY = 645;
  const colW = (width - 140 - 30) / 3;

  // Box 1: Archetype
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(70, statsY, colW, 140, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('FACIAL ARCHITECTURE', 95, statsY + 35);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText(metrics.faceShape, 95, statsY + 75);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 13px sans-serif';
  ctx.fillText(metrics.structuralProfile, 95, statsY + 105);

  // Box 2: Bilateral Symmetry
  const col2X = 70 + colW + 15;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(col2X, statsY, colW, 140, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('BILATERAL SYMMETRY', col2X + 25, statsY + 35);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText(`${metrics.symmetryPercentage}%`, col2X + 25, statsY + 75);
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(metrics.symmetryStatus, col2X + 25, statsY + 105);

  // Box 3: Mandibular / Jaw-to-Cheek
  const col3X = col2X + colW + 15;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(col3X, statsY, colW, 140, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('JAW-TO-CHEEK RATIO', col3X + 25, statsY + 35);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText(`${metrics.jawToCheekRatio}`, col3X + 25, statsY + 75);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 13px sans-serif';
  ctx.fillText(
    metrics.gender === 'female' ? 'Tapered V-Line Contour' : 'Structured Mandible',
    col3X + 25,
    statsY + 105
  );

  // 5. Detailed Geometric Diagnostic Grid
  const gridY = 815;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.fillText('Anthropometric Geometric Breakdown', 70, gridY);

  const subColW = (width - 140 - 45) / 4;
  const subBoxY = gridY + 20;

  const subMetrics = [
    {
      label: 'Vertical Thirds',
      val: `${metrics.upperThird}% : ${metrics.middleThird}% : ${metrics.lowerThird}%`,
      sub: 'Ideal: 33 : 33 : 33'
    },
    {
      label: 'Canthal Tilt',
      val: `${metrics.canthalTiltAngle}° (${metrics.canthalTiltType})`,
      sub: 'Lateral to medial axis'
    },
    {
      label: 'Intercanthal Ratio',
      val: `${metrics.intercanthalRatio}`,
      sub: 'Ideal: ~1.00'
    },
    {
      label: 'Nasolabial Angle',
      val: metrics.nasolabialAngle ? `${metrics.nasolabialAngle}°` : 'Profile View',
      sub: metrics.gender === 'female' ? 'Norm: 100°–108°' : 'Norm: 90°–95°'
    }
  ];

  subMetrics.forEach((m, i) => {
    const boxX = 70 + i * (subColW + 15);
    ctx.fillStyle = '#0f172a80';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, subBoxY, subColW, 95, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(m.label, boxX + 15, subBoxY + 28);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(m.val, boxX + 15, subBoxY + 54);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(m.sub, boxX + 15, subBoxY + 76);
  });

  // 6. Actionable Styling Protocols
  const stylingY = 960;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.fillText('Tailored Aesthetic & Styling Protocols', 70, stylingY);

  const cardW = width - 140;
  let currY = stylingY + 20;

  recommendations.slice(0, 3).forEach((r) => {
    ctx.fillStyle = '#0f172a99';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(70, currY, cardW, 115, 12);
    ctx.fill();
    ctx.stroke();

    // Category tag
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(r.category.toUpperCase(), 95, currY + 30);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Space Grotesk", sans-serif';
    ctx.fillText(r.title, 95, currY + 56);

    // Reason
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    const reasonTruncated = r.reason.length > 110 ? r.reason.substring(0, 107) + '...' : r.reason;
    ctx.fillText(reasonTruncated, 95, currY + 80);

    // Action points
    if (r.actionPoints.length > 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 12px sans-serif';
      ctx.fillText(`• ${r.actionPoints[0]}`, 95, currY + 101);
    }

    currY += 130;
  });

  // 7. Footer & Privacy Assurance
  const footerY = height - 90;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, footerY - 15);
  ctx.lineTo(width - 70, footerY - 15);
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('✔ 100% PRIVATE & ON-DEVICE', 70, footerY + 12);

  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.fillText(
    'No arbitrary 0-100 scores. Evaluated via deterministic Euclidean geometry and MediaPipe 3D anthropometry.',
    70,
    footerY + 32
  );

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 13px "Space Grotesk", sans-serif';
  ctx.fillText('facialharmony.ai', width - 190, footerY + 20);

  // 8. Download PNG
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facial-harmony-diagnostic-${metrics.gender}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}
