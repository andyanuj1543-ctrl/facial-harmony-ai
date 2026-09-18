import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Film, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Compass, 
  Layers, 
  CheckCircle2,
  Stethoscope,
  Volume2,
  Gauge,
  Eye,
  Flame
} from 'lucide-react';
import { Point2D, VideoScanData } from '../types';
import { ContinuousVideoAnalysisReport, VideoFrameTelemetry } from '../utils/videoAnalysisEngine';
import { FACIAL_CONTOURS_3D } from '../utils/faceMesh3DGeometry';

interface ContinuousVideoExaminationProps {
  videoUrl: string;
  report: ContinuousVideoAnalysisReport;
  onJumpToReport?: () => void;
  onListenToAudio?: () => void;
}

export const ContinuousVideoExamination: React.FC<ContinuousVideoExaminationProps> = ({
  videoUrl,
  report,
  onJumpToReport,
  onListenToAudio
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(true);  // Overlay display & orientation states
  const [showContours, setShowContours] = useState<boolean>(true);
  const [flipOverlay, setFlipOverlay] = useState<boolean>(true); // Default true to align camera-recorded telemetry
  const [mirrorVideo, setMirrorVideo] = useState<boolean>(false);
  const [activeTelemetry, setActiveTelemetry] = useState<VideoFrameTelemetry>(report.telemetry[0]);

  // Find telemetry frame matching current video timestamp
  const getTelemetryForTime = useCallback((time: number): VideoFrameTelemetry => {
    if (!report.telemetry || report.telemetry.length === 0) {
      return {
        timestamp: 0,
        yaw: 0,
        pitch: 0,
        roll: 0,
        landmarks: [],
        stage: 'frontal',
        phaseTitle: 'Frontal Baseline Alignment',
        doctorObservation: 'Initial facial plane alignment established.',
        jawSharpness: 85,
        symmetryDelta: 0.05,
        midfaceStability: 90
      };
    }

    if (report.telemetry.length === 1) {
      return report.telemetry[0];
    }
    let closest = report.telemetry[0];
    let minDiff = Math.abs(report.telemetry[0].timestamp - time);

    for (let i = 1; i < report.telemetry.length; i++) {
      const diff = Math.abs(report.telemetry[i].timestamp - time);
      if (diff < minDiff) {
        minDiff = diff;
        closest = report.telemetry[i];
      }
    }
    return closest;
  }, [report]);

  // Update canvas overlay on playback
  useEffect(() => {
    let animFrame: number;

    const renderOverlay = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        animFrame = requestAnimationFrame(renderOverlay);
        return;
      }

      if (video.videoWidth && video.videoHeight) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = video.currentTime;
      setCurrentTime(time);
      const tele = getTelemetryForTime(time);
      setActiveTelemetry(tele);

      if (tele && tele.landmarks && tele.landmarks.length >= 468) {
        const w = canvas.width;
        const h = canvas.height;
        const computeX = (normX: number) => (flipOverlay ? (1 - normX) : normX) * w;

        // 1. Render Facial Mesh Contours
        if (showContours) {
          ctx.save();
          ctx.lineWidth = 2.0;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          Object.entries(FACIAL_CONTOURS_3D).forEach(([name, loop]) => {
            if (loop.length < 2) return;

            let strokeColor = '#38bdf8cc'; // Sky
            if (name === 'jawline' || name === 'faceOval') strokeColor = '#a855f7'; // Purple
            else if (name === 'noseRidge' || name === 'noseBase') strokeColor = '#f59e0b'; // Amber
            else if (name === 'leftEye' || name === 'rightEye') strokeColor = '#34d399'; // Emerald
            else if (name === 'lipsOuter') strokeColor = '#ec4899'; // Rose

            ctx.strokeStyle = strokeColor;
            ctx.beginPath();
            let hasStarted = false;

            for (let i = 0; i < loop.length; i++) {
              const pt = tele.landmarks[loop[i]];
              if (!pt) continue;
              const x = computeX(pt.x);
              const y = pt.y * h;
              if (!hasStarted) {
                ctx.moveTo(x, y);
                hasStarted = true;
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
          });
          ctx.restore();
        }

        // 2. Render 468 Landmark Dots
        if (showMeshOverlay) {
          ctx.save();
          for (let i = 0; i < tele.landmarks.length; i += 2) {
            const pt = tele.landmarks[i];
            const x = computeX(pt.x);
            const y = pt.y * h;

            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
            ctx.fill();
          }

          // Highlight Chin 152 and Gonions 58, 288
          [152, 58, 288, 4].forEach((idx) => {
            const pt = tele.landmarks[idx];
            if (pt) {
              const x = computeX(pt.x);
              const y = pt.y * h;
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          });

          ctx.restore();
        }

        // 3. Dynamic Jawline Tracking Ribbon
        ctx.save();
        const chin = tele.landmarks[152];
        const rGonion = tele.landmarks[58];
        const lGonion = tele.landmarks[288];

        if (chin && rGonion && lGonion) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(computeX(rGonion.x), rGonion.y * h);
          ctx.lineTo(computeX(chin.x), chin.y * h);
          ctx.lineTo(computeX(lGonion.x), lGonion.y * h);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }

      animFrame = requestAnimationFrame(renderOverlay);
    };

    animFrame = requestAnimationFrame(renderOverlay);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [getTelemetryForTime, showContours, showMeshOverlay, flipOverlay]);

  // Video control helpers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const jumpToPhase = (targetTimestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = targetTimestamp;
      setCurrentTime(targetTimestamp);
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white font-['Space_Grotesk',sans-serif]">
                Clinical Continuous Video Examination
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Motion Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Examining full 360° motion arc, dynamic gonial angle transitions, and rotational bilateral symmetry
            </p>
          </div>
        </div>

        {onListenToAudio && (
          <button
            onClick={onListenToAudio}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
          >
            <Volume2 className="w-4 h-4 stroke-[2.5]" />
            <span>Doctor Voice Briefing</span>
          </button>
        )}
      </div>

      {/* Main Video & HUD Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Video Player with Live Tracking Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-black aspect-[4/3] sm:aspect-video max-h-[500px] shadow-2xl flex items-center justify-center">
            {/* The Video Source */}
            <video
              ref={videoRef}
              src={videoUrl}
              loop
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover transition-transform duration-200 ${mirrorVideo ? 'scale-x-[-1]' : ''}`}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Synchronized Landmark Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none object-cover"
            />

            {/* Live Head Yaw Gauge Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/[0.1] text-xs font-mono font-bold text-white shadow-lg">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Yaw: {activeTelemetry.yaw}°</span>
              <span className="text-[10px] text-slate-400">({activeTelemetry.stage.replace('_', ' ').toUpperCase()})</span>
            </div>

            {/* Toggle Overlay Chips */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 flex-wrap justify-end z-10">
              <button
                onClick={() => setFlipOverlay(!flipOverlay)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all backdrop-blur-md border ${
                  flipOverlay
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-slate-950/70 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
                title="Toggle Landmark Overlay Horizontal Alignment"
              >
                ⇄ {flipOverlay ? 'Aligned' : 'Raw Axis'}
              </button>
              <button
                onClick={() => setMirrorVideo(!mirrorVideo)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all backdrop-blur-md border ${
                  mirrorVideo
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 shadow-sm'
                    : 'bg-slate-950/70 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
                title="Toggle Selfie Video Mirroring"
              >
                {mirrorVideo ? 'Mirrored Video' : 'Normal Video'}
              </button>
              <button
                onClick={() => setShowContours(!showContours)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all backdrop-blur-md border ${
                  showContours
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/70 border-white/[0.08] text-slate-400'
                }`}
              >
                Contours
              </button>
              <button
                onClick={() => setShowMeshOverlay(!showMeshOverlay)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all backdrop-blur-md border ${
                  showMeshOverlay
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/70 border-white/[0.08] text-slate-400'
                }`}
              >
                468 Mesh
              </button>
            </div>
          </div>

          {/* Video Playback & Timeline Controls */}
          <div className="bg-slate-950/70 border border-white/[0.08] rounded-2xl p-4 space-y-3">
            {/* Scrubber Bar */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <input
                type="range"
                min="0"
                max={report.durationSeconds || 5.0}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />

              <span className="text-xs font-mono text-slate-300 font-bold shrink-0 min-w-[50px] text-right">
                {currentTime.toFixed(1)}s / {(report.durationSeconds || 5.0).toFixed(1)}s
              </span>
            </div>

            {/* Examination Phase Quick-Jump Markers */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => jumpToPhase(0.5)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Phase 1 (0.5s)</span>
                </div>
                <div className="text-xs font-semibold text-white truncate">Frontal Balance</div>
              </button>

              <button
                onClick={() => jumpToPhase(2.2)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Phase 2 (2.2s)</span>
                </div>
                <div className="text-xs font-semibold text-white truncate">Left Gonial Sweep</div>
              </button>

              <button
                onClick={() => jumpToPhase(4.0)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/30 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-sky-400 text-[10px] font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Phase 3 (4.0s)</span>
                </div>
                <div className="text-xs font-semibold text-white truncate">Right Arc & Profile</div>
              </button>
            </div>

            {/* Playback Speed Toggles */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.05]">
              <span className="text-slate-400 text-[11px] font-semibold">Inspection Speed:</span>
              <div className="flex items-center gap-1.5">
                {[0.5, 1.0, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeed(rate)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      playbackRate === rate
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x {rate === 0.5 ? '(Slow-Mo)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Doctor's Live Telemetry & Motion Biometrics */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Doctor's Observation Card */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Doctor's Active Observation
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                T: {currentTime.toFixed(1)}s
              </span>
            </div>

            <div className="text-sm font-bold text-white">
              {activeTelemetry.phaseTitle}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-900/60 p-3 rounded-xl border border-white/[0.06]">
              "{activeTelemetry.doctorObservation}"
            </p>
          </div>

          {/* Continuous Motion Biometrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Rotational Symmetry
              </span>
              <div className="text-2xl font-black text-amber-400 font-['Space_Grotesk',sans-serif]">
                {report.rotationalSymmetryPercentage}%
              </div>
              <span className="text-[10px] text-emerald-400 font-medium block">
                Left vs Right sweep parity
              </span>
            </div>

            <div className="bg-slate-950/70 border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Dynamic Mandible
              </span>
              <div className="text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">
                {report.dynamicJawlineDefinitionScore}<span className="text-xs font-normal text-slate-400">/100</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-medium block">
                Sharpness across turning arc
              </span>
            </div>

            <div className="bg-slate-950/70 border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Fluid Retention Index
              </span>
              <div className="text-2xl font-black text-sky-400 font-['Space_Grotesk',sans-serif]">
                {report.softTissueStabilityScore}%
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                Lean bone structure definition
              </span>
            </div>

            <div className="bg-slate-950/70 border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Gonial Trajectory
              </span>
              <div className="text-2xl font-black text-purple-400 font-['Space_Grotesk',sans-serif]">
                {report.gonialTrajectory.leftGonialAngle}° / {report.gonialTrajectory.rightGonialAngle}°
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                L / R mandibular gonial angle
              </span>
            </div>
          </div>

          {/* Doctor Synthesis Narrative */}
          <div className="bg-slate-950/70 border border-white/[0.08] rounded-2xl p-4 space-y-2.5">
            <span className="text-[11px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Video Examination Synthesis</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.doctorSynthesis.executiveSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinuousVideoExamination;
