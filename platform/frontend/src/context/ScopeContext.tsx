import React, { createContext, useContext, useState, useEffect } from 'react';

export type ScopeMode = 'cluster' | 'namespace' | 'app' | 'infra';
export type InfrastructureDomain = 'monitoring' | 'logging' | 'gitops' | 'networking' | 'storage';

interface ScopeContextType {
  scopeMode: ScopeMode;
  setScopeMode: (mode: ScopeMode) => void;
  selectedNamespace: string;
  setSelectedNamespace: (ns: string) => void;
  selectedApp: string;
  setSelectedApp: (app: string) => void;
  selectedDomain: InfrastructureDomain;
  setSelectedDomain: (domain: InfrastructureDomain) => void;
  getScopeParams: () => Record<string, string>;
  getScopeLabel: () => string;
}

const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

export const ScopeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scopeMode, setScopeMode] = useState<ScopeMode>(() => {
    return (localStorage.getItem('ops_scope_mode') as ScopeMode) || 'cluster';
  });

  const [selectedNamespace, setSelectedNamespace] = useState<string>(() => {
    return localStorage.getItem('ops_selected_ns') || 'devops-nexus-prod';
  });

  const [selectedApp, setSelectedApp] = useState<string>(() => {
    return localStorage.getItem('ops_selected_app') || 'payment-service';
  });

  const [selectedDomain, setSelectedDomain] = useState<InfrastructureDomain>(() => {
    return (localStorage.getItem('ops_selected_domain') as InfrastructureDomain) || 'monitoring';
  });

  useEffect(() => {
    localStorage.setItem('ops_scope_mode', scopeMode);
  }, [scopeMode]);

  useEffect(() => {
    localStorage.setItem('ops_selected_ns', selectedNamespace);
  }, [selectedNamespace]);

  useEffect(() => {
    localStorage.setItem('ops_selected_app', selectedApp);
  }, [selectedApp]);

  useEffect(() => {
    localStorage.setItem('ops_selected_domain', selectedDomain);
  }, [selectedDomain]);

  const getScopeParams = () => {
    const params: Record<string, string> = { scope_mode: scopeMode };
    if (scopeMode === 'namespace') {
      params.namespace = selectedNamespace;
    } else if (scopeMode === 'app') {
      params.namespace = selectedNamespace;
      params.app = selectedApp;
    } else if (scopeMode === 'infra') {
      params.domain = selectedDomain;
    }
    return params;
  };

  const getScopeLabel = () => {
    if (scopeMode === 'cluster') return '🌐 Entire Cluster';
    if (scopeMode === 'namespace') return `📦 Namespace: ${selectedNamespace}`;
    if (scopeMode === 'app') return `🚀 App: ${selectedApp} [${selectedNamespace}]`;
    if (scopeMode === 'infra') return `⚙ Infra: ${selectedDomain.toUpperCase()}`;
    return '🌐 Entire Cluster';
  };

  return (
    <ScopeContext.Provider
      value={{
        scopeMode,
        setScopeMode,
        selectedNamespace,
        setSelectedNamespace,
        selectedApp,
        setSelectedApp,
        selectedDomain,
        setSelectedDomain,
        getScopeParams,
        getScopeLabel
      }}
    >
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = () => {
  const context = useContext(ScopeContext);
  if (!context) {
    throw new Error('useScope must be used within a ScopeProvider');
  }
  return context;
};
