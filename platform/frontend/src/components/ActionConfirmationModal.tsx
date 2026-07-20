import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, RefreshCw, Scale, RotateCcw, Trash2, Zap } from 'lucide-react';

interface ActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paramValue?: any) => void;
  title: string;
  description: string;
  resourceName: string;
  resourceType: string;
  namespace?: string;
  actionType: 'restart' | 'scale' | 'rollback' | 'delete' | 'sync' | 'custom';
  defaultValue?: any;
  loading?: boolean;
}

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  resourceName,
  resourceType,
  namespace,
  actionType,
  defaultValue,
  loading = false
}) => {
  const [paramValue, setParamValue] = useState<any>(defaultValue ?? (actionType === 'scale' ? 2 : ''));

  if (!isOpen) return null;

  const isDestructive = actionType === 'delete' || actionType === 'rollback';

  const getActionIcon = () => {
    switch (actionType) {
      case 'restart': return <RefreshCw className="h-6 w-6 text-blue-400" />;
      case 'scale': return <Scale className="h-6 w-6 text-indigo-400" />;
      case 'rollback': return <RotateCcw className="h-6 w-6 text-amber-400" />;
      case 'delete': return <Trash2 className="h-6 w-6 text-rose-400" />;
      case 'sync': return <Zap className="h-6 w-6 text-emerald-400" />;
      default: return <AlertTriangle className="h-6 w-6 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isDestructive 
                ? 'bg-rose-500/15 border-rose-500/30' 
                : 'bg-blue-500/15 border-blue-500/30'
            }`}>
              {getActionIcon()}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Operations Control Plane Action Confirmation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Affected Resource Context Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Target Resource:</span>
            <span className="font-bold text-white uppercase bg-slate-800 px-2 py-0.5 rounded text-[10px]">{resourceType}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Resource Name:</span>
            <span className="font-mono font-bold text-blue-400">{resourceName}</span>
          </div>
          {namespace && (
            <div className="flex items-center justify-between text-slate-300">
              <span>Namespace Scope:</span>
              <span className="font-mono font-bold text-indigo-400">{namespace}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-300">{description}</p>

        {/* Dynamic Parameter Input (e.g. Scale Replicas) */}
        {actionType === 'scale' && (
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-bold text-slate-300 block">Target Replica Count (Min: 0, Max: 20)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={20}
                value={paramValue}
                onChange={(e) => setParamValue(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                className="w-24 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-base text-center focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-400">Replicas will be updated across cluster workloads.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm(paramValue)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Executing Action...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm & Execute
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
