# 📊 DevOps Nexus v1.0 — Observability Platform Guide

This document details the telemetry metrics dashboard, Grafana integration, and Loki log aggregator pipeline in **DevOps Nexus v1.0**.

---

## 📈 1. Telemetry Metrics Dashboard (`Metrics.tsx`)

DevOps Nexus provides a Grafana-grade telemetry suite rendering 8 live performance metrics:

1. **CPU Usage**: `100 - (avg(rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)`
2. **Memory Usage**: `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`
3. **Network I/O**: `sum(rate(node_network_receive_bytes_total[5m])) / 1024`
4. **Disk Usage**: `(1 - (node_filesystem_free_bytes{mountpoint='/'} / node_filesystem_size_bytes{mountpoint='/'})) * 100`
5. **Request Rate**: `sum(rate(http_requests_total[5m]))`
6. **Error Rate**: `(sum(rate(http_requests_total{status=~'5..'}[5m])) / sum(rate(http_requests_total[5m]))) * 100`
7. **P95 Latency**: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) * 1000`
8. **Running Pods Count**: `count(kube_pod_status_phase{phase='Running'})`

---

## 📜 2. Dual-Source Log Aggregation (`Logs.tsx`)

Log inspection uses a resilient dual-source pipeline:
- **Primary Source (Grafana Loki)**: Queries LogQL selectors (`{namespace=~"..."}`) via `app/clients/loki.py` with multi-tenancy `X-Scope-OrgID: fake` header.
- **Fallback Source (Kubernetes API)**: If Loki has no log streams for a specific pod, DevOps Nexus automatically falls back to live `pod_service.get_pod_logs`.

---

## 🔔 3. AlertManager Integration (`Alerts.tsx`)

DevOps Nexus queries active Prometheus AlertManager firing alerts via `/api/v1/monitoring/alerts` and synthesizes cluster workload warning badges.

---

## 🔗 Related Documentation
- 🏗️ [03-system-architecture.md](03-system-architecture.md) — System architecture
- 🧠 [07-nexus-ai.md](07-nexus-ai.md) — Nexus AI investigation engine
- 🔌 [11-api-reference.md](11-api-reference.md) — Telemetry API reference
