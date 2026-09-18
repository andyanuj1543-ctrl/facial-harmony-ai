import React, { useState, useEffect, useRef } from 'react';
import { Point2D, FacialMetrics, OverlayOptions, Gender, ViewMode, CompositeScan, VideoScanData } from './types';
import { computeFacialMetrics } from './utils/facialMetrics';
import { generateRecommendations } from './utils/recommendationEngine';
import { detectFaceLandmarks } from './utils/faceDetector';
import { SAMPLE_FACES } from './utils/sampleFaces';
import { FaceCanvas } from './components/FaceCanvas';
import { MetricCard } from './components/MetricCard';
import { RecommendationsView } from './components/RecommendationsView';
import { ReportModal } from './components/ReportModal';
import { VideoScan360Modal } from './components/VideoScan360Modal';
import { FaceMesh3DViewer } from './components/FaceMesh3DViewer';
import { AIAgentConsultantCard } from './components/AIAgentConsultantCard';
import { ContinuousVideoExamination } from './components/ContinuousVideoExamination';
import { generateAndDownloadDiagnosticCard } from './utils/diagnosticCardGenerator';
import { 
  Sparkles, 
  Upload, 
  Download, 
  RefreshCw, 
  Sliders, 
  ScanFace, 
  AlertTriangle,
  FileText,
  Film,
  Stethoscope,
  Trophy,
  Scissors,
  Box,
  Users,
  X,
  CheckCircle2
} from 'lucide-react';

export type AppTab = 'overview' | 'video' | 'grooming' | '3d';

