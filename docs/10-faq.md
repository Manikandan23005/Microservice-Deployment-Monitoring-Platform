# ❓ DevOps Nexus v1.0 — Frequently Asked Questions (FAQ)

Frequently asked questions regarding **DevOps Nexus v1.0**.

---

## 💡 General Questions

### Q1: What is DevOps Nexus?
**DevOps Nexus** is a production-grade, open-source enterprise platform unifying **Kubernetes Cluster Operations**, **ArgoCD GitOps Control Plane**, **Nexus AI Autonomous Incident Investigation**, **Grafana/Prometheus Telemetry**, and **Loki Log Analytics**.

### Q2: Is DevOps Nexus ready for production deployment?
**Yes.** DevOps Nexus v1.0 includes a zero-friction installer (`./install.sh`), 13-point subsystem health checker (`./scripts/healthcheck.sh`), state backup & restore utilities (`./scripts/backup.sh`, `./scripts/restore.sh`), diagnostics support bundle generator (`./scripts/diagnostics.sh`), and complete enterprise documentation.

---

## 🛠️ Operations & Installation

### Q3: How do I install DevOps Nexus?
Simply clone the repository and run `./install.sh`. The script performs pre-flight system checks, generates `.env` files, initializes PostgreSQL tables, seeds default accounts (`admin` / `admin123`), and starts platform containers via Docker Compose.

### Q4: How do I open the Autonomous AIOps Copilot Drawer?
Press **`Ctrl + Shift + K`** (or **`Cmd + Shift + K`** on macOS) anywhere in the platform, or click the floating **AIOps Copilot** bubble in the bottom right corner.

### Q5: How do I open the Spotlight Command Palette?
Press **`Ctrl + K`** (or **`Cmd + K`** on macOS) to launch global search across resources, navigation links, and AI commands.

---

## 🔒 Security & RBAC

### Q6: What default credentials are generated?
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `Administrator`

### Q7: Can non-admin users execute destructive cluster actions?
**No.** DevOps Nexus enforces Role-Based Access Control (RBAC). Only `Administrator` and `Platform Engineer` roles can execute scaling, restarts, or pod deletions. High-risk AI remediation steps require typing `CONFIRM` before authorization.

---

## 🔗 Related Documentation
- 🚀 [02-installation.md](02-installation.md) — Installation guide
- 🛡️ [12-rbac-security.md](12-rbac-security.md) — RBAC & security guide
- 🛠️ [08-troubleshooting.md](08-troubleshooting.md) — Troubleshooting guide
