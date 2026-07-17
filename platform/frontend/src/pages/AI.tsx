import React, { useState } from 'react';
import { api } from '../services/api';
import { Bot, Send, Sparkles } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

const AI: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: '### DevOps Nexus AI Assistant\n\nI am monitoring your GitOps deployment clusters. How can I help you troubleshoot? Supported queries: "Why is payment-service restarting?", "Show unhealthy pods".' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('groq');

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.askAI(text, provider);
      setMessages(prev => [...prev, { sender: 'ai', text: response }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Error connecting to the AI diagnostic service.' }]);
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    "Why is payment-service restarting?",
    "Show unhealthy pods",
    "Explain CrashLoopBackOff"
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
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-sm font-semibold cursor-pointer"
        >
          <option value="ollama">Ollama (Local)</option>
          <option value="openai">OpenAI (GPT-4)</option>
          <option value="groq">Groq (Llama-3)</option>
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
            
            <div className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/10' 
                : 'bg-slate-500/5 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 whitespace-pre-wrap'
            }`}>
              {msg.text}
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
              Querying {provider} engine...
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
          className="flex-1 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 text-sm"
        />
        <button
          type="submit"
          className="px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default AI;
