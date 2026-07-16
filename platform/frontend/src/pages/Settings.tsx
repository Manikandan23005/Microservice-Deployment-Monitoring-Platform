import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [provider, setProvider] = useState('ollama');
  const [k8sConfig, setK8sConfig] = useState('~/.kube/config');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Platform Settings</h2>

      <div className="space-y-6">
        {/* Kubernetes Config Section */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Kubernetes Integration</h3>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-semibold block">Kubeconfig File Path</label>
            <input 
              type="text" 
              value={k8sConfig}
              onChange={(e) => setK8sConfig(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* AI Provider Section */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Pluggable AI Diagnostics Provider</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-semibold block">AI Provider Engine</label>
            <select 
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="ollama">Ollama (Local LLM)</option>
              <option value="openai">OpenAI (Remote GPT)</option>
              <option value="groq">Groq (Llama-3 API)</option>
              <option value="lmstudio">LM Studio (Local endpoint)</option>
            </select>
          </div>

          {provider === 'ollama' && (
            <div className="space-y-1 pt-2">
              <label className="text-xs text-slate-500 font-semibold block">Ollama Endpoint URL</label>
              <input type="text" placeholder="http://localhost:11434" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm" />
            </div>
          )}

          {provider === 'openai' && (
            <div className="space-y-1 pt-2">
              <label className="text-xs text-slate-500 font-semibold block">OpenAI API Key</label>
              <input type="password" placeholder="sk-..." className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
