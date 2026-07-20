import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';

interface TemporaryDeletePodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  podName: string;
  namespace: string;
  deploymentName?: string;
  applicationName?: string;
}

export const TemporaryDeletePodModal: React.FC<TemporaryDeletePodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  podName,
  namespace,
  deploymentName,
  applicationName
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deletePod(namespace, podName);
      alert(`Pod '${podName}' deleted successfully. The ReplicaSet controller is spawning a replacement pod.`);
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message || "Failed to delete Pod.");
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
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitOps Managed Pod</h3>
              <p className="text-xs text-slate-400">Target: <span className="font-mono text-amber-400 font-bold">{podName}</span></p>
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
          <p className="leading-relaxed">
            This Pod belongs to Deployment <span className="font-mono text-white font-bold">{deploymentName || podName}</span> managed by ArgoCD (<span className="text-amber-400 font-bold">{applicationName || 'GitOps'}</span>).
          </p>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              Deletion Safety Guarantee
            </div>
            <p className="leading-relaxed opacity-90">
              Deleting the Pod is completely safe. The ReplicaSet/Deployment controller will automatically create a replacement Pod immediately. ArgoCD will continue managing the Deployment.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? 'Deleting...' : 'Delete Pod'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
