import { Point2D } from '../types';

declare global {
  interface Window {
    FaceMesh: any;
  }
}

let faceMeshInstance: any = null;
let isInitializing = false;

async function getFaceMesh(): Promise<any> {
  if (faceMeshInstance) return faceMeshInstance;

  if (isInitializing) {
    // Wait for in-progress initialization
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 50));
    }
    if (faceMeshInstance) return faceMeshInstance;
  }

  isInitializing = true;

  // Wait for window.FaceMesh script to load if needed
  let attempts = 0;
  while (!window.FaceMesh && attempts < 40) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }

  if (!window.FaceMesh) {
    isInitializing = false;
    throw new Error('MediaPipe FaceMesh library not loaded');
  }

  const faceMesh = new window.FaceMesh({
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  });

  await faceMesh.initialize();
  faceMeshInstance = faceMesh;
  isInitializing = false;
  return faceMeshInstance;
}

/**
 * Detect facial landmarks using MediaPipe FaceMesh.
 * Returns Point2D[] if a face is detected, or NULL if NO face is detected in the image.
 */
export async function detectFaceLandmarks(
  imageElement: HTMLImageElement | HTMLVideoElement
): Promise<Point2D[] | null> {
  try {
    const faceMesh = await getFaceMesh();

    // Draw to an offscreen canvas to guarantee clean pixels and dimensions
    const width = ('naturalWidth' in imageElement ? imageElement.naturalWidth : imageElement.videoWidth) || 640;
    const height = ('naturalHeight' in imageElement ? imageElement.naturalHeight : imageElement.videoHeight) || 480;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(imageElement, 0, 0, width, height);

    return new Promise<Point2D[] | null>((resolve) => {
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 6000);

      faceMesh.onResults((results: any) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          resolve(results.multiFaceLandmarks[0]);
        } else {
          // Strictly NO face detected!
          resolve(null);
        }
      });

      faceMesh.send({ image: offscreen }).catch((err: any) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.warn('FaceMesh process error:', err);
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.warn('Face detection error:', err);
    return null;
  }
}
