import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { RefreshCw, Play, X, History, Scale, Trash2, GitBranch, ShieldOff } from 'lucide-react';
import { useScope } from '../context/ScopeContext';
import { ActionConfirmationModal } from '../components/ActionConfirmationModal';
import { DisconnectGitOpsModal } from '../components/DisconnectGitOpsModal';
import { TemporaryDeleteModal } from '../components/TemporaryDeleteModal';
import { ReconnectGitOpsModal } from '../components/ReconnectGitOpsModal';

interface DeploymentItem {
  name: string;
  namespace: string;
  status: string;
  replicas: number;
  ready_replicas: number;
  gitopsManaged: boolean;
  manager: string;
  argocd_app_name?: string;
  repo_url?: string;
  targetRevision?: string;
  sync_status?: string;
  health_status?: string;
}

const Deployments: React.FC = () => {
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  
  // Selected app for details side panel drawer
  const [selectedApp, setSelectedApp] = useState<DeploymentItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Action Modals State
  const [modalTarget, setModalTarget] = useState<DeploymentItem | null>(null);
  const [modalAction, setModalAction] = useState<'restart' | 'scale' | 'rollback' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sprint 15.1 & 15.3 GitOps Modals State
  const [disconnectModalTarget, setDisconnectModalTarget] = useState<DeploymentItem | null>(null);
  const [tempDeleteModalTarget, setTempDeleteModalTarget] = useState<DeploymentItem | null>(null);
  const [reconnectModalTarget, setReconnectModalTarget] = useState<DeploymentItem | null>(null);

  const userRole = localStorage.getItem('user_role') || 'Viewer';
  const isDevOpsOrAdmin = ['Administrator', 'Platform Engineer', 'DevOps Engineer'].includes(userRole);
  const isAdmin = userRole === 'Administrator' || userRole === 'Platform Engineer';
  const { getScopeParams } = useScope();

  const fetchDeployments = async () => {
    try {
      const data = await api.getDeployments(undefined, getScopeParams());
      setDeployments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [JSON.stringify(getScopeParams())]);

  const handleSync = async (item: DeploymentItem) => {
    const appName = item.argocd_app_name || item.name;
    setTriggering(appName);
    try {
      await api.syncApplication(appName);
      await fetchDeployments();
    } catch (e: any) {
      alert(e.message || 'ArgoCD sync failed.');
    } finally {
      setTriggering(null);
    }
  };

  const handleOpenDetails = async (item: DeploymentItem) => {
    setSelectedApp(item);
    setHistoryLoading(true);
    try {
      const appName = item.argocd_app_name || item.name;
      const logs = await api.getApplicationHistory(appName);
      setHistoryLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleConfirmAction = async (paramValue?: any) => {
    if (!modalTarget || !modalAction) return;
    setActionLoading(true);
    try {
      if (modalAction === 'restart') {
        await api.restartDeployment(modalTarget.namespace, modalTarget.name);
      } else if (modalAction === 'scale') {
        const replicas = typeof paramValue === 'number' ? paramValue : 2;
        await api.scaleDeployment(modalTarget.namespace, modalTarget.name, replicas);
      } else if (modalAction === 'rollback') {
        await api.rollbackDeployment(modalTarget.namespace, modalTarget.name);
      } else if (modalAction === 'delete') {
        await api.deleteDeployment(modalTarget.namespace, modalTarget.name, false);
      }
      setModalTarget(null);
      setModalAction(null);
      await fetchDeployments();
    } catch (e: any) {
      alert(e.message || 'Deployment action failed due to RBAC policy or cluster state.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Deployment Name',
      accessor: (item: DeploymentItem) => (
        <div className="space-y-1">
          <div className="font-bold text-slate-800 dark:text-white font-mono text-sm flex items-center gap-2">
            {item.name}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {item.namespace}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Replicas: <strong className="text-white">{item.ready_replicas}/{item.replicas}</strong></span>
          </div>
        </div>
      )
    },
    {
      header: 'Management Badge',
      accessor: (item: DeploymentItem) => (
        <div className="space-y-1">
          {item.gitopsManaged ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group relative cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              🟢 GitOps Managed
              
              {/* Detailed GitOps Card Tooltip */}
              <div className="hidden group-hover:block absolute top-full left-0 mt-2 z-40 w-72 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold text-white">
                  <span>ArgoCD Application Info</span>
                  <span className="text-emerald-400 text-[10px] uppercase">{item.sync_status || 'Synced'}</span>
                </div>
                <div className="space-y-1 font-mono text-[10px]">
                  <div><span className="text-slate-500">Manager:</span> <strong className="text-white">{item.manager}</strong></div>
                  <div><span className="text-slate-500">Application:</span> <strong className="text-amber-400">{item.argocd_app_name || item.name}</strong></div>
                  <div><span className="text-slate-500">Repository:</span> <span className="text-blue-400 truncate block">{item.repo_url || 'GitHub (main)'}</span></div>
                  <div><span className="text-slate-500">Revision:</span> <span className="text-slate-300">{item.targetRevision || 'HEAD'}</span></div>
                  <div><span className="text-slate-500">Health:</span> <span className="text-emerald-400">{item.health_status || 'Healthy'}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-700/40">
              ⚪ Kubernetes Managed
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Sync & Health',
      accessor: (item: DeploymentItem) => (
        <div className="space-y-1">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
            (item.sync_status === 'Synced' || !item.gitopsManaged) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {item.sync_status || 'In-Sync'}
          </span>
        </div>
      )
    },
    {
      header: 'Operations Menu',
      accessor: (item: DeploymentItem) => (
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {item.gitopsManaged ? (
            <>
              {/* Runtime Operations: Scale Replicas */}
              {isDevOpsOrAdmin && (
                <button
                  onClick={() => { setModalTarget(item); setModalAction('scale'); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold cursor-pointer"
                  title="Scale Deployment Replicas (Upscale / Downscale)"
                >
                  <Scale className="h-3 w-3" />
                  Scale
                </button>
              )}

              {/* Runtime Operations: Restart Rollout */}
              {isDevOpsOrAdmin && (
                <button
                  onClick={() => { setModalTarget(item); setModalAction('restart'); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold cursor-pointer"
                  title="Runtime Operation: Restart Rollout"
                >
                  <RefreshCw className="h-3 w-3" />
                  Restart
                </button>
              )}

              {/* GitOps Operations: Sync */}
              {isDevOpsOrAdmin && (
                <button
                  onClick={() => handleSync(item)}
                  disabled={triggering === (item.argocd_app_name || item.name)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  title="GitOps Operation: Sync Application with Git Repo"
                >
                  {triggering === (item.argocd_app_name || item.name) ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  Sync
                </button>
              )}

              {/* GitOps Operations: History */}
              <button
                onClick={() => handleOpenDetails(item)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-bold cursor-pointer"
                title="GitOps Operation: View Revisions History"
              >
                <History className="h-3 w-3" />
                History
              </button>

              {/* Danger Zone: Temporary Delete */}
              {isDevOpsOrAdmin && (
                <button
                  onClick={() => setTempDeleteModalTarget(item)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold cursor-pointer"
                  title="Danger Zone: Temporary Maintenance Delete (Self-Heals)"
                >
                  <Trash2 className="h-3 w-3" />
                  Temp Delete
                </button>
              )}

              {/* Danger Zone: Disconnect from GitOps (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => setDisconnectModalTarget(item)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold cursor-pointer"
                  title="Danger Zone: Disconnect from GitOps (Unlocks K8s Lifecycle Actions)"
                >
                  <ShieldOff className="h-3 w-3" />
                  Disconnect
                </button>
              )}

              {/* Protected indicator */}
              <span className="text-[10px] text-slate-500 italic flex items-center gap-0.5">
                🔒 GitOps Protected
              </span>
            </>
          ) : (
            // --- KUBERNETES MANAGED WORKLOAD OPERATIONS ---
            <>
              {/* Scale */}
              {isDevOpsOrAdmin && (
                <button
                  onClick={() => { setModalTarget(item); setModalAction('scale'); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold cursor-pointer"
                >
                  <Scale className="h-3 w-3" />
                  Scale
                </button>
              )}

              {/* Restart */}
              {isDevOpsOrAdmin && (
                <button
                  onClick={() => { setModalTarget(item); setModalAction('restart'); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  Restart
                </button>
              )}

              {/* Reconnect to GitOps */}
              {isDevOpsOrAdmin && (
                <button
                  onClick={() => setReconnectModalTarget(item)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold cursor-pointer"
                  title="Reconnect Deployment to GitOps Management"
                >
                  <GitBranch className="h-3 w-3" />
                  Reconnect to GitOps
                </button>
              )}

              {/* Permanent Delete */}
              {isAdmin && (
                <button
                  onClick={() => { setModalTarget(item); setModalAction('delete'); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <div className="relative">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2.5">
              <GitBranch className="h-7 w-7 text-blue-500" />
              GitOps-Aware Operations Control Plane
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic GitOps ownership detection with RBAC-enforced operational guardrails.
            </p>
          </div>
          <button
            onClick={fetchDeployments}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Workloads
          </button>
        </div>

        <Table columns={columns} data={deployments} emptyMessage="No deployments found in active scope." />
      </div>

      {/* Action Confirmation Modal */}
      {modalTarget && modalAction && (
        <ActionConfirmationModal
          isOpen={true}
          onClose={() => { setModalTarget(null); setModalAction(null); }}
          onConfirm={handleConfirmAction}
          title={
            modalAction === 'scale' ? 'Scale Deployment Replicas' :
            modalAction === 'restart' ? 'Restart Deployment Rollout' :
            modalAction === 'rollback' ? 'Rollback Deployment Revision' :
            'Delete Deployment Workload'
          }
          description={
            modalAction === 'scale' ? `Specify the desired target number of replicas for deployment '${modalTarget.name}'.` :
            modalAction === 'restart' ? `Are you sure you want to trigger a rolling restart for deployment '${modalTarget.name}'?` :
            modalAction === 'rollback' ? `Are you sure you want to undo rollout for deployment '${modalTarget.name}' to the previous revision?` :
            `WARNING: You are about to permanently delete deployment '${modalTarget.name}'.`
          }
          resourceName={modalTarget.name}
          resourceType="Deployment"
          namespace={modalTarget.namespace}
          actionType={modalAction}
          defaultValue={modalAction === 'scale' ? modalTarget.replicas : undefined}
          loading={actionLoading}
        />
      )}

      {/* Sprint 15.1 Disconnect from GitOps Modal */}
      {disconnectModalTarget && (
        <DisconnectGitOpsModal
          isOpen={true}
          onClose={() => setDisconnectModalTarget(null)}
          onSuccess={fetchDeployments}
          appName={disconnectModalTarget.argocd_app_name || disconnectModalTarget.name}
          deploymentName={disconnectModalTarget.name}
          namespace={disconnectModalTarget.namespace}
        />
      )}

      {/* Sprint 15.1 Temporary Delete Modal */}
      {tempDeleteModalTarget && (
        <TemporaryDeleteModal
          isOpen={true}
          onClose={() => setTempDeleteModalTarget(null)}
          onSuccess={fetchDeployments}
          onOpenDisconnect={() => setDisconnectModalTarget(tempDeleteModalTarget)}
          deploymentName={tempDeleteModalTarget.name}
          namespace={tempDeleteModalTarget.namespace}
        />
      )}

      {/* Sprint 15.3 Reconnect to GitOps Modal */}
      {reconnectModalTarget && (
        <ReconnectGitOpsModal
          isOpen={true}
          onClose={() => setReconnectModalTarget(null)}
          onSuccess={fetchDeployments}
          deploymentName={reconnectModalTarget.name}
          namespace={reconnectModalTarget.namespace}
        />
      )}

      {/* Details Sidebar Overlay Drawer */}
      {selectedApp && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl p-8 flex flex-col justify-between transition-transform duration-300">
          <div className="space-y-6 overflow-y-auto pr-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedApp.name}</h3>
                <p className="text-xs text-slate-400">GitOps Revision Timeline & History</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {historyLoading ? (
              <Loading />
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Commit History Logs</h4>
                {historyLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-blue-400 font-bold">Rev #{log.id} ({log.revision.substring(0, 7)})</span>
                      <span className="text-[10px] text-slate-500">{new Date(log.deployedAt || Date.now()).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 font-medium">"{log.commitMessage || 'Automated GitOps Sync'}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Deployments;
