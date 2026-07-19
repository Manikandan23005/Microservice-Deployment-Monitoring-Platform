import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { PodInfo } from '../types';

import { useScope } from '../context/ScopeContext';

const Pods: React.FC = () => {
  const [pods, setPods] = useState<PodInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { getScopeParams } = useScope();

  useEffect(() => {
    setLoading(true);
    api.getPods(undefined, getScopeParams()).then((data) => {
      setPods(data);
      setLoading(false);
    });
  }, [JSON.stringify(getScopeParams())]);

  const columns = [
    { header: 'Pod Name', accessor: 'name' as const },
    { header: 'Namespace', accessor: 'namespace' as const },
    {
      header: 'Status',
      accessor: (item: PodInfo) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          item.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500' :
          item.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
          'bg-rose-500/10 text-rose-500 animate-pulse'
        }`}>
          {item.status}
        </span>
      )
    },
    { header: 'Restarts', accessor: (item: PodInfo) => <span className={item.restarts > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}>{item.restarts}</span> },
    { header: 'CPU (Request)', accessor: 'cpu' as const },
    { header: 'Memory (Request)', accessor: 'memory' as const }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Active Pod Instances</h2>
      {loading ? <Loading /> : <Table columns={columns} data={pods} emptyMessage="No pods running." />}
    </div>
  );
};

export default Pods;
