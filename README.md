# DevOps Nexus

<div align="center">

<!-- Project Logo Placeholder -->
```
      ____                 ____              _   _
     |  _ \  _____   __   / ___|  _ __  ___ | \ | | _____  ___ _   _ ___
     | | | |/ _ \ \ / /   \___ \ | '_ \/ _ \|  \| |/ _ \ \/ / | | | / __|
     | |_| |  __/\ V /     ___) || |_) | (_) | |\  |  __/>  <| |_| \__ \
     |____/ \___| \_/     |____/ | .__/ \___/|_| \_|\___/_/\_\\__,_|___/
                                 |_|
```

*An AI-Powered GitOps Deployment & Observability Platform*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=flat&logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![ArgoCD](https://img.shields.io/badge/ArgoCD-%23ef7b4d.svg?style=flat&logo=argo&logoColor=white)](https://argoproj.github.io/cd/)
[![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat&logo=Prometheus&logoColor=white)](https://prometheus.io)
[![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat&logo=Grafana&logoColor=white)](https://grafana.com)
[![Status: Active Development](https://img.shields.io/badge/Status-Active_Development-blue.svg)](#)

</div>

---

## 📖 Project Overview

**DevOps Nexus** is a self-hosted, enterprise-grade Internal Developer Platform (IDP) designed to unify CI/CD pipelines, container orchestration, declarative GitOps, full-stack observability, and automated AI incident analysis into a single, cohesive developer workspace.

The core of the platform is containerized, managed with Poetry, and built on a **FastAPI backend** and a **React + Vite + TypeScript frontend** that operates as an intelligent Kubernetes controller, deployment manager, and telemetry dashboard in one place.

---

## ⚠️ Problem Statement

Modern microservice operations suffer from **toolchain fragmentation**. Troubleshooting service issues require developers to bounce between 5+ portals (GitHub Actions, ArgoCD, Prometheus, Loki, K8s CLI, etc.). DevOps Nexus solves this by compiling all tools into a single, unified developer platform.

---

## 🏗️ Architecture Flow

```
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub Actions (CI)
    │
    ▼
Docker Build & Push ──► Container Registry
    │
    ▼
Update Helm Chart Configs
    │
    ▼
GitOps Repository (ArgoCD monitors)
    │
    ▼
ArgoCD Engine (Continuous Delivery syncs)
    │
    ▼
Kubernetes Cluster Runtime (gateway, auth, orders, users...)
    ▲
    │ (Telemetry monitoring scrapers)
    ▼
Prometheus & Loki Logs
    ▲
    │
    ▼
=============================================================
               DEVOPS NEXUS PLATFORM (v0.2.0)
=============================================================
React + Vite UI (Frontend client)
    │
    ▼
FastAPI API Gateway (Backend client orchestrator)
    │
    ├─► Kubernetes Cluster API (Pod control / Rollbacks)
    ├─► Prometheus & Loki API (Observability aggregators)
    ├─► ArgoCD API (Application syncing states)
    └─► Pluggable AI Service (Local Ollama / Remote OpenAI)
=============================================================
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Platform Backend** | FastAPI + Uvicorn |
| **Platform Frontend** | React.js + Vite + TypeScript |
| **Package Manager** | Poetry |
| **Containerization** | Docker / Docker Compose |
| **Orchestration** | Kubernetes |
| **Continuous Delivery** | Argo CD |
| **Packaging** | Helm |
| **Observability** | Prometheus, Grafana, Loki |
| **AI Incident Analysis** | Pluggable Engine (Ollama, OpenAI, Groq, LM Studio) |

---

## 🗺️ Roadmap

* [v0.1.0] **Initial Project Skeleton:** Setup directory layouts and stubs. (DONE)
* [v0.2.0] **Unified Platform Architecture:** Integrate Poetry, FastAPI, React+Vite+TS stubs, and root orchestration definitions. (CURRENT)
* [v0.3.0] **Platform Backend Integrations:** Connect FastAPI to Kubernetes API client, ArgoCD, and Prometheus endpoints.
* [v0.4.0] **React Portal UI:** Implement dashboard telemetry grids and log consoles in TSX.
* [v0.5.0] **AI Diagnostics Engine:** Integrate pluggable LLM wrappers supporting local Ollama models.

---

## ⚙️ Installation & Running Guides

Refer to [INSTALLATION.md](INSTALLATION.md) for detailed prerequisites. Below are the quick guides:

### 1. Running Locally (Development Mode)
To run the components bare-metal for development:

**Backend Setup:**
```bash
# Configure local virtual environment
poetry install

# Set local configurations
export PORT=8000
export AI_PROVIDER=ollama
export REDIS_URL=redis://localhost:6379/0

# Start FastAPI server
poetry run uvicorn platform.backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend Setup:**
```bash
cd platform/frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 2. Running via Docker Compose
To build and start the entire multi-service orchestrator:
```bash
# Copy and verify environment configs
cp .env.example .env

# Spin up platform containers
docker compose up --build -d
```
Access the dashboard on port `3000` and Swagger docs on `http://localhost:8000/docs`.

---

### 3. Running on Kubernetes
To deploy the platform workloads to your cluster (e.g., Minikube or Kind):
```bash
# Deploy Helm chart releases
helm upgrade --install devops-nexus ./helm/charts/devops-nexus --namespace devops-nexus --create-namespace

# Port forward backend service
kubectl port-forward svc/devops-nexus-backend 8000:8000 -n devops-nexus
```


---

## 📂 Folder Structure

```
DevOps-Nexus/
├── platform/              # Core Unified DevOps Platform
│   ├── frontend/          # React + Vite + TS UI Client
│   ├── backend/           # FastAPI Python Backend
│   └── shared/            # Common Models and Settings Configurations
├── applications/          # The microservices under deployment (auth, orders, etc.)
├── docs/                  # Engineering reference documentation
├── kubernetes/            # Core declarative YAML templates (stubs)
├── helm/                  # Parametrizing multi-environment templates via Helm
├── gitops/                # Environment application templates for ArgoCD
├── monitoring/            # Configuration stubs for Grafana/Prometheus/Loki/Alertmanager
├── ai/                    # AI incident analyzer model designs
├── scripts/               # Operation automation tools (setup.sh, rollback.sh, etc.)
├── assets/                # Design assets and logos
├── .github/               # GitHub Actions pipeline definition
├── pyproject.toml         # Poetry package configurations
├── Dockerfile             # Multi-stage platform backend Dockerfile
└── docker-compose.yml     # Project orchestration stack
```
