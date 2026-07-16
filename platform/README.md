# Core Platform Framework

## Overview
This directory contains the codebases of the DevOps Nexus platform. 

## Module Restructuring

```
platform/
├── backend/      # FastAPI Python api orchestrator
├── frontend/     # React + Vite + TypeScript UI client
└── shared/       # Unified configurations and Pydantic models
```

* **Frontend:** The Single Page Application rendering operational interfaces.
* **Backend:** Exposes the API endpoint controllers querying active cluster metrics and handling deployments.
* **Shared:** Holds validation templates and setting schemas used across backend services.
