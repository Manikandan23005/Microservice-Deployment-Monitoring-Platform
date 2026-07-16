import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export const Card: React.FC<CardProps> = ({ title, value, subtext, icon: Icon, trend }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 shadow-sm relative overflow-hidden transition-all duration-300 hover:border-blue-500/35 hover:-translate-y-0.5">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/5 text-blue-500 border border-blue-500/15">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.type === 'positive' ? 'bg-emerald-500/10 text-emerald-500' :
            trend.type === 'negative' ? 'bg-rose-500/10 text-rose-500' :
            'bg-slate-500/10 text-slate-400'
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500 leading-normal">
          {subtext}
        </p>
      )}
    </div>
  );
};
