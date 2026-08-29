import React, { useEffect, useState } from 'react';

export const InteractiveBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [targetPos, setTargetPos] = useState({ x: -500, y: -500 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Smooth Lerp animation loop for the ambient spotlight
    let animationFrameId: number;
    const updatePosition = () => {
      setMousePos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.06,
        y: prev.y + (targetPos.y - prev.y) * 0.06,
      }));
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetPos]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden select-none bg-[#f8fafc]">
      {/* 1. Subtle Precision Enterprise Grid Pattern */}
      <div 
        style={{
          transform: `translateY(${scrollY * 0.05}px)`,
          transition: 'transform 0.1s ease-out'
        }}
        className="absolute inset-0 bg-grid-pattern opacity-40 will-change-transform" 
      />

      {/* 2. Interactive Mouse-Following Radial Spotlight */}
      <div
        style={{
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.06), rgba(168, 85, 247, 0.03), transparent 70%)`,
        }}
        className="absolute inset-0 transition-opacity duration-300"
      />

      {/* 3. Soft Ambient Floating Mesh Glows (Deep Background) */}
      <div 
        style={{
          transform: `translate(${Math.sin(scrollY * 0.002) * 20}px, ${-scrollY * 0.1}px)`,
        }}
        className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl will-change-transform" 
      />
      <div 
        style={{
          transform: `translate(${-Math.cos(scrollY * 0.002) * 20}px, ${-scrollY * 0.08}px)`,
        }}
        className="absolute top-1/3 -right-32 w-80 h-80 bg-purple-200/15 rounded-full blur-3xl will-change-transform" 
      />
      <div 
        style={{
          transform: `translateY(${-scrollY * 0.05}px)`,
        }}
        className="absolute bottom-20 left-1/3 w-80 h-80 bg-sky-200/15 rounded-full blur-3xl will-change-transform" 
      />
    </div>
  );
};
