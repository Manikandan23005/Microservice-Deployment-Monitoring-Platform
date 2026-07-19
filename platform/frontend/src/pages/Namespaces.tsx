import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';

import { useScope } from '../context/ScopeContext';

interface NamespaceItem {
  name: string;
  status: string;
  podsCount: number;
  cpuQuota: string;
  memoryQuota: string;
}

const Namespaces: React.FC = () => {
  const [namespaces, setNamespaces] = useState<NamespaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { getScopeParams } = useScope();

  useEffect(() => {
    setLoading(true);
    api.getNamespaces(getScopeParams()).then((data) => {
      setNamespaces(data);
      setLoading(false);
    });
  }, [JSON.stringify(getScopeParams())]);

  const columns = [
    { header: 'Namespace Name', accessor: 'name' as const },
    {
      header: 'Status',
      accessor: (item: NamespaceItem) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
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
      {loading ? <Loading /> : <Table columns={columns} data={namespaces} />}
    </div>
  );
};

export default Namespaces;
