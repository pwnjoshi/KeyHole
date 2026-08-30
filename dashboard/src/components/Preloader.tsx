import React, { useState, useEffect } from 'react';

interface PreloaderProps {
  isLoading: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShouldRender(false), 350);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-all duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none scale-105'
      }`}
    >
      {/* Top minimal progress line */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-slate-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 w-2/3 animate-[progress_1s_ease-in-out_infinite]" />
      </div>

      {/* Minimal clean centered logo mark with micro-glow */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-sm animate-pulse" />
          <div className="relative w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-slate-800 transition-transform duration-300">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="5.8" r="2.8" fill="#ffffff"/>
              <path d="M6.6 7.2L5.4 13H10.6L9.4 7.2H6.6Z" fill="#ffffff"/>
              <circle cx="8" cy="5.8" r="1.1" fill="#4f46e5"/>
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm tracking-tight text-slate-900">
            KEYHOLE
          </span>
          <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
            MIDNIGHT ZK GATEWAY
          </span>
        </div>
      </div>
    </div>
  );
};
