# GitOps Control Plane & Continuous Delivery Guide

## Overview

DevOps Nexus implements an Enterprise GitOps Control Plane. Infrastructure changes (such as scaling replica counts or modifying configurations) are written to Git repositories and reconciled declaratively via ArgoCD.

---

## 🔄 12-Stage GitOps Write-Back Pipeline

```mermaid
flowchart TD
    A["1. Scale / Descale Action"] --> B["2. GitOps Ownership Check"]
    B --> C["3. Local Git Repo Resolution"]
    C --> D["4. Helm Values Manifest Discovery"]
    D --> E["5. Replica & HPA Modification"]
    E --> F["6. YAML Format Validation"]
    F --> G["7. Git Commit"]
    G --> H["8. Git Push to Remote"]
    H --> I["9. ArgoCD Cache Refresh"]
    I --> J["10. ArgoCD Cluster Sync"]
    J --> K["11. Rollout Reconciliation Check"]
    K --> L["12. UI Dashboard Refresh"]
```

---

## 🛠️ Key Operations

### Scaling Workloads
1. Navigate to **Deployments** page on the dashboard.
2. Click **Scale** on a GitOps-managed deployment (e.g. `auth-service`).
3. Select target replica count and confirm.
4. The platform executes the 12-stage write-back pipeline, updating `helm/auth/values-prod.yaml`, committing to Git, pushing to GitHub origin, and triggering ArgoCD synchronization.
