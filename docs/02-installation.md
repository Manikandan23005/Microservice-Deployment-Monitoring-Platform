# 🚀 DevOps Nexus v1.0 — Installation Guide

This guide provides instructions for deploying **DevOps Nexus v1.0** using the zero-friction one-command installer (`./install.sh`) or custom container orchestration.

---

## ⚡ 1. One-Command Automated Installation (Recommended)

To install, configure, and launch the complete DevOps Nexus v1.0 platform:

```bash
git clone https://github.com/Manikandan23005/Microservice-Deployment-Monitoring-Platform.git
cd Microservice-Deployment-Monitoring-Platform
./install.sh
```

### Automated Workflow Steps
The installer executes the following sequence:
1. **Pre-Install Diagnostics**: Validates Docker daemon, Docker Compose, `kubectl`, Minikube context, RAM, CPU, disk space, and port availability.
2. **Auto-Configuration**: Creates `.env` configuration file from `.env.example` if missing.
3. **Database Initialization**: Starts PostgreSQL and Redis containers, runs database migrations, and seeds initial RBAC roles and default administrator account (`admin` / `admin123`).
4. **Service Startup**: Launches backend FastAPI API, frontend React UI, and observability integrations.
5. **13-Point Health Check**: Executes subsystem diagnostic validation and displays access URLs.

---

## 🌐 2. Access URLs & Default Credentials

Upon successful installation, platform components are accessible at:

| Component | URL | Default Credentials |
|-----------|-----|---------------------|
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | `admin` / `admin123` |
| **Backend OpenAPI Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | N/A (Bearer Token) |
| **Grafana Dashboards** | [http://localhost:3200](http://localhost:3200) | `admin` / `admin` |
| **Prometheus Telemetry** | [http://localhost:9090](http://localhost:9090) | N/A |
| **Loki Log Aggregator** | [http://localhost:3100](http://localhost:3100) | Header: `X-Scope-OrgID: fake` |

---

## 🛠️ 3. Verification & Operational Management

### Subsystem Health Verification
```bash
./scripts/healthcheck.sh
```

### State Backup & Restore
```bash
# Create state backup archive
./scripts/backup.sh

# Restore state from backup
./scripts/restore.sh ./backups/nexus_backup_YYYYMMDD_HHMMSS.tar.gz
```

### Generating Support Diagnostics Bundle
```bash
./scripts/diagnostics.sh
```

---

## 🔗 Related Documentation
- 📋 [01-prerequisites.md](01-prerequisites.md) — System dependencies & requirements
- 🏗️ [03-system-architecture.md](03-system-architecture.md) — Platform architectural design
- 🔌 [11-api-reference.md](11-api-reference.md) — REST API endpoints
- 🔧 [15-administrator-guide.md](15-administrator-guide.md) — Operations & upgrades
