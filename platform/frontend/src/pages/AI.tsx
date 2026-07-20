import React, { useState } from 'react';
import { api } from '../services/api';
import { AIResponse } from '../types';
import { Bot, Send, Sparkles, CheckSquare, ShieldCheck, Play } from 'lucide-react';
import { useScope } from '../context/ScopeContext';
import { ActionConfirmationModal } from '../components/ActionConfirmationModal';

interface ChatMessage {
  sender: 'user' | 'ai';
  text?: string;
  structured?: AIResponse;
}

const AI: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'ai', 
      text: '### DevOps Nexus AI Operations Assistant\n\nI am connected to the live cluster telemetry stack. Ask any operational questions about pod statuses, logs, or metrics, and I will diagnose it using live context.\n\n*Examples:* "Why is payment-service restarting?", "Show cluster health", "CPU usage".' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('groq');
  const [progressStatus, setProgressStatus] = useState<string>('');
  
  const { getScopeParams, getScopeLabel } = useScope();
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [actionStates, setActionStates] = useState<Record<string, 'idle' | 'running' | 'success' | 'failed'>>({});

  // Action Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    key: string;
    type: 'restart' | 'scale';
    ns: string;
    svc: string;
    label: string;
    replicas?: number;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const userRole = localStorage.getItem('user_role') || 'Viewer';
  const isActionAllowed = ['Administrator', 'Platform Engineer', 'DevOps Engineer', 'Developer'].includes(userRole);

  const handleSend = (text: string) => {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);
    setProgressStatus('Thinking');

    api.askAIStream(
      text,
      provider,
      sessionId,
      getScopeParams(),
      (status) => {
        setProgressStatus(status);
      },
      (data) => {
        setMessages(prev => [...prev, { sender: 'ai', structured: data }]);
        setLoading(false);
        setProgressStatus('');
      },
      (err) => {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: `### Connection Failed\n\nFailed to get completions response: ${err.message || 'Unknown network error'}` 
        }]);
        setLoading(false);
        setProgressStatus('');
      }
    );
  };

  const executeConfirmedAiAction = async (paramValue?: any) => {
    if (!confirmModal) return;
    setActionLoading(true);
    const { key, type, ns, svc } = confirmModal;
    setActionStates(prev => ({ ...prev, [key]: 'running' }));
    
    let success = false;
    try {
      if (type === 'restart') {
        success = await api.restartDeployment(ns, svc);
      } else if (type === 'scale') {
        const reps = typeof paramValue === 'number' ? paramValue : (confirmModal.replicas || 2);
        success = await api.scaleDeployment(ns, svc, reps);
      }
      setActionStates(prev => ({ ...prev, [key]: success ? 'success' : 'failed' }));
    } catch (e: any) {
      alert(e.message || 'AI Recommended Action failed due to RBAC policy.');
      setActionStates(prev => ({ ...prev, [key]: 'failed' }));
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 3000);
    }
  };

  const parseActionableSuggestion = (rec: string) => {
    const lower = rec.toLowerCase();
    const services = ["auth", "users", "products", "orders", "payment", "notification", "gateway", "frontend"];
    let matchedSvc = "";
    for (const s of services) {
      if (lower.includes(s)) {
        matchedSvc = s;
        break;
      }
    }

    if (matchedSvc) {
      const svcName = `${matchedSvc}-service`;
      if (lower.includes("restart") || lower.includes("rollout")) {
        return {
          type: 'restart' as const,
          label: `Rollout Restart ${matchedSvc}-service`,
          svc: svcName,
          ns: "devops-nexus-prod"
        };
      }
      if (lower.includes("scale")) {
        const match = lower.match(/scale.*?to\s+(\d+)/);
        const replicas = match ? parseInt(match[1], 10) : 2;
        return {
          type: 'scale' as const,
          label: `Scale ${matchedSvc}-service to ${replicas}`,
          svc: svcName,
          ns: "devops-nexus-prod",
          replicas
        };
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              AIOps Operations Assistant
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                {getScopeLabel()} Scope
              </span>
            </h2>
            <p className="text-xs text-slate-400">Context-aware infrastructure diagnostics with RBAC-guarded actions.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Model Provider:</label>
          <select 
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="groq">Groq (llama-3.3-70b-versatile)</option>
            <option value="openai">OpenAI (gpt-4o-mini)</option>
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl rounded-2xl p-5 border shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white border-blue-500 shadow-blue-600/10' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white'
            }`}>
              
              {msg.text && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.text}
                </div>
              )}

              {msg.structured && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-500">
                      <Sparkles className="h-4 w-4" />
                      Telemetry Incident Diagnostics
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Confidence: {msg.structured.confidence}%
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                    {msg.structured.summary}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Root Cause Analysis</h4>
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {msg.structured.root_cause}
                    </div>
                  </div>

                  {msg.structured.affected_resources && msg.structured.affected_resources.length > 0 && (
                    <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Affected Resources</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.structured.affected_resources.map((res, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.structured.recommendations && msg.structured.recommendations.length > 0 && (
                    <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                        AI Remediation Action Triggers
                      </h4>
                      <div className="space-y-3">
                        {msg.structured.recommendations.map((rec, i) => {
                          const action = parseActionableSuggestion(rec);
                          const actionKey = `${idx}-${i}`;
                          const state = actionStates[actionKey] || 'idle';
                          
                          return (
                            <div key={i} className="flex flex-col gap-2 p-2.5 rounded-lg bg-slate-500/5 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                <span>{rec}</span>
                              </div>
                              
                              {action && (
                                <div className="mt-1 flex items-center gap-2">
                                  <button
                                    onClick={() => isActionAllowed && setConfirmModal({
                                      isOpen: true,
                                      key: actionKey,
                                      type: action.type,
                                      ns: action.ns,
                                      svc: action.svc,
                                      label: action.label,
                                      replicas: action.replicas
                                    })}
                                    disabled={state === 'running' || !isActionAllowed}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                      !isActionAllowed ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' :
                                      state === 'running' ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' :
                                      state === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                      state === 'failed' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                      'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md'
                                    }`}
                                  >
                                    <Play className="h-3 w-3" />
                                    {state === 'running' ? 'Executing...' :
                                     state === 'success' ? 'Triggered!' :
                                     state === 'failed' ? 'Failed' :
                                     `⚡ Action: ${action.label}`}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-blue-500 font-bold bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 w-max">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>{progressStatus || 'Analyzing cluster state...'}</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Ask AI Assistant to diagnose issues or perform operational actions..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>

      {/* AI Action Confirmation Modal */}
      {confirmModal && (
        <ActionConfirmationModal
          isOpen={true}
          onClose={() => setConfirmModal(null)}
          onConfirm={executeConfirmedAiAction}
          title={`Execute AI Recommended Action`}
          description={`AI Recommendation: "${confirmModal.label}". Are you sure you want to execute this operation?`}
          resourceName={confirmModal.svc}
          resourceType="Deployment"
          namespace={confirmModal.ns}
          actionType={confirmModal.type}
          defaultValue={confirmModal.replicas}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AI;
