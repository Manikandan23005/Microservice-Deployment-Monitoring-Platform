import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { AppInfo } from '../types';
import { RefreshCw, Play, X, History } from 'lucide-react';

const Deployments: React.FC = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  
  // Selected app for details side panel drawer
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchApps = async () => {
    try {
      const data = await api.getApplications();
      setApps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

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

  const handleRollback = async (appName: string, revisionId: number) => {
    setHistoryLoading(true);
    try {
      await api.rollbackApplication(appName, revisionId);
      // Re-fetch data
      const logs = await api.getApplicationHistory(appName);
      setHistoryLogs(logs);
      await fetchApps();
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns = [
    { header: 'App Name', accessor: 'name' as const },
    {
      header: 'Sync Status',
      accessor: (item: AppInfo) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          item.status === 'Synced' ? 'bg-emerald-500/10 text-emerald-500' :
          item.status === 'OutOfSync' ? 'bg-amber-500/10 text-amber-500' :
          item.status === 'Progressing' ? 'bg-blue-500/10 text-blue-500' :
          'bg-rose-500/10 text-rose-500'
        }`}>
          {item.status}
        </span>
      )
    },
    { header: 'Environment', accessor: (item: AppInfo) => <span className="uppercase text-xs font-bold text-slate-400">{item.environment}</span> },
    { header: 'Revision', accessor: 'targetRevision' as const },
    {
      header: 'Actions',
      accessor: (item: AppInfo) => (
        <div className="flex gap-2.5">
          <button
            onClick={() => handleSync(item.name)}
            disabled={triggering === item.name}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold disabled:opacity-50"
          >
            {triggering === item.name ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            Sync
          </button>
          <button
            onClick={() => handleOpenDetails(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-800 transition-all text-xs font-bold"
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
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">ArgoCD Declarative Deployments</h2>
        <Table columns={columns} data={apps} emptyMessage="No deployments found." />
      </div>

      {/* --- Details Sidebar Overlay Drawer --- */}
      {selectedApp && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl p-8 flex flex-col justify-between transition-transform duration-300">
          <div className="space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-white">{selectedApp.name}</h3>
                <span className="uppercase text-xs font-bold text-slate-500">Env: {selectedApp.environment}</span>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Static configurations details */}
            <div className="space-y-3.5 text-sm">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Repository URL</span>
                <span className="font-mono text-xs text-slate-300">https://github.com/Manikandan23005/DevOps-Nexus</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Sync Policy</span>
                <span className="text-slate-300 font-medium">Automatic (Self-Heal: enabled)</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Path Location</span>
                <span className="font-mono text-xs text-slate-300">helm/charts/{selectedApp.name}</span>
              </div>
            </div>

            {/* Timelines and Revisions Logs */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Revisions History</h4>
              
              {historyLoading ? (
                <Loading />
              ) : (
                <div className="space-y-3">
                  {historyLogs.map((log: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-blue-500 block">Revision: {log.revision}</span>
                        <span className="text-[10px] text-slate-500">Deployed: {log.sync_time.split('T')[0]}</span>
                      </div>

                      <button
                        onClick={() => handleRollback(selectedApp.name, log.id || idx + 1)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/10 border border-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold"
                      >
                        Rollback
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deployments;
