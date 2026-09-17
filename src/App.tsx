import React, { useState, useEffect, useRef } from 'react';
import { Point2D, FacialMetrics, OverlayOptions, Gender, ViewMode, CompositeScan } from './types';
import { computeFacialMetrics } from './utils/facialMetrics';
import { generateRecommendations } from './utils/recommendationEngine';
import { detectFaceLandmarks } from './utils/faceDetector';
import { SAMPLE_FACES } from './utils/sampleFaces';
import { FaceCanvas } from './components/FaceCanvas';
import { MetricCard } from './components/MetricCard';
import { RecommendationsView } from './components/RecommendationsView';
import { ReportModal } from './components/ReportModal';
import { Scan360Modal } from './components/Scan360Modal';
import { FaceMesh3DViewer } from './components/FaceMesh3DViewer';
import { generateAndDownloadDiagnosticCard } from './utils/diagnosticCardGenerator';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  Sliders, 
  ScanFace, 
  AlertTriangle,
  User,
  RotateCw,
  FileText,
  Columns,
  Rotate3d
} from 'lucide-react';

export const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_FACES[0].imageUrl);
  const [gender, setGender] = useState<Gender>('male');
  const [viewMode, setViewMode] = useState<ViewMode>('front');
  const [landmarks, setLandmarks] = useState<Point2D[] | null>(null);
  const [metrics, setMetrics] = useState<FacialMetrics | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [is360ScanOpen, setIs360ScanOpen] = useState<boolean>(false);
  const [compositeScan, setCompositeScan] = useState<CompositeScan | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
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
  const analyzeImage = async (imageSrc: string, targetGender: Gender = gender, targetView: ViewMode = viewMode) => {
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
        setDetectionError('No human face was detected in this image. Please upload a clear, well-lit photo.');
        return;
      }

      setDetectionError(null);
      setLandmarks(detectedLandmarks);

      const computed = computeFacialMetrics(
        detectedLandmarks, 
        img.naturalWidth || 800, 
        img.naturalHeight || 800,
        targetGender,
        targetView
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

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    if (compositeScan) {
      const frontMetrics = computeFacialMetrics(compositeScan.front.landmarks, 800, 800, newGender, 'front');
      const profileMetrics = computeFacialMetrics(compositeScan.profile.landmarks, 800, 800, newGender, 'profile');
      const updated: CompositeScan = {
        ...compositeScan,
        gender: newGender,
        front: { ...compositeScan.front, metrics: frontMetrics },
        profile: { ...compositeScan.profile, metrics: profileMetrics }
      };
      setCompositeScan(updated);
      if (viewMode === 'front') {
        setMetrics(frontMetrics);
      } else {
        setMetrics(profileMetrics);
      }
    }
  };

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    if (compositeScan) {
      if (newMode === 'front' || newMode === 'dual' || newMode === '3d') {
        setSelectedImage(compositeScan.front.imageUrl);
        setLandmarks(compositeScan.front.landmarks);
        setMetrics(compositeScan.front.metrics);
      } else {
        setSelectedImage(compositeScan.profile.imageUrl);
        setLandmarks(compositeScan.profile.landmarks);
        setMetrics(compositeScan.profile.metrics);
      }
    } else if (newMode === 'dual') {
      setIs360ScanOpen(true);
    }
  };

  const handle360Complete = (composite: CompositeScan) => {
    setCompositeScan(composite);
    setIs360ScanOpen(false);
    setGender(composite.gender);
    setViewMode('dual');
    setSelectedImage(composite.front.imageUrl);
    setLandmarks(composite.front.landmarks);
    setMetrics(composite.front.metrics);
    setDetectionError(null);
  };

  useEffect(() => {
    if (!compositeScan) {
      analyzeImage(selectedImage, gender, viewMode);
    }
  }, [gender, viewMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isCameraActive) stopCamera();
    setCompositeScan(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const url = event.target.result as string;
        setSelectedImage(url);
        analyzeImage(url, gender, viewMode);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Unable to access webcam. Please check browser permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setSelectedImage(dataUrl);
    stopCamera();
    analyzeImage(dataUrl, gender, viewMode);
  };

  const recommendations = metrics ? generateRecommendations(metrics) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Facial Harmony AI" 
              className="w-10 h-10 rounded-xl shadow-lg shadow-amber-500/20 border border-amber-500/30 object-contain p-0.5 bg-slate-900" 
            />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                Facial Harmony <span className="text-amber-400">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Anthropometric Architecture & Diagnostic Proportions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% In-Browser Privacy</span>
            </div>

            {metrics && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Diagnostic Report</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Source & Mode Controls Bar */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            {/* Gender Toggle */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => handleGenderChange('male')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gender === 'male'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👨 Male</span>
              </button>
              <button
                onClick={() => handleGenderChange('female')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gender === 'female'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👩 Female</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => handleViewModeChange('front')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'front'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Front View</span>
              </button>
              <button
                onClick={() => handleViewModeChange('profile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'profile'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Side Profile (E-Line)</span>
              </button>
              <button
                onClick={() => handleViewModeChange('dual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'dual'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dual Split View</span>
                {compositeScan && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
              <button
                onClick={() => handleViewModeChange('3d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === '3d'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5 text-amber-400" />
                <span>3D Wireframe</span>
              </button>
            </div>

            {/* 360 Live Scan Button */}
            <button
              onClick={() => {
                if (isCameraActive) stopCamera();
                setIs360ScanOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>360° Live Scan</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Photo</span>
            </button>

            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>Webcam</span>
              </button>
            ) : (
              <button
                onClick={captureWebcamSnapshot}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Capture</span>
              </button>
            )}
          </div>

          {/* Preset Test Models */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-medium text-slate-400 hidden xl:inline">Test Models:</span>
            {SAMPLE_FACES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  if (isCameraActive) stopCamera();
                  setCompositeScan(null);
                  setGender(sample.gender);
                  setViewMode(sample.viewMode);
                  setSelectedImage(sample.imageUrl);
                  analyzeImage(sample.imageUrl, sample.gender, sample.viewMode);
                }}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                  selectedImage === sample.imageUrl && !detectionError
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <img
                  src={sample.imageUrl}
                  alt={sample.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-700"
                />
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Active Composite Scan Banner */}
        {compositeScan && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-cyan-500/10 border border-amber-500/30 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-bold text-white text-xs tracking-wide uppercase">
                360° Composite Biometric Locked
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                • Frontal & Lateral Profile biometrics recorded
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                Viewing: {viewMode === 'front' ? 'Frontal Symmetry & Thirds' : 'Lateral Ricketts E-Line'}
              </span>
              <button
                onClick={() => setIs360ScanOpen(true)}
                className="text-[11px] text-slate-300 hover:text-white underline ml-1 font-semibold"
              >
                Scan Again
              </button>
            </div>
          </div>
        )}

        {/* Live Camera Viewport if active */}
        {isCameraActive && (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-black max-w-lg mx-auto p-2 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto rounded-xl object-cover"
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={stopCamera}
                className="px-3 py-1 rounded-lg bg-slate-900/80 text-white text-xs border border-slate-700"
              >
                Cancel
              </button>
            </div>
            <div className="text-center py-2">
              <p className="text-xs text-emerald-400 font-medium animate-pulse">
                Keep face centered in view
              </p>
            </div>
          </div>
        )}

        {/* Primary Analysis Viewport Grid */}
        {viewMode === '3d' ? (
          <div className="space-y-6">
            <FaceMesh3DViewer
              landmarks={landmarks}
              gender={gender}
              title="Interactive 3D Face Mesh Wireframe"
            />
            {/* Synchronized Diagnostic Metric Strip */}
            {metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <MetricCard
                  label="Archetype"
                  value={metrics.faceShape}
                  ideal="Natural"
                  status="Optimal"
                  description={metrics.structuralProfile}
                />
                <MetricCard
                  label="Symmetry"
                  value={`${metrics.symmetryPercentage}%`}
                  ideal=">90%"
                  status={metrics.symmetryPercentage >= 90 ? 'Optimal' : 'Balanced'}
                  description={metrics.symmetryStatus}
                />
                <MetricCard
                  label="Thirds (Mid)"
                  value={`${metrics.middleThird}%`}
                  ideal="33.3%"
                  status={Math.abs(metrics.middleThird - 33.3) < 3 ? 'Optimal' : 'Balanced'}
                  description={`${metrics.upperThird}% : ${metrics.middleThird}% : ${metrics.lowerThird}%`}
                />
                <MetricCard
                  label="Mandible Ratio"
                  value={metrics.jawToCheekRatio}
                  ideal={gender === 'female' ? '0.70' : '0.78'}
                  status={gender === 'female' ? (metrics.jawToCheekRatio <= 0.72 ? 'Optimal' : 'Moderate') : (metrics.jawToCheekRatio >= 0.75 ? 'Optimal' : 'Moderate')}
                  description={gender === 'female' ? 'Delicate V-line' : 'Structured jaw'}
                />
                <MetricCard
                  label="Canthal Tilt"
                  value={`${metrics.canthalTiltAngle}°`}
                  ideal="Positive"
                  status={metrics.canthalTiltType === 'positive' ? 'Optimal' : 'Balanced'}
                  description={metrics.canthalTiltType}
                />
                <MetricCard
                  label="F-WHR"
                  value={metrics.fwhr}
                  ideal={gender === 'female' ? '1.80' : '1.90'}
                  status="Balanced"
                  description="Facial Width-to-Height"
                />
              </div>
            )}
          </div>
        ) : viewMode === 'dual' && compositeScan ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: Frontal Portrait Viewport */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Frontal Symmetry & Proportions (0°)
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {compositeScan.front.metrics.symmetryPercentage}% Symmetry
                  </span>
                </div>
                <FaceCanvas
                  imageSrc={compositeScan.front.imageUrl}
                  landmarks={compositeScan.front.landmarks}
                  metrics={compositeScan.front.metrics}
                  overlayOptions={overlayOptions}
                />
                {/* Frontal Toggles */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-800">
                  {[
                    { key: 'showThirds', label: 'Thirds' },
                    { key: 'showFifths', label: 'Fifths' },
                    { key: 'showMidline', label: 'Midline' },
                    { key: 'showTilt', label: 'Eye Tilt' },
                    { key: 'showJawline', label: 'Jawline' },
                    { key: 'showLandmarks', label: 'Mesh' },
                  ].map(({ key, label }) => {
                    const isActive = (overlayOptions as any)[key];
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setOverlayOptions(prev => ({
                            ...prev,
                            [key]: !prev[key as keyof OverlayOptions]
                          }))
                        }
                        className={`px-2 py-1 rounded-lg text-xs font-medium border text-center transition-all ${
                          isActive
                            ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 font-bold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Lateral Profile Viewport */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Lateral Ricketts' E-Line Profile (~60°)
                    </span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {compositeScan.profile.metrics.nasolabialAngle ? `${compositeScan.profile.metrics.nasolabialAngle}° Angle` : 'Profile'}
                  </span>
                </div>
                <FaceCanvas
                  imageSrc={compositeScan.profile.imageUrl}
                  landmarks={compositeScan.profile.landmarks}
                  metrics={compositeScan.profile.metrics}
                  overlayOptions={overlayOptions}
                />
                {/* Profile Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                  {[
                    { key: 'showELine', label: "E-Line" },
                    { key: 'showProfileAngles', label: 'Nose Angle' },
                    { key: 'showJawline', label: 'Jaw Slope' },
                    { key: 'showLandmarks', label: 'Mesh' },
                  ].map(({ key, label }) => {
                    const isActive = (overlayOptions as any)[key];
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setOverlayOptions(prev => ({
                            ...prev,
                            [key]: !prev[key as keyof OverlayOptions]
                          }))
                        }
                        className={`px-2 py-1 rounded-lg text-xs font-medium border text-center transition-all ${
                          isActive
                            ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-300 font-bold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comprehensive Dual Metric Cards Grid */}
            {metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <MetricCard
                  label="Archetype"
                  value={metrics.faceShape}
                  ideal="Natural"
                  status="Optimal"
                  description={metrics.structuralProfile}
                />
                <MetricCard
                  label="Symmetry"
                  value={`${compositeScan.front.metrics.symmetryPercentage}%`}
                  ideal=">90%"
                  status={compositeScan.front.metrics.symmetryPercentage >= 90 ? 'Optimal' : 'Balanced'}
                  description={compositeScan.front.metrics.symmetryStatus}
                />
                <MetricCard
                  label="Thirds (Mid)"
                  value={`${compositeScan.front.metrics.middleThird}%`}
                  ideal="33.3%"
                  status={Math.abs(compositeScan.front.metrics.middleThird - 33.3) < 3 ? 'Optimal' : 'Balanced'}
                  description={`${compositeScan.front.metrics.upperThird}% : ${compositeScan.front.metrics.middleThird}% : ${compositeScan.front.metrics.lowerThird}%`}
                />
                <MetricCard
                  label="Mandible Ratio"
                  value={compositeScan.front.metrics.jawToCheekRatio}
                  ideal={gender === 'female' ? '0.70' : '0.78'}
                  status={gender === 'female' ? (compositeScan.front.metrics.jawToCheekRatio <= 0.72 ? 'Optimal' : 'Moderate') : (compositeScan.front.metrics.jawToCheekRatio >= 0.75 ? 'Optimal' : 'Moderate')}
                  description={gender === 'female' ? 'Delicate V-line' : 'Structured jaw'}
                />
                <MetricCard
                  label="Ricketts E-Line"
                  value={compositeScan.profile.metrics.eLineUpperLipDist ? `${compositeScan.profile.metrics.eLineUpperLipDist.toFixed(1)} mm` : '0 mm'}
                  ideal={gender === 'female' ? 'Behind' : 'Touching'}
                  status={compositeScan.profile.metrics.eLineStatus === 'Balanced Profile' ? 'Optimal' : 'Moderate'}
                  description={compositeScan.profile.metrics.eLineStatus || 'Profile alignment'}
                />
                <MetricCard
                  label="Nasolabial"
                  value={compositeScan.profile.metrics.nasolabialAngle ? `${compositeScan.profile.metrics.nasolabialAngle}°` : '95°'}
                  ideal={gender === 'female' ? '100°–108°' : '90°–95°'}
                  status={compositeScan.profile.metrics.nasolabialStatus || 'Optimal'}
                  description="Columellar angle"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Face Canvas & Toggles */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {viewMode === 'front' ? 'Frontal Proportions Overlay' : 'Side Profile Cephalometric Overlay'}
                    </span>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Measuring 3D Coordinates...</span>
                    </div>
                  )}
                </div>

                {/* The Visual Face Canvas */}
                <FaceCanvas
                  imageSrc={selectedImage}
                  landmarks={landmarks}
                  metrics={metrics}
                  overlayOptions={overlayOptions}
                  detectionError={detectionError}
                />

                {/* Toggle Controls */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-800">
                  {viewMode === 'front' ? (
                    [
                      { key: 'showThirds', label: 'Thirds' },
                      { key: 'showFifths', label: 'Fifths' },
                      { key: 'showMidline', label: 'Midline' },
                      { key: 'showTilt', label: 'Eye Tilt' },
                      { key: 'showJawline', label: 'Jawline' },
                      { key: 'showLandmarks', label: 'Mesh' },
                    ].map(({ key, label }) => {
                      const isActive = (overlayOptions as any)[key];
                      const isDisabled = !landmarks;
                      return (
                        <button
                          key={key}
                          disabled={isDisabled}
                          onClick={() =>
                            setOverlayOptions(prev => ({
                              ...prev,
                              [key]: !prev[key as keyof OverlayOptions]
                            }))
                          }
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                            isDisabled
                              ? 'border-slate-900 bg-slate-950/40 text-slate-600 cursor-not-allowed opacity-50'
                              : isActive
                              ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 font-bold'
                              : 'border-slate-800 bg-slate-950/60 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })
                  ) : (
                    [
                      { key: 'showELine', label: "E-Line" },
                      { key: 'showProfileAngles', label: 'Nose Angle' },
                      { key: 'showJawline', label: 'Jaw Slope' },
                      { key: 'showLandmarks', label: 'Mesh' },
                    ].map(({ key, label }) => {
                      const isActive = (overlayOptions as any)[key];
                      const isDisabled = !landmarks;
                      return (
                        <button
                          key={key}
                          disabled={isDisabled}
                          onClick={() =>
                            setOverlayOptions(prev => ({
                              ...prev,
                              [key]: !prev[key as keyof OverlayOptions]
                            }))
                          }
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                            isDisabled
                              ? 'border-slate-900 bg-slate-950/40 text-slate-600 cursor-not-allowed opacity-50'
                              : isActive
                              ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-300 font-bold'
                              : 'border-slate-800 bg-slate-950/60 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Pure Diagnostic Structure (Zero Arbitrary Scores) */}
            <div className="lg:col-span-5 space-y-4">
              {metrics ? (
                <>
                  {/* Structural Diagnostic Card */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-6 shadow-2xl transition-all relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Facial Architecture Diagnostic
                        </span>
                        <h3 className="text-2xl font-extrabold text-white font-['Space_Grotesk',sans-serif] mt-1">
                          {metrics.faceShape} <span className="text-xs font-normal text-slate-400 capitalize">({metrics.gender})</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{metrics.structuralProfile}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Mode</span>
                        <span className="inline-block mt-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300">
                          {viewMode === 'front' ? 'Frontal' : 'Side Profile'}
                        </span>
                      </div>
                    </div>

                    {/* Vertical Thirds Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>Vertical Balance (Rule of Thirds)</span>
                        <span className="text-white font-semibold">
                          {metrics.upperThird}% : {metrics.middleThird}% : {metrics.lowerThird}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                        <div
                          style={{ width: `${metrics.upperThird}%` }}
                          className="h-full bg-sky-400 rounded-l-full transition-all duration-500"
                          title="Upper Third (Forehead)"
                        />
                        <div
                          style={{ width: `${metrics.middleThird}%` }}
                          className="h-full bg-amber-400 transition-all duration-500"
                          title="Middle Third (Nose & Eyes)"
                        />
                        <div
                          style={{ width: `${metrics.lowerThird}%` }}
                          className="h-full bg-emerald-400 rounded-r-full transition-all duration-500"
                          title="Lower Third (Chin & Jaw)"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Forehead
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Midface
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Lower
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Breakdown Grid (Pure Diagnostic Facts) */}
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
                      label="Jaw-to-Cheek"
                      value={metrics.jawToCheekRatio}
                      ideal={gender === 'female' ? '0.66 - 0.72' : '0.76 - 0.82'}
                      status={
                        gender === 'female'
                          ? metrics.jawToCheekRatio <= 0.72 ? 'Optimal' : 'Moderate'
                          : metrics.jawToCheekRatio >= 0.75 ? 'Optimal' : 'Moderate'
                      }
                      description={gender === 'female' ? 'Tapered V-line / delicate jaw contour.' : 'Mandibular width relative to cheekbones.'}
                    />

                    {viewMode === 'profile' ? (
                      <MetricCard
                        label="Nasolabial Angle"
                        value={`${metrics.nasolabialAngle}°`}
                        ideal={gender === 'female' ? '100°–108°' : '90°–95°'}
                        status={metrics.nasolabialStatus || 'Optimal'}
                        description="Columellar to upper lip angle in profile."
                      />
                    ) : (
                      <MetricCard
                        label="Intercanthal Ratio"
                        value={metrics.intercanthalRatio}
                        ideal="~1.00"
                        status={
                          Math.abs(metrics.intercanthalRatio - 1.0) < 0.15 ? 'Optimal' : 'Balanced'
                        }
                        description="Inner eye spacing relative to eye length."
                      />
                    )}
                  </div>
                </>
              ) : detectionError ? (
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 text-center space-y-3 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-rose-200">No Human Face Detected</h4>
                  <p className="text-xs text-rose-300/80 leading-relaxed max-w-sm mx-auto">
                    {detectionError}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload a Portrait</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                  <ScanFace className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">No Face Analyzed Yet</p>
                  <p className="text-xs text-slate-500 mt-1">Select a model or upload a photo above</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actionable Recommendations Dashboard */}
        {metrics && (
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Personalized Styling & Architectural Protocols</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grooming and aesthetic guidance tailored to your {metrics.faceShape} bone structure ({metrics.gender})
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={async () => {
                    if (!metrics) return;
                    await generateAndDownloadDiagnosticCard(selectedImage, metrics, recommendations, compositeScan);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card (PNG)</span>
                </button>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Diagnostic Report</span>
                </button>
              </div>
            </div>

            <RecommendationsView recommendations={recommendations} />
          </section>
        )}
      </main>

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

      {/* 360 Real-Time Head Rotation Scan Modal */}
      <Scan360Modal
        isOpen={is360ScanOpen}
        gender={gender}
        onClose={() => setIs360ScanOpen(false)}
        onComplete={handle360Complete}
      />
    </div>
  );
};

export default App;
