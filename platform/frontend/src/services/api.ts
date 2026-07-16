import { AppInfo, PodInfo, NodeInfo, AlertInfo, LogLine } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getApplications: async (): Promise<AppInfo[]> => {
    await sleep(200);
    return [
      { name: 'auth-service', status: 'Synced', environment: 'prod', targetRevision: 'main-v1.0.0', lastSync: '2 mins ago' },
      { name: 'orders-service', status: 'Synced', environment: 'prod', targetRevision: 'main-v1.2.0', lastSync: '10 mins ago' },
      { name: 'payment-service', status: 'Degraded', environment: 'prod', targetRevision: 'feature-stripe-v2', lastSync: 'Just now' },
      { name: 'gateway-service', status: 'Synced', environment: 'prod', targetRevision: 'main-v1.0.5', lastSync: '1 hour ago' },
      { name: 'users-service', status: 'Progressing', environment: 'stage', targetRevision: 'v0.9.8-rc1', lastSync: '5 mins ago' },
      { name: 'notification-service', status: 'OutOfSync', environment: 'dev', targetRevision: 'dev-branch-v0.2', lastSync: 'Yesterday' }
    ];
  },

  getPods: async (): Promise<PodInfo[]> => {
    await sleep(150);
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
    await sleep(150);
    return [
      { name: 'node-control-plane-1', status: 'Ready', role: 'control-plane', cpuAllocated: '45%', memoryAllocated: '60%', ipAddress: '192.168.1.100' },
      { name: 'node-worker-worker-2', status: 'Ready', role: 'worker', cpuAllocated: '75%', memoryAllocated: '80%', ipAddress: '192.168.1.101' },
      { name: 'node-worker-worker-3', status: 'Ready', role: 'worker', cpuAllocated: '30%', memoryAllocated: '55%', ipAddress: '192.168.1.102' }
    ];
  },

  getAlerts: async (): Promise<AlertInfo[]> => {
    await sleep(100);
    return [
      { id: '1', severity: 'critical', message: 'Payment-service pods are crashing (restarts > 5)', service: 'payment-service', timestamp: '3 mins ago' },
      { id: '2', severity: 'warning', message: 'Users-service latency spike detected (> 500ms)', service: 'users-service', timestamp: '12 mins ago' },
      { id: '3', severity: 'info', message: 'ArgoCD auto-synced auth-service configurations', service: 'auth-service', timestamp: '1 hour ago' }
    ];
  },

  getLogs: async (pod: string): Promise<LogLine[]> => {
    await sleep(200);
    const now = new Date().toISOString();
    return [
      { timestamp: now, pod, message: `[INFO] Initializing service container client...` },
      { timestamp: now, pod, message: `[INFO] Connecting to postgres-db at auth-db.devops-nexus.svc.cluster.local:5432` },
      { timestamp: now, pod, message: `[INFO] Database connection established successfully.` },
      { timestamp: now, pod, message: `[WARN] Settings verify: STRIPE_API_KEY value is using sandbox tags.` },
      { timestamp: now, pod, message: `[INFO] Server running, listening on port 8000` }
    ];
  },

  askAI: async (prompt: string): Promise<string> => {
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
