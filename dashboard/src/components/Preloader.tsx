import React from 'react';

interface PreloaderProps {
  isLoading: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-300 pointer-events-none">
      {/* Top minimal progress line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-slate-100 overflow-hidden">
        <div className="h-full bg-indigo-600 w-1/2 animate-[progress_1s_ease-in-out_infinite]" />
      </div>

      {/* Minimal clean centered logo mark */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="5.8" r="2.8" fill="#ffffff"/>
            <path d="M6.6 7.2L5.4 13H10.6L9.4 7.2H6.6Z" fill="#ffffff"/>
            <circle cx="8" cy="5.8" r="1.1" fill="#4f46e5"/>
          </svg>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm tracking-tight text-slate-900">
            KEYHOLE
          </span>
          <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            v1.0
          </span>
        </div>
      </div>
    </div>
  );
};
