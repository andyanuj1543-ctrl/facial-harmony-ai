import { Point2D, HeadPose } from '../types';

/**
 * Computes 3D head pose (Yaw, Pitch, Roll) and turn progress from MediaPipe landmarks.
 * Landmarks used:
 * - Glabella / Forehead: #10
 * - Menton / Chin: #152
 * - Left zygoma / tragus (viewer's left): #234
 * - Right zygoma / tragus (viewer's right): #454
 * - Nose tip: #1
 * - Left eye outer canthus: #33
 * - Right eye outer canthus: #263
 */
export function estimateHeadPose(landmarks: Point2D[]): HeadPose {
  if (!landmarks || landmarks.length < 468) {
    return {
      yaw: 0,
      pitch: 0,
      roll: 0,
      isFrontal: true,
      isProfile: false,
      turnProgress: 0,
      direction: 'center'
    };
  }

  const pNose = landmarks[1];
  const pTop = landmarks[10];
  const pChin = landmarks[152];
  const pLeftCheek = landmarks[234];
  const pRightCheek = landmarks[454];
  const pLeftEye = landmarks[33];
  const pRightEye = landmarks[263];

  // 1. Roll calculation (in-plane tilt)
  const dyEye = pRightEye.y - pLeftEye.y;
  const dxEye = pRightEye.x - pLeftEye.x;
  const roll = Math.atan2(dyEye, dxEye) * (180 / Math.PI);

  // 2. Yaw calculation (horizontal head rotation)
  const dLeft = Math.abs(pNose.x - pLeftCheek.x);
  const dRight = Math.abs(pRightCheek.x - pNose.x);
  const totalCheekWidth = dLeft + dRight;

  let ratioYaw = 0;
  if (totalCheekWidth > 0.001) {
    const balance = (dRight - dLeft) / totalCheekWidth;
    ratioYaw = Math.max(-85, Math.min(85, balance * 105));
  }

  // 3D vector cross product if z coordinate is present
  let vectorYaw = ratioYaw;
  if (pNose.z !== undefined && pLeftCheek.z !== undefined && pRightCheek.z !== undefined) {
    const v1 = {
      x: pChin.x - pTop.x,
      y: pChin.y - pTop.y,
      z: (pChin.z || 0) - (pTop.z || 0)
    };
    const v2 = {
      x: pRightCheek.x - pLeftCheek.x,
      y: pRightCheek.y - pLeftCheek.y,
      z: (pRightCheek.z || 0) - (pLeftCheek.z || 0)
    };

    const nx = v1.y * v2.z - v1.z * v2.y;
    const nz = v1.x * v2.y - v1.y * v2.x;

    const angleFrom3D = Math.atan2(nx, -nz) * (180 / Math.PI);
    vectorYaw = ratioYaw * 0.6 + angleFrom3D * 0.4;
  }

  const yaw = Math.round(Math.max(-90, Math.min(90, vectorYaw)));

  // 3. Pitch calculation (up/down tilt)
  const midFaceY = (pTop.y + pChin.y) / 2;
  const faceHeight = Math.abs(pChin.y - pTop.y);
  const pitchOffset = (pNose.y - midFaceY) / (faceHeight || 1);
  const pitch = Math.round((pitchOffset - 0.06) * 90);

  // States
  const absYaw = Math.abs(yaw);
  const isFrontal = absYaw <= 12 && Math.abs(pitch) <= 16;
  const isProfile = absYaw >= 50;
  const turnProgress = Math.min(100, Math.round((absYaw / 60) * 100));

  let direction: 'center' | 'left' | 'right' = 'center';
  if (yaw > 12) direction = 'right';
  else if (yaw < -12) direction = 'left';

  return {
    yaw,
    pitch,
    roll: Math.round(roll),
    isFrontal,
    isProfile,
    turnProgress,
    direction
  };
}
