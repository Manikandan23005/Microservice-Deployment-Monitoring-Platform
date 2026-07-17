import axios from 'axios';
import { AppInfo, PodInfo, NodeInfo, AlertInfo, LogLine, AIResponse } from '../types';

// API base configurations parsed from env or default local dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  getNamespaces: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/v1/k8s/namespaces');
      if (response.data && response.data.success) {
        return response.data.data.map((ns: any) => ({
          name: ns.name,
          status: ns.status,
          podsCount: 0,
          cpuQuota: 'No Quota',
          memoryQuota: 'No Quota'
        }));
      }
    } catch (e) {
      console.warn("Failed to fetch namespaces from live cluster backend:", e);
    }
    return [];
  },

  getApplications: async (): Promise<AppInfo[]> => {
    try {
      const response = await apiClient.get('/api/v1/gitops/argocd/applications');
      if (response.data && response.data.success) {
        return response.data.data.map((app: any) => ({
          name: app.name,
          status: app.sync_status === 'Synced' ? 'Synced' : 'OutOfSync',
          environment: app.name.includes('prod') ? 'prod' : 'dev',
          targetRevision: 'main',
          lastSync: 'Sync active'
        }));
      }
    } catch (e) {
      console.warn("Failed to fetch ArgoCD applications:", e);
    }
    return [];
  },

  syncApplication: async (appName: string): Promise<any> => {
    const response = await apiClient.post(`/api/v1/gitops/argocd/applications/${appName}/sync`);
    return response.data;
  },

  rollbackApplication: async (appName: string, revision: number): Promise<any> => {
    const response = await apiClient.post(`/api/v1/gitops/argocd/applications/${appName}/rollback?revision=${revision}`);
    return response.data;
  },

  getApplicationHistory: async (appName: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/v1/gitops/argocd/applications/${appName}/history`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn(`Failed to fetch history for ArgoCD app ${appName}:`, e);
    }
    return [];
  },

  getClusterMetrics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/v1/monitoring/metrics');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch Prometheus cluster metrics:", e);
    }
    return {
      cpu_utilization: 0.0,
      memory_utilization: 0.0,
      disk_utilization: 0.0,
      network_throughput_bytes: 0.0
    };
  },

  getMetricsRange: async (metricType: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/v1/monitoring/metrics/range?metric_type=${metricType}`);
      if (response.data && response.data.success) {
        return response.data.data.values;
      }
    } catch (e) {
      console.warn(`Failed to fetch Prometheus range metrics for ${metricType}:`, e);
    }
    return [];
  },

  getGitHubDetails: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/v1/gitops/github/repo-details');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch GitHub repository info:", e);
    }
    return {
      owner: 'Manikandan23005',
      repository: 'Microservice-Deployment-Monitoring-Platform',
      branches: [],
      latest_commits: []
    };
  },

  getPods: async (): Promise<PodInfo[]> => {
    try {
      const response = await apiClient.get('/api/v1/k8s/pods');
      if (response.data && response.data.success) {
        return response.data.data.map((pod: any) => ({
          name: pod.name,
          namespace: pod.namespace,
          status: pod.status,
          restarts: pod.restarts,
          cpu: '0m',
          memory: '0Mi'
        }));
      }
    } catch (e) {
      console.warn("Failed to fetch live Pods list:", e);
    }
    return [];
  },

  getNodes: async (): Promise<NodeInfo[]> => {
    try {
      const response = await apiClient.get('/api/v1/k8s/nodes');
      if (response.data && response.data.success) {
        return response.data.data.map((node: any) => ({
          name: node.name,
          status: node.status,
          role: node.role,
          cpuAllocated: '0%',
          memoryAllocated: '0%',
          ipAddress: node.ip_address
        }));
      }
    } catch (e) {
      console.warn("Failed to fetch live Nodes list:", e);
    }
    return [];
  },

  getAlerts: async (): Promise<AlertInfo[]> => {
    // Return empty active alerts for empty cluster status
    return [];
  },

  getLogs: async (pod: string, search?: string): Promise<LogLine[]> => {
    try {
      const params: any = { pod };
      if (search) params.search = search;
      
      const response = await apiClient.get('/api/v1/monitoring/logs', { params });
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn(`Failed to fetch Loki logs for pod ${pod}:`, e);
    }
    return [];
  },

  askAI: async (prompt: string, provider?: string): Promise<AIResponse> => {
    try {
      const response = await apiClient.post('/api/v1/ai/chat', { prompt, provider });
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e: any) {
      const errMsg = e.response?.data?.detail || e.message || "Unknown error";
      return {
        summary: "AI Diagnostics Connection Offline",
        analysis: `Failed to communicate with the AIOps diagnostics engine API: ${errMsg}`,
        evidence: ["API connection failed or timed out"],
        recommendation: ["Please ensure your .env configurations are active and API keys are set."],
        severity: "Critical",
        confidence: 0
      };
    }
    return {
      summary: "AI Diagnostics Failed",
      analysis: "Did not receive a valid structured response from the backend service.",
      evidence: ["Empty response payload"],
      recommendation: ["Please retry the query or review backend orchestrator logs."],
      severity: "Warning",
      confidence: 0
    };
  }
};
