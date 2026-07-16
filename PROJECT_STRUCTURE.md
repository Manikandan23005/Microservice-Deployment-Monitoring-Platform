# Project Structure

This document details the folder structure of the **DevOps Nexus** repository, explaining the purpose of each directory and guiding developers.

---

## 📂 Directories Map

```
DevOps-Nexus/
├── platform/              # Core Unified DevOps Platform
│   ├── frontend/          # React + Vite + TypeScript UI Client Codebase
│   │   ├── src/           # Components, Pages, Hooks, Layouts, Services, Types, Assets
│   │   └── public/        # Browser metadata and index icons
│   ├── backend/           # FastAPI Orchestrator API Backend Codebase
│   │   ├── app/           # api, core, services, clients, schemas, routers, dependencies, utils
│   │   └── tests/         # Unit and integration test suites
│   └── shared/            # Common Models, Configs, Loggers, Exceptions and Constants
├── applications/          # The microservices under deployment (auth, orders, etc.)
├── docs/                  # Detailed system architecture guides and manuals
├── kubernetes/            # Core declarative YAML templates (stubs)
├── helm/                  # Parametrizing multi-environment templates via Helm
├── gitops/
│   └── argocd/            # Environment application templates (dev, qa, stage, prod)
├── monitoring/            # Configuration stubs for Grafana/Prometheus/Loki/Alertmanager
├── ai/                    # AI incident analyzer model designs
├── scripts/               # Operation bash tools (setup.sh, rollback.sh, etc.)
├── assets/                # Design assets and logos
├── pyproject.toml         # Poetry package definition
├── Dockerfile             # Multi-stage platform Dockerfile
└── docker-compose.yml     # Local orchestration stack
```

---

## 🛠️ Components Breakdown

### 1. Platform (`/platform`)
The core DevOps Nexus application itself.
* **Frontend:** A responsive Single Page Application (SPA) built using React, Vite, and TypeScript.
* **Backend:** A highly scalable FastAPI service managed with **Poetry**. Exposes API endpoints for deployments, log streaming, pod lookups, and AI post-mortem generation.
* **Shared:** Common Pydantic data schemas, Settings loader configuration singletons, and global tools utilized by platform backend APIs.

### 2. Applications (`/applications`)
Simulates user applications (such as an e-commerce platform with services like `auth`, `payment`, `notification`). These are packaged into containers and deployed to Kubernetes.

### 3. Infrastructure Delivery (`/kubernetes`, `/helm`, `/gitops`)
Defines how applications are packaged (Helm), declared (Kubernetes raw templates), and synchronized to cluster namespaces (ArgoCD Application models).
