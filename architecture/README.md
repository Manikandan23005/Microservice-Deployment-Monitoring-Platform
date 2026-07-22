# 📐 DevOps Nexus v1.0 — Architecture Diagrams & Engineering Artifacts

This directory contains technical architecture diagrams and sequence flow charts for **DevOps Nexus v1.0**.

---

## 🎨 Recommended Tools
All diagram files in this directory use standard [Draw.io / Diagrams.net](https://app.diagrams.net) XML formatting (`.drawio`). You can edit them using:
- **Web App**: [app.diagrams.net](https://app.diagrams.net)
- **VSCode Extension**: `Draw.io Integration` (`hediet.vscode-drawio`)
- **Desktop Application**: `drawio-desktop`

---

## 📁 Diagram Index

| Diagram File | Subsystem & Description |
|--------------|-------------------------|
| [`system-overview.drawio`](system-overview.drawio) | High-level system architecture overview connecting UI, Backend API, Telemetry, and K8s |
| [`backend-architecture.drawio`](backend-architecture.drawio) | FastAPI Async Backend structure, routers, services, DB, and client modules |
| [`frontend-architecture.drawio`](frontend-architecture.drawio) | React 18 frontend component tree, design tokens, contexts, and spotlight modals |
| [`cluster-registry.drawio`](cluster-registry.drawio) | Multi-Cluster Registry management, API endpoints, and heartbeat health checks |
| [`gitops-control-plane.drawio`](gitops-control-plane.drawio) | ArgoCD ownership detection, sync operations, and fallback handlers |
| [`nexus-ai.drawio`](nexus-ai.drawio) | Nexus AI reasoning pipeline, prompt synthesis, and execution plans |
| [`rbac.drawio`](rbac.drawio) | Role-Based Access Control matrix, JWT authentication, and permission guardrails |
| [`database-er.drawio`](database-er.drawio) | PostgreSQL entity relationship diagram (`users`, `audit_logs`, `clusters`, `applications`) |
| [`deployment-architecture.drawio`](deployment-architecture.drawio) | Container deployment architecture, Docker Compose, and Kubernetes Helm topology |
| [`sequence-login.drawio`](sequence-login.drawio) | Sequence flow for JWT user authentication and token exchange |
| [`sequence-ai-investigation.drawio`](sequence-ai-investigation.drawio) | Sequence flow for Autonomous AIOps incident investigation |
| [`sequence-gitops-sync.drawio`](sequence-gitops-sync.drawio) | Sequence flow for ArgoCD application sync and state verification |
