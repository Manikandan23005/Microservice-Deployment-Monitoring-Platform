# 🏗️ DevOps Nexus v1.0 — System Architecture

**DevOps Nexus v1.0** is an enterprise-grade platform uniting **Kubernetes Workload Management**, **ArgoCD GitOps Control Plane**, **Nexus AI Autonomous Incident Investigation**, **Grafana/Prometheus Telemetry**, and **Loki Log Analytics**.

---

## 🏛️ Overall Architectural Blueprint

```
                                  +---------------------------------------+
                                  |     DevOps Nexus Frontend Platform     |
                                  |   (React 18 + TS + Enterprise Design) |
                                  +-------------------+-------------------+
                                                      |
                                          HTTP / REST | (JWT Auth & Scope)
                                                      v
                                  +---------------------------------------+
                                  |     DevOps Nexus Backend Platform     |
                                  |    (FastAPI + Async Python 3.10+)     |
                                  +----+--------------+---------------+---+
                                       |              |               |
             +-------------------------+              |               +--------------------------+
             |                                        |                                          |
             v                                        v                                          v
+------------------------+              +---------------------------+              +----------------------------+
|  Nexus AI Autonomous   |              |  GitOps Control Plane     |              |  Observability Platform    |
|  Investigation Engine  |              |  & Multi-Cluster Registry |              |  Prometheus & Loki Stack   |
|  - Root Cause Analysis |              |  - ArgoCD Applications    |              |  - 8 Telemetry SVGs        |
|  - Execution Plans     |              |  - K8s API Fallbacks      |              |  - Live Log Streams        |
|  - Health Verification |              |  - RBAC Policy Guardrails |              |  - AlertManager Alerts     |
+------------------------+              +---------------------------+              +----------------------------+
             |                                        |                                          |
             +----------------------------------------+------------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |    Target Kubernetes Infrastructure   |
                                  |   (Minikube / EKS / GKE / AKS / K3s)  |
                                  +---------------------------------------+
```

---

## 🧩 Subsystem Architecture Overview

### 1. Frontend Platform Layer (React 18 + TypeScript + Vite)
- **Enterprise Design System**: Standardized CSS custom variables (`design-system.css`) and design tokens (`designTokens.ts`).
- **Spotlight Command Palette (`Ctrl + K`)**: Global search across resources, pages, and AI actions.
- **Autonomous AIOps Copilot Drawer (`Ctrl + Shift + K`)**: Grounded incident investigation with code copy and step timelines.

### 2. Backend Platform Layer (FastAPI Async)
- **Asynchronous Architecture**: High-concurrency endpoints using Python `asyncio` and `httpx`.
- **JWT Security & RBAC Guardrails**: Role-based access control checking user roles (`Administrator`, `Platform Engineer`, `DevOps Engineer`, `Viewer`).

### 3. GitOps Control Plane & Multi-Cluster Registry
- **GitOps Ownership Resolution**: Automatic detection of ArgoCD application management vs native K8s workloads.
- **Multi-Cluster Registry**: Multi-context cluster registration with heartbeat monitoring.

### 4. Nexus AI Autonomous Investigation Engine
- **Prompt Synthesis Engine**: Grounded incident investigation combining K8s pod state, Prometheus metric spikes, and Loki error logs.
- **Remediation Plan Generator**: Interactive multi-step execution plans with safety confirmation guardrails.

### 5. Observability Platform (Prometheus & Loki)
- **8-Metric Telemetry Pipeline**: CPU, Memory, Network I/O, Disk Usage, Requests, Errors, P95 Latency, Pods Count.
- **Dual-Source Log Engine**: Query Loki LogQL with live K8s API pod log stream fallback.

---

## 🔗 Related Documentation
- 📋 [01-prerequisites.md](01-prerequisites.md) — System prerequisites
- 🔀 [04-ci-cd-gitops.md](04-ci-cd-gitops.md) — GitOps pipelines
- 🧠 [07-nexus-ai.md](07-nexus-ai.md) — Nexus AI architecture
- 🔌 [11-api-reference.md](11-api-reference.md) — Backend API specification
