import React from 'react';
import { FacialMetrics, Recommendation } from '../types';
import { X, Printer, ShieldCheck, Sparkles } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: FacialMetrics;
  recommendations: Recommendation[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  recommendations
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
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
                Facial Harmony & Biometric Diagnostic Report
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Generated via Scientific Anthropometric Landmark Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
            >
              <Printer className="w-4 h-4" />
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

        {/* Executive Score Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center print:border-gray-300">
            <span className="text-xs text-slate-400 uppercase font-semibold">Harmony Score</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">{metrics.harmonyScore}/100</div>
            <span className="text-[11px] text-emerald-400 font-medium">High Bilateral Balance</span>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center print:border-gray-300">
            <span className="text-xs text-slate-400 uppercase font-semibold">Face Shape</span>
            <div className="text-3xl font-extrabold text-white print:text-black mt-1">{metrics.faceShape}</div>
            <span className="text-[11px] text-sky-400 font-medium">fWHR: {metrics.fwhr}</span>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center print:border-gray-300">
            <span className="text-xs text-slate-400 uppercase font-semibold">Bilateral Symmetry</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">{metrics.symmetryScore}%</div>
            <span className="text-[11px] text-slate-400 font-medium">Sagittal Midline Alignment</span>
          </div>
        </div>

        {/* Proportions Table */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-3">
            Metric Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Vertical Thirds</span>
              <span className="font-bold text-white">{metrics.upperThird}% : {metrics.middleThird}% : {metrics.lowerThird}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Ideal: 33 : 33 : 33</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Canthal Tilt</span>
              <span className="font-bold text-emerald-400">{metrics.canthalTiltAngle}° ({metrics.canthalTiltType})</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Target: +1° to +5°</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Jaw/Cheekbone Ratio</span>
              <span className="font-bold text-white">{metrics.jawToCheekRatio}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Target: 0.75 - 0.80</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Intercanthal Ratio</span>
              <span className="font-bold text-white">{metrics.intercanthalRatio}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Target: ~1.0</span>
            </div>
          </div>
        </div>

        {/* Recommendations Checklist */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider mb-3">
            Key Style Protocols
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

        {/* Privacy & Methodology Footer */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-800 pt-4 print:hidden">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>This report was computed 100% locally on-device. No facial biometrics or photographs were transmitted or stored.</span>
        </div>
      </div>
    </div>
  );
};
