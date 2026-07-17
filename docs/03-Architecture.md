# Platform Architecture

## Overview
This document details the architecture of the **DevOps Nexus** unified core platform, focusing on decoupled microservice coordination, centralized observability routing, and GitOps controls.

## Design Decisions
1. **Frontend-to-Backend API Coordination:**
   - React TypeScript UI on port 3000 queries the FastAPI REST backend on port 8000.
2. **Kubernetes Integration Client:**
   - Uses the official Kubernetes Python Client library (`kubernetes`) to list namespaces, describe active pods, scale deployments, and check cluster health.
3. **Telemetry & Observability Scrapers:**
   - Prometheus and Loki client connectors fetch real-time workload stats (CPU, Memory, Disk) and log streams.
4. **GitOps synchronizations:**
   - Wraps the GitHub REST API to trace workflows and ArgoCD server REST routes to sync and roll back applications.
5. **AI Assistant Completions:**
   - Supports local models (Ollama/LM Studio) and remote models (OpenAI/Groq).
6. **Hardened Production Controls:**
   - Uses Redis to support rate-limiting and metadata caching.
   - Enforces RBAC permissions through JWT token validators.
