# Platform Architecture

## Overview
This document details the architecture of the **DevOps Nexus** unified core platform, focusing on decoupled microservice coordination, centralized observability routing, and GitOps controls.

## Goals
- Detail platform backend endpoints division.
- Document inter-component API client connections (ArgoCD, Kubernetes API, Prometheus, Loki, AI).

## Implementation Plan
1. **API Ingress routing:**
   - Client access occurs via the React TypeScript UI.
   - React UI communicates directly with the FastAPI backend exposed on port 8000.
2. **FastAPI Client Connectors:**
   - **`services/k8s_client.py`:** Handles cluster API interactions using the official Kubernetes Python Client library.
   - **`services/prometheus_client.py` & `loki_client.py`:** Telemetry scrapers gathering metrics/logs.
   - **`services/ai_engine.py`:** Integrates pluggable AI models.
3. **Pluggable AI Integration:**
   - Core API backend routes incident contexts dynamically to local Ollama nodes or external APIs depending on environment settings.

## Future Work
* **Kubernetes Webhook controller:** Setup controllers to trigger active callbacks into FastAPI on deployment failure events.
* **Redis caching layers:** Configure Redis cache hooks to speed up repeated queries to cluster states.

## References
* [Twelve-Factor App Methodology](https://12factor.net/)
* [Kubernetes Python Client Reference](https://github.com/kubernetes-client/python)
