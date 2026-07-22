# 🔧 DevOps Nexus v1.0 — Administrator Guide

This guide is designed for Site Reliability Engineers (SREs), DevOps Architects, and System Administrators operating **DevOps Nexus v1.0** in production environments.

---

## 🚀 1. Production Deployment & Launch

### Quick Launch via Automated Installer
```bash
./install.sh
```

### Subsystem Health Verification
Run the 13-point subsystem diagnostic checker:
```bash
./scripts/healthcheck.sh
```

---

## 📦 2. Backup & Disaster Recovery

### Creating a State Backup
```bash
./scripts/backup.sh
```
This generates a timestamped archive (`./backups/nexus_backup_YYYYMMDD_HHMMSS.tar.gz`) containing PostgreSQL dumps, `.env` config, and Kubernetes manifests.

### Restoring State from Backup
```bash
./scripts/restore.sh ./backups/nexus_backup_20260721_102111.tar.gz
```

---

## 🩺 3. Support Bundles & Troubleshooting

Generate a diagnostics support bundle tarball when opening support tickets:
```bash
./scripts/diagnostics.sh
```
Output: `./diagnostics/nexus_support_bundle_YYYYMMDD_HHMMSS.tar.gz`.

---

## 🔄 4. Zero-Downtime Upgrades

Perform safe zero-downtime upgrades:
```bash
./scripts/upgrade.sh
```
This automatically executes pre-upgrade backups, container updates, database migrations, and health checks.

---

## 🔗 Related Documentation
- 📋 [01-prerequisites.md](01-prerequisites.md) — System requirements
- 🚀 [02-installation.md](02-installation.md) — Installation guide
- 🛡️ [12-rbac-security.md](12-rbac-security.md) — Security & RBAC
- 🛠️ [08-troubleshooting.md](08-troubleshooting.md) — Troubleshooting guide
