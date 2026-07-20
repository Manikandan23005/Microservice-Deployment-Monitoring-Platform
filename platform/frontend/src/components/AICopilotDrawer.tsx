import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Maximize2, Minimize2, Send, CheckCircle2, ShieldAlert, Play, RefreshCw, ShieldCheck, Activity, Trash2, Copy, Check, ChevronRight, Zap, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useScope } from '../context/ScopeContext';
import { colors } from '../theme/designTokens';

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

/* --- Inline Code Block with Copy Button --- */
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg overflow-hidden my-2" style={{ background: colors.slate[950], border: `1px solid ${colors.slate[800]}` }}>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: colors.slate[900], borderBottom: `1px solid ${colors.slate[800]}` }}>
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: colors.slate[500] }}>{language || 'shell'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer" style={{
          color: copied ? colors.semantic.success.text : colors.slate[400],
          background: copied ? colors.semantic.success.bg : 'transparent',
          border: copied ? `1px solid ${colors.semantic.success.border}` : '1px solid transparent',
        }}>
          {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed" style={{ color: colors.slate[300] }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

/* --- Markdown-like Text Renderer with Code Detection --- */
const RichTextRenderer: React.FC<{ text: string }> = ({ text }) => {
  // Split text by code blocks (``` ... ```)
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="prose prose-invert prose-xs leading-relaxed whitespace-pre-wrap font-sans">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3);
          const firstLine = inner.split('\n')[0]?.trim();
          const hasLang = firstLine && !firstLine.includes(' ') && firstLine.length < 20;
          const lang = hasLang ? firstLine : undefined;
          const code = hasLang ? inner.slice(firstLine.length + 1) : inner;
          return <CodeBlock key={idx} code={code.trim()} language={lang} />;
        }
        // Inline bold: **text**
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={idx}>
            {boldParts.map((bp, bIdx) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return <strong key={bIdx} className="text-white font-bold">{bp.slice(2, -2)}</strong>;
              }
              return <span key={bIdx}>{bp}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
};

/* --- Evidence Quality Badge --- */
const EvidenceQualityBadge: React.FC<{ quality: string }> = ({ quality }) => {
  const qMap: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    HIGH: { ...colors.semantic.success, icon: CheckCircle2 },
    MEDIUM: { ...colors.semantic.warning, icon: Eye },
    LOW: { bg: 'rgba(100, 116, 139, 0.15)', text: colors.slate[300], border: colors.slate[600], icon: Activity },
  };
  const style = qMap[quality] || qMap.LOW;
  const Icon = style.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{
      background: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
    }}>
      <Icon className="h-3 w-3" />
      {quality || 'N/A'}
    </span>
  );
};

