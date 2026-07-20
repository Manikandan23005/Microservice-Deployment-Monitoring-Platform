import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { PodInfo } from '../types';
import { useScope } from '../context/ScopeContext';
import { ActionConfirmationModal } from '../components/ActionConfirmationModal';
import { RefreshCw, Trash2, FileText } from 'lucide-react';

const Pods: React.FC = () => {
  const [pods, setPods] = useState<PodInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPod, setSelectedPod] = useState<PodInfo | null>(null);
  const [modalAction, setModalAction] = useState<'restart' | 'delete' | null>(null);
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
    { header: 'Pod Name', accessor: (item: PodInfo) => <span className="font-mono font-bold text-slate-800 dark:text-white">{item.name}</span> },
    { header: 'Namespace', accessor: (item: PodInfo) => <span className="font-mono text-xs text-blue-400">{item.namespace}</span> },
    {
      header: 'Status',
      accessor: (item: PodInfo) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          item.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
          item.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
          'bg-rose-500/10 text-rose-500 animate-pulse border border-rose-500/20'
        }`}>
          {item.status}
        </span>
      )
    },
    { header: 'Restarts', accessor: (item: PodInfo) => <span className={item.restarts > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{item.restarts}</span> },
    {
      header: 'Actions',
      accessor: (item: PodInfo) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => window.location.href = `/logs?pod=${item.name}&ns=${item.namespace}`}
            className="px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            Logs
          </button>
          
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
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Active Pod Instances</h2>
        <button
          onClick={loadPods}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Workloads
        </button>
      </div>

      {loading ? <Loading /> : <Table columns={columns} data={pods} emptyMessage="No pods running." />}

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
    </div>
  );
};

export default Pods;
