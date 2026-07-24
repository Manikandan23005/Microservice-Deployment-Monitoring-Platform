import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const VerificationDashboardPage: React.FC = () => {
  const [subsystems, setSubsystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerificationData = async () => {
    setLoading(true);
    try {
      const data = await api.getVerificationMetrics();
      setSubsystems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
            Operational Verification Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Grounded telemetry source validation tracking infrastructure truth across platform subsystems.</p>
        </div>

        <button
          onClick={fetchVerificationData}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Validation
        </button>
      </div>

      {/* Grid of Subsystem health cards */}
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subsystems.map((sub, idx) => {
            const isHealthy = sub.health === 'Healthy';
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{sub.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isHealthy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {isHealthy ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {sub.health}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Source:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{sub.source}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Last Sync:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                      {new Date(sub.last_sync).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Validation Status:</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="h-3 w-3" /> {sub.validation_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Data Age:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{sub.data_age}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Tool Used:</span>
                    <span className="font-mono text-[10px] text-blue-500">{sub.tool_used}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Message:</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 break-all font-mono">
                      {sub.current_value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
