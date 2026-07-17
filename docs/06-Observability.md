# Observability & Monitoring

This document details the telemetry monitoring integrations implemented in the DevOps Nexus platform.

## Prometheus Integration
The backend communicates with Prometheus HTTP endpoint (`PROMETHEUS_URL`) to execute instant vector and range queries.
- **Range Queries:** Implemented in `platform/backend/app/clients/prometheus.py`, query CPU and Memory utilization data points.
- **Aggregations:** The services calculate cluster-wide averages and return clean JSON range arrays.

## Loki Integration
Container logs are streamed from Grafana Loki HTTP endpoint (`LOKI_URL`).
- **Search Filters:** Supports real-time text parsing search and namespace log filtering.
- **Fallbacks:** In the absence of an active Loki instance, the backend returns simulated server output lines.

## Frontend Charts
The dashboard UI renders these metrics ranges using custom SVG vectors paths (`<path d="..." />`) to plot active memory utilization sparklines over the last 1 hour without relying on heavy third-party plotting libraries.
