# Observability & Telemetry Pipeline Architecture

## Overview

DevOps Nexus aggregates real-time metrics, log streams, and Kubernetes cluster events into a unified observability pipeline. Telemetry feeds directly into both the visual Monitoring Dashboard and the Autonomous AIOps Investigation Engine.

---

## 📊 Telemetry Flow Architecture

```mermaid
graph TD
    subgraph "Kubernetes Infrastructure Layer"
        Pods["📦 Kubernetes Pods / Containers"]
        Nodes["💻 Kubernetes Nodes (Minikube)"]
        Events["📢 K8s Cluster Events (Warning / Critical)"]
    end

    subgraph "Monitoring & Logging Stack"
        Prometheus["📊 Prometheus (Port 9090)"]
        Loki["📝 Loki (Port 3100)"]
    end

    subgraph "Platform Collector & Supervisor"
        PortSupervisor["🛡️ Telemetry Port Supervisor (Daemon Thread)"]
        PromClient["PrometheusClient (with K8s Metric Fallback)"]
        LokiClient["LokiClient (with K8s Log Stream Fallback)"]
        EventCollector["K8s Event Collector"]
    end

    subgraph "Data Consumers"
        Dashboard["🎨 Frontend Monitoring & Metrics Dashboard"]
        AIEngine["🧠 Autonomous AIOps Investigation Engine"]
    end

    Pods -->|Scrape Metrics| Prometheus
    Pods -->|Log Output (stdout/stderr)| Loki
    Pods -->|Emit Lifecycle Events| Events

    Prometheus --> PromClient
    Loki --> LokiClient
    Events --> EventCollector

    PortSupervisor -.->|Auto-Heals Ports 9090 & 3100| Prometheus
    PortSupervisor -.->|Auto-Heals Ports 9090 & 3100| Loki

    PromClient --> Dashboard
    LokiClient --> Dashboard
    EventCollector --> Dashboard

    PromClient -->|Metrics Evidence| AIEngine
    LokiClient -->|Log Streams Evidence| AIEngine
    EventCollector -->|Events Evidence| AIEngine
```

---

## 🛡️ Fail-Safe Telemetry Architecture (Zero-Degraded Guarantee)

### 1. Continuous Background Port Supervisor Daemon
* **File**: `platform/backend/app/services/port_supervisor.py`
* **Mechanism**: Spawns a background thread running every 3 seconds to check ports `9090` (Prometheus), `3100` (Loki), and `8082` (Grafana).
* **Auto-Healing**: If ports drop due to host restart, minikube reboot, or process kill, the daemon re-executes `kubectl port-forward --address=0.0.0.0` automatically.

### 2. K8s API Metric Synthesis Fallback (`PrometheusClient`)
* **File**: `platform/backend/app/clients/prometheus.py`
* **Mechanism**: If Prometheus is starting up or temporarily unreachable, queries K8s API (`list_pod_for_all_namespaces`) to synthesize valid Prometheus vector/matrix JSON responses.
* **Result**: Dashboard metrics endpoints **NEVER** throw unhandled exceptions or display `DEGRADED` telemetry status cards.

### 3. K8s Container Log Stream Fallback (`LokiClient`)
* **File**: `platform/backend/app/clients/loki.py`
* **Mechanism**: If Loki is starting up or unreachable, queries live container log output via K8s API (`read_namespaced_pod_log`) and returns valid LogQL stream structures.
* **Result**: Dashboard log endpoints **NEVER** throw unhandled exceptions or display `DEGRADED` status cards.
