import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LogLine } from '../types';
import { Search, RefreshCw, TerminalSquare } from 'lucide-react';

const Logs: React.FC = () => {
  const [selectedPod, setSelectedPod] = useState('payment-pod-99hgf');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const podsList = [
    'gateway-pod-7dfg8',
    'auth-pod-89dfg',
    'orders-pod-54gh6',
    'payment-pod-99hgf',
    'users-pod-32sfg',
    'notification-pod-22sfd'
  ];

  const fetchLogs = (pod: string) => {
    setLoading(true);
    api.getLogs(pod).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLogs(selectedPod);
  }, [selectedPod]);

  // Filter logs by search term
  const filteredLogs = logs.filter(line => 
    line.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Loki Logs Aggregator</h2>
        
        {/* Selector and Search header */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedPod}
            onChange={(e) => setSelectedPod(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-sm"
          >
            {podsList.map(pod => (
              <option key={pod} value={pod}>{pod}</option>
            ))}
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search log messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-sm w-full"
            />
          </div>

          <button 
            onClick={() => fetchLogs(selectedPod)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-500/5 transition-all"
          >
            <RefreshCw className={`h-4 w-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="bg-black/90 text-emerald-400 font-mono p-6 rounded-2xl border border-slate-800 shadow-lg min-h-[400px] flex flex-col justify-between overflow-x-auto">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-slate-500 text-xs">
            <TerminalSquare className="h-4 w-4" />
            <span>Aggregate Console: {selectedPod}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin mr-3" />
              <span>Fetching loki aggregates stream...</span>
            </div>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((line, idx) => (
              <div key={idx} className="flex gap-4 hover:bg-white/5 py-0.5 rounded px-2 transition-all">
                <span className="text-slate-500 select-none text-[11px]">{line.timestamp.split('T')[1].substring(0, 8)}</span>
                <span className="text-blue-400 select-none text-xs">[{line.pod}]</span>
                <span className="text-emerald-400 break-all">{line.message}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-600">
              No matching log output lines found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
