# 🛠️ DevOps Nexus v1.0 — Operational CLI Utility Scripts

This directory contains production-grade operational CLI shell scripts for installing, diagnosing, backing up, restoring, upgrading, and troubleshooting **DevOps Nexus v1.0**.

---

## 📋 CLI Utility Index & Reference

### 1. `install.sh` (Root Entrypoint)
- **Purpose**: One-command automated installer that performs pre-flight system diagnostics, auto-generates `.env` files, initializes PostgreSQL tables, seeds default admin credentials (`admin` / `admin123`), and starts container services.
- **Usage**: `./install.sh [options]`
- **Arguments**:
  - `--validate-only`: Runs system prerequisite diagnostics without starting containers.
  - `--skip-build`: Launches services using pre-built images.
- **Dependencies**: Bash, Docker, Docker Compose, `kubectl`.

---

### 2. `healthcheck.sh`
- **Purpose**: Executes a 13-point subsystem health diagnostic check across PostgreSQL, Redis, FastAPI Backend, React Frontend, Auth, Cluster Registry, K8s API, ArgoCD, Prometheus, Loki, Nexus AI, RBAC, and Audit Logging.
- **Usage**: `./scripts/healthcheck.sh`
- **Output**: Colorized `[✓ Healthy]` / `[✗ Failed]` diagnostic summary.
- **Dependencies**: Bash, `curl`, `docker`, `kubectl`.

---

### 3. `backup.sh`
- **Purpose**: Creates a compressed timestamped state backup archive (`./backups/nexus_backup_YYYYMMDD_HHMMSS.tar.gz`) containing PostgreSQL SQL dumps, `.env` config, and Kubernetes manifests.
- **Usage**: `./scripts/backup.sh`
- **Output**: Compressed `.tar.gz` archive in `./backups/`.
- **Dependencies**: Bash, `docker compose`, `tar`.

---

### 4. `restore.sh`
- **Purpose**: Restores platform state from a backup archive with database import and manifest re-application.
- **Usage**: `./scripts/restore.sh <backup-archive.tar.gz>`
- **Example**: `./scripts/restore.sh ./backups/nexus_backup_20260721_102111.tar.gz`
- **Dependencies**: Bash, `docker compose`, `tar`.

---

### 5. `diagnostics.sh`
- **Purpose**: Generates a support diagnostics bundle (`./diagnostics/nexus_support_bundle_YYYYMMDD_HHMMSS.tar.gz`) containing system info, Docker logs, K8s events, and subsystem health reports.
- **Usage**: `./scripts/diagnostics.sh`
- **Output**: Compressed `.tar.gz` archive in `./diagnostics/`.
- **Dependencies**: Bash, `docker compose`, `kubectl`, `tar`.

---

### 6. `upgrade.sh`
- **Purpose**: Performs a safe zero-downtime platform upgrade with pre-upgrade backup, container rebuild, database schema migration, and post-upgrade health check verification.
- **Usage**: `./scripts/upgrade.sh`
- **Dependencies**: Bash, `docker compose`.

---

## ⚙️ Script Execution Permissions
Ensure scripts have executable permissions prior to running:
```bash
chmod +x scripts/*.sh install.sh
```
