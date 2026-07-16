# Strategic Roadmap

This document outlines the high-level roadmap and feature plans for **DevOps Nexus**. The plan is divided into phases to progress from a project skeleton to a production-grade, AI-assisted GitOps platform.

---

## 📅 Phase 1: Repository Setup & Skeleton (v0.1.0) - DONE
* [x] **Folder Structure:** Generate standard folder hierarchy for applications, infrastructure, and monitoring.
* [x] **Documentation Structure:** Build initial 10-chapter documentation architecture in `docs/`.
* [x] **Stub Microservices:** Stub configurations, Dockers, and directories for core e-commerce apps.

---

## 🛠️ Phase 2: Unified Platform Restructuring (v0.2.0) - CURRENT
* [x] **Reorganize Directories:** Rename `dashboard/` to `platform/` containing frontend client and backend orchestrator stubs.
* [x] **Configure Package Manager:** Build root `pyproject.toml` managing FastAPI dependencies via Poetry.
* [x] **Root Orchestration:** Add root Dockerfile and `docker-compose.yml` to boot platform client and services side-by-side.
* [x] **Update Documentation:** Re-align architecture guides to represent unified container models.

---

## ⚙️ Phase 3: Platform Backend Integrations (v0.3.0)
* [ ] **Kubernetes client setup:** Implement app/services/k8s_client.py querying active namespace pod events.
* [ ] **Prometheus Metrics Scraper:** Build connectors gathering system performance stats.
* [ ] **ArgoCD Sync Monitors:** Query sync controllers via REST APIs.

---

## 🧠 Phase 4: React UI Portal Interface (v0.4.0)
* [ ] **Vite Client Scaffolding:** Build interface layouts using TypeScript and React.
* [ ] **Telemetry Visualizations:** Implement charts displaying performance stats.
* [ ] **Integrated Terminal Panel:** Display container logs dynamically.

---

## 🤖 Phase 5: AI Diagnostics Engine (v0.5.0+)
* [ ] **AI Webhook Receivers:** Set up alerts parsing hooks in the FastAPI platform.
* [ ] **Pluggable LLM Modules:** Connect backend services to local Ollama containers and OpenAI APIs.
* [ ] **RAG resolution playbooks:** Index cluster incident patterns for automated triage recommendations.
