# Observability Stack Guide

## Overview
This document describes how DevOps Nexus integrates with the cluster observability stack (Prometheus, Loki, Alertmanager).

## Goals
- Aggregate metrics and logs from all running microservices.
- Retrieve data programmatically via our unified FastAPI backend observability services.

## Implementation Plan
1. **Metrics Collection:**
   - Prometheus queries pod performance status.
   - FastAPI backend queries Prometheus REST endpoints (`/api/v1/query`) using `httpx` to parse and serialize measurements.
2. **Log Aggregation:**
   - Loki aggregates container logs.
   - FastAPI backend endpoints query Loki API streams (`/loki/api/v1/query_range`) and return them as a unified text socket to the React client logs console.
3. **Alertmanager Webhooks:**
   - Alertmanager posts firing alerts directly to the FastAPI path `/api/v1/alerts`.
   - The platform receives alerts, gathers Loki logs around the alert timestamp, and submits the context to the AI diagnostics queue.

## Future Work
* **OpenTelemetry Distributed Tracing:** Implement tracing endpoints in FastAPI to visualize trace trees in the React UI.
* **WebSocket Streams:** Use WebSockets for streaming logs from Loki dynamically.

## References
* [Prometheus API Documentation](https://prometheus.io/docs/prometheus/latest/querying/api/)
* [Loki HTTP API Reference](https://grafana.com/docs/loki/latest/reference/api/)
