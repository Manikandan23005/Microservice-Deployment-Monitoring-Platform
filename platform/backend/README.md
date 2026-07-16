# Unified Platform Backend API

## Overview
This is the API backend codebase serving the DevOps Nexus core platform. It acts as the orchestration engine, coordinating connections to the Kubernetes API, ArgoCD, Prometheus telemetry metrics, Loki logs, and the AI Incident Analyzer service.

## Tech Stack
* **Framework:** FastAPI (Python 3.11)
* **Package Manager:** Poetry
* **ASGI Server:** Uvicorn

## Structure
* `app/api/`: Endpoint controllers.
* `app/services/`: Core systems connectors (Kubernetes client, Prometheus client, ArgoCD api client, AI engine interface).
* `app/models/`: Pydantic data schemas.
* `app/utils/`: Helper utilities.
* `app/config/`: App settings loader.

## Development Setup
Install dependencies and activate environment:
```bash
cd platform/backend
poetry install
poetry shell
```

Run application locally:
```bash
uvicorn app.main:app --reload
```
