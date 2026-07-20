import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AlertInfo } from '../types';
import { Loading } from '../components/Loading';
import { AlertTriangle, AlertCircle, Info, RefreshCw, Bell, ShieldCheck } from 'lucide-react';
import { useScope } from '../context/ScopeContext';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const { getScopeParams, getScopeLabel } = useScope();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts(getScopeParams());
      setAlerts(data);
    } catch (e) {
      console.warn("Failed to fetch alerts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [getScopeParams().scope_mode, getScopeParams().namespace, getScopeParams().app, getScopeParams().domain]);

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              AlertManager Notifications
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                {getScopeLabel()} Scope
              </span>
            </h2>
            <p className="text-xs text-slate-400">Live Prometheus AlertManager alerts & Kubernetes workload warnings.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity filter tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  filterSeverity === sev
                    ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAlerts}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh Alerts"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredAlerts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Active Firing Alerts</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All workload deployment targets under <strong className="text-slate-200">{getScopeLabel()}</strong> are operating smoothly with 0 active Prometheus firing alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            
            return (
              <div 
                key={alert.id}
                className={`p-4 rounded-2xl border flex gap-4 items-start transition-all duration-200 hover:-translate-y-0.5 ${
                  isCritical ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' :
                  isWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-200'
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  isCritical ? 'bg-rose-500/15 text-rose-500' :
                  isWarning ? 'bg-amber-500/15 text-amber-500' :
                  'bg-blue-500/15 text-blue-500'
                }`}>
                  {isCritical ? <AlertCircle className="h-5 w-5" /> : 
                   isWarning ? <AlertTriangle className="h-5 w-5" /> : 
                   <Info className="h-5 w-5" />}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                      {alert.service}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
