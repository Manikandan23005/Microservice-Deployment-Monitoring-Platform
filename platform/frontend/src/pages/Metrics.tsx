import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Loading } from '../components/Loading';

const Metrics: React.FC = () => {
  const [cpuData, setCpuData] = useState<any[]>([]);
  const [memData, setMemData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetricsRange = async () => {
    try {
      const [cpu, mem] = await Promise.all([
        api.getMetricsRange('cpu'),
        api.getMetricsRange('memory')
      ]);
      setCpuData(cpu);
      setMemData(mem);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsRange();
    
    // Auto-refresh metrics every 5 seconds
    const interval = setInterval(() => {
      fetchMetricsRange();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generates SVG Path coordinates from timeline array
  const generateSvgPath = (data: any[], width: number, height: number): string => {
    if (data.length < 2) return '';
    const maxVal = Math.max(...data.map(d => d[1]), 100);
    const minVal = Math.min(...data.map(d => d[1]), 0);
    const range = maxVal - minVal || 1;

    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((d[1] - minVal) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">Active Cluster Telemetries</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time charting fetched from Prometheus scrapers logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CPU Utilizations */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">CPU Usage timeline (Last 1 hour)</h3>
          
          <div className="h-64 border-b border-l border-slate-700/50 relative p-2">
            {/* SVG line graph */}
            <svg className="w-full h-full overflow-visible">
              <path 
                d={generateSvgPath(cpuData, 400, 240)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute top-2 right-2 text-xs font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
              Active queries: 10s step
            </div>
          </div>
        </div>

        {/* Memory Utilizations */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Memory Usage timeline (Last 1 hour)</h3>
          
          <div className="h-64 border-b border-l border-slate-700/50 relative p-2">
            <svg className="w-full h-full overflow-visible">
              <path 
                d={generateSvgPath(memData, 400, 240)}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute top-2 right-2 text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
              Active queries: 10s step
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Metrics;
