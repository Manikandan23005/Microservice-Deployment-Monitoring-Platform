# 🚀 DevOps Nexus v1.0 — Enterprise Autonomous AIOps & GitOps Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v1.0.0-emerald.svg)](CHANGELOG.md)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](docs/15-administrator-guide.md)
[![Build](https://img.shields.io/badge/Build-Passing-success.svg)](#-verification--testing)
[![Architecture](https://img.shields.io/badge/Architecture-Distributed%20Microservices-indigo.svg)](docs/03-system-architecture.md)

**DevOps Nexus** is a production-grade, open-source enterprise platform that unifies **Kubernetes Cluster Operations**, **ArgoCD GitOps Control Plane**, **Nexus AI Autonomous Incident Investigation**, **Grafana/Prometheus Telemetry**, and **Loki Log Analytics** into a handcrafted operations cockpit.

---

## 🏛️ System Architecture

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

## ⚡ One-Command Quick Start

Install, validate, and launch the complete DevOps Nexus v1.0 platform with a single command:

```bash
git clone https://github.com/Manikandan23005/Microservice-Deployment-Monitoring-Platform.git
cd Microservice-Deployment-Monitoring-Platform
./install.sh
```

### Pre-Install System Check Only
To run system prerequisite diagnostics without starting containers:
```bash
./install.sh --validate-only
```

---

## 🌐 Platform Endpoints & Credentials

Once launched, access the platform components at:

| Component | URL | Default Credentials |
|-----------|-----|---------------------|
| **Frontend Platform UI** | [http://localhost:3000](http://localhost:3000) | `admin` / `admin123` |
| **Backend API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | N/A (Bearer Token) |
| **Grafana Telemetry Dashboards** | [http://localhost:3200](http://localhost:3200) | `admin` / `admin` |
| **Prometheus Telemetry Engine** | [http://localhost:9090](http://localhost:9090) | N/A |
| **Loki Log Aggregator** | [http://localhost:3100](http://localhost:3100) | Header: `X-Scope-OrgID: fake` |

---

## ✨ Key Enterprise Capabilities

1. **Nexus AI Autonomous Copilot Drawer (`Ctrl + Shift + K`)**
   - Grounded incident diagnostics synthesizing K8s pod status, Prometheus metric spikes, and Loki error logs.
   - Generates executable remediation plans with downtime estimates and automated health verification.
   - Interactive `CONFIRM` prompt for destructive lifecycle actions.

2. **GitOps Operations Control Plane**
   - Real-time GitOps ownership badges (🟢 GitOps Managed / ⚪ Kubernetes Managed).
   - ArgoCD application sync, revision commit timeline, and RBAC-enforced scaling/rollbacks.

3. **Grafana-Grade Observability Platform**
   - 8 live SVG area charts: CPU, Memory, Network I/O, Disk Usage, Request Rate, Error Rate, P95 Latency, and Active Pods.
   - KPI summary cards with time range controls (`1h`, `6h`, `24h`) and category filter tabs.

4. **Loki Log Streaming & K8s API Fallback**
   - Query Pod logs via Loki LogQL with automatic fallback to live Kubernetes API streams when Loki has no data.

5. **Multi-Cluster Registry**
   - Register, manage, and monitor multiple Kubernetes clusters with context switching and health heartbeats.

6. **Spotlight Command Palette (`Ctrl + K`)**
   - Instant global search across workloads, pages, and AI investigation commands.

---

## 🛠️ Operational CLI Utilities

| Utility | Command | Purpose |
|---------|---------|---------|
| **Installer** | `./install.sh` | Automated pre-checks, DB init, seeding, and launch |
| **Health Check** | `./scripts/healthcheck.sh` | 13-point subsystem diagnostic check |
| **State Backup** | `./scripts/backup.sh` | Exports DB, env config, and K8s manifests to tarball |
| **State Restore** | `./scripts/restore.sh <archive>` | Restores state from backup tarball |
| **Support Bundle** | `./scripts/diagnostics.sh` | Generates diagnostics bundle for issue resolution |
| **Safe Upgrade** | `./scripts/upgrade.sh` | Pre-upgrade backup, container rebuild, and schema migration |

---

## 📚 Documentation Index

Explore the complete enterprise documentation suite in [`docs/`](docs/):

- 📋 [01-prerequisites.md](docs/01-prerequisites.md) — System requirements & Docker setup
- 🚀 [02-installation.md](docs/02-installation.md) — Production installation guide
- 🏗️ [03-system-architecture.md](docs/03-system-architecture.md) — Platform architectural design
- 🔀 [04-ci-cd-gitops.md](docs/04-ci-cd-gitops.md) — GitOps pipelines & GitHub Actions
- ☸️ [05-kubernetes-integration.md](docs/05-kubernetes-integration.md) — K8s integration & workload management
- 📊 [06-observability.md](docs/06-observability.md) — Prometheus, Loki, & Grafana setup
- 🧠 [07-nexus-ai.md](docs/07-nexus-ai.md) — Autonomous AIOps reasoning engine guide
- 🛠️ [08-troubleshooting.md](docs/08-troubleshooting.md) — Diagnostics & self-healing guide
- 🗺️ [09-roadmap.md](docs/09-roadmap.md) — Future feature roadmap
- ❓ [10-faq.md](docs/10-faq.md) — Frequently asked questions
- 🔌 [11-api-reference.md](docs/11-api-reference.md) — Complete REST API specification
- 🛡️ [12-rbac-security.md](docs/12-rbac-security.md) — RBAC model & security review
- 🔀 [13-gitops-cluster-registry.md](docs/13-gitops-cluster-registry.md) — Multi-cluster & ArgoCD guide
- 💻 [14-developer-guide.md](docs/14-developer-guide.md) — Local development & design tokens
- 🔧 [15-administrator-guide.md](docs/15-administrator-guide.md) — Operations, backups, & upgrades

---

## 🧪 Verification & Testing

Verify system integrity using automated test suites:

```bash
# Run Backend Pytest Suite (30 Test Cases)
./poetry-venv/bin/poetry run pytest

# Build Frontend Bundle (TypeScript & Vite Verification)
cd platform/frontend && npm run build
```

---

## 📄 License & Community

DevOps Nexus is released under the [MIT License](LICENSE). Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for details.
