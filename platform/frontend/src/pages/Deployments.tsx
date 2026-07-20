import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { AppInfo } from '../types';
import { RefreshCw, Play, X, History, Scale, RotateCcw, Trash2 } from 'lucide-react';
import { useScope } from '../context/ScopeContext';
import { ActionConfirmationModal } from '../components/ActionConfirmationModal';

const Deployments: React.FC = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  
  // Selected app for details side panel drawer
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Action Modal State
  const [modalTarget, setModalTarget] = useState<AppInfo | null>(null);
  const [modalAction, setModalAction] = useState<'restart' | 'scale' | 'rollback' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const userRole = localStorage.getItem('user_role') || 'Viewer';
  const isDevOpsOrAdmin = ['Administrator', 'Platform Engineer', 'DevOps Engineer'].includes(userRole);
  const isAdmin = userRole === 'Administrator' || userRole === 'Platform Engineer';
  const { getScopeParams } = useScope();

  const fetchApps = async () => {
    try {
      const data = await api.getApplications(getScopeParams());
      setApps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [JSON.stringify(getScopeParams())]);

  const handleSync = async (appName: string) => {
    setTriggering(appName);
    try {
      await api.syncApplication(appName);
      await fetchApps();
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(null);
    }
  };

  const handleOpenDetails = async (app: AppInfo) => {
    setSelectedApp(app);
    setHistoryLoading(true);
    try {
      const logs = await api.getApplicationHistory(app.name);
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
    const ns = 'devops-nexus-prod';
    try {
      if (modalAction === 'restart') {
        await api.restartDeployment(ns, modalTarget.name);
      } else if (modalAction === 'scale') {
        const replicas = typeof paramValue === 'number' ? paramValue : 2;
        await api.scaleDeployment(ns, modalTarget.name, replicas);
      } else if (modalAction === 'rollback') {
        await api.rollbackDeployment(ns, modalTarget.name);
      } else if (modalAction === 'delete') {
        await api.deleteDeployment(ns, modalTarget.name);
      }
      setModalTarget(null);
      setModalAction(null);
      await fetchApps();
    } catch (e: any) {
      alert(e.message || 'Deployment action failed due to RBAC policy or cluster state.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { header: 'App Name', accessor: (item: AppInfo) => <span className="font-bold text-slate-800 dark:text-white font-mono">{item.name}</span> },
    {
      header: 'Sync Status',
      accessor: (item: AppInfo) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          item.status === 'Synced' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
          item.status === 'OutOfSync' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
          item.status === 'Progressing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
          'bg-rose-500/10 text-rose-500 border border-rose-500/20'
        }`}>
          {item.status}
        </span>
      )
    },
    { header: 'Environment', accessor: (item: AppInfo) => <span className="uppercase text-xs font-bold text-slate-400">{item.environment}</span> },
    { header: 'Revision', accessor: (item: AppInfo) => <span className="font-mono text-xs text-blue-400">{item.targetRevision}</span> },
    {
      header: 'Actions',
      accessor: (item: AppInfo) => (
        <div className="flex items-center justify-end gap-2">
          {/* ArgoCD Sync */}
          <button
            onClick={() => isDevOpsOrAdmin && handleSync(item.name)}
            disabled={triggering === item.name || !isDevOpsOrAdmin}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
              !isDevOpsOrAdmin 
                ? 'bg-slate-800/20 border-slate-800/40 text-slate-500 cursor-not-allowed opacity-50' 
                : 'bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white cursor-pointer'
            }`}
          >
            {triggering === item.name ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Sync
          </button>

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

          {/* Rollback */}
          {isDevOpsOrAdmin && (
            <button
              onClick={() => { setModalTarget(item); setModalAction('rollback'); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Rollback
            </button>
          )}

          {/* Delete (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => { setModalTarget(item); setModalAction('delete'); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}

          <button
            onClick={() => handleOpenDetails(item)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-bold cursor-pointer"
          >
            <History className="h-3 w-3" />
            History
          </button>
        </div>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <div className="relative">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">ArgoCD Declarative Deployments</h2>
          <button
            onClick={fetchApps}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh List
          </button>
        </div>

        <Table columns={columns} data={apps} emptyMessage="No deployments found." />
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
          namespace="devops-nexus-prod"
          actionType={modalAction}
          defaultValue={modalAction === 'scale' ? 2 : undefined}
          loading={actionLoading}
        />
      )}

      {/* Details Sidebar Overlay Drawer */}
      {selectedApp && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl p-8 flex flex-col justify-between transition-transform duration-300">
          <div className="space-y-6 overflow-y-auto pr-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedApp.name}</h3>
                <p className="text-xs text-slate-400">GitOps Release Timeline & Revisions</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                      <span className="text-[10px] text-slate-500">{new Date(log.deployedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 font-medium">"{log.commitMessage}"</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Author: {log.author}</span>
                      {isDevOpsOrAdmin && (
                        <button
                          onClick={() => { setSelectedApp(null); setModalTarget(selectedApp); setModalAction('rollback'); }}
                          className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold hover:bg-amber-500/20"
                        >
                          Rollback Here
                        </button>
                      )}
                    </div>
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
