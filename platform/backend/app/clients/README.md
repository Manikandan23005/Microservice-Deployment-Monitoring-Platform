# Integration Clients

## Purpose
This directory contains direct connectors to external interfaces. These wrappers only handle low-level API communication.

## Planned Modules
* `kubernetes.py`: Calls to the Kubernetes Cluster API.
* `argocd.py`: Querying the Argo CD REST API.
* `prometheus.py`: Scrapes from the Prometheus HTTP API.
* `loki.py`: Extracts from the Loki Query API.
* `ai.py`: Connectors to local Ollama or OpenAI endpoints.
