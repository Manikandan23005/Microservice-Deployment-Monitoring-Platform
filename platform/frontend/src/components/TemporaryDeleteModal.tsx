import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldOff, X } from 'lucide-react';
import { api } from '../services/api';

interface TemporaryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenDisconnect: () => void;
  deploymentName: string;
  namespace: string;
}

export const TemporaryDeleteModal: React.FC<TemporaryDeleteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenDisconnect,
  deploymentName,
  namespace
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTemporaryDelete = async () => {
    setLoading(true);
    try {
      await api.deleteDeployment(namespace, deploymentName, true);
      alert(`Temporary maintenance deletion executed for '${deploymentName}'. ArgoCD Self-Healing will recreate it during the next cycle.`);
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message || "Failed to execute temporary maintenance deletion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitOps Managed Deployment</h3>
              <p className="text-xs text-slate-400">Target: <span className="font-mono text-amber-400 font-bold">{deploymentName}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed text-slate-300 font-medium">
            This Deployment is currently managed by ArgoCD. Deleting it directly from Kubernetes will <strong className="text-white">NOT permanently remove it</strong>.
          </p>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold">
              <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
              ArgoCD Self-Healing Guarantee
            </div>
            <p className="leading-relaxed opacity-90">
              ArgoCD Self-Healing will automatically recreate this Deployment during the next reconciliation cycle. This operation is intended only for temporary runtime maintenance.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              onClick={() => { onClose(); onOpenDisconnect(); }}
              disabled={loading}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldOff className="h-3.5 w-3.5" />
              Disconnect from GitOps
            </button>

            <button
              onClick={handleTemporaryDelete}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? 'Executing...' : 'Temporary Delete'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
