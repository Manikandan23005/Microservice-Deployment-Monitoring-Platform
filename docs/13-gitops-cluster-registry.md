# 🔀 DevOps Nexus v1.0 — GitOps & Cluster Registry Guide

This guide covers the **GitOps Control Plane** and **Multi-Cluster Registry** in **DevOps Nexus v1.0**.

---

## 🟢 1. GitOps Operations Control Plane

DevOps Nexus inspects Kubernetes Deployments and Pods to classify management ownership:

```
                            [ Workload Analysis ]
                                      |
                +---------------------+---------------------+
                |                                           |
         ArgoCD Metadata Present?                  No ArgoCD Metadata
        (app.kubernetes.io/instance)                        |
                |                                           v
                v                                ⚪ Kubernetes Managed
      🟢 GitOps Managed                              - Direct K8s Lifecycle
      - ArgoCD Application Sync                      - Scale / Restart / Delete
      - Revision History Logs
      - Guardrail Protection
```

---

## 🌐 2. Multi-Cluster Registry

The platform supports managing multiple clusters from a single control plane:

1. **Cluster Registration**: Register cluster API server endpoint, CA cert, and authentication token via `/api/v1/clusters`.
2. **Context Switching**: Use the global Scope Selector (`ScopeContext.tsx`) to switch active cluster context (`minikube`, `eks-prod`, `gke-dev`).
3. **Heartbeat Monitoring**: Background worker monitors registered cluster health every 30 seconds.

---

## 🔗 Related Documentation
- 🔀 [04-ci-cd-gitops.md](04-ci-cd-gitops.md) — GitOps pipelines
- ☸️ [05-kubernetes-integration.md](05-kubernetes-integration.md) — Workload management
- 🛡️ [12-rbac-security.md](12-rbac-security.md) — RBAC & security guardrails
