import React, { useState } from 'react';
import { GitBranch, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';

interface ReconnectGitOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deploymentName: string;
  namespace: string;
}

export const ReconnectGitOpsModal: React.FC<ReconnectGitOpsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  deploymentName,
  namespace
}) => {
  const [reconnectMode, setReconnectMode] = useState<'adopt' | 'restore'>('adopt');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [statusMessage, setStatusMessage] = useState('🟡 Reconnecting...');

  if (!isOpen) return null;

  const handleReconnect = async () => {
    setLoading(true);
    setStatusMessage('🟡 Reconnecting...');
    try {
      setTimeout(() => setStatusMessage('🔵 Syncing with ArgoCD...'), 800);
      await api.reconnectGitOpsApp(deploymentName, reconnectMode, namespace);
      setStatusMessage('🟢 Healthy & Reconnected');
      setStep(2);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (e: any) {
      alert(e.message || "Failed to reconnect deployment to GitOps management.");
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
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reconnect Deployment to GitOps</h3>
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

        {step === 1 ? (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed text-slate-300 font-medium">
              This Deployment is currently managed directly by Kubernetes. Reconnecting it will allow ArgoCD to manage this Deployment again. Choose how you want to reconnect.
            </p>

            {/* Mode Selection Options */}
            <div className="space-y-3 pt-1">
              <label 
                onClick={() => setReconnectMode('adopt')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  reconnectMode === 'adopt'
                    ? 'bg-blue-500/10 border-blue-500/40 text-white shadow-md'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="reconnectMode" 
                  checked={reconnectMode === 'adopt'}
                  onChange={() => setReconnectMode('adopt')}
                  className="mt-0.5 accent-blue-500"
                />
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Adopt Current Deployment
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Import the current Kubernetes Deployment into GitOps. The current Deployment configuration becomes the new desired state stored in Git.
                  </p>
                </div>
              </label>

              <label 
                onClick={() => setReconnectMode('restore')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  reconnectMode === 'restore'
                    ? 'bg-blue-500/10 border-blue-500/40 text-white shadow-md'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="reconnectMode" 
                  checked={reconnectMode === 'restore'}
                  onChange={() => setReconnectMode('restore')}
                  className="mt-0.5 accent-blue-500"
                />
                <div className="space-y-1">
                  <div className="font-bold text-white">Restore Git Version</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Restore the Deployment using the configuration currently stored in Git. Any local changes made while disconnected may be overwritten.
                  </p>
                </div>
              </label>
            </div>

            {loading && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs font-bold text-blue-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {statusMessage}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReconnect}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? statusMessage : 'Reconnect'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
            <h4 className="text-sm font-bold text-white">Successfully Reconnected</h4>
            <p className="text-xs text-slate-400">
              Deployment <span className="font-mono text-white font-bold">{deploymentName}</span> is now 🟢 GitOps Managed.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
