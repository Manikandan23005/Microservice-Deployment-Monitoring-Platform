import React, { useState } from 'react';
import { AlertTriangle, ShieldOff, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';

interface DisconnectGitOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appName: string;
  deploymentName: string;
  namespace: string;
}

export const DisconnectGitOpsModal: React.FC<DisconnectGitOpsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  appName,
  deploymentName,
  namespace
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await api.disconnectGitOpsApp(appName || deploymentName);
      setStep(2);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (e: any) {
      alert(e.message || "Failed to disconnect deployment from GitOps management.");
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
              <ShieldOff className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Disconnect from GitOps</h3>
              <p className="text-xs text-slate-400">Application: <span className="font-mono text-amber-400 font-bold">{appName || deploymentName}</span></p>
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

        {step === 1 ? (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Permanent Reconciliation Disconnection Warning
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                This Deployment is currently managed by ArgoCD. Disconnecting it will permanently stop GitOps reconciliation for this Deployment.
              </p>
            </div>

            <ul className="space-y-2 list-disc pl-4 text-[11px] text-slate-400">
              <li>The live workload in namespace <span className="font-mono text-white font-bold">{namespace}</span> will remain active.</li>
              <li>The tracking ArgoCD Application resource will be safely deleted.</li>
              <li>After disconnecting, it will behave like a normal <span className="text-white font-bold">⚪ Kubernetes Managed</span> deployment.</li>
              <li>Direct lifecycle operations (<span className="text-blue-400 font-bold">Scale</span>, <span className="text-rose-400 font-bold">Delete</span>, <span className="text-emerald-400 font-bold">Update Image</span>) will become unlocked.</li>
            </ul>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
            <h4 className="text-sm font-bold text-white">Successfully Disconnected</h4>
            <p className="text-xs text-slate-400">
              Deployment <span className="font-mono text-white font-bold">{deploymentName}</span> is now ⚪ Kubernetes Managed.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
