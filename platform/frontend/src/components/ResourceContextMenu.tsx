import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, FileText, Cpu, AlertTriangle } from 'lucide-react';

interface ContextMenuProps {
  children: React.ReactNode;
}

export const ResourceContextMenu: React.FC<ContextMenuProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetInfo, setTargetInfo] = useState<{ name: string; kind: string; namespace: string } | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Check if clicked element or parent has data-ai-resource
      const target = (e.target as HTMLElement).closest('[data-ai-resource]') as HTMLElement;
      if (target) {
        e.preventDefault();
        const name = target.getAttribute('data-ai-name') || 'auth-service';
        const kind = target.getAttribute('data-ai-kind') || 'deployment';
        const namespace = target.getAttribute('data-ai-namespace') || 'devops-nexus-prod';
        
        setTargetInfo({ name, kind, namespace });
        setPosition({ x: Math.min(e.clientX, window.innerWidth - 220), y: Math.min(e.clientY, window.innerHeight - 250) });
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    const handleClick = () => setVisible(false);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const triggerAIAction = (promptText: string) => {
    setVisible(false);
    if (targetInfo) {
      window.dispatchEvent(new CustomEvent('devops_nexus_ai_investigate', {
        detail: {
          prompt: promptText,
          resourceName: targetInfo.name,
          resourceKind: targetInfo.kind,
          namespace: targetInfo.namespace
        }
      }));
    }
  };

  return (
    <>
      {children}
      {visible && targetInfo && (
        <div
          style={{ top: position.y, left: position.x }}
          className="fixed z-50 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 text-xs font-sans text-slate-200 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 border-b border-slate-800 font-mono text-[10px] text-slate-400 flex items-center justify-between">
            <span className="truncate font-bold text-white">{targetInfo.name}</span>
            <span className="uppercase text-indigo-400">{targetInfo.kind}</span>
          </div>

          {targetInfo.kind === 'deployment' && (
            <>
              <button
                onClick={() => triggerAIAction(`Investigate incident and perform root cause analysis on deployment ${targetInfo.name}`)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-indigo-300 font-semibold cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Investigate with AI
              </button>
              <button
                onClick={() => triggerAIAction(`Explain YAML manifest configuration for deployment ${targetInfo.name}`)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Explain YAML Manifest
              </button>
              <button
                onClick={() => triggerAIAction(`Perform health check and replica status analysis on deployment ${targetInfo.name}`)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                Run Health Check
              </button>
            </>
          )}

          {targetInfo.kind === 'pod' && (
            <>
              <button
                onClick={() => triggerAIAction(`Analyze container logs and stack traces for pod ${targetInfo.name}`)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-indigo-300 font-semibold cursor-pointer"
              >
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                Analyze Pod Logs with AI
              </button>
              <button
                onClick={() => triggerAIAction(`Explain why pod ${targetInfo.name} is crashing or restarting`)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                Explain Pod Crash
              </button>
            </>
          )}

          {targetInfo.kind === 'node' && (
            <button
              onClick={() => triggerAIAction(`Analyze CPU and memory pressure on node ${targetInfo.name}`)}
              className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              Node Pressure Analysis
            </button>
          )}
        </div>
      )}
    </>
  );
};
