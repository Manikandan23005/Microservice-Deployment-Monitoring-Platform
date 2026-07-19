import React, { useState } from 'react';
import { api } from '../services/api';
import { AIResponse } from '../types';
import { Bot, Send, Sparkles, CheckSquare, AlertTriangle, ShieldCheck, Play } from 'lucide-react';

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
  
  // Persistent session tracking
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  
  // Action status dictionary tracker
  const [actionStates, setActionStates] = useState<Record<string, 'idle' | 'running' | 'success' | 'failed'>>({});

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

  const handleTriggerAction = async (key: string, type: 'restart' | 'scale', ns: string, svc: string, replicas?: number) => {
    setActionStates(prev => ({ ...prev, [key]: 'running' }));
    let success = false;
    if (type === 'restart') {
      success = await api.restartDeployment(ns, svc);
    } else if (type === 'scale' && replicas !== undefined) {
      success = await api.scaleDeployment(ns, svc, replicas);
    }
    setActionStates(prev => ({ ...prev, [key]: success ? 'success' : 'failed' }));
    
    // Reset back to idle status after 3 seconds
    setTimeout(() => {
      setActionStates(prev => ({ ...prev, [key]: 'idle' }));
    }, 3000);
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

  const presets = [
    "Why is payment-service restarting?",
    "Show cluster health",
    "Explain CrashLoopBackOff",
    "Show CPU usage"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">AI Incident Assistant</h2>
          <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold flex items-center gap-1.5 uppercase">
            <Sparkles className="h-3 w-3" />
            Active
          </div>
        </div>

        {/* Pluggable Provider Selection */}
        <select 
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-sm font-semibold cursor-pointer text-slate-800 dark:text-white"
        >
          <option value="groq">Groq (Llama-3)</option>
          <option value="openai">OpenAI (GPT-4)</option>
          <option value="ollama">Ollama (Local)</option>
          <option value="lmstudio">LM Studio (Local)</option>
        </select>
      </div>

      {/* Preset Command Buttons */}
      <div className="flex flex-wrap gap-2.5">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(preset)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-all"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Message History Grid */}
      <div className="flex-1 bg-white/45 dark:bg-slate-900/45 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-6 backdrop-blur-md">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/15 text-blue-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5" />
              </div>
            )}
            
            <div className={`p-5 rounded-2xl max-w-xl text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/10' 
                : 'bg-slate-500/5 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
            }`}>
              {msg.text && (
                <div className="whitespace-pre-wrap select-text">
                  {msg.text.replace(/###\s*(.*)/g, '$1')}
                </div>
              )}

              {msg.structured && (
                <div className="space-y-4">
                  {/* Status header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      msg.structured.severity.toLowerCase() === 'critical' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                      msg.structured.severity.toLowerCase() === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      <AlertTriangle className="h-3 w-3" />
                      {msg.structured.severity}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Confidence: {msg.structured.confidence}%
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                    {msg.structured.summary}
                  </div>

                  {/* Root Cause Analysis */}
                  <div className="space-y-1">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Root Cause Analysis</h4>
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {msg.structured.root_cause}
                    </div>
                  </div>

                  {/* Affected Resources */}
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

                  {/* Evidence list */}
                  {msg.structured.evidence && msg.structured.evidence.length > 0 && (
                    <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Observed Evidence</h4>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {msg.structured.evidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations and Suggested Actions */}
                  {msg.structured.recommendations && msg.structured.recommendations.length > 0 && (
                    <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                        Remediation Actions
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
                                    onClick={() => handleTriggerAction(actionKey, action.type, action.ns, action.svc, action.replicas)}
                                    disabled={state === 'running'}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                      state === 'running' ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' :
                                      state === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                      state === 'failed' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                      'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                                    }`}
                                  >
                                    <Play className="h-3 w-3" />
                                    {state === 'running' ? 'Running...' :
                                     state === 'success' ? 'Triggered Success' :
                                     state === 'failed' ? 'Triggered Failed' :
                                     action.label}
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

            {msg.sender === 'user' && (
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                U
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 justify-start">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot className="h-5 w-5" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs flex items-center gap-2 select-none">
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span>{progressStatus || 'Querying'} ({provider} engine)...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input panel */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        className="flex gap-3 sticky bottom-0"
      >
        <input
          type="text"
          placeholder={`Type a command for the ${provider} engine...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-sm text-slate-800 dark:text-white"
        />
        <button
          type="submit"
          className="px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default AI;
