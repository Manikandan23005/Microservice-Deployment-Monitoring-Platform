// --- TypeScript Type Interfaces ---

export interface AppInfo {
  name: string;
  status: 'Synced' | 'OutOfSync' | 'Progressing' | 'Degraded';
  environment: 'dev' | 'qa' | 'stage' | 'prod';
  targetRevision: string;
  lastSync: string;
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'Failed' | 'CrashLoopBackOff';
  restarts: number;
  cpu: string;
  memory: string;
}

export interface NodeInfo {
  name: string;
  status: 'Ready' | 'NotReady';
  role: string;
  cpuAllocated: string;
  memoryAllocated: string;
  ipAddress: string;
}

export interface AlertInfo {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  service: string;
  timestamp: string;
}

export interface LogLine {
  timestamp: string;
  pod: string;
  message: string;
}

export interface AIResponse {
  summary: string;
  analysis: string;
  evidence: string[];
  recommendation: string[];
  severity: string;
  confidence: number;
}
