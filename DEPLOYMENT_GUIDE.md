# DevOps Nexus - Microservices Deployment & Operations Manual

This guide describes the architecture, deployment processes, Helm packaging, GitOps integration, and observability systems for the sample microservices ecosystem.

---

## 🏛️ 1. Microservice Overview
The sample ecosystem simulates a lightweight e-commerce application platform:

| Service | Port | Tech Stack | Role | Downstream Deps |
|---|---|---|---|---|
| `gateway` | `8080` | Express.js | Ingress Routing, Auth checks | All services |
| `frontend` | `3000` | Express.js | Client dashboard portal UI | `gateway` |
| `auth` | `8000` | FastAPI | Token auth check, login check | None |
| `users` | `8000` | FastAPI | User profile management | None |
| `products` | `8000` | FastAPI | E-Commerce product catalog | None |
| `orders` | `8000` | FastAPI | Shopping cart checkout | `products`, `payment`, `notification` |
| `payment` | `8000` | FastAPI | Processing simulated payments | None |
| `notification`| `8000` | FastAPI | Event logging dispatched alerts | None |

Each python microservice contains `/health`, `/ready`, `/version`, and `/metrics` routes.

---

## 📦 2. Docker Packaging & Image Builds
Images are optimized using multi-stage slim Python/Node templates. Build them inside Minikube's Docker namespace:
```bash
# Configure the terminal shell
eval $(minikube docker-env)

# Run the automated builder script
./scripts/build_images.sh
```

---

## ⛵ 3. Helm Configuration Guide
Independent charts are configured under `helm/<service>/`.
- **Overrides:** `values.yaml` (default), `values-dev.yaml`, `values-qa.yaml`, `values-prod.yaml`
- **Port Naming:** Ports are named `http` to enable automatic discovery by the Prometheus ServiceMonitor.
- **Deploy Command:**
```bash
./scripts/deploy_helm.sh
```

---

## 🔄 4. GitOps ArgoCD Integration
ArgoCD Application manifests are configured under `gitops/argocd/` environments (`dev`, `qa`, `prod`). To register them:
```bash
kubectl apply -f gitops/argocd/prod/
```
These point to the respective Helm value overrides and deploy the target releases into environment-specific namespaces (e.g. `devops-nexus-prod`).

---

## 🚦 5. Traffic Generator Operations
The traffic generator runs inside the cluster sending synthetic requests to simulate real dashboard activity:
- **Start:** Scale the deployment to `1`:
  ```bash
  kubectl scale deployment/traffic-generator -n devops-nexus-prod --replicas=1
  ```
- **Stop:** Scale the deployment to `0`:
  ```bash
  kubectl scale deployment/traffic-generator -n devops-nexus-prod --replicas=0
  ```
- **View Logs:**
  ```bash
  kubectl logs -n devops-nexus-prod -l app=traffic-generator
  ```
