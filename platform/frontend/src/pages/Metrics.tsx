import React from 'react';

const Metrics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Cluster Performance Telemetry</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CPU utilization diagram */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">CPU Utilization Limit (Last 1 hour)</h3>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-slate-700 p-4">
            {/* Visual Bar stubs */}
            <div className="bg-blue-500/80 w-full rounded-t-lg transition-all duration-300 hover:bg-blue-600" style={{ height: '35%' }} />
            <div className="bg-blue-500/80 w-full rounded-t-lg transition-all duration-300 hover:bg-blue-600" style={{ height: '48%' }} />
            <div className="bg-blue-500/80 w-full rounded-t-lg transition-all duration-300 hover:bg-blue-600" style={{ height: '42%' }} />
            <div className="bg-blue-500/80 w-full rounded-t-lg transition-all duration-300 hover:bg-blue-600" style={{ height: '65%' }} />
            <div className="bg-blue-500/80 w-full rounded-t-lg transition-all duration-300 hover:bg-blue-600" style={{ height: '70%' }} />
            <div className="bg-blue-500/80 w-full rounded-t-lg transition-all duration-300 hover:bg-blue-600" style={{ height: '50%' }} />
          </div>
        </div>

        {/* Network latency diagram */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Gateway Request Rate (rps)</h3>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-slate-700 p-4">
            <div className="bg-indigo-500/80 w-full rounded-t-lg transition-all" style={{ height: '55%' }} />
            <div className="bg-indigo-500/80 w-full rounded-t-lg transition-all" style={{ height: '60%' }} />
            <div className="bg-indigo-500/80 w-full rounded-t-lg transition-all" style={{ height: '40%' }} />
            <div className="bg-indigo-500/80 w-full rounded-t-lg transition-all" style={{ height: '75%' }} />
            <div className="bg-indigo-500/80 w-full rounded-t-lg transition-all" style={{ height: '80%' }} />
            <div className="bg-indigo-500/80 w-full rounded-t-lg transition-all" style={{ height: '90%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