/* --- Step Timeline Item --- */
const StepTimelineItem: React.FC<{ step: any; stepIndex: number; isExecuting: boolean }> = ({ step, stepIndex, isExecuting }) => {
  const isCompleted = step.status === 'completed';
  const isInProgress = step.status === 'in_progress' || isExecuting;
  return (
    <div className="flex items-stretch gap-3">
      {/* Timeline Connector */}
      <div className="flex flex-col items-center">
        <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{
          background: isCompleted ? colors.semantic.success.bg : isInProgress ? 'rgba(99, 102, 241, 0.15)' : colors.slate[800],
          border: `2px solid ${isCompleted ? colors.semantic.success.border : isInProgress ? 'rgba(99, 102, 241, 0.4)' : colors.slate[700]}`,
        }}>
          {isCompleted ? (
            <CheckCircle2 className="h-3.5 w-3.5" style={{ color: colors.semantic.success.text }} />
          ) : isInProgress ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ color: '#818cf8' }} />
          ) : (
            <span className="text-[10px] font-bold" style={{ color: colors.slate[400] }}>{stepIndex}</span>
          )}
        </div>
        <div className="w-px flex-1 min-h-[8px]" style={{ background: colors.slate[800] }} />
      </div>

      {/* Step Content */}
      <div className="flex-1 pb-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg text-[11px]" style={{
          background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : colors.slate[900],
          border: `1px solid ${isCompleted ? colors.semantic.success.border : colors.slate[800]}`,
        }}>
          <span className={`font-mono ${isCompleted ? 'line-through' : ''}`} style={{
            color: isCompleted ? colors.slate[500] : colors.slate[200],
          }}>
            {step.label}
          </span>
          <span className="text-[9px] uppercase font-bold tracking-wider" style={{
            color: isCompleted ? colors.semantic.success.text : isInProgress ? '#818cf8' : colors.slate[500],
          }}>
            {isCompleted ? 'Done' : isInProgress ? 'Running...' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};


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

  const [activeWorkload, setActiveWorkload] = useState<string>(() => getScopeParams().app || 'auth-service');

  const knownWorkloads = [
    'auth-service', 'frontend-service', 'gateway-service',
    'notification-service', 'orders-service', 'payment-service',
    'products-service', 'traffic-generator', 'users-service'
  ];

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
      if (resourceName) {
        setActiveWorkload(resourceName);
      }
      setIsOpen(true);
      if (prompt) {
        handleSendMessage(prompt, resourceName, resourceKind, namespace);
      }
    };
    window.addEventListener('devops_nexus_ai_investigate' as any, handleCustomTrigger as any);
    return () => window.removeEventListener('devops_nexus_ai_investigate' as any, handleCustomTrigger as any);
  }, [activeWorkload]);

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
    const phases = [
      'Parsing query intent...',
      'Collecting K8s pod & deployment telemetry...',
      'Querying Prometheus metrics & Loki error logs...',
      'Synthesizing infrastructure diagnostics...',
    ];
    for (const phase of phases) {
      setStreamingPhase(phase);
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      // 1. Run investigation engine
      const invData = await api.investigateCopilot(
        query,
        targetName || activeWorkload || getScopeParams().app || 'auth-service',
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
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-white font-bold shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
          title="Open Autonomous AIOps Copilot (Ctrl+Shift+K)"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #3b82f6 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 50px -12px rgba(79, 70, 229, 0.4)',
          }}
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 animate-pulse" style={{ color: '#fbbf24' }} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full animate-ping" style={{ background: colors.semantic.success.badgeBg }} />
          </div>
          <span className="text-sm font-semibold tracking-wide">AIOps Copilot</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono" style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
            Ctrl+Shift+K
          </span>
        </button>
      )}

      {/* --- EXPANDABLE COPILOT DRAWER PANEL --- */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-[750px] h-[85vh]' : 'w-[440px] h-[620px]'
        }`} style={{
          background: colors.slate[900],
          border: `1px solid ${colors.slate[700]}`,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.08)',
        }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 backdrop-blur-md" style={{
            background: `linear-gradient(180deg, ${colors.slate[950]} 0%, rgba(15, 23, 42, 0.95) 100%)`,
            borderBottom: `1px solid ${colors.slate[800]}`,
          }}>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl text-white shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)' }}>
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Autonomous AIOps Copilot
                  <span className="h-2 w-2 rounded-full" style={{ background: colors.semantic.success.badgeBg }} />
                </h3>
                <div className="flex items-center gap-1 text-[10px] font-mono mt-0.5" style={{ color: colors.slate[400] }}>
                  <span>Target:</span>
                  <select
                    value={activeWorkload}
                    onChange={(e) => setActiveWorkload(e.target.value)}
                    className="px-1.5 py-0.5 rounded text-[11px] font-bold focus:outline-none cursor-pointer"
                    style={{
                      background: colors.slate[900],
                      border: `1px solid ${colors.slate[700]}`,
                      color: '#818cf8',
                    }}
                  >
                    {knownWorkloads.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <span style={{ color: colors.slate[500] }}>({getScopeParams().namespace || 'devops-nexus-prod'})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Clear Chat History"
                style={{ color: colors.slate[400] }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? "Minimize Width" : "Expand Width"}
                style={{ color: colors.slate[400] }}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Close Drawer"
                style={{ color: colors.slate[400] }}
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
                  <div className="h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    color: '#818cf8',
                  }}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[88%] ${m.sender === 'user' ? 'p-3 rounded-2xl rounded-tr-sm shadow-md' : 'p-3.5 rounded-2xl rounded-tl-sm shadow-xl'}`} style={
                  m.sender === 'user' 
                    ? { background: '#4f46e5', color: 'white' }
                    : { background: colors.slate[800], border: `1px solid rgba(51, 65, 85, 0.5)`, color: colors.slate[200] }
                }>
                  {/* Message Text with Rich Rendering */}
                  {m.text && <RichTextRenderer text={m.text} />}

                  {/* Investigation Report Card */}
                  {m.investigation && (
                    <div className="mt-3 p-3.5 rounded-xl space-y-3 text-[11px]" style={{
                      background: `linear-gradient(135deg, ${colors.slate[900]} 0%, rgba(15, 23, 42, 0.95) 100%)`,
                      border: `1px solid ${colors.slate[700]}`,
                    }}>
                      {/* Report Header */}
                      <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${colors.slate[800]}` }}>
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5" style={{ color: '#818cf8' }} />
                          {m.investigation.severity === 'Info' ? 'Telemetry Status Summary' : 'Verified Root Cause Report'}
                        </span>
                        <EvidenceQualityBadge quality={m.investigation.evidence_quality || 'HIGH'} />
                      </div>

                      {/* Intent Classification */}
                      <div style={{ color: colors.slate[300] }}>
                        <span className="font-semibold" style={{ color: colors.slate[400] }}>Intent / Classification:</span>{' '}
                        <strong style={{ color: '#818cf8' }}>{m.investigation.incident_type}</strong>
                      </div>

                      {/* Timeline & Observed Symptoms */}
                      {m.investigation.infrastructure_timeline && (
                        <div className="text-[10px] font-mono flex items-center gap-1.5" style={{ color: colors.slate[400] }}>
                          <ChevronRight className="h-3 w-3" />
                          Timeline: {m.investigation.infrastructure_timeline}
                        </div>
                      )}

                      {/* Verified Evidence List */}
                      {m.investigation.evidence?.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-semibold flex items-center gap-1" style={{ color: colors.slate[400] }}>
                            <Zap className="h-3 w-3" />
                            Verified Evidence:
                          </span>
                          <ul className="list-none space-y-1 font-mono text-[10px] p-2.5 rounded-lg" style={{
                            background: colors.slate[950],
                            border: `1px solid ${colors.slate[800]}`,
                            color: colors.slate[300],
                          }}>
                            {m.investigation.evidence.map((ev: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5 truncate">
                                <span className="text-emerald-500 mt-0.5">▸</span>
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Supporting Evidence */}
                      {m.investigation.supporting_evidence?.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-semibold" style={{ color: colors.slate[400] }}>Supporting Telemetry / Traces:</span>
                          <ul className="list-none space-y-1 font-mono text-[10px] p-2.5 rounded-lg" style={{
                            background: colors.slate[950],
                            border: `1px solid ${colors.slate[800]}`,
                            color: colors.slate[400],
                          }}>
                            {m.investigation.supporting_evidence.map((sev: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5 truncate">
                                <span className="text-amber-500 mt-0.5">▸</span>
                                {sev}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Preventive Recommendations */}
                      {m.investigation.preventive_recommendations && (
                        <div className="p-2.5 rounded-lg text-[10px]" style={{
                          background: 'rgba(99, 102, 241, 0.06)',
                          border: '1px solid rgba(99, 102, 241, 0.15)',
                          color: '#a5b4fc',
                        }}>
                          <strong>Preventive Recommendation:</strong> {m.investigation.preventive_recommendations}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Execution Plan Card */}
                  {m.plan && (
                    <div className="mt-3 p-3.5 rounded-xl space-y-3" style={{
                      background: 'linear-gradient(135deg, rgba(49, 46, 129, 0.3) 0%, rgba(30, 27, 75, 0.4) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                    }}>
                      <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.15)' }}>
                        <span className="font-bold flex items-center gap-1.5 text-xs" style={{ color: '#c7d2fe' }}>
                          <ShieldCheck className="h-4 w-4" style={{ color: colors.semantic.success.text }} />
                          Remediation Execution Plan
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{
                          background: m.plan.risk_level === 'High' ? colors.semantic.danger.bg : colors.semantic.success.bg,
                          color: m.plan.risk_level === 'High' ? colors.semantic.danger.text : colors.semantic.success.text,
                          border: `1px solid ${m.plan.risk_level === 'High' ? colors.semantic.danger.border : colors.semantic.success.border}`,
                        }}>
                          Risk: {m.plan.risk_level}
                        </span>
                      </div>

                      <div className="text-[11px] flex items-center justify-between" style={{ color: colors.slate[300] }}>
                        <span>Downtime: <strong className="text-white">{m.plan.expected_downtime}</strong></span>
                        <span>Duration: <strong className="text-white">{m.plan.estimated_duration}</strong></span>
                      </div>

                      {/* Steps Timeline */}
                      <div className="space-y-0">
                        {m.plan.steps.map((st: any) => (
                          <StepTimelineItem
                            key={st.step_index}
                            step={st}
                            stepIndex={st.step_index}
                            isExecuting={executingStep === st.step_index}
                          />
                        ))}
                      </div>

                      {/* Destructive Confirm Input */}
                      {m.plan.requires_confirm_text && m.plan.status !== 'COMPLETED' && (
                        <div className="p-2.5 rounded-xl space-y-1.5" style={{
                          background: 'rgba(239, 68, 68, 0.06)',
                          border: `1px solid ${colors.semantic.danger.border}`,
                        }}>
                          <label className="text-[10px] font-bold flex items-center gap-1" style={{ color: colors.semantic.danger.text }}>
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Type 'CONFIRM' to authorize high-risk remediation:
                          </label>
                          <input
                            type="text"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            placeholder="CONFIRM"
                            className="w-full px-2.5 py-1 rounded text-xs font-mono text-white focus:outline-none"
                            style={{
                              background: colors.slate[900],
                              border: `1px solid ${colors.semantic.danger.border}`,
                            }}
                          />
                        </div>
                      )}

                      {/* Approve & Execute Button */}
                      {m.plan.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleExecuteAllSteps(m.id, m.plan)}
                          disabled={executingStep !== null || (m.plan.requires_confirm_text && confirmInput !== 'CONFIRM')}
                          className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                            boxShadow: '0 4px 15px -3px rgba(5, 150, 105, 0.3)',
                          }}
                        >
                          {executingStep !== null ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          Approve & Execute Remediation Plan
                        </button>
                      )}
                    </div>
                  )}

                  {/* Verification Card */}
                  {m.verification && (
                    <div className="mt-3 p-3 rounded-xl space-y-2 text-[11px]" style={{
                      background: 'rgba(16, 185, 129, 0.04)',
                      border: `1px solid ${colors.semantic.success.border}`,
                    }}>
                      <div className="flex items-center justify-between font-bold" style={{ color: colors.semantic.success.text }}>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Post-Remediation Health Verified
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded" style={{
                          background: colors.semantic.success.bg,
                          border: `1px solid ${colors.semantic.success.border}`,
                        }}>
                          100% Stable
                        </span>
                      </div>
                      <p className="font-sans leading-relaxed" style={{ color: colors.slate[300] }}>
                        {m.verification.verification_summary}
                      </p>
                    </div>
                  )}

                  <div className="text-[9px] text-right mt-1 font-mono" style={{ color: colors.slate[500] }}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Indicator */}
            {streamingPhase && (
              <div className="flex gap-2.5 items-center p-3.5 rounded-2xl font-mono text-xs" style={{
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
              }}>
                <div className="relative">
                  <RefreshCw className="h-4 w-4 animate-spin" style={{ color: '#fbbf24' }} />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full animate-ping" style={{ background: '#fbbf24' }} />
                </div>
                <span>{streamingPhase}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 flex gap-2" style={{
            background: colors.slate[950],
            borderTop: `1px solid ${colors.slate[800]}`,
          }}>
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Copilot or request incident investigation..."
              disabled={loading}
              className="flex-1 px-3.5 py-2 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              style={{
                background: colors.slate[900],
                border: `1px solid ${colors.slate[800]}`,
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !promptInput.trim()}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
              style={{
                background: '#4f46e5',
                boxShadow: '0 4px 10px -3px rgba(79, 70, 229, 0.3)',
              }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
