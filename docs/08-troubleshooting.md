# 🛠️ DevOps Nexus v1.0 — Troubleshooting & Self-Healing Guide

This guide provides diagnostic procedures and resolution steps for common operational issues in **DevOps Nexus v1.0**.

---

## 🏥 1. Automated Diagnostics Tools

DevOps Nexus provides two built-in CLI diagnostic utilities:

### 13-Point Subsystem Health Checker
```bash
./scripts/healthcheck.sh
```
Executes diagnostic checks across PostgreSQL, Redis, Backend API, Frontend UI, Auth, Cluster Registry, K8s API, ArgoCD, Prometheus, Loki, Nexus AI, RBAC, and Audit Logging.

### Support Bundle Generator
```bash
./scripts/diagnostics.sh
```
Generates a compressed support bundle (`./diagnostics/nexus_support_bundle_YYYYMMDD_HHMMSS.tar.gz`) containing system logs, Docker status, K8s events, and health reports.

---

## ❓ 2. Common Issues & Resolutions

### Issue 1: Port Conflict on `8000`, `3000`, `5432`, or `6379`
- **Cause**: Existing local service is bound to platform ports.
- **Resolution**: Run `./install.sh --validate-only` to identify bound ports, or update port mapping in `.env` and `docker-compose.yml`.

### Issue 2: Loki HTTP 401 Unauthorized Error
- **Cause**: Grafana Loki running in multi-tenant mode requires an Organization ID header.
- **Resolution**: DevOps Nexus automatically appends `X-Scope-OrgID: fake` header in `app/clients/loki.py`. Ensure Loki service is reachable on port 3100.

### Issue 3: Kubernetes API Connection Timeout
- **Cause**: Minikube is stopped or `kubectl` context is unset.
- **Resolution**: Run `minikube start --driver=docker` or verify context with `kubectl config current-context`.

---

## 🔗 Related Documentation
- 📋 [01-prerequisites.md](01-prerequisites.md) — System requirements
- 🚀 [02-installation.md](02-installation.md) — Installation guide
- 🔧 [15-administrator-guide.md](15-administrator-guide.md) — Operations & maintenance
