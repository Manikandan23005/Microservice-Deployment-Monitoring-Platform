import axios from 'axios';
import { AppInfo, NodeInfo, AlertInfo, LogLine, AIResponse } from '../types';

// API base configurations parsed from env or default local dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Outgoing request interceptor to inject JWT Authorization token header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const clusterId = localStorage.getItem('nexus_active_cluster_id');
  if (clusterId) {
    config.headers['X-Cluster-ID'] = clusterId;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to clear expired tokens and redirect to /login on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('session_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  getNamespaces: async (scopeParams?: Record<string, string>): Promise<any[]> => {
    try {
      const params = new URLSearchParams(scopeParams || {});
      const response = await apiClient.get(`/api/v1/k8s/namespaces?${params.toString()}`);
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

  createNamespace: async (name: string): Promise<any> => {
    const response = await apiClient.post(`/api/v1/k8s/namespaces?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  deleteNamespace: async (name: string): Promise<any> => {
    const response = await apiClient.delete(`/api/v1/k8s/namespaces/${encodeURIComponent(name)}`);
    return response.data;
  },

  getApplications: async (scopeParams?: Record<string, string>): Promise<AppInfo[]> => {
    try {
      const params = new URLSearchParams(scopeParams || {});
      const response = await apiClient.get(`/api/v1/gitops/argocd/applications?${params.toString()}`);
      if (response.data && response.data.success) {
        return response.data.data.map((app: any) => ({
          name: app.name,
          status: (app.sync_status === 'Synced' || app.health_status === 'Healthy') ? 'Synced' : 'OutOfSync',
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

  disconnectGitOpsApp: async (appName: string): Promise<any> => {
    const response = await apiClient.post(`/api/v1/gitops/argocd/applications/${appName}/disconnect`);
    return response.data;
  },

  reconnectGitOpsApp: async (appName: string, mode: 'adopt' | 'restore' = 'restore', namespace?: string): Promise<any> => {
    const response = await apiClient.post(`/api/v1/gitops/argocd/applications/${appName}/reconnect`, {
      mode,
      namespace: namespace || 'devops-nexus-prod'
    });
    return response.data;
  },

  getDeployments: async (ns?: string, scopeParams?: Record<string, string>): Promise<any[]> => {
    try {
      const params = new URLSearchParams(scopeParams || {});
      if (ns) params.append('namespace', ns);
      const response = await apiClient.get(`/api/v1/k8s/deployments?${params.toString()}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch deployments:", e);
    }
    return [];
  },

  getClusterMetrics: async (scopeParams?: Record<string, string>): Promise<any> => {
    try {
      const params = new URLSearchParams(scopeParams || {});
      const response = await apiClient.get(`/api/v1/monitoring/metrics?${params.toString()}`);
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

  getMetricsRange: async (metricType: string, scopeParams?: Record<string, string>): Promise<any[]> => {
    try {
      const params = new URLSearchParams(scopeParams || {});
      params.append('metric_type', metricType);
      const response = await apiClient.get(`/api/v1/monitoring/metrics/range?${params.toString()}`);
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

  getPods: async (ns?: string, scopeParams?: Record<string, string>): Promise<any[]> => {
    try {
      const params = new URLSearchParams(scopeParams || {});
      if (ns) params.append('namespace', ns);
      const response = await apiClient.get(`/api/v1/k8s/pods?${params.toString()}`);
      if (response.data && response.data.success) {
        return response.data.data.map((pod: any) => ({
          name: pod.name || pod.podName,
          podName: pod.podName || pod.name,
          namespace: pod.namespace,
          status: pod.status,
          restarts: pod.restarts,
          cpu: '0m',
          memory: '0Mi',
          gitopsManaged: pod.gitopsManaged || false,
          deploymentName: pod.deploymentName,
          applicationName: pod.applicationName,
          ownerKind: pod.ownerKind || 'Node',
          ownerName: pod.ownerName,
          manager: pod.manager || (pod.gitopsManaged ? 'ArgoCD' : 'Kubernetes')
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

  getLogs: async (pod: string, search?: string, limit: number = 100, scopeParams?: Record<string, string>): Promise<LogLine[]> => {
    try {
      const params = new URLSearchParams(scopeParams || {});
      params.append('pod', pod);
      if (search) params.append('search', search);
      params.append('limit', limit.toString());
      
      const response = await apiClient.get(`/api/v1/monitoring/logs?${params.toString()}`);
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
        const data = response.data.data;
        return {
          ...data,
          analysis: data.root_cause || data.analysis,
          recommendation: data.recommendations || data.recommendation
        };
      }
    } catch (e: any) {
      const errMsg = e.response?.data?.detail || e.message || "Unknown error";
      return {
        summary: "AI Diagnostics Connection Offline",
        root_cause: `Failed to communicate with the AIOps diagnostics engine API: ${errMsg}`,
        evidence: ["API connection failed or timed out"],
        affected_resources: [],
        recommendations: ["Please ensure your .env configurations are active and API keys are set."],
        severity: "Critical",
        confidence: 0
      };
    }
    return {
      summary: "AI Diagnostics Failed",
      root_cause: "Did not receive a valid structured response from the backend service.",
      evidence: ["Empty response payload"],
      affected_resources: [],
      recommendations: ["Please retry the query or review backend orchestrator logs."],
      severity: "Warning",
      confidence: 0
    };
  },

  askAIStream: (
    prompt: string,
    provider: string,
    sessionId: string,
    scopeParams: Record<string, string> | undefined,
    onProgress: (status: string) => void,
    onDone: (data: AIResponse) => void,
    onError: (err: any) => void
  ) => {
    const baseUrl = apiClient.defaults.baseURL || '';
    const token = localStorage.getItem('session_token') || '';
    const params = new URLSearchParams(scopeParams || {});
    params.append('prompt', prompt);
    params.append('provider', provider);
    params.append('session_id', sessionId);
    params.append('token', token);
    const url = `${baseUrl}/api/v1/ai/chat/stream?${params.toString()}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('progress', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        onProgress(payload.status);
      } catch (err) {
        console.error('Failed to parse progress event:', err);
      }
    });

    eventSource.addEventListener('done', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        // Map keys to match TS expectations if they differ
        const finalResponse: AIResponse = {
          ...payload,
          analysis: payload.root_cause || payload.analysis || '',
          recommendation: payload.recommendations || payload.recommendation || []
        };
        onDone(finalResponse);
        eventSource.close();
      } catch (err) {
        onError(err);
        eventSource.close();
      }
    });

    eventSource.onerror = (err) => {
      onError(err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },

  restartDeployment: async (namespace: string, name: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/api/v1/k8s/deployments/${namespace}/${name}/restart`);
      return !!(response.data && response.data.success);
    } catch (e: any) {
      console.error(`Failed to restart deployment ${name}:`, e);
      throw new Error(e.response?.data?.error?.message || e.message || 'Restart failed');
    }
  },

  scaleDeployment: async (namespace: string, name: string, replicas: number): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/api/v1/k8s/deployments/${namespace}/${name}/scale`, { replicas });
      return !!(response.data && response.data.success);
    } catch (e: any) {
      console.error(`Failed to scale deployment ${name} to ${replicas}:`, e);
      throw new Error(e.response?.data?.error?.message || e.message || 'Scaling failed');
    }
  },

  rollbackDeployment: async (namespace: string, name: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/api/v1/k8s/deployments/${namespace}/${name}/rollback`);
      return !!(response.data && response.data.success);
    } catch (e: any) {
      console.error(`Failed to rollback deployment ${name}:`, e);
      throw new Error(e.response?.data?.error?.message || e.message || 'Rollback failed');
    }
  },

  deleteDeployment: async (namespace: string, name: string, temporary: boolean = false): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/api/v1/k8s/deployments/${namespace}/${name}?temporary=${temporary}`);
      return !!(response.data && response.data.success);
    } catch (e: any) {
      console.error(`Failed to delete deployment ${name}:`, e);
      throw new Error(e.response?.data?.error?.message || e.message || 'Delete deployment failed');
    }
  },

  restartPod: async (namespace: string, podName: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/api/v1/k8s/pods/${namespace}/${podName}/restart`);
      return !!(response.data && response.data.success);
    } catch (e: any) {
      console.error(`Failed to restart pod ${podName}:`, e);
      throw new Error(e.response?.data?.error?.message || e.message || 'Restart pod failed');
    }
  },

  deletePod: async (namespace: string, podName: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/api/v1/k8s/pods/${namespace}/${podName}`);
      return !!(response.data && response.data.success);
    } catch (e: any) {
      console.error(`Failed to delete pod ${podName}:`, e);
      throw new Error(e.response?.data?.error?.message || e.message || 'Delete pod failed');
    }
  },

  login: async (username: string, password: string): Promise<any> => {
    const response = await apiClient.post('/api/v1/auth/login', { username, password });
    if (response.data && response.data.success) {
      const { token, role, require_password_change } = response.data.data;
      localStorage.setItem('session_token', token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('username', username);
      if (require_password_change) {
        localStorage.setItem('require_password_change', 'true');
      } else {
        localStorage.removeItem('require_password_change');
      }
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Login failed');
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<any> => {
    const response = await apiClient.post('/api/v1/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    });
    if (response.data && response.data.success) {
      localStorage.removeItem('require_password_change');
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Password change failed');
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (e) {
      console.warn("Logout request failed on server:", e);
    } finally {
      localStorage.removeItem('session_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('username');
      localStorage.removeItem('require_password_change');
    }
  },

  getPlatformMetrics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/v1/monitoring/platform-metrics');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch platform metrics:", e);
    }
    return null;
  },

  // --- Administration & IAM Methods ---
  getUsers: async (search?: string): Promise<any[]> => {
    try {
      const url = search ? `/api/v1/admin/users?search=${encodeURIComponent(search)}` : '/api/v1/admin/users';
      const response = await apiClient.get(url);
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch users:", e);
    }
    return [];
  },

  createUser: async (userData: any): Promise<any> => {
    const response = await apiClient.post('/api/v1/admin/users', userData);
    return response.data;
  },

  updateUser: async (username: string, userData: any): Promise<any> => {
    const response = await apiClient.put(`/api/v1/admin/users/${username}`, userData);
    return response.data;
  },

  deleteUser: async (username: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/api/v1/admin/users/${username}`);
      return !!(response.data && response.data.success);
    } catch (e) {
      return false;
    }
  },

  resetPassword: async (username: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/api/v1/admin/users/${username}/reset-password`, { new_password: newPassword });
      return !!(response.data && response.data.success);
    } catch (e) {
      return false;
    }
  },

  getRoles: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/v1/admin/roles');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch roles:", e);
    }
    return [];
  },

  createRole: async (roleData: any): Promise<any> => {
    const response = await apiClient.post('/api/v1/admin/roles', roleData);
    return response.data;
  },

  updateRole: async (name: string, roleData: any): Promise<any> => {
    const response = await apiClient.put(`/api/v1/admin/roles/${name}`, roleData);
    return response.data;
  },

  deleteRole: async (name: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/api/v1/admin/roles/${name}`);
      return !!(response.data && response.data.success);
    } catch (e) {
      return false;
    }
  },

  cloneRole: async (name: string, newRoleName: string): Promise<any> => {
    const response = await apiClient.post(`/api/v1/admin/roles/${name}/clone`, { new_role_name: newRoleName });
    return response.data;
  },

  getAuditLogs: async (search?: string): Promise<any[]> => {
    try {
      const url = search ? `/api/v1/admin/audit-logs?search=${encodeURIComponent(search)}` : '/api/v1/admin/audit-logs';
      const response = await apiClient.get(url);
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch (e) {
      console.warn("Failed to fetch audit logs:", e);
    }
    return [];
  },

  // --- Multi-Cluster Registry Endpoints ---
  getClusters: async (): Promise<any> => {
    return apiClient.get('/api/v1/clusters');
  },

  getClusterDetails: async (id: string): Promise<any> => {
    return apiClient.get(`/api/v1/clusters/${id}`);
  },

  addCluster: async (data: any): Promise<any> => {
    return apiClient.post('/api/v1/clusters', data);
  },

  parseKubeconfig: async (content: string): Promise<any> => {
    return apiClient.post('/api/v1/clusters/parse-kubeconfig', { kubeconfig_content: content });
  },

  testClusterConnection: async (id: string): Promise<any> => {
    return apiClient.post(`/api/v1/clusters/${id}/test`);
  },

  setDefaultCluster: async (id: string): Promise<any> => {
    return apiClient.post(`/api/v1/clusters/${id}/set-default`);
  }
};
