import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'chart' | 'list';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 3 }) => {
  if (type === 'table') {
    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 p-4 space-y-3">
        <div className="h-8 bg-slate-200 dark:bg-slate-800/60 rounded-xl animate-shimmer w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-shimmer w-full" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-shimmer w-32" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-shimmer w-16" />
        </div>
        <div className="h-48 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-shimmer w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-shimmer w-3/4" />
          <div className="h-8 bg-slate-100 dark:bg-slate-800/40 rounded animate-shimmer w-1/2" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800/20 rounded animate-shimmer w-full" />
        </div>
      ))}
    </div>
  );
};
