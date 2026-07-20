import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface EnterpriseEmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EnterpriseEmptyState: React.FC<EnterpriseEmptyStateProps> = ({
  icon: Icon = ShieldAlert,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
      <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto">
        <Icon className="h-6 w-6" />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
