# 🔀 DevOps Nexus v1.0 — CI/CD & GitOps Control Plane

This document details the **GitOps Control Plane** and **CI/CD pipeline integration** in **DevOps Nexus v1.0**.

---

## 🟢 1. GitOps Detection & Synchronization

DevOps Nexus automatically inspects every Kubernetes Deployment and Pod to determine its management model:

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
      - Guardrail Enforcement
```

---

## 🔄 2. GitHub Actions CI/CD Pipeline

The repository includes GitHub Actions workflows in `.github/workflows/`:
1. **Automated Testing**: Runs Pytest backend suite and Vite frontend build checks on every pull request.
2. **Container Image Building**: Multi-stage Docker builds for platform services and microservices.
3. **GitOps Repository Synchronization**: Triggers ArgoCD sync on main branch commits.

---

## 🛠️ 3. Operational Guardrails

- **GitOps Lock**: Workloads marked as `🟢 GitOps Managed` are protected against accidental permanent deletion.
- **GitOps Disconnect**: Administrators can disconnect workloads from ArgoCD control via `DisconnectGitOpsModal.tsx` to unlock standard K8s operations.

---

## 🔗 Related Documentation
- 🏗️ [03-system-architecture.md](03-system-architecture.md) — System architecture
- 🔀 [13-gitops-cluster-registry.md](13-gitops-cluster-registry.md) — Cluster registry & ArgoCD details
- 🛡️ [12-rbac-security.md](12-rbac-security.md) — Guardrails & RBAC
