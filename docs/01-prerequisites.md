# 📋 DevOps Nexus v1.0 — Prerequisites & System Requirements

This document outlines the software dependencies, hardware recommendations, and environment prerequisites required to deploy, build, and operate **DevOps Nexus v1.0**.

---

## 💻 Hardware & System Requirements

| Resource | Minimum Requirement | Recommended Production |
|----------|---------------------|-----------------------|
| **CPU** | 2 Cores | 4+ Cores |
| **RAM** | 4 GB | 8+ GB |
| **Disk Space** | 5 GB Free | 20+ GB SSD |
| **OS** | Linux (Ubuntu/Debian/RHEL), macOS, or Windows (WSL2) | Linux (Ubuntu 22.04 LTS / Debian 12) |

---

## 🛠️ Required Software Dependencies

### 1. Container Runtime & Orchestration
- **Docker Engine**: `v24.0.0+` (or Docker Desktop `v4.20.0+`)
- **Docker Compose**: `v2.20.0+` (plugin or standalone `docker-compose`)

### 2. Kubernetes Environment
- **Local Kubernetes**: Minikube `v1.32.0+` (with `ingress` and `metrics-server` addons), Kind, or K3s.
- **Production Kubernetes**: AWS EKS, GCP GKE, Azure AKS, or bare-metal Kubernetes `v1.26+`.

### 3. Command Line Utilities
- **`kubectl`**: Matching active cluster version (`v1.26+`).
- **`helm`**: `v3.12.0+` (for Helm chart deployments).
- **`git`**: `v2.38+` (for GitOps repository syncing).

---

## ⚡ Automated Pre-Install Diagnostics Check

DevOps Nexus provides an automated pre-flight system validator. Run this prior to installation:

```bash
./install.sh --validate-only
```

This verifies Docker daemon status, Docker Compose plugin, `kubectl` connectivity, Minikube state, RAM, CPU, available disk space, and port availability (`8000`, `3000`, `5432`, `6379`, `9090`, `3100`).

---

## 🔗 Related Documentation
- 🚀 [02-installation.md](02-installation.md) — One-command installation guide
- 🏗️ [03-system-architecture.md](03-system-architecture.md) — System component architecture
- 🛠️ [08-troubleshooting.md](08-troubleshooting.md) — Pre-flight troubleshooting
- 🔧 [15-administrator-guide.md](15-administrator-guide.md) — System administration guide
