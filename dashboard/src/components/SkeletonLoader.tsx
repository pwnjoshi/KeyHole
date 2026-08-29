import React from 'react';

export const SkeletonText: React.FC<{ width?: string; height?: string; className?: string }> = ({
  width = 'w-full',
  height = 'h-4',
  className = ''
}) => (
  <div className={`bg-slate-200/80 rounded-md animate-pulse ${width} ${height} ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" />
        <div className="space-y-1.5">
          <SkeletonText width="w-32" height="h-4" />
          <SkeletonText width="w-20" height="h-3" />
        </div>
      </div>
      <div className="w-16 h-6 bg-slate-200 rounded-md animate-pulse" />
    </div>
    <div className="space-y-2 pt-2">
      <SkeletonText width="w-full" height="h-3" />
      <SkeletonText width="w-4/5" height="h-3" />
    </div>
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
      <SkeletonText width="w-24" height="h-3" />
      <div className="w-20 h-7 bg-slate-200 rounded-lg animate-pulse" />
    </div>
  </div>
);

export const SkeletonMetric: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card space-y-3">
    <div className="flex items-center justify-between">
      <SkeletonText width="w-24" height="h-3" />
      <div className="w-5 h-5 bg-slate-200 rounded-md animate-pulse" />
    </div>
    <div className="w-16 h-8 bg-slate-200 rounded-md animate-pulse" />
    <SkeletonText width="w-36" height="h-3" />
  </div>
);

export const SkeletonFeedItem: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
        <SkeletonText width="w-28" height="h-3.5" />
      </div>
      <SkeletonText width="w-16" height="h-3" />
    </div>
    <SkeletonText width="w-full" height="h-3" />
  </div>
);
