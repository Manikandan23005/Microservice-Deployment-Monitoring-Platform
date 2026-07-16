import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { AppInfo } from '../types';
import { Shield, Cpu, Layers, GitBranch } from 'lucide-react';

const Overview: React.FC = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplications().then((data) => {
      setApps(data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { header: 'Application', accessor: 'name' as const },
    {
      header: 'Status',
      accessor: (item: AppInfo) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
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
    { header: 'Last Sync', accessor: 'lastSync' as const }
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Deployments" value="8 active" subtext="All envs monitoring active" icon={GitBranch} />
        <Card title="Total Pods" value="12 pods" subtext="1 CrashLoopBackOff detected" icon={Shield} trend={{ value: '-1', type: 'negative' }} />
        <Card title="CPU Saturation" value="50%" subtext="Average worker usage limit" icon={Cpu} trend={{ value: '+4%', type: 'positive' }} />
        <Card title="Namespaces" value="4 active" subtext="dev, qa, staging, production" icon={Layers} />
      </div>

      {/* Main Apps Grid Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Active Workloads (GitOps Sync Status)</h2>
        {loading ? <Loading /> : <Table columns={columns} data={apps} />}
      </div>
    </div>
  );
};

export default Overview;
