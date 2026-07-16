# Project Structure

This document details the folder structure of the **DevOps Nexus** repository, explaining the purpose of each directory and guiding new developers on where code should be added.

---

## 📂 Directories Map

```
DevOps-Nexus/
├── .github/
│   └── workflows/          # GitHub Actions pipeline definition (ci.yml)
├── docs/                  # Detailed system architecture guides and manuals
├── applications/          # The microservices under development
│   ├── frontend/          # Application web frontend
│   ├── gateway/           # Application reverse proxy / gateway routing
│   ├── auth/              # Authentication and security microservice
│   ├── users/             # User profiles management service
│   ├── products/          # Catalog and inventory service
│   ├── orders/            # Order placement and state tracking service
│   ├── payment/           # Processing payments gateway stub
│   └── notification/      # E-mail/SMS dispatch microservice
├── docker/                # Local runner configuration maps (e.g. Compose overrides)
├── helm/                  # Parametrizing multi-environment templates via Helm
├── kubernetes/            # Core declarative YAML templates (stubs)
├── gitops/
│   └── argocd/            # Environment application templates (dev, qa, stage, prod)
├── monitoring/            # Configuration stubs for Grafana/Prometheus logs & metrics
│   ├── prometheus/
│   ├── grafana/
│   ├── loki/
│   └── alertmanager/
├── dashboard/             # Developer IDP dashboard interface codebases
│   ├── frontend/          # IDP web app client code
│   └── backend/           # IDP controller API code
├── ai/                    # Autonomous triage module architectures and stubs
├── scripts/               # Operation bash tools (setup.sh, rollback.sh, etc.)
└── assets/                # Design assets and logos
```

---

## 🛠️ Components Breakdown

### 1. Applications (`/applications`)
Every folder here holds a standalone microservice with independent deployment lifecycles. They use the `.env.example` configurations to map dependencies.

### 2. Infrastructure Delivery (`/kubernetes`, `/helm`, `/gitops`)
* **Kubernetes:** Raw templates defining deployments, roles, networks, and auto-scalers.
* **Helm:** Package management layer to inject environment variables dynamically.
* **GitOps:** Continuous Delivery target states monitored by ArgoCD engines.

### 3. Monitoring Stack (`/monitoring`)
Stores configurations for dashboards and metrics:
* `/prometheus` for scrape targets and job configurations.
* `/grafana` for dashboards files.
* `/loki` for log streaming properties.
* `/alertmanager` for alerting routes and Webhook parameters.
