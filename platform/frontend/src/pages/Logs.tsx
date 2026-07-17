import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { LogLine } from '../types';
import { Search, RefreshCw, TerminalSquare, Eye, EyeOff } from 'lucide-react';

const Logs: React.FC = () => {
  const [selectedPod, setSelectedPod] = useState('payment-pod-99hgf');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [liveRefresh, setLiveRefresh] = useState(true);
  
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const podsList = [
    'gateway-pod-7dfg8',
    'auth-pod-89dfg',
    'orders-pod-54gh6',
    'payment-pod-99hgf',
    'users-pod-32sfg',
    'notification-pod-22sfd'
  ];

  const fetchLogsData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getLogs(selectedPod, searchTerm || undefined);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsData();
  }, [selectedPod, searchTerm]);

  // Live Refresh interval: 3 seconds
  useEffect(() => {
    if (!liveRefresh) return;
    const timer = setInterval(() => {
      fetchLogsData(true);
    }, 3000);
    return () => clearInterval(timer);
  }, [selectedPod, searchTerm, liveRefresh]);

  // Auto-scroll to latest log lines when log indices update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Loki Logs Aggregator</h2>
          <p className="text-xs text-slate-400 mt-0.5">Filter container logs matching selectors labels.</p>
        </div>
        
        {/* Terminals parameters headers */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedPod}
            onChange={(e) => setSelectedPod(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-sm font-semibold cursor-pointer"
          >
            {podsList.map(pod => (
              <option key={pod} value={pod}>{pod}</option>
            ))}
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search log lines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-sm w-full font-medium"
            />
          </div>

          {/* Live toggle */}
          <button 
            onClick={() => setLiveRefresh(!liveRefresh)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all ${
              liveRefresh ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400'
            }`}
          >
            {liveRefresh ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Live
          </button>

          <button 
            onClick={() => fetchLogsData()}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-500/5 transition-all bg-white dark:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Black Console terminal */}
      <div className="bg-black/90 text-emerald-400 font-mono p-6 rounded-2xl border border-slate-800 shadow-xl min-h-[420px] max-h-[500px] overflow-y-auto flex flex-col justify-between">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-500 text-xs select-none">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-4 w-4 text-emerald-500" />
              <span>Aggregate console terminal stream: {selectedPod}</span>
            </div>
            {liveRefresh && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />}
          </div>

          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin mr-3" />
              <span>Streaming loki aggregates...</span>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((line, idx) => (
                <div key={idx} className="flex gap-4 hover:bg-white/5 py-0.5 rounded px-2 transition-all">
                  <span className="text-slate-500 select-none text-[10px]">{line.timestamp.includes('T') ? line.timestamp.split('T')[1].substring(0, 8) : line.timestamp}</span>
                  <span className="text-blue-400 select-none text-[10px]">[{line.pod}]</span>
                  <span className="text-emerald-400 break-all">{line.message}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
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
