import React, { useEffect, useRef } from 'react';
import { Point2D, FacialMetrics, OverlayOptions } from '../types';
import { AlertCircle } from 'lucide-react';

interface FaceCanvasProps {
  imageSrc: string | null;
  landmarks: Point2D[] | null;
  metrics: FacialMetrics | null;
  overlayOptions: OverlayOptions;
  detectionError?: string | null;
}

export const FaceCanvas: React.FC<FaceCanvasProps> = ({
  imageSrc,
  landmarks,
  metrics,
  overlayOptions,
  detectionError
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const maxWidth = 720;
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const displayWidth = img.naturalWidth * scale;
      const displayHeight = img.naturalHeight * scale;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      if (!landmarks || landmarks.length < 468 || !metrics) return;

      const pts = landmarks.map(p => ({
        x: p.x * displayWidth,
        y: p.y * displayHeight
      }));

      const forehead = pts[10];
      const glabella = pts[168] || pts[9];
      const subnasale = pts[2];
      const noseTip = pts[4] || pts[1];
      const upperLip = pts[13];
      const lowerLip = pts[14];
      const menton = pts[152];
      const rOuter = pts[33];
      const rInner = pts[133];
      const lInner = pts[362];
      const lOuter = pts[263];

      const isProfile = metrics.viewMode === 'profile';

      // ==========================================
      // PROFILE OVERLAYS (SIDE VIEW)
      // ==========================================
      if (isProfile) {
        // 1. Ricketts' Esthetic Line (E-Line: Nose Tip to Chin Tip)
        if (overlayOptions.showELine) {
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = '#06b6d4'; // Cyan
          ctx.lineWidth = 3;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.moveTo(noseTip.x, noseTip.y);
          ctx.lineTo(menton.x, menton.y);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Points at Nose tip & Chin
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(noseTip.x, noseTip.y, 4, 0, Math.PI * 2);
          ctx.arc(menton.x, menton.y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Badge
          ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
          ctx.fillRect(noseTip.x - 70, noseTip.y - 24, 140, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText("Ricketts' E-Line", noseTip.x, noseTip.y - 10);
          ctx.restore();
        }

        // 2. Nasolabial Angle Arc
        if (overlayOptions.showProfileAngles && metrics.nasolabialAngle) {
          ctx.save();
          const columella = pts[94] || pts[168];
          ctx.beginPath();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.moveTo(columella.x, columella.y);
          ctx.lineTo(subnasale.x, subnasale.y);
          ctx.lineTo(upperLip.x, upperLip.y);
          ctx.stroke();

          // Angle tag
          ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
          ctx.fillRect(subnasale.x + 12, subnasale.y - 10, 110, 22);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`NLA: ${metrics.nasolabialAngle}°`, subnasale.x + 16, subnasale.y + 5);
          ctx.restore();
        }
      }

      // ==========================================
      // FRONTAL OVERLAYS
      // ==========================================
      if (!isProfile) {
        // 1. RULE OF THIRDS
        if (overlayOptions.showThirds) {
          ctx.save();
          const thirdLines = [
            { y: forehead.y, label: `Hairline (${metrics.upperThird}%)`, color: '#38bdf8' },
            { y: glabella.y, label: `Brow Level (${metrics.middleThird}%)`, color: '#fbbf24' },
            { y: subnasale.y, label: `Nose Base (${metrics.lowerThird}%)`, color: '#34d399' },
            { y: menton.y, label: 'Chin Base', color: '#a78bfa' }
          ];

          thirdLines.forEach((tl) => {
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = tl.color;
            ctx.lineWidth = 2;
            ctx.moveTo(10, tl.y);
            ctx.lineTo(displayWidth - 10, tl.y);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(12, tl.y - 20, 140, 20);
            ctx.strokeStyle = tl.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(12, tl.y - 20, 140, 20);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
            ctx.fillText(tl.label, 18, tl.y - 6);
          });
          ctx.restore();
        }

        // 2. RULE OF FIFTHS
        if (overlayOptions.showFifths) {
          ctx.save();
          const leftCheek = pts[234];
          const rightCheek = pts[454];
          const eyeLevelY = (rInner.y + lInner.y) / 2;
          const xCols = [leftCheek.x, rOuter.x, rInner.x, lInner.x, lOuter.x, rightCheek.x];

          for (let i = 0; i < xCols.length - 1; i++) {
            const x1 = xCols[i];
            const x2 = xCols[i + 1];
            const pct = metrics.fifthsRatio[i] || 20;

            ctx.beginPath();
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.moveTo(x1, eyeLevelY - 60);
            ctx.lineTo(x1, eyeLevelY + 60);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
            ctx.fillRect(x1 + 2, eyeLevelY - 14, Math.max(10, x2 - x1 - 4), 28);

            ctx.fillStyle = '#fef3c7';
            ctx.font = 'bold 9px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${pct}%`, (x1 + x2) / 2, eyeLevelY + 4);
          }
          ctx.restore();
        }

        // 3. FACIAL SYMMETRY MIDLINE
        if (overlayOptions.showMidline) {
          ctx.save();
          const midX = (glabella.x + subnasale.x + menton.x) / 3;

          ctx.beginPath();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          ctx.moveTo(midX, forehead.y - 15);
          ctx.lineTo(midX, menton.y + 20);
          ctx.stroke();
          ctx.shadowBlur = 0;

          const pairs = [
            [pts[33], pts[263]],  // Outer eyes
            [pts[133], pts[362]], // Inner eyes
            [pts[61], pts[291]],  // Mouth corners
            [pts[234], pts[454]]  // Cheekbones
          ];

          pairs.forEach(([p1, p2]) => {
            ctx.beginPath();
            ctx.setLineDash([2, 4]);
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          });

          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
          ctx.fillRect(midX - 65, menton.y + 25, 130, 22);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Sagittal Alignment: ${metrics.symmetryPercentage}%`, midX, menton.y + 40);
          ctx.restore();
        }

        // 4. CANTHAL TILT
        if (overlayOptions.showTilt) {
          ctx.save();
          const drawTiltLine = (inner: Point2D, outer: Point2D) => {
            ctx.beginPath();
            ctx.strokeStyle = metrics.canthalTiltType === 'positive' ? '#10b981' : '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.moveTo(inner.x, inner.y);
            ctx.lineTo(outer.x, outer.y);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(outer.x, outer.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
          };

          drawTiltLine(rInner, rOuter);
          drawTiltLine(lInner, lOuter);

          ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
          ctx.fillRect(lOuter.x + 10, lOuter.y - 12, 110, 22);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`Tilt: ${metrics.canthalTiltAngle}° (${metrics.canthalTiltType})`, lOuter.x + 14, lOuter.y + 3);
          ctx.restore();
        }

        // 5. JAWLINE PERIMETER
        if (overlayOptions.showJawline) {
          ctx.save();
          const jawIndices = [
            234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152,
            377, 400, 378, 379, 365, 397, 288, 361, 323, 454
          ];

          ctx.beginPath();
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 6;

          let first = true;
          jawIndices.forEach(idx => {
            const pt = pts[idx];
            if (!pt) return;
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          });
          ctx.stroke();
          ctx.restore();
        }
      }

      // 468 Landmarks Cloud Toggle
      if (overlayOptions.showLandmarks) {
        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
        pts.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
    };
  }, [imageSrc, landmarks, metrics, overlayOptions]);

  return (
    <div className="relative w-full flex items-center justify-center bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-2 min-h-[380px]">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-xl shadow-inner object-contain"
      />
      {!imageSrc && (
        <div className="text-center p-8 text-slate-400">
          <p className="text-sm font-medium">Upload or select a photo to begin facial analysis</p>
        </div>
      )}

      {detectionError && (
        <div className="absolute bottom-4 left-4 right-4 bg-rose-950/90 border border-rose-500/50 backdrop-blur-md text-rose-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-200">No Face Detected</p>
            <p className="text-[11px] text-rose-300/80 mt-0.5">{detectionError}</p>
          </div>
        </div>
      )}
    </div>
  );
};
