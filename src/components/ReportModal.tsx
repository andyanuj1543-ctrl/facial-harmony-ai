import React, { useState } from 'react';
import { FacialMetrics, Recommendation, CompositeScan } from '../types';
import { X, Printer, ShieldCheck, Sparkles, CheckCircle2, Download, Image as ImageIcon } from 'lucide-react';
import { generateAndDownloadDiagnosticCard } from '../utils/diagnosticCardGenerator';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: FacialMetrics;
  recommendations: Recommendation[];
  compositeScan?: CompositeScan | null;
  imageUrl?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  recommendations,
  compositeScan,
  imageUrl = ''
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      await generateAndDownloadDiagnosticCard(imageUrl, metrics, recommendations, compositeScan);
    } catch (err) {
      console.error('Error downloading diagnostic card:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative print:p-0 print:border-none print:bg-white print:text-black">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 print:border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white print:text-black">
                Facial Architecture & Proportions Diagnostic
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600">
                {compositeScan
                  ? `Full 360° Composite Analysis (${metrics.gender.toUpperCase()} • FRONTAL & LATERAL PROFILE)`
                  : `Anthropometric Landmark Analysis (${metrics.gender.toUpperCase()} • ${metrics.viewMode.toUpperCase()})`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating...' : 'Download Card (PNG)'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-xs hover:bg-slate-700 transition-all"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 360 Dual Photos if Composite Scan */}
        {compositeScan && (
          <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                360° Dual Biometric Capture
              </span>
              <span className="text-[11px] text-slate-400">Synchronized Frontal & Lateral Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 bg-black">
                  <img src={compositeScan.front.imageUrl} alt="Front View" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 px-1">
                  <span className="font-semibold text-white">Frontal Thirds & Symmetry</span>
                  <span>Yaw: 0°</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 bg-black">
                  <img src={compositeScan.profile.imageUrl} alt="Profile View" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 px-1">
                  <span className="font-semibold text-white">Ricketts E-Line & Profile</span>
                  <span>Yaw: ~60°</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Structural Diagnostic Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center print:border-gray-300">
            <span className="text-xs text-slate-400 uppercase font-semibold">Face Architecture</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{metrics.faceShape}</div>
            <span className="text-[11px] text-slate-300 font-medium">{metrics.structuralProfile}</span>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center print:border-gray-300">
            <span className="text-xs text-slate-400 uppercase font-semibold">Bilateral Symmetry</span>
            <div className="text-2xl font-extrabold text-white print:text-black mt-1">{metrics.symmetryPercentage}%</div>
            <span className="text-[11px] text-emerald-400 font-medium">{metrics.symmetryStatus}</span>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center print:border-gray-300">
            <span className="text-xs text-slate-400 uppercase font-semibold">Jaw-to-Cheek Ratio</span>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">{metrics.jawToCheekRatio}</div>
            <span className="text-[11px] text-slate-400 font-medium">{metrics.gender === 'female' ? 'Tapered V-Line' : 'Structured Mandible'}</span>
          </div>
        </div>

        {/* Proportions Table */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-3">
            Geometric Diagnostic Measurements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Vertical Thirds</span>
              <span className="font-bold text-white">{metrics.upperThird}% : {metrics.middleThird}% : {metrics.lowerThird}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Norm: 33 : 33 : 33</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Canthal Tilt</span>
              <span className="font-bold text-emerald-400">{metrics.canthalTiltAngle}° ({metrics.canthalTiltType})</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Neutral to Positive</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Intercanthal Ratio</span>
              <span className="font-bold text-white">{metrics.intercanthalRatio}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Norm: ~1.00</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Nasolabial Angle</span>
              <span className="font-bold text-white">{metrics.nasolabialAngle ? `${metrics.nasolabialAngle}°` : 'Profile View'}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{metrics.gender === 'female' ? 'Ideal: 100°–108°' : 'Ideal: 90°–95°'}</span>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations Checklist */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-3">
            Tailored Styling Protocols
          </h3>
          <div className="space-y-3">
            {recommendations.map(r => (
              <div key={r.id} className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-400">{r.title}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">{r.category}</span>
                </div>
                <p className="text-slate-300 mb-2">{r.reason}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  {r.actionPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-800 pt-4 print:hidden">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Processed 100% locally on-device via WebAssembly. No biometric data or photographs are ever uploaded.</span>
        </div>
      </div>
    </div>
  );
};
