import React, { useState, useEffect, useRef } from 'react';
import { Point2D, FacialMetrics, OverlayOptions } from './types';
import { computeFacialMetrics } from './utils/facialMetrics';
import { generateRecommendations } from './utils/recommendationEngine';
import { detectFaceLandmarks } from './utils/faceDetector';
import { SAMPLE_FACES } from './utils/sampleFaces';
import { FaceCanvas } from './components/FaceCanvas';
import { MetricCard } from './components/MetricCard';
import { RecommendationsView } from './components/RecommendationsView';
import { ReportModal } from './components/ReportModal';
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
  Image as ImageIcon
} from 'lucide-react';

export const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_FACES[0].imageUrl);
  const [landmarks, setLandmarks] = useState<Point2D[] | null>(null);
  const [metrics, setMetrics] = useState<FacialMetrics | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

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

      // Detect 468 landmarks
      const detectedLandmarks = await detectFaceLandmarks(img);
      
      if (!detectedLandmarks) {
        // Explicitly NO face was detected!
        setLandmarks(null);
        setMetrics(null);
        setDetectionError('No human face was detected in this image. Please upload a clear, front-facing portrait.');
        return;
      }

      setDetectionError(null);
      setLandmarks(detectedLandmarks);

      // Compute metrics from detected landmarks
      const computed = computeFacialMetrics(detectedLandmarks, img.naturalWidth || 800, img.naturalHeight || 800);
      setMetrics(computed);
    } catch (err) {
      console.error('Analysis error:', err);
      setLandmarks(null);
      setMetrics(null);
      setDetectionError('Could not process this image. Please ensure it contains a clear, well-lit human face.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Run analysis on mount for default sample
  useEffect(() => {
    analyzeImage(selectedImage);
  }, []);

  // Handle user photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isCameraActive) stopCamera();

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const url = event.target.result as string;
        setSelectedImage(url);
        analyzeImage(url);
      }
    };
    reader.readAsDataURL(file);
  };

  // Webcam controls
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
    analyzeImage(dataUrl);
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
              <p className="text-[10px] text-slate-400 font-medium">Scientific Anthropometry & Style Optimization</p>
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
                <span>Export Report</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Source Controls Bar */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Photo</span>
            </button>

            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Use Webcam</span>
              </button>
            ) : (
              <button
                onClick={captureWebcamSnapshot}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
            )}
          </div>

          {/* Preset Test Faces */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-medium text-slate-400 hidden md:inline">Test Models:</span>
            {SAMPLE_FACES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  if (isCameraActive) stopCamera();
                  setSelectedImage(sample.imageUrl);
                  analyzeImage(sample.imageUrl);
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
                Keep face centered with neutral expression
              </p>
            </div>
          </div>
        )}

        {/* Primary Analysis Viewport Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Face Canvas & Toggles */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Geometric Proportion Analysis
                  </span>
                </div>
                {isProcessing && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting Face & Landmarks...</span>
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

              {/* Toggle Controls - only enabled when face is detected */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-800">
                {[
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
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Scorecard & Biometrics */}
          <div className="lg:col-span-5 space-y-4">
            {metrics ? (
              <>
                {/* Executive Score Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 shadow-2xl transition-all relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Facial Harmony Index
                      </span>
                      <h3 className="text-3xl font-extrabold text-white font-['Space_Grotesk',sans-serif] mt-1">
                        {metrics.harmonyScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Face Shape</span>
                      <span className="inline-block mt-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300">
                        {metrics.faceShape}
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

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Bilateral Symmetry"
                    value={`${metrics.symmetryScore}%`}
                    ideal=">90%"
                    status={metrics.symmetryScore >= 90 ? 'Optimal' : 'Balanced'}
                    description="Balance across the central sagittal axis (eyes, cheekbones, mouth)."
                  />

                  <MetricCard
                    label="Canthal Tilt"
                    value={`${metrics.canthalTiltAngle}°`}
                    ideal="+1° to +5°"
                    status={metrics.canthalTiltType === 'positive' ? 'Optimal' : 'Variant'}
                    description={`Eye corner orientation (${metrics.canthalTiltType} tilt).`}
                  />

                  <MetricCard
                    label="Jaw-to-Cheek"
                    value={metrics.jawToCheekRatio}
                    ideal="0.75 - 0.80"
                    status={
                      metrics.jawToCheekRatio >= 0.75 && metrics.jawToCheekRatio <= 0.82
                        ? 'Optimal'
                        : 'Moderate'
                    }
                    description="Bigonial jaw width relative to bizygomatic cheek width."
                  />

                  <MetricCard
                    label="Intercanthal Ratio"
                    value={metrics.intercanthalRatio}
                    ideal="~1.00"
                    status={
                      Math.abs(metrics.intercanthalRatio - 1.0) < 0.15 ? 'Optimal' : 'Balanced'
                    }
                    description="Distance between inner eyes relative to eye length."
                  />
                </div>
              </>
            ) : detectionError ? (
              /* Alert Card when NO face is detected */
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

        {/* Actionable Recommendations Dashboard - Only shown when face exists */}
        {metrics && (
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Personalized Styling & Grooming Protocols</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actionable advice tailored dynamically to your {metrics.faceShape} face shape and proportions
                </p>
              </div>
              <button
                onClick={() => setIsReportOpen(true)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>View Full Diagnostic Report</span>
              </button>
            </div>

            <RecommendationsView recommendations={recommendations} />
          </section>
        )}
      </main>

      {/* Full PDF / Diagnostic Report Modal */}
      {metrics && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          metrics={metrics}
          recommendations={recommendations}
        />
      )}
    </div>
  );
};

export default App;
