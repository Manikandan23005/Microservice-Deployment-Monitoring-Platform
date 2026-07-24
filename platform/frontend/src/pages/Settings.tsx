import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Save, GitBranch, Shield, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const [provider, setProvider] = useState('ollama');
  const [k8sConfig, setK8sConfig] = useState('~/.kube/config');

  // Git Settings State
  const [gitProvider, setGitProvider] = useState('github');
  const [gitRepo, setGitRepo] = useState('Manikandan23005/Microservice-Deployment-Monitoring-Platform');
  const [gitBranch, setGitBranch] = useState('main');
  const [gitToken, setGitToken] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load existing Git settings from API
    api.getGitProviderSettings().then(data => {
      if (data) {
        setGitProvider(data.provider || 'github');
        setGitRepo(data.repository || '');
        setGitBranch(data.branch || 'main');
        setGitToken(data.token || '');
      }
    }).catch(err => console.warn(err));
  }, []);

  const handleSaveGitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.saveGitProviderSettings({
        provider: gitProvider,
        repository: gitRepo,
        branch: gitBranch,
        token: gitToken
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save Git settings.');
    } finally {
      setSaving(false);
    }
  };

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

        {/* Git Provider Integration Section */}
        <form onSubmit={handleSaveGitSettings} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-blue-500" />
            Git Provider Integration (GitOps Desired State)
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-semibold block">Git Provider</label>
              <select
                value={gitProvider}
                onChange={(e) => setGitProvider(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="azure">Azure DevOps</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-semibold block">Target Branch</label>
              <input
                type="text"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                placeholder="main"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-semibold block">Repository (Owner/Name)</label>
            <input
              type="text"
              value={gitRepo}
              onChange={(e) => setGitRepo(e.target.value)}
              placeholder="e.g. Manikandan23005/Microservice-Deployment-Monitoring-Platform"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-semibold block flex items-center gap-1">
              <Shield className="h-3 w-3 text-slate-400" />
              Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={gitToken}
              onChange={(e) => setGitToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-400">Tokens are stored securely and masked when viewed.</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess && (
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Check className="h-4 w-4" /> Git Integration Saved Successfully
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Git Integration'}
            </button>
          </div>
        </form>

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
