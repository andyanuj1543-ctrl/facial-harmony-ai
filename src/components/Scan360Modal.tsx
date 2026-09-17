import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, ArrowRight, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Gender, Point2D, ScanSnapshot, CompositeScan, HeadPose } from '../types';
import { detectFaceLandmarks } from '../utils/faceDetector';
import { estimateHeadPose } from '../utils/headPose';
import { computeFacialMetrics } from '../utils/facialMetrics';
import { soundAndVoice } from '../utils/soundAndVoice';

interface Scan360ModalProps {
  isOpen: boolean;
  gender: Gender;
  onClose: () => void;
  onComplete: (composite: CompositeScan) => void;
}

type ScanStage = 'front' | 'turning' | 'profile' | 'completed';

export const Scan360Modal: React.FC<Scan360ModalProps> = ({
  isOpen,
  gender,
  onClose,
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDetectingRef = useRef<boolean>(false);

  const [stage, setStage] = useState<ScanStage>('front');
  const [pose, setPose] = useState<HeadPose>({
    yaw: 0,
    pitch: 0,
    roll: 0,
    isFrontal: false,
    isProfile: false,
    turnProgress: 0,
    direction: 'center'
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(soundAndVoice.getMuted());

  // Snapshot holding
  const [frontSnapshot, setFrontSnapshot] = useState<ScanSnapshot | null>(null);
  const [profileSnapshot, setProfileSnapshot] = useState<ScanSnapshot | null>(null);
  const frontSnapshotRef = useRef<ScanSnapshot | null>(null);
  const latestLandmarksRef = useRef<Point2D[] | null>(null);

  // Auto-capture countdowns
  const frontStableTimerRef = useRef<number>(0);
  const profileStableTimerRef = useRef<number>(0);
  const lastCountdownRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Helper to grab snapshot data URL from current video frame
  const captureFrame = useCallback((): { dataUrl: string; width: number; height: number } | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw video frame (mirror horizontally so it matches preview)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.95),
      width: canvas.width,
      height: canvas.height
    };
  }, []);

  // Stop media stream
  const stopCamera = useCallback(() => {
    soundAndVoice.stopAll();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
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
      soundAndVoice.speak("Please look straight at the camera.");
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Could not access camera. Please check your device settings.'
      );
      setIsInitializing(false);
    }
  }, []);

  // Capture Front Logic
  const handleCaptureFront = useCallback(async (landmarks: Point2D[]) => {
    const frame = captureFrame();
    if (!frame) return;

    // Mirror landmarks along X to match the horizontally mirrored frame
    const mirroredLandmarks: Point2D[] = landmarks.map(p => ({
      ...p,
      x: 1 - p.x
    }));

    const metrics = computeFacialMetrics(mirroredLandmarks, frame.width, frame.height, gender, 'front');
    const snap: ScanSnapshot = {
      imageUrl: frame.dataUrl,
      landmarks: mirroredLandmarks,
      metrics,
      capturedAt: Date.now()
    };
    frontSnapshotRef.current = snap;
    setFrontSnapshot(snap);
    setStage('turning');
    frontStableTimerRef.current = 0;
    setCountdown(null);
    lastCountdownRef.current = null;
    soundAndVoice.playSuccessChime();
    soundAndVoice.speak("Front captured! Now slowly turn your head sideways.");
  }, [captureFrame, gender]);

  // Capture Profile Logic
  const handleCaptureProfile = useCallback(async (landmarks: Point2D[]) => {
    const frame = captureFrame();
    if (!frame) return;

    // Mirror landmarks along X to match the horizontally mirrored frame
    const mirroredLandmarks: Point2D[] = landmarks.map(p => ({
      ...p,
      x: 1 - p.x
    }));

    const metrics = computeFacialMetrics(mirroredLandmarks, frame.width, frame.height, gender, 'profile');
    const snap: ScanSnapshot = {
      imageUrl: frame.dataUrl,
      landmarks: mirroredLandmarks,
      metrics,
      capturedAt: Date.now()
    };
    setProfileSnapshot(snap);
    setStage('completed');
    profileStableTimerRef.current = 0;
    setCountdown(null);
    lastCountdownRef.current = null;
    soundAndVoice.playCompletionFanfare();
    soundAndVoice.speak("Profile captured! 360 scan complete.");

    // If both exist, trigger onComplete after a brief confirmation delay
    const frontSnap = frontSnapshotRef.current || frontSnapshot;
    if (frontSnap) {
      setTimeout(() => {
        stopCamera();
        onComplete({
          front: frontSnap,
          profile: snap,
          gender
        });
      }, 1200);
    }
  }, [captureFrame, gender, frontSnapshot, onComplete, stopCamera]);

  // Continuous frame analysis loop
  useEffect(() => {
    if (!isOpen || cameraError || isInitializing) return;

    let mounted = true;

    const loop = async () => {
      if (!mounted || !videoRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      if (!isDetectingRef.current) {
        isDetectingRef.current = true;
        try {
          const landmarks = await detectFaceLandmarks(videoRef.current);
          if (landmarks && mounted) {
            latestLandmarksRef.current = landmarks;
            const currentPose = estimateHeadPose(landmarks);
            setPose(currentPose);

            // STAGE 1: Looking for Frontal (yaw ~ 0°)
            if (stage === 'front') {
              if (currentPose.isFrontal) {
                frontStableTimerRef.current += 1;
                const remaining = Math.max(1, 3 - Math.floor(frontStableTimerRef.current / 3));
                setCountdown(remaining);

                if (remaining !== lastCountdownRef.current) {
                  lastCountdownRef.current = remaining;
                  soundAndVoice.playCountdownBeep(480 + (4 - remaining) * 50);
                }

                if (frontStableTimerRef.current >= 8) {
                  // Stable for ~0.8s
                  await handleCaptureFront(landmarks);
                }
              } else {
                frontStableTimerRef.current = 0;
                setCountdown(null);
                lastCountdownRef.current = null;
              }
            }
            // STAGE 2: Looking for Profile (yaw >= 50°)
            else if (stage === 'turning' || stage === 'profile') {
              // Voice guidance prompt while turning halfway
              if (currentPose.turnProgress > 45 && !currentPose.isProfile) {
                soundAndVoice.speak("Keep turning sideways...", false);
              }

              if (currentPose.isProfile) {
                profileStableTimerRef.current += 1;
                const remaining = Math.max(1, 3 - Math.floor(profileStableTimerRef.current / 3));
                setCountdown(remaining);

                if (remaining !== lastCountdownRef.current) {
                  lastCountdownRef.current = remaining;
                  soundAndVoice.playCountdownBeep(560 + (4 - remaining) * 50);
                }

                if (profileStableTimerRef.current >= 8) {
                  // Stable for ~0.8s
                  await handleCaptureProfile(landmarks);
                }
              } else {
                profileStableTimerRef.current = 0;
                setCountdown(null);
                lastCountdownRef.current = null;
              }
            }
          }
        } catch (e) {
          console.warn('Real-time tracking tick error:', e);
        } finally {
          isDetectingRef.current = false;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      mounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, cameraError, isInitializing, stage, handleCaptureFront, handleCaptureProfile]);

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      setStage('front');
      setFrontSnapshot(null);
      setProfileSnapshot(null);
      frontSnapshotRef.current = null;
      latestLandmarksRef.current = null;
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
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif] tracking-tight">
                360° Real-time Head Rotation Scan
              </h2>
              <p className="text-xs text-slate-400">
                Turn your head slowly to capture both Frontal & Lateral Profile harmony
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                soundAndVoice.setMuted(nextMuted);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isMuted
                  ? 'border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              }`}
              title={isMuted ? 'Unmute Voice & Sound' : 'Mute Voice & Sound'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Viewport with HUD */}
        <div className="relative aspect-[4/3] w-full bg-black overflow-hidden flex items-center justify-center">
          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-sm">Starting biometric camera stream...</span>
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

          {/* Real-time Angle & Stage HUD */}
          {!cameraError && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              
              {/* Top Step Pill */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 shadow-lg">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    stage === 'completed'
                      ? 'bg-emerald-400 animate-pulse'
                      : stage === 'turning' || stage === 'profile'
                      ? 'bg-sky-400 animate-pulse'
                      : 'bg-amber-400 animate-pulse'
                  }`} />
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    {stage === 'front' && 'Step 1: Center Frontal View'}
                    {(stage === 'turning' || stage === 'profile') && 'Step 2: Turn Head Sideways (Profile)'}
                    {stage === 'completed' && '360° Scan Complete!'}
                  </span>
                </div>
              </div>

              {/* Central Target Reticle & Angle Meter */}
              <div className="flex flex-col items-center justify-center my-auto">
                <div className={`relative w-64 h-64 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
                  stage === 'front'
                    ? pose.isFrontal
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
                      : 'border-amber-400/60 bg-amber-500/5'
                    : pose.isProfile
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
                    : 'border-sky-400/60 bg-sky-500/5'
                }`}>
                  {/* Rotating needle / arc indicator */}
                  <div
                    className="absolute w-1 h-28 bg-gradient-to-t from-transparent to-amber-400 rounded-full origin-bottom transition-transform duration-100"
                    style={{
                      bottom: '50%',
                      transform: `rotate(${pose.yaw * 1.5}deg)`
                    }}
                  />

                  {/* Centered Countdown or Checkmark */}
                  {countdown !== null ? (
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-xl animate-bounce">
                      {countdown}
                    </div>
                  ) : stage === 'completed' ? (
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-xl">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl font-black font-['Space_Grotesk',sans-serif] text-white tracking-tight">
                        {Math.abs(pose.yaw)}°
                      </span>
                      <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        {pose.direction === 'center' ? 'Centered' : `${pose.direction} rotation`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Directive Guidance Caption */}
                <div className="mt-4 px-4 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-center">
                  <p className="text-xs font-medium text-slate-200">
                    {stage === 'front' && (
                      pose.isFrontal
                        ? 'Hold steady... Capturing frontal symmetry'
                        : 'Look directly forward at the camera'
                    )}
                    {(stage === 'turning' || stage === 'profile') && (
                      pose.isProfile
                        ? 'Hold steady... Capturing lateral E-line profile'
                        : `Turn head ${pose.turnProgress}% — aim for >50° profile`
                    )}
                    {stage === 'completed' && 'Processing 360° Facial Harmony Composite...'}
                  </p>
                </div>
              </div>

              {/* Bottom Progress Tracker */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  frontSnapshot
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : stage === 'front'
                    ? 'bg-slate-900/90 border-amber-500/40 text-amber-400'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    frontSnapshot ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {frontSnapshot ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Front View</div>
                    <div className="text-[10px] text-slate-400">
                      {frontSnapshot ? 'Captured (0°)' : 'Thirds & Fifths'}
                    </div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  profileSnapshot
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : stage === 'turning' || stage === 'profile'
                    ? 'bg-slate-900/90 border-sky-500/40 text-sky-400'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    profileSnapshot ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {profileSnapshot ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Side Profile</div>
                    <div className="text-[10px] text-slate-400">
                      {profileSnapshot ? 'Captured (60°)' : 'Ricketts E-Line'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer info & manual bypass */}
        <div className="p-4 px-6 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client-Side Processing • No Biometric Frames Uploaded</span>
          </div>

          <div className="flex items-center gap-2">
            {stage === 'turning' && (
              <button
                onClick={() => {
                  setStage('front');
                  setFrontSnapshot(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
              >
                Retake Front
              </button>
            )}
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
