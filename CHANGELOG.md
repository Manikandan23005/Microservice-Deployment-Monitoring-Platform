# 📜 DevOps Nexus Changelog

All notable changes to the **DevOps Nexus** platform are documented in this file. This project adheres to [Semantic Versioning](https://semver.org/).

---

## 🚀 [v1.0.0] — 2026-07-21 (Official Production Release)

### Added
- **One-Command Installer (`./install.sh`)**: Automated system pre-validation (Docker, Compose, kubectl, Minikube, RAM, CPU, disk, ports), `.env` auto-generation, PostgreSQL DB initialization, and schema migrations.
- **13-Point Subsystem Diagnostics (`./scripts/healthcheck.sh`)**: Colorized health checker validating PostgreSQL, Redis, FastAPI Backend, React Frontend, Auth, Cluster Registry, K8s API, ArgoCD, Prometheus, Loki, Nexus AI, RBAC, and Audit Logging.
- **Enterprise Design System**: Handcrafted dark slate palette (`designTokens.ts`, `design-system.css`), custom fonts (Inter, Fira Code), status chips, shimmer loaders, and `<EnterpriseTable />`.
- **Spotlight Command Palette (`Ctrl + K`)**: Global modal search across resources, pages, and AI actions.
- **Nexus AI Autonomous Investigation Engine**: Grounded incident investigation with evidence quality badges (`HIGH`/`MEDIUM`/`LOW`), step timelines, and high-risk `CONFIRM` authorization guardrails.
- **GitOps Operations Control Plane**: Real-time ownership detection (🟢 GitOps Managed / ⚪ Kubernetes Managed), ArgoCD sync, revision timeline, and RBAC-enforced operations.
- **Observability Platform**: 8 SVG telemetry area charts (CPU, Memory, Network I/O, Disk Usage, Requests, Errors, P95 Latency, Pods Count) and dual-source log streaming (Loki LogQL + K8s API fallback).
- **Multi-Cluster Registry**: Multi-context cluster registration with heartbeat monitoring.
- **Operational Utilities**: `./scripts/backup.sh`, `./scripts/restore.sh`, `./scripts/diagnostics.sh`, `./scripts/upgrade.sh`.
- **Enterprise Documentation Suite**: 15 standardized guides in `docs/`.

---

## [v1.0.0-rc1] — 2026-07-19

### Added
- Intelligent query router, tool-first LLM bypass, Prometheus/Loki integrations, and RBAC policy enforcement.
