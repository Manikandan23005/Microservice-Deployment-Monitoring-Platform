import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { ShieldAlert, Search, RefreshCw, Bot, CheckCircle, AlertTriangle } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(search);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-rose-500" />
            Enterprise Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">Append-only audit trail logging every privileged operation, role, and AI interaction.</p>
        </div>

        <button
          onClick={() => fetchAuditLogs()}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Audit Trail
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search audit trail by user, action, resource, or namespace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none w-full"
        />
      </div>

      {/* Audit Table */}
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User & Role</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target Resource</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-xs">
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-white">@{log.username}</div>
                      <div className="text-[10px] text-blue-500 font-semibold">{log.role_name}</div>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {log.ai_assisted && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold" title="Triggered via AI Assistant">
                            <Bot className="h-3 w-3 inline" /> AI
                          </span>
                        )}
                        {log.action}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-white font-mono">{log.target_resource}</div>
                      <div className="text-[10px] text-slate-400">NS: {log.namespace || 'cluster'} • App: {log.application || 'N/A'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {log.status === 'SUCCESS' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {log.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {log.client_ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
