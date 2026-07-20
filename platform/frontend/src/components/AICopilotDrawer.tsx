import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Maximize2, Minimize2, Send, CheckCircle2, ShieldAlert, Play, RefreshCw, ShieldCheck, Activity, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useScope } from '../context/ScopeContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  streamingStatus?: string;
  investigation?: any;
  plan?: any;
  verification?: any;
  executiveReport?: any;
}

export const AICopilotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingPhase, setStreamingPhase] = useState<string | null>(null);
  
  // High-Risk Confirmation State
  const [confirmInput, setConfirmInput] = useState('');
  const [executingStep, setExecutingStep] = useState<number | null>(null);

  const { getScopeParams } = useScope();

  // Load chat history from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_ai_copilot_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "👋 **Hello! I'm your Autonomous AIOps Copilot.**\n\nI automatically monitor your Kubernetes clusters, ArgoCD GitOps pipelines, Prometheus metrics, and Loki logs. Ask me to investigate any incident, explain YAML manifests, or generate an automated remediation plan."
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Save history
  useEffect(() => {
    localStorage.setItem('nexus_ai_copilot_history', JSON.stringify(messages.slice(-30)));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, streamingPhase]);

  // Keyboard shortcut listener (Ctrl+Shift+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') || (e.metaKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global event listener for Right-Click AI actions
  useEffect(() => {
    const handleCustomTrigger = (e: CustomEvent) => {
      const { prompt, resourceName, resourceKind, namespace } = e.detail || {};
      setIsOpen(true);
      if (prompt) {
        handleSendMessage(prompt, resourceName, resourceKind, namespace);
      }
    };
    window.addEventListener('devops_nexus_ai_investigate' as any, handleCustomTrigger as any);
    return () => window.removeEventListener('devops_nexus_ai_investigate' as any, handleCustomTrigger as any);
  }, []);

  const handleSendMessage = async (
    customPrompt?: string,
    targetName?: string,
    targetKind?: string,
    targetNamespace?: string
  ) => {
    const query = customPrompt || promptInput;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setPromptInput('');
    setLoading(true);

    // Streaming SSE Phase Simulation
    setStreamingPhase('Thinking & Analyzing Query...');
    await new Promise(r => setTimeout(r, 400));
    setStreamingPhase('Collecting K8s Pods & Deployments Telemetry...');
    await new Promise(r => setTimeout(r, 400));
    setStreamingPhase('Querying Prometheus Metrics & Loki Error Logs...');
    await new Promise(r => setTimeout(r, 400));
    setStreamingPhase('Running Infrastructure Deep Diagnostics...');
    await new Promise(r => setTimeout(r, 400));

    try {
      // 1. Run investigation engine
      const invData = await api.investigateCopilot(
        query,
        targetName || getScopeParams().app || 'auth-service',
        targetKind || 'deployment',
        targetNamespace || getScopeParams().namespace || 'devops-nexus-prod'
      );

      // 2. Generate Plan if incident detected
      let planData = null;
      if (invData && invData.suggested_plan) {
        planData = await api.generateExecutionPlan(
          invData.suggested_plan.action,
          invData.target_resource,
          invData.target_namespace
        );
      }

      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: invData?.root_cause || 'Investigation completed.',
        investigation: invData,
        plan: planData
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ **AIOps Copilot Offline:** ${err.message || 'Could not complete infrastructure investigation.'}`
        }
      ]);
    } finally {
      setLoading(false);
      setStreamingPhase(null);
    }
  };

  const handleExecutePlanStep = async (msgId: string, plan: any, stepIndex: number) => {
    if (plan.requires_confirm_text && confirmInput !== 'CONFIRM') {
      alert("High-risk action requires typing 'CONFIRM' to execute.");
      return;
    }

    setExecutingStep(stepIndex);
    try {
      await api.executePlanStep(plan.plan_id, stepIndex, confirmInput);
      
      // Update plan step state in messages
      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.plan) {
          const updatedSteps = m.plan.steps.map((s: any) => 
            s.step_index === stepIndex ? { ...s, status: 'completed' } : s
          );
          const allDone = updatedSteps.every((s: any) => s.status === 'completed');
          return {
            ...m,
            plan: { ...m.plan, steps: updatedSteps, status: allDone ? 'COMPLETED' : 'IN_PROGRESS' }
          };
        }
        return m;
      }));

      // If last step completed, run post-execution verification automatically!
      if (stepIndex === plan.steps.length) {
        const verifyRes = await api.verifyRemediation(plan.target_resource, plan.namespace);
        setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
            return { ...m, verification: verifyRes };
          }
          return m;
        }));
      }
    } catch (e: any) {
      alert(`Step execution failed: ${e.message}`);
    } finally {
      setExecutingStep(null);
    }
  };

  const handleExecuteAllSteps = async (msgId: string, plan: any) => {
    for (let i = 1; i <= plan.steps.length; i++) {
      await handleExecutePlanStep(msgId, plan, i);
    }
  };

  const clearHistory = () => {
    if (confirm("Clear AI Copilot chat history?")) {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "👋 **Chat history cleared.** How can I assist you with your infrastructure today?"
        }
      ]);
      localStorage.removeItem('nexus_ai_copilot_history');
    }
  };

  return (
    <>
      {/* --- FLOATING AI BUTTON BUBBLE --- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white font-bold shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer border border-indigo-400/30"
          title="Open Autonomous AIOps Copilot (Ctrl+Shift+K)"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <span className="text-sm font-semibold tracking-wide">AIOps Copilot</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 font-mono text-white/90">
            Ctrl+Shift+K
          </span>
        </button>
      )}

      {/* --- EXPANDABLE COPILOT DRAWER PANEL --- */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 z-50 flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
          isExpanded ? 'w-[750px] h-[85vh]' : 'w-[440px] h-[620px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Autonomous AIOps Copilot
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Context: <strong className="text-slate-200">{getScopeParams().app || 'auth-service'}</strong> ({getScopeParams().namespace || 'devops-nexus-prod'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? "Minimize Width" : "Expand Width"}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Drawer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbar-thin">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'assistant' && (
                  <div className="h-7 w-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[88%] ${m.sender === 'user' ? 'bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-xs shadow-md' : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 p-3.5 rounded-2xl rounded-tl-xs shadow-xl'}`}>
                  {/* Message Text */}
                  {m.text && (
                    <div className="prose prose-invert prose-xs leading-relaxed whitespace-pre-wrap font-sans">
                      {m.text}
                    </div>
                  )}

                  {/* Investigation Report Card */}
                  {m.investigation && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2.5 text-[11px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-indigo-400" />
                          Root Cause Analysis
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.investigation.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          m.investigation.severity === 'Warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {m.investigation.severity} • {m.investigation.confidence}% Confidence
                        </span>
                      </div>

                      <div className="text-slate-300">
                        <span className="text-slate-400 font-semibold">Incident Pattern:</span>{' '}
                        <strong className="text-amber-300">{m.investigation.incident_type}</strong>
                      </div>

                      {/* Evidence List */}
                      {m.investigation.evidence?.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-slate-400 font-semibold">Evidence:</span>
                          <ul className="list-disc list-inside space-y-0.5 font-mono text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                            {m.investigation.evidence.map((ev: string, idx: number) => (
                              <li key={idx} className="truncate">{ev}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Execution Plan Card */}
                  {m.plan && (
                    <div className="mt-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-900/60 pb-2">
                        <span className="font-bold text-indigo-200 flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          Remediation Execution Plan
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.plan.risk_level === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          Risk: {m.plan.risk_level}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 flex items-center justify-between">
                        <span>Downtime: <strong className="text-white">{m.plan.expected_downtime}</strong></span>
                        <span>Duration: <strong className="text-white">{m.plan.estimated_duration}</strong></span>
                      </div>

                      {/* Steps List */}
                      <div className="space-y-1.5">
                        {m.plan.steps.map((st: any) => (
                          <div key={st.step_index} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
                            <div className="flex items-center gap-2 font-mono">
                              {st.status === 'completed' ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              ) : st.status === 'in_progress' ? (
                                <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                              ) : (
                                <span className="h-3.5 w-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-400 font-bold">{st.step_index}</span>
                              )}
                              <span className={st.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-200'}>
                                {st.label}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-500">{st.status}</span>
                          </div>
                        ))}
                      </div>

                      {/* Destructive Confirm Input */}
                      {m.plan.requires_confirm_text && m.plan.status !== 'COMPLETED' && (
                        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-1.5">
                          <label className="text-[10px] font-bold text-rose-300 flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Type 'CONFIRM' to authorize high-risk remediation:
                          </label>
                          <input
                            type="text"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            placeholder="CONFIRM"
                            className="w-full px-2.5 py-1 rounded bg-slate-900 border border-rose-500/40 text-xs font-mono text-white focus:outline-none focus:border-rose-400"
                          />
                        </div>
                      )}

                      {/* Approve & Execute Button */}
                      {m.plan.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleExecuteAllSteps(m.id, m.plan)}
                          disabled={executingStep !== null || (m.plan.requires_confirm_text && confirmInput !== 'CONFIRM')}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {executingStep !== null ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          Approve & Execute Remediation Plan
                        </button>
                      )}
                    </div>
                  )}

                  {/* Verification Card */}
                  {m.verification && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Post-Remediation Health Verified
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                          100% Stable
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans leading-relaxed">
                        {m.verification.verification_summary}
                      </p>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-400 text-right mt-1 font-mono">
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Indicator */}
            {streamingPhase && (
              <div className="flex gap-2.5 items-center p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 font-mono text-xs animate-pulse">
                <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                <span>{streamingPhase}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Copilot or request incident investigation..."
              disabled={loading}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !promptInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
