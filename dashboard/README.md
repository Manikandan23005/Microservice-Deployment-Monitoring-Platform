# DevOps Nexus Dashboard Portal

## Overview
This directory contains the codebase for the DevOps Nexus Internal Developer Platform (IDP) unified dashboard.

## Wireframe Structure

```
+-----------------------------------------------------------------------------------+
|  [DevOps Nexus]   Env: [Dev  | QA | Stage | Prod]      Status: [System Healthy]    |
+-----------------------------------------------------------------------------------+
|  [Navigation]  | [Overview: Deployment States]                                    |
|                |                                                                  |
|  * Services    |  +--------------------+  +--------------------+  +------------+  |
|  * Observability|  | auth      [Synced] |  | gateway   [Synced] |  | users [Err]|  |
|  * Logs        |  +--------------------+  +--------------------+  +------------+  |
|  * AI Insights |                                                                  |
|  * Configs     | [Observability Panel]                                            |
|                |  - Latency: [   25ms ]  - Throughput: [ 1.2k rps ]                |
|                |                                                                  |
|                | [AI Incident Assistant Diagnostic Report]                         |
|                |  > CRITICAL: service "users" failed due to database connection    |
|                |  > timeout. Recommendation: Verify ConfigMap db url bindings.    |
+-----------------------------------------------------------------------------------+
```

## Component Breakdowns
* **Service Grid:** Visual card representations mapping status info (derived from ArgoCD and Kubernetes pods lists).
* **Metrics Ingestion Panel:** Sparkline representations of pod CPU/Memory and request counts.
* **Logs Aggregator Terminal:** Filterable log output console reading from Loki index targets.
* **AI Diagnostics Panel:** Detailed post-mortem breakdown display window.

## Subdirectories
* `frontend/`: Single Page Application (SPA) client interface resources.
* `backend/`: FastAPI or Go backend API server resource files.
