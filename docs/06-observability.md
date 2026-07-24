# Observability & Telemetry Integration Guide

## Overview

The observability stack in DevOps Nexus aggregates metrics, container log streams, and Kubernetes cluster events into real-time visual dashboards and AI diagnostic context.

---

## 📊 Telemetry Data Flow

```mermaid
graph TD
    Pod["📦 Kubernetes Pods"] -->|Scrape Metrics| Prom["📊 Prometheus (9090)"]
    Pod -->|Container stdout/stderr| Loki["📝 Loki (9100)"]
    Pod -->|Lifecycle Events| K8sEvents["📢 K8s API Events"]

    Prom --> PromClient["Prometheus Client"]
    Loki --> LokiClient["Loki Client"]
    K8sEvents --> EventCollector["Event Collector"]

    PromClient --> Dashboard["🎨 Monitoring Dashboard"]
    LokiClient --> Dashboard
    EventCollector --> Dashboard

    PromClient --> AIEngine["🧠 Autonomous AIOps Engine"]
    LokiClient --> AIEngine
    EventCollector --> AIEngine
```

---

## 🛡️ Zero-Degraded Fail-Safe Guarantee

1. **Continuous Port Supervisor Daemon**: Checks ports 9090 (Prometheus), 3100 (Loki), and 8082 (Grafana) every 3 seconds and auto-heals dropped port-forwards.
2. **K8s API Metric Synthesis**: If Prometheus is offline, `prometheus_client` synthesizes metrics vector/matrix JSON directly from live Kubernetes pod and node states.
3. **K8s Log Stream Synthesis**: If Loki is offline, `loki_client` queries live container logs via `read_namespaced_pod_log` and returns valid stream structures.
