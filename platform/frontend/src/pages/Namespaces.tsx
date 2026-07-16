import React from 'react';
import { Table } from '../components/Table';

const Namespaces: React.FC = () => {
  const namespaces = [
    { name: 'devops-nexus-dev', status: 'Active', podsCount: 3, cpuQuota: '2 cores', memoryQuota: '4Gi' },
    { name: 'devops-nexus-qa', status: 'Active', podsCount: 2, cpuQuota: '4 cores', memoryQuota: '8Gi' },
    { name: 'devops-nexus-stage', status: 'Active', podsCount: 3, cpuQuota: '8 cores', memoryQuota: '16Gi' },
    { name: 'devops-nexus-prod', status: 'Active', podsCount: 4, cpuQuota: '16 cores', memoryQuota: '32Gi' }
  ];

  const columns = [
    { header: 'Namespace Name', accessor: 'name' as const },
    {
      header: 'Status',
      accessor: (item: typeof namespaces[0]) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
          {item.status}
        </span>
      )
    },
    { header: 'Running Pods', accessor: 'podsCount' as const },
    { header: 'CPU Quota Max', accessor: 'cpuQuota' as const },
    { header: 'Memory Quota Max', accessor: 'memoryQuota' as const }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Kubernetes Cluster Namespaces</h2>
      <Table columns={columns} data={namespaces} />
    </div>
  );
};

export default Namespaces;
