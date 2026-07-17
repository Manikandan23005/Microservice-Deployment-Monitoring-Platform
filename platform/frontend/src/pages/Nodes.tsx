import React, { useEffect, useState } from 'react';
import { Table } from '../components/Table';
import { Loading } from '../components/Loading';
import { api } from '../services/api';
import { NodeInfo } from '../types';

const Nodes: React.FC = () => {
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNodes().then((data) => {
      setNodes(data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { header: 'Node Name', accessor: 'name' as const },
    {
      header: 'Status',
      accessor: (item: NodeInfo) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          item.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
        }`}>
          {item.status}
        </span>
      )
    },
    { header: 'Role', accessor: 'role' as const },
    { header: 'CPU Allocation', accessor: 'cpuAllocated' as const },
    { header: 'Memory Allocation', accessor: 'memoryAllocated' as const },
    { header: 'Internal IP', accessor: 'ipAddress' as const }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Cluster Worker Nodes</h2>
      {loading ? <Loading /> : <Table columns={columns} data={nodes} emptyMessage="No nodes found." />}
    </div>
  );
};

export default Nodes;
