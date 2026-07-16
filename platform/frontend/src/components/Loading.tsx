import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <span className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase animate-pulse">
        Aggregating cluster telemetry...
      </span>
    </div>
  );
};
