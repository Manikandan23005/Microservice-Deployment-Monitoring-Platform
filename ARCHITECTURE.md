# System Architecture Guide

This document details the architectural principles and flow mechanics within **DevOps Nexus** (v0.2).

---

## 🏛️ Architecture Overview

DevOps Nexus operates as an **Internal Developer Platform (IDP)** overlay containerized as a single application suite (FastAPI backend + React frontend) that manages e-commerce app microservices running on Kubernetes.

```
 +-------------------------------------------------------------------------------+
 |                              React Frontend UI                                |
 +-------------------------------------------------------------------------------+
                                         │
                                         ▼ (HTTP API calls)
 +-------------------------------------------------------------------------------+
 |                           FastAPI API Backend                                 |
 |                      (Managed with Python Poetry)                             |
 +-------------------------------------------------------------------------------+
         │                       │                       │               │
         ▼                       ▼                       ▼               ▼
 +---------------+       +---------------+       +---------------+  +------------+
 |  Kubernetes   |       |  ArgoCD API   |       | Prometheus &  |  | Pluggable  |
 |  Cluster API  |       |               |       | Loki Logs API |  | AI Engine  |
 +---------------+       +---------------+       +---------------+  +------------+
         │                       │                       │               │
         ▼                       ▼                       ▼               ▼
 [ Pod / Node ]          [ Application ]         [ Metrics & ]      [ Ollama / ]
 [ Management ]          [ Sync Status ]         [ Ingestion ]      [ OpenAI ]
```

---

## 🧩 Architectural Layers

### Platform Backend Client (`platform/backend`)
A FastAPI application that encapsulates connections to:
1. **Kubernetes API:** Queries cluster resources, lists pod statuses, retrieves logs, and triggers namespace events.
2. **ArgoCD API:** Monitors declarative sync states.
3. **Observability Clients:** Scrapes metric outputs from Prometheus and streams pod log files from Loki.
4. **AI Connectors:** Dispatches context (logs, errors, and system events) to local Ollama containers or remote OpenAI endpoints for incident triage.

### Platform Frontend SPA (`platform/frontend`)
A React + Vite application written in TypeScript that fetches data from the backend APIs, rendering:
* Operational statuses of user microservices.
* Interactive real-time metrics panels.
* Integrated CLI log console.
* AI recommendations post-mortem reports panel.
