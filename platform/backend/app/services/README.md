# Platform Integration Services

## Purpose
This directory contains client engines interfacing with external DevOps components.

## Planned Modules
* `k8s_client.py`: Interacts with the Kubernetes Python Client API to list pods, nodes, and deploy resources.
* `argocd_client.py`: Queries the ArgoCD REST API for application synchronization states.
* `prometheus_client.py`: Fetches time-series telemetry metrics.
* `loki_client.py`: Aggregates container log files.
* `ai_engine.py`: Context compilers connecting to OpenAI, Groq, or local Ollama instances.
