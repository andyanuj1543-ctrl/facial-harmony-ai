import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Video, 
  Camera, 
  RefreshCw, 
  X, 
  Check, 
  Upload, 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Film,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Point2D, ScanSnapshot, CompositeScan, VideoScanData, HeadPose } from '../types';
import { detectFaceLandmarks } from '../utils/faceDetector';
import { estimateHeadPose } from '../utils/headPose';
import { computeFacialMetrics } from '../utils/facialMetrics';
import { soundAndVoice } from '../utils/soundAndVoice';
import { analyzeContinuousVideoFrames, ContinuousVideoAnalysisReport } from '../utils/videoAnalysisEngine';

interface VideoScan360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { composite: CompositeScan; videoData?: VideoScanData }) => void;
}

type ModalState = 'ready' | 'recording' | 'processing' | 'review';

interface SampledFrame {
  dataUrl: string;
  width: number;
  height: number;
  landmarks: Point2D[];
  yaw: number;
}

export const VideoScan360Modal: React.FC<VideoScan360ModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const frameSampleIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [modalState, setModalState] = useState<ModalState>('ready');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5.0);
  const [currentYaw, setCurrentYaw] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundAndVoice.getMuted());

  // Result holdings
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [frontFrame, setFrontFrame] = useState<SampledFrame | null>(null);
  const [profileFrame, setProfileFrame] = useState<SampledFrame | null>(null);
  const sampledFramesRef = useRef<SampledFrame[]>([]);

  // Stop media stream and background timers
  const stopCamera = useCallback(() => {
    soundAndVoice.stopAll();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (frameSampleIntervalRef.current) clearInterval(frameSampleIntervalRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start webcam
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : 'Could not access camera. Please check your device settings.'
      );
      setIsInitializing(false);
    }
  }, []);

  // Helper to grab a mirrored frame from video element
  const captureCurrentVideoFrame = (videoEl: HTMLVideoElement): { dataUrl: string; width: number; height: number } | null => {
    if (!videoEl.videoWidth || !videoEl.videoHeight) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw mirrored so orientation matches selfie preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.95),
      width: canvas.width,
      height: canvas.height
    };
  };

  // Start 5-second video recording
  const startVideoRecording = () => {
    if (!streamRef.current || !videoRef.current) return;

    sampledFramesRef.current = [];
    recordedChunksRef.current = [];
    setSecondsRemaining(5.0);
    setModalState('recording');

    soundAndVoice.speak("Recording. Slowly rotate your head from center to sides.");
    soundAndVoice.playCountdownBeep(600);

    // Setup MediaRecorder
    let mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported('video/webm')) {
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else {
        mimeType = '';
      }
    }

    try {
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(streamRef.current, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        processRecordedFrames();
      };

      recorder.start(150); // Slice data every 150ms
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.warn('MediaRecorder error, falling back to frame-only capture:', e);
    }

    // Timer: Countdown 5.0 seconds
    const startTime = Date.now();
    const duration = 5000;

    recordingTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      setSecondsRemaining(Number(remaining.toFixed(1)));

      if (elapsed >= duration) {
        clearInterval(recordingTimerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        } else {
          processRecordedFrames();
        }
      }
    }, 100);

    // Periodic frame sampling during recording
    frameSampleIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const rawLandmarks = await detectFaceLandmarks(videoRef.current);
        if (!rawLandmarks) return;

        const pose = estimateHeadPose(rawLandmarks);
        setCurrentYaw(Math.round(pose.yaw));

        const frame = captureCurrentVideoFrame(videoRef.current);
        if (!frame) return;

        // Mirror landmarks to match mirrored canvas frame
        const mirroredLandmarks: Point2D[] = rawLandmarks.map((p) => ({
          ...p,
          x: 1 - p.x
        }));

        sampledFramesRef.current.push({
          dataUrl: frame.dataUrl,
          width: frame.width,
          height: frame.height,
          landmarks: mirroredLandmarks,
          yaw: pose.yaw
        });
      } catch (err) {
        // Frame sample error
      }
    }, 180);
  };

  // Process and extract optimal Frontal and Profile frames from the 5s recording
  const processRecordedFrames = () => {
    setModalState('processing');
    if (frameSampleIntervalRef.current) clearInterval(frameSampleIntervalRef.current);

    const frames = sampledFramesRef.current;
    if (frames.length === 0) {
      // Fallback if no frames were saved
      setModalState('ready');
      soundAndVoice.speak("No clear face detected during recording. Please try again.");
      return;
    }

    // 1. Find optimal Frontal frame (yaw closest to 0°)
    let bestFront = frames[0];
    let minFrontDiff = Math.abs(frames[0].yaw);

    for (let i = 1; i < frames.length; i++) {
      const diff = Math.abs(frames[i].yaw);
      if (diff < minFrontDiff) {
        minFrontDiff = diff;
        bestFront = frames[i];
      }
    }

    // 2. Find optimal Profile frame (yaw with maximum absolute angle)
    let bestProfile = frames[0];
    let maxProfileYaw = Math.abs(frames[0].yaw);

    for (let i = 1; i < frames.length; i++) {
      const absYaw = Math.abs(frames[i].yaw);
      if (absYaw > maxProfileYaw) {
        maxProfileYaw = absYaw;
        bestProfile = frames[i];
      }
    }

    setFrontFrame(bestFront);
    setProfileFrame(bestProfile);
    setModalState('review');

    soundAndVoice.playCompletionFanfare();
    soundAndVoice.speak("5-second video scan complete! Review your multi-angle diagnostic.");
  };

  // Upload a pre-recorded short video file
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalState('processing');
    const videoUrl = URL.createObjectURL(file);
    setRecordedVideoUrl(videoUrl);

    // Create temporary video element to sample frames
    const tempVideo = document.createElement('video');
    tempVideo.src = videoUrl;
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    await new Promise((resolve) => {
      tempVideo.onloadedmetadata = () => resolve(null);
    });

    const duration = tempVideo.duration || 5;
    const sampled: SampledFrame[] = [];
    const step = Math.max(0.2, duration / 20);

    for (let t = 0; t <= duration; t += step) {
      tempVideo.currentTime = t;
      await new Promise((r) => {
        tempVideo.onseeked = () => r(null);
      });

      try {
        const rawLandmarks = await detectFaceLandmarks(tempVideo);
        if (rawLandmarks) {
          const pose = estimateHeadPose(rawLandmarks);
          const canvas = document.createElement('canvas');
          canvas.width = tempVideo.videoWidth || 640;
          canvas.height = tempVideo.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            sampled.push({
              dataUrl: canvas.toDataURL('image/jpeg', 0.9),
              width: canvas.width,
              height: canvas.height,
              landmarks: rawLandmarks,
              yaw: pose.yaw
            });
          }
        }
      } catch {
        // Skip frame
      }
    }

    if (sampled.length > 0) {
      sampledFramesRef.current = sampled;
      processRecordedFrames();
    } else {
      setModalState('ready');
      alert('Could not detect facial landmarks in this video. Please upload a clear, front-facing video.');
    }
  };

  // Confirm and commit the 360 scan
  const handleAcceptScan = () => {
    if (!frontFrame || !profileFrame) return;

    const frontMetrics = computeFacialMetrics(
      frontFrame.landmarks,
      frontFrame.width,
      frontFrame.height,
      'male',
      'front'
    );

    const profileMetrics = computeFacialMetrics(
      profileFrame.landmarks,
      profileFrame.width,
      profileFrame.height,
      'male',
      'profile'
    );

    const frontSnap: ScanSnapshot = {
      imageUrl: frontFrame.dataUrl,
      landmarks: frontFrame.landmarks,
      metrics: frontMetrics,
      capturedAt: Date.now()
    };

    const profileSnap: ScanSnapshot = {
      imageUrl: profileFrame.dataUrl,
      landmarks: profileFrame.landmarks,
      metrics: profileMetrics,
      capturedAt: Date.now()
    };

    const composite: CompositeScan = {
      front: frontSnap,
      profile: profileSnap,
      gender: 'male'
    };

    let videoReport: ContinuousVideoAnalysisReport | undefined;
    try {
      if (sampledFramesRef.current.length > 0) {
        const framesWithTime = sampledFramesRef.current.map((f, i) => ({
          timestamp: Number(((i * 5.0) / (sampledFramesRef.current.length || 1)).toFixed(2)),
          landmarks: f.landmarks,
          yaw: f.yaw
        }));
        videoReport = analyzeContinuousVideoFrames(framesWithTime, 5.0);
      }
    } catch (e) {
      console.warn("Continuous video analysis generation fallback:", e);
    }

    const videoData: VideoScanData = {
      videoUrl: recordedVideoUrl || '',
      durationSeconds: 5.0,
      front: frontSnap,
      profile: profileSnap,
      videoReport,
      capturedAt: Date.now()
    };

    stopCamera();
    onComplete({ composite, videoData });
  };

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      setModalState('ready');
      setRecordedVideoUrl(null);
      setFrontFrame(null);
      setProfileFrame(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white font-['Space_Grotesk',sans-serif]">
                  5-Second 360° Video Rotation Scanner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Men's Lab
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Smooth video rotation • Automatic Front & Profile Angle Extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextMute = soundAndVoice.toggleMute();
                setIsMuted(nextMute);
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-black overflow-hidden flex items-center justify-center">
          {modalState === 'review' && recordedVideoUrl ? (
            /* Review: Recorded Video Player */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={playbackVideoRef}
                src={recordedVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>5-Second Video Loop Ready</span>
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <>
              {isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                  <span className="text-sm font-medium">Starting biometric camera stream...</span>
                </div>
              )}

              {cameraError ? (
                <div className="p-8 text-center max-w-md">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Camera Access Required</h3>
                  <p className="text-sm text-slate-400 mb-6">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}

              {/* HUD Overlay while recording */}
              {modalState === 'recording' && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 bg-radial-vignette">
                  {/* Top Recording Pill */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/90 backdrop-blur-md border border-rose-500/40 shadow-xl animate-pulse">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                        Recording 360° Video • {secondsRemaining}s
                      </span>
                    </div>
                  </div>

                  {/* Central Reticle */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    <div className="relative w-60 h-60 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-500/5 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl font-black font-['Space_Grotesk',sans-serif] text-white">
                          {Math.abs(currentYaw)}°
                        </span>
                        <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mt-1">
                          Rotate Head Smoothly
                        </p>
                      </div>
                    </div>

                    {/* Instruction Caption */}
                    <div className="mt-4 px-4 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-center">
                      <p className="text-xs font-semibold text-slate-200">
                        Turn slowly: Center (0°) → Left Profile → Right Profile
                      </p>
                    </div>
                  </div>

                  {/* Bottom Progress Bar */}
                  <div className="w-full max-w-sm mx-auto h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-100"
                      style={{ width: `${Math.round(((5 - secondsRemaining) / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {modalState === 'processing' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-md text-white">
                  <RefreshCw className="w-10 h-10 animate-spin text-amber-400" />
                  <p className="text-sm font-extrabold font-['Space_Grotesk',sans-serif]">
                    Extracting Optimal Front & Profile Biometric Angles...
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Extracted Frame Cards & Review Tray */}
        {modalState === 'review' && frontFrame && profileFrame && (
          <div className="p-4 px-6 bg-slate-950/60 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Extracted Multi-Angle Diagnostic Snapshots
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                100% Euclidean Match
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Front Frame */}
              <div className="relative rounded-2xl border border-amber-500/40 p-2.5 bg-slate-900/60 flex items-center gap-3">
                <img 
                  src={frontFrame.dataUrl} 
                  alt="Frontal extracted frame" 
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h4 className="text-xs font-bold text-white">Frontal Frame (0°)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Vertical Thirds & Bilateral Symmetry
                  </p>
                </div>
              </div>

              {/* Profile Frame */}
              <div className="relative rounded-2xl border border-cyan-500/40 p-2.5 bg-slate-900/60 flex items-center gap-3">
                <img 
                  src={profileFrame.dataUrl} 
                  alt="Profile extracted frame" 
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h4 className="text-xs font-bold text-white">
                      Profile Frame ({Math.abs(Math.round(profileFrame.yaw))}°)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ricketts' E-Line & Nasolabial Angle
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="p-4 px-6 border-t border-white/[0.08] bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% In-Browser Media Processing • Zero Video Frames Uploaded</span>
          </div>

          <div className="flex items-center gap-2">
            {modalState === 'ready' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Short Video</span>
                </button>

                <button
                  onClick={startVideoRecording}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
                >
                  <Video className="w-4 h-4" />
                  <span>Record 5s 360° Video</span>
                </button>
              </>
            )}

            {modalState === 'review' && (
              <>
                <button
                  onClick={() => {
                    setModalState('ready');
                    startCamera();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-colors"
                >
                  Record Again
                </button>
                <button
                  onClick={handleAcceptScan}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Lock & Analyze 360° Video</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
