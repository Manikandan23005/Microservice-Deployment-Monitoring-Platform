# 📚 DevOps Nexus v1.0 — Reference Examples Library

This directory contains reference templates, HTTP request samples, configuration presets, and Kubernetes manifest examples for **DevOps Nexus v1.0**.

> [!NOTE]
> All files in this directory are **reference examples** provided for documentation and testing purposes. Do not use sample credentials or test secrets directly in production.

---

## 📁 Directory Structure

| Subdirectory | Contents & Purpose |
|--------------|--------------------+
| [`api/`](api/) | Sample HTTP API requests (`login.http`, `deployments.http`, `investigate.http`) and export collections (`curl/`, `postman/`, `insomnia/`) |
| [`config/`](config/) | Configuration environment reference templates (`env/sample.env`) |
| [`kubernetes/`](kubernetes/) | Kubernetes workload manifest templates (`sample-deployment.yaml`) |
| [`helm/`](helm/) | Helm chart custom values reference (`sample-values.yaml`) |
| [`gitops/`](gitops/) | ArgoCD Application manifest templates (`application.yaml`) |
| [`cluster-registry/`](cluster-registry/) | Multi-Cluster Registry JSON payloads (`minikube.json`, `kubeadm.json`) |
| [`rbac/`](rbac/) | Enterprise RBAC role matrix definitions (`role-matrix.json`) |
| [`ai/`](ai/) | Nexus AI investigation request & response payloads (`sample-investigation-request.json`, `sample-investigation-response.json`) |
