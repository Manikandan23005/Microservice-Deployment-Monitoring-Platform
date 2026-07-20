import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { useScope } from '../context/ScopeContext';
import { ActionConfirmationModal } from '../components/ActionConfirmationModal';
import { TemporaryDeletePodModal } from '../components/TemporaryDeletePodModal';
import { RefreshCw, Trash2, FileText, ExternalLink, Box, GitBranch } from 'lucide-react';

interface PodItem {
  name: string;
  podName?: string;
  namespace: string;
  status: string;
  restarts: number;
  gitopsManaged: boolean;
  deploymentName?: string;
  applicationName?: string;
  ownerKind?: string;
  ownerName?: string;
  manager?: string;
}

const Pods: React.FC = () => {
  const [pods, setPods] = useState<PodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPod, setSelectedPod] = useState<PodItem | null>(null);
  const [modalAction, setModalAction] = useState<'restart' | 'delete' | null>(null);
  const [tempDeletePodTarget, setTempDeletePodTarget] = useState<PodItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { getScopeParams } = useScope();

  const userRole = localStorage.getItem('user_role') || 'Viewer';
  const canOperate = ['Administrator', 'Platform Engineer', 'DevOps Engineer'].includes(userRole);

  const loadPods = () => {
    setLoading(true);
    api.getPods(undefined, getScopeParams()).then((data) => {
      setPods(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadPods();
  }, [JSON.stringify(getScopeParams())]);

  const handleConfirmAction = async () => {
    if (!selectedPod || !modalAction) return;
    setActionLoading(true);
    try {
      if (modalAction === 'restart') {
        await api.restartPod(selectedPod.namespace, selectedPod.name);
      } else if (modalAction === 'delete') {
        await api.deletePod(selectedPod.namespace, selectedPod.name);
      }
      setSelectedPod(null);
      setModalAction(null);
      loadPods();
    } catch (e: any) {
      alert(e.message || 'Operation failed due to RBAC policy or cluster exception.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Pod Name',
      accessor: (item: PodItem) => (
        <div className="space-y-1">
          <div className="font-mono font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <Box className="h-4 w-4 text-blue-400" />
            {item.name}
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span>Namespace: <strong className="text-blue-400">{item.namespace}</strong></span>
            {item.ownerKind && <span>Owner: <strong className="text-slate-300">{item.ownerKind}</strong></span>}
          </div>
        </div>
      )
    },
    {
      header: 'Management Badge',
      accessor: (item: PodItem) => (
        <div className="space-y-1">
          {item.gitopsManaged ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group relative cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              🟢 GitOps Managed

              {/* Tooltip Card */}
              <div className="hidden group-hover:block absolute top-full left-0 mt-2 z-40 w-64 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold text-white">
                  <span>GitOps Ownership</span>
                  <span className="text-emerald-400 text-[10px] font-mono">ArgoCD</span>
                </div>
                <div><span className="text-slate-500">Deployment:</span> <strong className="text-white">{item.deploymentName || 'N/A'}</strong></div>
                <div><span className="text-slate-500">Application:</span> <strong className="text-amber-400">{item.applicationName || 'N/A'}</strong></div>
                <div><span className="text-slate-500">Parent:</span> <span className="font-mono text-slate-300">{item.ownerKind} ({item.ownerName})</span></div>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-700/40">
              ⚪ Kubernetes Managed
            </div>
          )}
          {item.deploymentName && (
            <div className="text-[10px] text-slate-400 font-mono">
              Deployment: <span className="text-white font-bold">{item.deploymentName}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Status & Restarts',
      accessor: (item: PodItem) => (
        <div className="space-y-1">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            item.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
            item.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
            'bg-rose-500/10 text-rose-500 animate-pulse border border-rose-500/20'
          }`}>
            {item.status}
          </span>
          <div className="text-[11px] text-slate-400">
            Restarts: <strong className={item.restarts > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{item.restarts}</strong>
          </div>
        </div>
      )
    },
    {
      header: 'Operations Menu',
      accessor: (item: PodItem) => (
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {/* Logs */}
          <button
            onClick={() => window.location.href = `/logs?pod=${item.name}&ns=${item.namespace}`}
            className="px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
            title="View Live Loki/K8s Logs"
          >
            <FileText className="h-3.5 w-3.5" />
            Logs
          </button>

          {item.gitopsManaged ? (
            // --- GITOPS MANAGED POD ACTIONS ---
            <>
              {/* Restart */}
              {canOperate && (
                <button
                  onClick={() => { setSelectedPod(item); setModalAction('restart'); }}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 hover:bg-blue-500/20 flex items-center gap-1 cursor-pointer"
                  title="Restart Pod (ReplicaSet auto-creates replacement)"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Restart
                </button>
              )}

              {/* Temporary Delete */}
              {canOperate && (
                <button
                  onClick={() => setTempDeletePodTarget(item)}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400 hover:bg-rose-500/20 flex items-center gap-1 cursor-pointer"
                  title="Temporary Maintenance Delete (ReplicaSet auto-creates replacement)"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Temp Delete
                </button>
              )}

              {/* Open Deployment */}
              <button
                onClick={() => window.location.href = '/deployments'}
                className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                title="Open Deployment Control Plane"
              >
                <ExternalLink className="h-3 w-3" />
                Deployment
              </button>

              {/* Open ArgoCD Application */}
              <button
                onClick={() => window.location.href = '/deployments'}
                className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 hover:bg-amber-500/20 flex items-center gap-1 cursor-pointer"
                title="Open ArgoCD Application"
              >
                <GitBranch className="h-3 w-3" />
                ArgoCD App
              </button>
            </>
          ) : (
            // --- KUBERNETES MANAGED POD ACTIONS ---
            <>
              {canOperate && (
                <>
                  <button
                    onClick={() => { setSelectedPod(item); setModalAction('restart'); }}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 hover:bg-blue-500/20 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Restart
                  </button>

                  <button
                    onClick={() => { setSelectedPod(item); setModalAction('delete'); }}
                    className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400 hover:bg-rose-500/20 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Box className="h-7 w-7 text-blue-500" />
            GitOps-Aware Pod Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic Pod ownership resolution with safe GitOps lifecycle operations.
          </p>
        </div>
        <button
          onClick={loadPods}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Workloads
        </button>
      </div>

      {loading ? <Loading /> : <Table columns={columns} data={pods} emptyMessage="No active pods found." />}

      {/* Confirmation Modal */}
      {selectedPod && modalAction && (
        <ActionConfirmationModal
          isOpen={true}
          onClose={() => { setSelectedPod(null); setModalAction(null); }}
          onConfirm={handleConfirmAction}
          title={modalAction === 'restart' ? 'Restart Kubernetes Pod' : 'Delete Kubernetes Pod'}
          description={modalAction === 'restart' 
            ? `Are you sure you want to restart pod '${selectedPod.name}'? The container will be terminated and replaced by ReplicaSet controller.`
            : `WARNING: You are about to delete pod '${selectedPod.name}'. This action is immediate.`
          }
          resourceName={selectedPod.name}
          resourceType="Pod"
          namespace={selectedPod.namespace}
          actionType={modalAction}
          loading={actionLoading}
        />
      )}

      {/* Temporary Delete Pod Modal */}
      {tempDeletePodTarget && (
        <TemporaryDeletePodModal
          isOpen={true}
          onClose={() => setTempDeletePodTarget(null)}
          onSuccess={loadPods}
          podName={tempDeletePodTarget.name}
          namespace={tempDeletePodTarget.namespace}
          deploymentName={tempDeletePodTarget.deploymentName}
          applicationName={tempDeletePodTarget.applicationName}
        />
      )}
    </div>
  );
};

export default Pods;
