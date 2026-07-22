# 🔌 DevOps Nexus v1.0 — REST API Reference

The **DevOps Nexus** Backend API is built using **FastAPI Async** and provides RESTful endpoints for microservice telemetry, Kubernetes workload management, ArgoCD GitOps control, Nexus AI incident investigation, and multi-cluster orchestration.

Base URL: `http://localhost:8000/api/v1`

Interactive Swagger OpenAPI UI: `http://localhost:8000/docs`

---

## 🔐 1. Authentication & Security

### `POST /api/v1/auth/login`
Authenticate user credentials and receive a JWT Access Token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "username": "admin",
    "role": "Administrator"
  }
}
```

---

## ☸️ 2. Workload & Cluster Operations

### `GET /api/v1/deployments`
List deployments in the current scope.

**Query Parameters:**
- `namespace` *(optional)*: Filter by namespace (e.g. `devops-nexus-prod`)
- `cluster` *(optional)*: Target cluster name (e.g. `minikube`)

**Response (200 OK):**
```json
[
  {
    "name": "auth-service",
    "namespace": "devops-nexus-prod",
    "status": "Healthy",
    "replicas": 2,
    "ready_replicas": 2,
    "gitopsManaged": true,
    "manager": "ArgoCD",
    "argocd_app_name": "auth-service",
    "sync_status": "Synced",
    "health_status": "Healthy"
  }
]
```

### `POST /api/v1/deployments/{namespace}/{name}/restart`
Trigger a rolling restart for a deployment rollout.

### `POST /api/v1/deployments/{namespace}/{name}/scale`
Scale replica count for a deployment.

**Request Body:**
```json
{
  "replicas": 3
}
```

---

## 📦 3. Kubernetes Pod Operations

### `GET /api/v1/pods`
List pods in active scope.

### `GET /api/v1/logs`
Stream pod log entries from Grafana Loki or live Kubernetes API fallback.

---

## 📊 4. Telemetry & Observability

### `GET /api/v1/monitoring/metrics`
Retrieve 8-type performance range metrics for SVG chart rendering.

**Query Parameters:**
- `metric_type`: `cpu` | `memory` | `network` | `disk` | `requests` | `errors` | `latency` | `pods`

---

## 🧠 5. Nexus AI Autonomous Investigation Engine

### `POST /api/v1/ai/investigate`
Run deep infrastructure diagnostics on a target workload.

**Request Body:**
```json
{
  "query": "Why is auth-service restarting?",
  "target_resource": "auth-service",
  "target_kind": "deployment",
  "namespace": "devops-nexus-prod"
}
```

### `POST /api/v1/ai/plan/execute`
Execute a step in a Nexus AI remediation plan.

---

## 🌐 6. Multi-Cluster Registry

### `GET /api/v1/clusters`
List all registered clusters.

---

## 🔗 Related Documentation
- 🏗️ [03-system-architecture.md](03-system-architecture.md) — System architecture
- 🛡️ [12-rbac-security.md](12-rbac-security.md) — Security & JWT auth
- 💻 [14-developer-guide.md](14-developer-guide.md) — Developer API client bindings
