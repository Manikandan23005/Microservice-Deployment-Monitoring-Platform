import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AlertInfo } from '../types';
import { Loading } from '../components/Loading';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Alertmanager Notifications</h2>

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            
            return (
              <div 
                key={alert.id}
                className={`p-5 rounded-2xl border flex gap-4 items-start transition-all duration-200 hover:-translate-y-0.5 ${
                  isCritical ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' :
                  isWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-200'
                }`}
              >
                {/* Warning icon representation */}
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  isCritical ? 'bg-rose-500/15 text-rose-500' :
                  isWarning ? 'bg-amber-500/15 text-amber-500' :
                  'bg-blue-500/15 text-blue-500'
                }`}>
                  {isCritical ? <AlertCircle className="h-5 w-5" /> : 
                   isWarning ? <AlertTriangle className="h-5 w-5" /> : 
                   <Info className="h-5 w-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                      {alert.service}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
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
