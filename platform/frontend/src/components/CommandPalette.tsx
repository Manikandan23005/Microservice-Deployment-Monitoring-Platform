import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, GitBranch, Layers, Server, 
  BarChart3, TerminalSquare, Bot, ShieldCheck, Sparkles, 
  RefreshCw, CornerDownLeft
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Resource' | 'AI Action' | 'Quick Actions';
  icon: any;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Overview Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => { navigate('/'); onClose(); }
    },
    {
      id: 'nav-gitops',
      title: 'GitOps ArgoCD Deployments',
      category: 'Navigation',
      icon: GitBranch,
      action: () => { navigate('/deployments'); onClose(); }
    },
    {
      id: 'nav-pods',
      title: 'Kubernetes Workload Pods',
      category: 'Navigation',
      icon: Layers,
      action: () => { navigate('/pods'); onClose(); }
    },
    {
      id: 'nav-clusters',
      title: 'Multi-Cluster Control Plane',
      category: 'Navigation',
      icon: Server,
      action: () => { navigate('/clusters'); onClose(); }
    },
    {
      id: 'nav-metrics',
      title: 'Prometheus & Grafana Telemetries',
      category: 'Navigation',
      icon: BarChart3,
      action: () => { navigate('/metrics'); onClose(); }
    },
    {
      id: 'nav-logs',
      title: 'Loki Container Log Stream',
      category: 'Navigation',
      icon: TerminalSquare,
      action: () => { navigate('/logs'); onClose(); }
    },
    {
      id: 'nav-ai',
      title: 'Autonomous AIOps Copilot',
      category: 'Navigation',
      icon: Bot,
      action: () => { navigate('/ai'); onClose(); }
    },
    {
      id: 'nav-audit',
      title: 'Enterprise Audit Logs & Compliance',
      category: 'Navigation',
      icon: ShieldCheck,
      action: () => { navigate('/audit'); onClose(); }
    },
    {
      id: 'ai-investigate',
      title: 'AI Investigation: Run Cluster Health Check',
      category: 'AI Action',
      icon: Sparkles,
      action: () => { navigate('/ai?prompt=run+cluster+health+check'); onClose(); },
      shortcut: 'AI'
    },
    {
      id: 'action-refresh',
      title: 'Quick Action: Refresh Cluster Telemetries',
      category: 'Quick Actions',
      icon: RefreshCw,
      action: () => { window.location.reload(); onClose(); },
      shortcut: 'F5'
    }
  ];

  const filteredCommands = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search pages, resources, AI actions... (Ctrl + K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-4 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command List Items */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands or resources found for &quot;<strong className="text-slate-200">{query}</strong>&quot;.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-400'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{cmd.title}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {cmd.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.shortcut && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isSelected 
                          ? 'bg-white/20 text-white border-white/30' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {cmd.shortcut}
                      </span>
                    )}
                    {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">↵</kbd>
              Select
            </span>
          </div>

          <span className="text-indigo-400 font-bold">DevOps Nexus Spotlight</span>
        </div>
      </div>
    </div>
  );
};