export const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_FACES[0].imageUrl);
  const gender: Gender = 'male'; // Exclusively Men's Facial Architecture Lab
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [landmarks, setLandmarks] = useState<Point2D[] | null>(null);
  const [metrics, setMetrics] = useState<FacialMetrics | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [is360ScanOpen, setIs360ScanOpen] = useState<boolean>(false);
  const [isSamplesModalOpen, setIsSamplesModalOpen] = useState<boolean>(false);
  const [compositeScan, setCompositeScan] = useState<CompositeScan | null>(null);
  const [videoScanData, setVideoScanData] = useState<VideoScanData | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Overlay display states
  const [overlayOptions, setOverlayOptions] = useState<OverlayOptions>({
    showThirds: true,
    showFifths: false,
    showMidline: true,
    showTilt: true,
    showLandmarks: false,
    showJawline: true,
    showELine: true,
    showProfileAngles: true,
  });

  // Analyze the current image
  const analyzeImage = async (imageSrc: string) => {
    setIsProcessing(true);
    setDetectionError(null);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        if (img.complete && img.naturalWidth > 0) resolve(null);
        else {
          img.onload = () => resolve(null);
          img.onerror = () => reject(new Error('Failed to load image'));
        }
      });

      const detectedLandmarks = await detectFaceLandmarks(img);
      
      if (!detectedLandmarks) {
        setLandmarks(null);
        setMetrics(null);
        setDetectionError('No human face was detected in this image. Please upload a clear, well-lit portrait.');
        return;
      }

      setDetectionError(null);
      setLandmarks(detectedLandmarks);

      const computed = computeFacialMetrics(
        detectedLandmarks, 
        img.naturalWidth || 800, 
        img.naturalHeight || 800,
        gender,
        'front'
      );
      setMetrics(computed);
    } catch (err) {
      console.error('Analysis error:', err);
      setLandmarks(null);
      setMetrics(null);
      setDetectionError('Could not process this image. Please ensure it contains a clear human face.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideoScanComplete = (data: { composite: CompositeScan; videoData?: VideoScanData }) => {
    setCompositeScan(data.composite);
    if (data.videoData) {
      setVideoScanData(data.videoData);
    }
    setIs360ScanOpen(false);
    setSelectedImage(data.composite.front.imageUrl);
    setLandmarks(data.composite.front.landmarks);
    setMetrics(data.composite.front.metrics);
    setDetectionError(null);
    // Smoothly route to the video examination tab
    setActiveTab('video');
  };

  useEffect(() => {
    if (!compositeScan) {
      analyzeImage(selectedImage);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompositeScan(null);
    setVideoScanData(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const url = event.target.result as string;
        setSelectedImage(url);
        analyzeImage(url);
        setActiveTab('overview');
      }
    };
    reader.readAsDataURL(file);
  };

  const recommendations = metrics ? generateRecommendations(metrics) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Top Ambient Glow Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-amber-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Clean, Premium Header */}
      <header className="border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-300" />
              <img 
                src="/logo.svg" 
                alt="Facial Harmony AI" 
                className="relative w-8 h-8 rounded-lg border border-amber-500/40 object-contain p-0.5 bg-slate-950 shadow-md" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
                  Facial Harmony <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">AI</span>
                </h1>
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 hidden md:inline-block tracking-wider">
                  Men's Lab
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Clinical Facial Architecture & Grooming Blueprints</p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Sample archetypes opener */}
            <button
              onClick={() => setIsSamplesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Archetypes</span>
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload</span>
            </button>

            {/* 5s 360 Video Scan Primary Button */}
            <button
              onClick={() => setIs360ScanOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Film className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>5s Video Scan</span>
            </button>

            {/* Diagnostic Report Button */}
            {metrics && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-semibold text-white hover:bg-slate-800 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Report</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Clear 2026 Clinical Report Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/25">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Clinical Biometric Intelligence
              </span>
              {metrics && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Validated (468 pts)
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-['Space_Grotesk',sans-serif]">
              Facial Analysis Report
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              AI-powered facial architecture & grooming insights
            </p>
          </div>

          {metrics && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/60 border border-white/[0.08] flex items-center gap-3 shadow-inner">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Archetype</span>
                  <span className="text-xs font-black text-amber-400 font-['Space_Grotesk',sans-serif]">{metrics.faceShape}</span>
                </div>
                <div className="h-5 w-[1px] bg-white/[0.08]" />
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Symmetry</span>
                  <span className="text-xs font-black text-white font-['Space_Grotesk',sans-serif]">{metrics.symmetryPercentage}%</span>
                </div>
                <div className="h-5 w-[1px] bg-white/[0.08]" />
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Protocol</span>
                  <span className="text-xs font-black text-cyan-400 font-['Space_Grotesk',sans-serif]">Men's Custom</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Navigation Tabs (Organized & Uncluttered) */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'video'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Video Exam</span>
              {videoScanData?.videoReport && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('grooming')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'grooming'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Grooming Blueprint</span>
            </button>

            <button
              onClick={() => setActiveTab('3d')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === '3d'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>3D Model</span>
            </button>
          </div>

          {metrics && (
            <span className="text-xs font-mono font-bold text-amber-300 hidden md:block">
              {metrics.faceShape.toUpperCase()} • {metrics.symmetryPercentage}% SYMMETRY
            </span>
          )}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Spotlight Banner */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-xl">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Face Archetype</span>
                  <div className="text-lg sm:text-xl font-black text-amber-400 font-['Space_Grotesk',sans-serif]">
                    {metrics.faceShape}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{metrics.structuralProfile}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bilateral Symmetry</span>
                  <div className="text-lg sm:text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                    {metrics.symmetryPercentage}%
                  </div>
                  <span className="text-[10px] text-emerald-400 block font-semibold">{metrics.symmetryStatus}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandible Jaw-to-Cheek</span>
                  <div className="text-lg sm:text-xl font-black text-sky-400 font-['Space_Grotesk',sans-serif]">
                    {metrics.jawToCheekRatio}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Male Ideal: 0.76 - 0.82</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vertical Thirds</span>
                  <div className="text-lg sm:text-xl font-black text-purple-400 font-['Space_Grotesk',sans-serif]">
                    {metrics.upperThird}% : {metrics.middleThird}% : {metrics.lowerThird}%
                  </div>
                  <span className="text-[10px] text-slate-400 block">Golden Ratio: 33 : 33 : 33</span>
                </div>
              </div>
            )}

            {/* Main Visuals & AI Consultant Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 6 Cols: Face Canvas & Clean Toggles */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Anthropometric Proportions Canvas
                      </span>
                    </div>
                    {isProcessing && (
                      <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Detecting 468 landmarks...</span>
                      </div>
                    )}
                  </div>

                  <FaceCanvas
                    imageSrc={selectedImage}
                    landmarks={landmarks}
                    metrics={metrics}
                    overlayOptions={overlayOptions}
                    detectionError={detectionError}
                  />

                  {/* Clean, Compact Overlay Toggles */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
                    {[
                      { key: 'showThirds', label: 'Thirds' },
                      { key: 'showMidline', label: 'Midline' },
                      { key: 'showJawline', label: 'Jawline' },
                      { key: 'showLandmarks', label: '468 Mesh' }
                    ].map(({ key, label }) => {
                      const isActive = (overlayOptions as any)[key];
                      return (
                        <button
                          key={key}
                          onClick={() =>
                            setOverlayOptions((prev) => ({
                              ...prev,
                              [key]: !prev[key as keyof OverlayOptions]
                            }))
                          }
                          className={`py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                            isActive
                              ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 font-bold'
                              : 'border-white/[0.06] bg-slate-950/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right 6 Cols: AI Voice Consultant & Key Metrics */}
              <div className="lg:col-span-6 space-y-4">
                {/* Spoken AI Agent Briefing */}
                {metrics && (
                  <AIAgentConsultantCard
                    metrics={metrics}
                    recommendations={recommendations}
                    compositeScan={compositeScan}
                    videoData={videoScanData}
                  />
                )}

                {/* 4 Focused Diagnostic Cards */}
                {metrics && (
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      label="Bilateral Symmetry"
                      value={`${metrics.symmetryPercentage}%`}
                      ideal="Balanced"
                      status={metrics.symmetryStatus === 'High Symmetry' ? 'Optimal' : 'Balanced'}
                      description="Sagittal alignment across paired facial landmarks."
                    />

                    <MetricCard
                      label="Canthal Tilt"
                      value={`${metrics.canthalTiltAngle}°`}
                      ideal="Neutral / Positive"
                      status={metrics.canthalTiltType === 'positive' ? 'Optimal' : 'Balanced'}
                      description={`Eye corner orientation (${metrics.canthalTiltType} tilt).`}
                    />

                    <MetricCard
                      label="Mandible Ratio"
                      value={metrics.jawToCheekRatio}
                      ideal="0.76 - 0.82"
                      status={metrics.jawToCheekRatio >= 0.75 ? 'Optimal' : 'Moderate'}
                      description="Mandibular width relative to cheekbones."
                    />

                    <MetricCard
                      label="Eye Spacing Ratio"
                      value={metrics.intercanthalRatio}
                      ideal="~1.00"
                      status={Math.abs(metrics.intercanthalRatio - 1.0) < 0.15 ? 'Optimal' : 'Balanced'}
                      description="Inner eye spacing relative to eye length."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIDEO EXAMINATION */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            {videoScanData?.videoReport ? (
              <ContinuousVideoExamination
                videoUrl={videoScanData.videoUrl}
                report={videoScanData.videoReport}
                onListenToAudio={() => setActiveTab('overview')}
              />
            ) : (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-10 text-center max-w-xl mx-auto space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white font-['Space_Grotesk',sans-serif]">
                  Continuous 5-Second Video Examination
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Real clinical video analysis. Rotate your head from center to left and right for 5 seconds. The AI tracks dynamic jawline sharpness, rotational bilateral symmetry, and fluid retention throughout your motion.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIs360ScanOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Film className="w-4 h-4 stroke-[2.5]" />
                    <span>Start 5s Head Rotation Scan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GROOMING BLUEPRINT */}
        {activeTab === 'grooming' && (
          <div className="space-y-6">
            {metrics && (
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2.5 font-['Space_Grotesk',sans-serif]">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <Scissors className="w-4 h-4" />
                      </div>
                      <span>Tailored Grooming & Architectural Protocols</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Calibrated exclusively to your {metrics.faceShape} bone structure and masculine proportions
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!metrics) return;
                      await generateAndDownloadDiagnosticCard(selectedImage, metrics, recommendations, compositeScan);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs hover:from-amber-400 hover:to-orange-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Download Biometric Card</span>
                  </button>
                </div>

                <RecommendationsView recommendations={recommendations} />
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 3D MODEL */}
        {activeTab === '3d' && (
          <div className="space-y-6">
            <FaceMesh3DViewer
              landmarks={landmarks}
              gender={gender}
              title="Volumetric 3D Facial Architecture Model"
            />
          </div>
        )}
      </main>

      {/* Clean Sample Archetypes Modal */}
      {isSamplesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/[0.08] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Benchmark Masculine Archetypes</h3>
              </div>
              <button
                onClick={() => setIsSamplesModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select a benchmark face to examine how the AI anthropometry engine analyzes different masculine bone structures:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {SAMPLE_FACES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setCompositeScan(null);
                    setVideoScanData(null);
                    setSelectedImage(sample.imageUrl);
                    analyzeImage(sample.imageUrl);
                    setIsSamplesModalOpen(false);
                    setActiveTab('overview');
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06] hover:border-amber-500/50 hover:bg-slate-950 transition-all text-left"
                >
                  <img
                    src={sample.imageUrl}
                    alt={sample.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{sample.name}</div>
                    <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                      {sample.viewMode.toUpperCase()} VIEW
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Diagnostic Report Modal */}
      {metrics && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          metrics={metrics}
          recommendations={recommendations}
          compositeScan={compositeScan}
          imageUrl={selectedImage}
        />
      )}

      {/* 5-Second 360° Video Rotation Scanner Modal */}
      <VideoScan360Modal
        isOpen={is360ScanOpen}
        onClose={() => setIs360ScanOpen(false)}
        onComplete={handleVideoScanComplete}
      />
    </div>
  );
};

export default App;
