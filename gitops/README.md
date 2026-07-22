# 🔀 DevOps Nexus v1.0 — GitOps Manifests & ArgoCD Configurations

This directory contains ArgoCD application definitions, environment values, and GitOps synchronization manifests for **DevOps Nexus v1.0**.

---

## 📁 Directory Structure

```
gitops/
├── README.md                  # GitOps directory overview
└── argocd/                    # ArgoCD application manifests
    ├── development/           # Development environment ArgoCD applications
    ├── production/            # Production environment ArgoCD applications
    ├── dev/                   # Multi-tenant dev cluster manifests
    ├── stage/                 # Staging cluster manifests
    └── prod/                  # Production cluster manifests
```

---

## 🛠️ ArgoCD Application Deployment
To deploy applications via ArgoCD:
```bash
kubectl apply -f gitops/argocd/production/
```
DevOps Nexus automatically detects ArgoCD labels (`app.kubernetes.io/instance`) and displays `🟢 GitOps Managed` badges in the platform control plane UI.
