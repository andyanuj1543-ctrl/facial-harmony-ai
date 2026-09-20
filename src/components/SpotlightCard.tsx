import React, { useRef, useState, useCallback } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  showCrosshairs?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(245, 158, 11, 0.12)',
  borderColor = 'rgba(255, 255, 255, 0.08)',
  showCrosshairs = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group rounded-2xl bg-[#0d121c] border overflow-hidden transition-colors duration-300 ${className}`}
      style={{ borderColor }}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-500 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 75%)`
        }}
      />

      {/* Top Hairline Light Glint */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Technical Corner Crosshairs '+' */}
      {showCrosshairs && (
        <>
          <span className="pointer-events-none absolute top-2 left-2.5 font-mono text-[9px] text-white/20 select-none">
            +
          </span>
          <span className="pointer-events-none absolute top-2 right-2.5 font-mono text-[9px] text-white/20 select-none">
            +
          </span>
          <span className="pointer-events-none absolute bottom-2 left-2.5 font-mono text-[9px] text-white/20 select-none">
            +
          </span>
          <span className="pointer-events-none absolute bottom-2 right-2.5 font-mono text-[9px] text-white/20 select-none">
            +
          </span>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
