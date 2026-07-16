import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { AppInfo } from '../types';
import { RefreshCw, Play } from 'lucide-react';

const Deployments: React.FC = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);

  useEffect(() => {
    api.getApplications().then((data) => {
      setApps(data);
      setLoading(false);
    });
  }, []);

  const handleSync = async (appName: string) => {
    setTriggering(appName);
    await new Promise(resolve => setTimeout(resolve, 800));
    setApps(prev => prev.map(app => app.name === appName ? { ...app, status: 'Synced', lastSync: 'Just now' } : app));
    setTriggering(null);
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
    { header: 'Target Environment', accessor: (item: AppInfo) => <span className="uppercase text-xs font-bold text-slate-400">{item.environment}</span> },
    { header: 'Revision Hash', accessor: 'targetRevision' as const },
    {
      header: 'Actions',
      accessor: (item: AppInfo) => (
        <button
          onClick={() => handleSync(item.name)}
          disabled={triggering === item.name}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold disabled:opacity-50"
        >
          {triggering === item.name ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          Sync Now
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">ArgoCD Declarative Deployments</h2>
      </div>

      {loading ? <Loading /> : <Table columns={columns} data={apps} />}
    </div>
  );
};

export default Deployments;
