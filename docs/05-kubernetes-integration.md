# ☸️ DevOps Nexus v1.0 — Kubernetes Integration Guide

This document covers the Kubernetes integration mechanisms, cluster context resolution, and workload management in **DevOps Nexus v1.0**.

---

## 🛰️ 1. Cluster Connectivity & Multi-Context Scope

DevOps Nexus communicates with Kubernetes clusters via the official Python Kubernetes client. The active target cluster and namespace scope are dynamically selected via `ScopeContext.tsx`:

- **Cluster Scope**: `minikube`, `eks-prod`, `gke-dev`.
- **Namespace Scope**: `all-namespaces`, `devops-nexus-prod`, `monitoring`, `argocd`.

---

## 📦 2. Workload Operations

From the DevOps Nexus Control Plane UI, operators can perform RBAC-gated workload lifecycle operations:

1. **Deployments Control Plane (`Deployments.tsx`)**:
   - Rolling Restart (`/api/v1/deployments/{ns}/{name}/restart`)
   - Replica Scaling (`/api/v1/deployments/{ns}/{name}/scale`)
   - GitOps Sync & Revisions History
   - Temporary Maintenance Delete & GitOps Disconnection
2. **Pods Operations (`Pods.tsx`)**:
   - Pod Termination & Auto-Replacement (`/api/v1/pods/{ns}/{name}/restart`)
   - Live Pod Log Stream Viewer (`/logs?pod=...&ns=...`)

---

## 🔗 Related Documentation
- 🔀 [04-ci-cd-gitops.md](04-ci-cd-gitops.md) — GitOps pipelines
- 📊 [06-observability.md](06-observability.md) — Telemetry & log streaming
- 🔀 [13-gitops-cluster-registry.md](13-gitops-cluster-registry.md) — Multi-cluster registry
