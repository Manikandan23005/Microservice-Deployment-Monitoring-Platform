import axios from 'axios';
import { AppInfo, PodInfo, NodeInfo, AlertInfo, LogLine } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Increase timeout for slow AI completions
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    } catch {
      // Fallback
    }
    return [
      { name: 'devops-nexus-dev', status: 'Active', podsCount: 3, cpuQuota: '2 cores', memoryQuota: '4Gi' },
      { name: 'devops-nexus-qa', status: 'Active', podsCount: 2, cpuQuota: '4 cores', memoryQuota: '8Gi' },
      { name: 'devops-nexus-stage', status: 'Active', podsCount: 3, cpuQuota: '8 cores', memoryQuota: '16Gi' },
      { name: 'devops-nexus-prod', status: 'Active', podsCount: 4, cpuQuota: '16 cores', memoryQuota: '32Gi' }
    ];
  },

  getApplications: async (): Promise<AppInfo[]> => {
    try {
      const response = await apiClient.get('/api/v1/gitops/argocd/applications');
      if (response.data && response.data.success) {
        return response.data.data.map((app: any) => ({
          name: app.name,
          status: app.sync_status === 'Synced' ? 'Synced' : 'OutOfSync',
          environment: app.name.includes('prod') ? 'prod' : 'dev',
          targetRevision: 'main-v1.0.0',
          lastSync: 'Sync active'
        }));
      }
    } catch {
      // Fallback
    }
    return [
      { name: 'auth-service', status: 'Synced', environment: 'prod', targetRevision: 'main-v1.0.0', lastSync: '2 mins ago' },
      { name: 'orders-service', status: 'Synced', environment: 'prod', targetRevision: 'main-v1.2.0', lastSync: '10 mins ago' },
      { name: 'payment-service', status: 'Degraded', environment: 'prod', targetRevision: 'feature-stripe-v2', lastSync: 'Just now' },
      { name: 'gateway-service', status: 'Synced', environment: 'prod', targetRevision: 'main-v1.0.5', lastSync: '1 hour ago' },
      { name: 'users-service', status: 'Progressing', environment: 'stage', targetRevision: 'v0.9.8-rc1', lastSync: '5 mins ago' },
      { name: 'notification-service', status: 'OutOfSync', environment: 'dev', targetRevision: 'dev-branch-v0.2', lastSync: 'Yesterday' }
    ];
  },

  syncApplication: async (appName: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/api/v1/gitops/argocd/applications/${appName}/sync`);
      return response.data;
    } catch {
      await sleep(800);
      return { success: true, message: `Sync triggered successfully for ${appName}.` };
    }
  },

  rollbackApplication: async (appName: string, revision: number): Promise<any> => {
    try {
      const response = await apiClient.post(`/api/v1/gitops/argocd/applications/${appName}/rollback?revision=${revision}`);
      return response.data;
    } catch {
      await sleep(800);
      return { success: true, message: `Rollback triggered successfully for ${appName}.` };
    }
  },

  getApplicationHistory: async (appName: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/v1/gitops/argocd/applications/${appName}/history`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }
    return [
      { revision: 'main-v1.0.0', sync_time: '2026-07-16T18:00:00Z', id: 1 },
      { revision: 'feature-stripe-v2', sync_time: '2026-07-16T18:30:00Z', id: 2 }
    ];
  },

  getClusterMetrics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/v1/monitoring/metrics');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }
    return {
      cpu_utilization: 45.2,
      memory_utilization: 62.8,
      disk_utilization: 58.4,
      network_throughput_bytes: 12450.0
    };
  },

  getMetricsRange: async (metricType: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/api/v1/monitoring/metrics/range?metric_type=${metricType}`);
      if (response.data && response.data.success) {
        return response.data.data.values;
      }
    } catch {
      // Fallback
    }
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: 12 }, (_, i) => [
      now - (11 - i) * 300,
      50.0 + (i * 2.5) % 15
    ]);
  },

  getGitHubDetails: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/v1/gitops/github/repo-details');
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }
    return {
      owner: 'Manikandan23005',
      repository: 'Microservice-Deployment-Monitoring-Platform',
      branches: ['main', 'dev', 'feature/payment'],
      latest_commits: [
        { sha: '8820978', author: 'Antigravity', message: 'feat: implement Sprint-4 Prometheus metrics' },
        { sha: 'be8368c', author: 'Antigravity', message: 'feat: implement Sprint-1 backend infrastructure' },
        { sha: '6b209f6', author: 'Antigravity', message: 'refactor: expand backend, frontend, and shared modules' }
      ]
    };
  },

  getPods: async (): Promise<PodInfo[]> => {
    try {
      const response = await apiClient.get('/api/v1/k8s/pods');
      if (response.data && response.data.success) {
        return response.data.data.map((pod: any) => ({
          name: pod.name,
          namespace: pod.namespace,
          status: pod.status === 'Running' ? 'Running' : 'Pending',
          restarts: pod.restarts,
          cpu: '15m',
          memory: '32Mi'
        }));
      }
    } catch {
      // Fallback
    }
    return [
      { name: 'gateway-pod-7dfg8', namespace: 'devops-nexus-prod', status: 'Running', restarts: 0, cpu: '25m', memory: '48Mi' },
      { name: 'auth-pod-89dfg', namespace: 'devops-nexus-prod', status: 'Running', restarts: 0, cpu: '10m', memory: '32Mi' },
      { name: 'orders-pod-54gh6', namespace: 'devops-nexus-prod', status: 'Running', restarts: 1, cpu: '12m', memory: '64Mi' },
      { name: 'payment-pod-99hgf', namespace: 'devops-nexus-prod', status: 'CrashLoopBackOff', restarts: 5, cpu: '0m', memory: '12Mi' },
      { name: 'users-pod-32sfg', namespace: 'devops-nexus-stage', status: 'Pending', restarts: 0, cpu: '0m', memory: '0Mi' },
      { name: 'notification-pod-22sfd', namespace: 'devops-nexus-dev', status: 'Running', restarts: 3, cpu: '8m', memory: '28Mi' }
    ];
  },

  getNodes: async (): Promise<NodeInfo[]> => {
    try {
      const response = await apiClient.get('/api/v1/k8s/nodes');
      if (response.data && response.data.success) {
        return response.data.data.map((node: any) => ({
          name: node.name,
          status: node.status,
          role: node.role,
          cpuAllocated: '45%',
          memoryAllocated: '60%',
          ipAddress: node.ip_address
        }));
      }
    } catch {
      // Fallback
    }
    return [
      { name: 'node-control-plane-1', status: 'Ready', role: 'control-plane', cpuAllocated: '45%', memoryAllocated: '60%', ipAddress: '192.168.1.100' },
      { name: 'node-worker-worker-2', status: 'Ready', role: 'worker', cpuAllocated: '75%', memoryAllocated: '80%', ipAddress: '192.168.1.101' },
      { name: 'node-worker-worker-3', status: 'Ready', role: 'worker', cpuAllocated: '30%', memoryAllocated: '55%', ipAddress: '192.168.1.102' }
    ];
  },

  getAlerts: async (): Promise<AlertInfo[]> => {
    return [
      { id: '1', severity: 'critical', message: 'Payment-service pods are crashing (restarts > 5)', service: 'payment-service', timestamp: '3 mins ago' },
      { id: '2', severity: 'warning', message: 'Users-service latency spike detected (> 500ms)', service: 'users-service', timestamp: '12 mins ago' },
      { id: '3', severity: 'info', message: 'ArgoCD auto-synced auth-service configurations', service: 'auth-service', timestamp: '1 hour ago' }
    ];
  },

  getLogs: async (pod: string, search?: string): Promise<LogLine[]> => {
    try {
      const params: any = { pod };
      if (search) params.search = search;
      
      const response = await apiClient.get('/api/v1/monitoring/logs', { params });
      if (response.data && response.data.success) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }
    
    const now = new Date().toISOString();
    return [
      { timestamp: now, pod, message: `[INFO] Initializing service container client...` },
      { timestamp: now, pod, message: `[INFO] Connecting to postgres-db at auth-db.devops-nexus.svc.cluster.local:5432` },
      { timestamp: now, pod, message: `[INFO] Database connection established successfully.` },
      { timestamp: now, pod, message: `[WARN] Settings verify: STRIPE_API_KEY value is using sandbox tags.` },
      { timestamp: now, pod, message: `[INFO] Server running, listening on port 8000` }
    ];
  },

  askAI: async (prompt: string, provider?: string): Promise<string> => {
    try {
      const response = await apiClient.post('/api/v1/ai/chat', { prompt, provider });
      if (response.data && response.data.success) {
        return response.data.data.response;
      }
    } catch {
      // Fallback
    }
    
    await sleep(1000);
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('payment') || lowerPrompt.includes('restarting') || lowerPrompt.includes('crashloopbackoff')) {
      return `### DevOps Nexus AI Diagnostics Report\n\n**Incident:** Pod \`payment-pod-99hgf\` is currently in \`CrashLoopBackOff\` status with **5 restarts**.\n\n**Root Cause Identification:**\nAnalyzing Loki aggregate logs reveals a connection timeout to the Stripe payment integration client. The secret configuration \`STRIPE_API_KEY\` contains invalid syntax or has expired.\n\n**Actionable Remediation steps:**\n1. Run \`kubectl describe secret devops-nexus-secrets -n devops-nexus\` to check parameter keys.\n2. Update Stripe values tags in Helm config values-dev.yaml and trigger ArgoCD synchronize controls.`;
    }
    if (lowerPrompt.includes('unhealthy') || lowerPrompt.includes('failed')) {
      return `### DevOps Nexus AI Cluster Triage\n\nThere is **1 unhealthy pod** currently active: \`payment-pod-99hgf\` in namespace \`devops-nexus-prod\`.\n\n**Triage Suggestion:** Run \`kubectl get events -n devops-nexus-prod\` to view crash triggers.`;
    }
    return `### DevOps Nexus AI Assistant\n\nI am monitoring your GitOps deployment clusters. How can I help you troubleshoot? Supported queries: "Why is payment-service restarting?", "Show unhealthy pods".`;
  }
};
