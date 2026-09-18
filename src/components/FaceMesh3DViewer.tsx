import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  Rotate3d, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  Layers, 
  Activity, 
  Sparkles,
  Camera,
  Sun,
  Shield,
  Box,
  Compass,
  Info,
  Crosshair
} from 'lucide-react';
import { Point2D, Gender } from '../types';
import { 
  buildMeshEdges, 
  computeCentroid, 
  computeMeshBounds,
  FaceMeshBounds,
  projectPoint3D, 
  getDepthColor,
  ANATOMICAL_LANDMARKS_3D,
  FACIAL_CONTOURS_3D,
  FACIAL_TRIANGLES_3D,
  AESTHETIC_FACIAL_PLANES_3D,
  computeFacetLighting,
  ProjectedPoint
} from '../utils/faceMesh3DGeometry';

interface FaceMesh3DViewerProps {
  landmarks: Point2D[] | null;
  gender: Gender;
  title?: string;
}

export type RenderMode = 'solid' | 'planes' | 'wireframe' | 'heatmap';

export const FaceMesh3DViewer: React.FC<FaceMesh3DViewerProps> = ({
  landmarks,
  gender,
  title = 'Interactive 3D Face Mesh Wireframe'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D Camera / Transform state
  const [rotX, setRotX] = useState<number>(0.08); // slight tilt down
  const [rotY, setRotY] = useState<number>(0.25); // slight 3/4 angle
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<RenderMode>('solid');
  const [showDenseLattice, setShowDenseLattice] = useState<boolean>(true);
  const [selectedLandmark, setSelectedLandmark] = useState<number | null>(4); // default Nose Tip
  const [hoveredLandmark, setHoveredLandmark] = useState<number | null>(null);
  const [hoveredPlane, setHoveredPlane] = useState<string | null>(null);

  // Interaction tracking & 60fps animation refs
  const isDraggingRef = useRef<boolean>(false);
  const isPanningRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const projectedPointsRef = useRef<ProjectedPoint[]>([]);

  // Synchronized refs to allow silky smooth 60fps rotation without component re-mounting
  const rotXRef = useRef<number>(rotX);
  const rotYRef = useRef<number>(rotY);
  const panXRef = useRef<number>(panX);
  const panYRef = useRef<number>(panY);
  const zoomRef = useRef<number>(zoom);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const renderModeRef = useRef<RenderMode>(renderMode);
  const showDenseLatticeRef = useRef<boolean>(showDenseLattice);
  const selectedLandmarkRef = useRef<number | null>(selectedLandmark);
  const hoveredLandmarkRef = useRef<number | null>(hoveredLandmark);
  const hoveredPlaneRef = useRef<string | null>(hoveredPlane);

  useEffect(() => { rotXRef.current = rotX; }, [rotX]);
  useEffect(() => { rotYRef.current = rotY; }, [rotY]);
  useEffect(() => { panXRef.current = panX; }, [panX]);
  useEffect(() => { panYRef.current = panY; }, [panY]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);
  useEffect(() => { renderModeRef.current = renderMode; }, [renderMode]);
  useEffect(() => { showDenseLatticeRef.current = showDenseLattice; }, [showDenseLattice]);
  useEffect(() => { selectedLandmarkRef.current = selectedLandmark; }, [selectedLandmark]);
  useEffect(() => { hoveredLandmarkRef.current = hoveredLandmark; }, [hoveredLandmark]);
  useEffect(() => { hoveredPlaneRef.current = hoveredPlane; }, [hoveredPlane]);

  // Precomputed edges
  const meshEdges = useMemo(() => buildMeshEdges(), []);

  // 3D Bounding Box & True Geometric Center
  const meshBounds: FaceMeshBounds = useMemo(() => {
    if (!landmarks || landmarks.length === 0) {
      return {
        minX: 0.3,
        maxX: 0.7,
        minY: 0.2,
        maxY: 0.8,
        minZ: -0.1,
        maxZ: 0.1,
        centerX: 0.5,
        centerY: 0.5,
        centerZ: 0,
        width: 0.4,
        height: 0.6,
        depth: 0.2
      };
    }
    return computeMeshBounds(landmarks);
  }, [landmarks]);

  const centroid = useMemo(() => ({
    x: meshBounds.centerX,
    y: meshBounds.centerY,
    z: meshBounds.centerZ
  }), [meshBounds]);

  // Snap to preset angles with auto-centering
  const snapAngle = useCallback((yawDeg: number, pitchDeg: number = 0) => {
    setAutoRotate(false);
    autoRotateRef.current = false;
    const newY = (yawDeg * Math.PI) / 180;
    const newX = (pitchDeg * Math.PI) / 180;
    setRotY(newY);
    setRotX(newX);
    setPanX(0);
    setPanY(0);
    setZoom(1.0);
    rotYRef.current = newY;
    rotXRef.current = newX;
    panXRef.current = 0;
    panYRef.current = 0;
    zoomRef.current = 1.0;
  }, []);

  const handleCenterView = useCallback(() => {
    setPanX(0);
    setPanY(0);
    setZoom(1.0);
    panXRef.current = 0;
    panYRef.current = 0;
    zoomRef.current = 1.0;
  }, []);

  const handleResetView = useCallback(() => {
    setAutoRotate(true);
    autoRotateRef.current = true;
    setRotX(0.08);
    setRotY(0.25);
    setPanX(0);
    setPanY(0);
    setZoom(1.0);
    rotXRef.current = 0.08;
    rotYRef.current = 0.25;
    panXRef.current = 0;
    panYRef.current = 0;
    zoomRef.current = 1.0;
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Accurate CSS layout dimensions of container
      const rect = containerRef.current?.getBoundingClientRect();
      const cssWidth = rect && rect.width > 0 ? rect.width : (canvas.clientWidth || 800);
      const cssHeight = rect && rect.height > 0 ? rect.height : (canvas.clientHeight || 560);
      const dpr = window.devicePixelRatio || 1;

      const targetBufferW = Math.round(cssWidth * dpr);
      const targetBufferH = Math.round(cssHeight * dpr);

      // Keep internal pixel buffer in sync with device screen resolution
      if (canvas.width !== targetBufferW || canvas.height !== targetBufferH) {
        canvas.width = targetBufferW;
        canvas.height = targetBufferH;
      }

      // CRITICAL HIGH-DPI FIX: Explicitly set matrix to scale 1 CSS pixel -> dpr device pixels.
      // This prevents double-scaling bugs on Mac Retina screens and keeps face perfectly centered!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Auto rotation update
      if (autoRotateRef.current && !isDraggingRef.current && !isPanningRef.current) {
        rotYRef.current = (rotYRef.current + 0.007) % (Math.PI * 2);
      }

      if (!landmarks || landmarks.length < 468) {
        // Empty state
        ctx.fillStyle = '#64748b';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No 3D landmarks available to project', cssWidth / 2, cssHeight / 2);
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const currentRotX = rotXRef.current;
      const currentRotY = rotYRef.current;
      const currentZoom = zoomRef.current;
      const currentPanX = panXRef.current;
      const currentPanY = panYRef.current;
      const currentRenderMode = renderModeRef.current;
      const currentSelectedLandmark = selectedLandmarkRef.current;
      const currentHoveredLandmark = hoveredLandmarkRef.current;
      const currentHoveredPlane = hoveredPlaneRef.current;
      const currentShowDense = showDenseLatticeRef.current;

      // Perfectly centered on CSS container with pan offset
      const centerX = cssWidth / 2 + currentPanX;
      const centerY = cssHeight / 2 + currentPanY;

      // Prominently scale face to fill ~74% of viewport height & ~58% of viewport width
      const targetFaceH = cssHeight * 0.74;
      const targetFaceW = cssWidth * 0.58;
      const scaleH = targetFaceH / meshBounds.height;
      const scaleW = targetFaceW / meshBounds.width;
      const baseScale = Math.min(scaleH, scaleW) * currentZoom;

      // 1. Project all 468 landmarks into 3D camera space
      const projected: ProjectedPoint[] = new Array(landmarks.length);
      let minZ = Infinity;
      let maxZ = -Infinity;

      for (let i = 0; i < landmarks.length; i++) {
        const pt = projectPoint3D(
          landmarks[i],
          i,
          centroid,
          currentRotX,
          currentRotY,
          0,
          baseScale,
          centerX,
          centerY,
          750
        );
        projected[i] = pt;
        if (pt.z < minZ) minZ = pt.z;
        if (pt.z > maxZ) maxZ = pt.z;
      }
      projectedPointsRef.current = projected;

      // 2. Render Holographic Ground Pedestal Grid
      ctx.save();
      const facePixelHalfH = (meshBounds.height * baseScale) / 2;
      const pedestalY = centerY + facePixelHalfH + (24 * currentZoom);
      const pedestalRadiusX = Math.max(70, (meshBounds.width * baseScale) * 0.58);
      const pedestalRadiusY = Math.max(3, pedestalRadiusX * 0.22 * Math.abs(Math.cos(currentRotX)));

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, pedestalY, pedestalRadiusX, Math.max(2, pedestalRadiusY), 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(centerX, pedestalY, pedestalRadiusX * 0.65, Math.max(2, pedestalRadiusY * 0.65), 0, 0, Math.PI * 2);
      ctx.stroke();

      // Cross ticks
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const ang = a + currentRotY;
        const tx1 = centerX + Math.cos(ang) * (pedestalRadiusX * 0.5);
        const ty1 = pedestalY + Math.sin(ang) * pedestalRadiusY * 0.5;
        const tx2 = centerX + Math.cos(ang) * pedestalRadiusX;
        const ty2 = pedestalY + Math.sin(ang) * pedestalRadiusY;
        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Volumetric Shaded Solid Mesh Mode
      if (currentRenderMode === 'solid') {
        ctx.save();
        const lightDir = { x: 0.45, y: -0.55, z: 0.7 };

        const sortedTriangles = FACIAL_TRIANGLES_3D.map(([a, b, c]) => {
          const p1 = projected[a];
          const p2 = projected[b];
          const p3 = projected[c];
          const avgZ = ((p1?.z ?? 0) + (p2?.z ?? 0) + (p3?.z ?? 0)) / 3;
          return { a, b, c, avgZ, p1, p2, p3 };
        }).sort((t1, t2) => t2.avgZ - t1.avgZ);

        for (const tri of sortedTriangles) {
          if (!tri.p1 || !tri.p2 || !tri.p3) continue;

          const { intensity, isBackfacing } = computeFacetLighting(tri.p1, tri.p2, tri.p3, lightDir);
          if (isBackfacing) continue;

          const fillAlpha = 0.28 + intensity * 0.42;
          const r = Math.round(180 + intensity * 65);
          const g = Math.round(120 + intensity * 50);
          const b = Math.round(40 + intensity * 20);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fillAlpha})`;
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.12 + intensity * 0.25})`;
          ctx.lineWidth = 0.8;

          ctx.beginPath();
          ctx.moveTo(tri.p1.x, tri.p1.y);
          ctx.lineTo(tri.p2.x, tri.p2.y);
          ctx.lineTo(tri.p3.x, tri.p3.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Aesthetic Facial Planes Mode
      if (currentRenderMode === 'planes') {
        ctx.save();
        AESTHETIC_FACIAL_PLANES_3D.forEach((plane) => {
          const isHovered = currentHoveredPlane === plane.id;
          const pts = plane.indices.map((idx) => projected[idx]).filter(Boolean);
          if (pts.length < 3) return;

          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();

          ctx.fillStyle = isHovered ? `${plane.color}55` : `${plane.color}25`;
          ctx.strokeStyle = plane.color;
          ctx.lineWidth = isHovered ? 2.5 : 1.5;
          ctx.fill();
          ctx.stroke();

          const avgX = pts.reduce((acc, p) => acc + p.x, 0) / pts.length;
          const avgY = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;

          ctx.fillStyle = '#0f172aee';
          ctx.strokeStyle = plane.color;
          ctx.lineWidth = 1;
          const text = plane.name.split(' ')[0];
          ctx.font = 'bold 9px sans-serif';
          const txtW = ctx.measureText(text).width + 10;
          ctx.beginPath();
          ctx.rect(avgX - txtW / 2, avgY - 7, txtW, 14);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, avgX, avgY);
        });
        ctx.restore();
      }

      // 5. Wireframe Edges / Lattice
      if (currentRenderMode === 'wireframe' || currentRenderMode === 'heatmap' || (currentRenderMode === 'solid' && currentShowDense)) {
        ctx.save();
        ctx.lineWidth = currentRenderMode === 'solid' ? 0.6 : 1.0;

        for (let i = 0; i < meshEdges.length; i++) {
          const [a, b] = meshEdges[i];
          const p1 = projected[a];
          const p2 = projected[b];
          if (!p1 || !p2) continue;

          const avgZ = (p1.z + p2.z) / 2;

          if (currentRenderMode === 'heatmap') {
            ctx.strokeStyle = getDepthColor(avgZ, minZ, maxZ) + '55';
          } else if (currentRenderMode === 'solid') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          } else {
            const alpha = Math.max(0.15, Math.min(0.7, 0.45 - (avgZ / (maxZ - minZ || 1)) * 0.3));
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
          }

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. Major Anatomical Contours
      ctx.save();
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      Object.entries(FACIAL_CONTOURS_3D).forEach(([name, loop]) => {
        if (loop.length < 2) return;

        let strokeColor = '#38bdf8';
        if (name === 'faceOval' || name === 'jawline') strokeColor = '#a855f7';
        else if (name === 'lipsOuter' || name === 'lipsInner') strokeColor = '#ec4899';
        else if (name === 'noseRidge' || name === 'noseBase') strokeColor = '#f59e0b';
        else if (name === 'leftEye' || name === 'rightEye') strokeColor = '#34d399';
        else if (name === 'leftEyebrow' || name === 'rightEyebrow') strokeColor = '#fbbf24';
        else if (name === 'midline') strokeColor = '#f43f5e99';

        ctx.strokeStyle = strokeColor;
        ctx.beginPath();

        let hasStarted = false;
        for (let i = 0; i < loop.length; i++) {
          const pt = projected[loop[i]];
          if (!pt) continue;
          if (!hasStarted) {
            ctx.moveTo(pt.x, pt.y);
            hasStarted = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      });
      ctx.restore();

      // 7. Render 3D Point Vertices
      ctx.save();
      for (let i = 0; i < projected.length; i++) {
        const pt = projected[i];
        const isAnatomical = ANATOMICAL_LANDMARKS_3D[i] !== undefined;
        const isSelected = currentSelectedLandmark === i;
        const isHovered = currentHoveredLandmark === i;

        if (isSelected || isHovered) {
          // Glow halo
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8 * pt.scaleFactor, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4.5 * pt.scaleFactor, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (isAnatomical) {
          // Highlight key clinical landmark
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3 * pt.scaleFactor, 0, Math.PI * 2);
          ctx.fillStyle = ANATOMICAL_LANDMARKS_3D[i].color;
          ctx.fill();
        } else if (currentRenderMode === 'heatmap') {
          // Heatmap dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.4 * pt.scaleFactor, 0, Math.PI * 2);
          ctx.fillStyle = getDepthColor(pt.z, minZ, maxZ);
          ctx.fill();
        } else if (currentRenderMode === 'wireframe') {
          // Cyber point
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.2 * pt.scaleFactor, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
        }
      }
      ctx.restore();

      // 8. Draw Selected/Hovered Landmark Callout Card (Bound within visible CSS container)
      const activeIdx = currentHoveredLandmark ?? currentSelectedLandmark;
      if (activeIdx !== null && projected[activeIdx] && ANATOMICAL_LANDMARKS_3D[activeIdx]) {
        const pt = projected[activeIdx];
        const meta = ANATOMICAL_LANDMARKS_3D[activeIdx];
        const origPt = landmarks[activeIdx];

        ctx.save();
        const cardX = Math.min(cssWidth - 235, Math.max(15, pt.x + 15));
        const cardY = Math.min(cssHeight - 80, Math.max(15, pt.y - 45));

        // Connecting line
        ctx.strokeStyle = '#f59e0b99';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(cardX, cardY + 20);
        ctx.stroke();
        ctx.setLineDash([]);

        // Card background
        ctx.fillStyle = '#0f172ae6';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(cardX, cardY, 220, 68, 8);
        } else {
          ctx.rect(cardX, cardY, 220, 68);
        }
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = meta.color;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(meta.name, cardX + 10, cardY + 20);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 10px sans-serif';
        ctx.fillText(meta.clinicalRole, cardX + 10, cardY + 36);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'mono 10px monospace';
        const depthVal = origPt.z !== undefined ? `${(origPt.z * 100).toFixed(1)}mm` : 'N/A';
        ctx.fillText(`Pt #${activeIdx} • Rel Z: ${depthVal}`, cardX + 10, cardY + 54);
        ctx.restore();
      }

      // Compass Axis Indicator (Bottom Left)
      const compassX = 45;
      const compassY = cssHeight - 45;
      const compassLen = 28;

      ctx.save();
      ctx.lineWidth = 2;
      // X Axis (Red)
      const compX = compassLen * Math.cos(currentRotY);
      const compZ = -compassLen * Math.sin(currentRotY);
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX + compX, compassY);
      ctx.stroke();

      // Y Axis (Green)
      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX, compassY - compassLen);
      ctx.stroke();

      // Z Axis (Blue Depth)
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX + compZ * 0.7, compassY + compZ * 0.4);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('3D AXIS', compassX, compassY + 20);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    landmarks,
    centroid,
    meshBounds,
    meshEdges
  ]);

  // Keep canvas layout synchronized with container size via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      // Dimension changes are smoothly picked up on next requestAnimationFrame
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Mouse / Touch handlers for Orbit and Pan Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    if (e.button === 2 || e.shiftKey) {
      // Right-click or Shift+Click -> Pan
      isPanningRef.current = true;
    } else {
      isDraggingRef.current = true;
      setAutoRotate(false);
      autoRotateRef.current = false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isPanningRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      panXRef.current += deltaX;
      panYRef.current += deltaY;
      setPanX(panXRef.current);
      setPanY(panYRef.current);
      return;
    }

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      rotYRef.current += deltaX * 0.008;
      rotXRef.current = Math.max(-1.2, Math.min(1.2, rotXRef.current + deltaY * 0.008));
      setRotY(rotYRef.current);
      setRotX(rotXRef.current);
      return;
    }

    // Hover detection in CSS pixel coordinates (1:1 with projected points)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closestIdx: number | null = null;
    let closestDist = 16;

    const projected = projectedPointsRef.current;
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      if (!p) continue;
      const d = Math.hypot(p.x - mouseX, p.y - mouseY);
      if (d < closestDist) {
        closestDist = d;
        closestIdx = i;
      }
    }

    setHoveredLandmark(closestIdx);
    hoveredLandmarkRef.current = closestIdx;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closestIdx: number | null = null;
    let closestDist = 18;

    const projected = projectedPointsRef.current;
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      if (!p) continue;
      const d = Math.hypot(p.x - mouseX, p.y - mouseY);
      if (d < closestDist) {
        closestDist = d;
        closestIdx = i;
      }
    }

    if (closestIdx !== null) {
      setSelectedLandmark(closestIdx);
      selectedLandmarkRef.current = closestIdx;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => {
      const next = Math.max(0.6, Math.min(2.5, prev - e.deltaY * 0.0015));
      zoomRef.current = next;
      return next;
    });
  };

  // Touch controls: 1 finger to rotate, 2 fingers to pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setAutoRotate(false);
      autoRotateRef.current = false;
    } else if (e.touches.length === 2) {
      isPanningRef.current = true;
      isDraggingRef.current = false;
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      lastMousePosRef.current = { x: midX, y: midY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      rotYRef.current += deltaX * 0.008;
      rotXRef.current = Math.max(-1.2, Math.min(1.2, rotXRef.current + deltaY * 0.008));
      setRotY(rotYRef.current);
      setRotX(rotXRef.current);
    } else if (e.touches.length === 2 && isPanningRef.current) {
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const deltaX = midX - lastMousePosRef.current.x;
      const deltaY = midY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: midX, y: midY };

      panXRef.current += deltaX;
      panYRef.current += deltaY;
      setPanX(panXRef.current);
      setPanY(panYRef.current);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  // Snapshot PNG export
  const downloadSnapshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `facial-harmony-3d-wireframe-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col w-full bg-[#0d121c] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 px-6 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Box className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-['Space_Grotesk',sans-serif]">
                {title}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Volumetric 3D Facets
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sculpted masculine bone structure & aesthetic planes • {gender.toUpperCase()} Anthropometry
            </p>
          </div>
        </div>

        {/* Style Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-white/[0.06]">
          <button
            onClick={() => setRenderMode('solid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              renderMode === 'solid'
                ? 'bg-white/[0.08] text-white border border-white/[0.12] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Volumetric Solid</span>
          </button>
          <button
            onClick={() => setRenderMode('planes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              renderMode === 'planes'
                ? 'bg-white/[0.08] text-white border border-white/[0.12] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Facial Planes</span>
          </button>
          <button
            onClick={() => setRenderMode('wireframe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              renderMode === 'wireframe'
                ? 'bg-white/[0.08] text-white border border-white/[0.12] font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cyber Lattice</span>
          </button>
          <button
            onClick={() => setRenderMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              renderMode === 'heatmap'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Z-Depth Heatmap</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] md:aspect-[16/10] min-h-[520px] max-h-[740px] bg-gradient-to-b from-[#06090e] via-[#090d16] to-[#06090e] overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* Quick Snap View Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => snapAngle(0, 0)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Front (0°)
            </button>
            <button
              onClick={() => snapAngle(45, -4)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              3/4 Oblique (45°)
            </button>
            <button
              onClick={() => snapAngle(0, -28)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Submental view looking up: examines gonial angle and jawline definition"
            >
              Submental Jaw
            </button>
            <button
              onClick={() => snapAngle(80, 0)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Profile (80°)
            </button>
            <button
              onClick={() => snapAngle(0, 28)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cranial Top
            </button>
          </div>

          {/* Right Action & Euler Angle HUD */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-amber-300 font-bold hidden sm:block">
              Yaw: {Math.round((rotY * 180) / Math.PI) % 360}° • Pitch: {Math.round((rotX * 180) / Math.PI)}°
            </div>

            <button
              onClick={() => {
                const next = !autoRotate;
                setAutoRotate(next);
                autoRotateRef.current = next;
              }}
              title={autoRotate ? 'Pause 360° Rotation' : 'Start 360° Rotation'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                autoRotate
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoRotate ? 'Auto Orbiting' : 'Orbit 360°'}</span>
            </button>

            <button
              onClick={downloadSnapshot}
              title="Save 3D Snapshot PNG"
              className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Orbit & Zoom Navigation Pill */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button
            onClick={() => setZoom((z) => {
              const next = Math.min(2.5, z + 0.15);
              zoomRef.current = next;
              return next;
            })}
            title="Zoom In"
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-300 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => {
              const next = Math.max(0.6, z - 0.15);
              zoomRef.current = next;
              return next;
            })}
            title="Zoom Out"
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
          <button
            onClick={handleCenterView}
            title="Re-Center Model in Viewport"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)]"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Center</span>
          </button>
          <button
            onClick={handleResetView}
            title="Reset Camera & Orientation"
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Left Gesture Hint */}
        <div className="absolute bottom-4 left-24 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/70 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-800/60">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Left-Drag: Orbit • Right / Shift-Drag: Pan • Scroll: Zoom • Tap Vertex to Focus</span>
        </div>
      </div>

      {/* Anatomical Landmark Quick-Selector Bar */}
      <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Key Clinical Anatomical Landmarks
          </span>
          <span className="text-[11px] text-slate-500">
            Click to focus 3D landmark
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ANATOMICAL_LANDMARKS_3D).map(([idxStr, data]) => {
            const idx = Number(idxStr);
            const isSelected = selectedLandmark === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedLandmark(idx);
                  selectedLandmarkRef.current = idx;
                  if (Math.abs(panXRef.current) > 120 || Math.abs(panYRef.current) > 120) {
                    setPanX(0);
                    setPanY(0);
                    panXRef.current = 0;
                    panYRef.current = 0;
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: data.color }} 
                />
                <span>{data.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
