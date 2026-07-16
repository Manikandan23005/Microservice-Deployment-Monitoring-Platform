# Observability Stack Guide

## Overview
This document describes the structure and operations of the DevOps Nexus Observability stack: Prometheus, Grafana, Loki, and Alertmanager.

## Goals
- Aggregate metrics and logs from all running microservices.
- Provide unified dashboards for developer triage.
- Configure alerting pathways for immediate incident warnings.

## Implementation Plan
1. **Metrics Collection:**
   - Prometheus scrapers query target service ports.
   - Core metrics: request volume, latency, error rates, and CPU saturation.
2. **Log Aggregation:**
   - Loki streams container logs mapped by namespace, pod name, and container name.
3. **Alerting System:**
   - Alertmanager rules trigger warning thresholds (e.g. pods in CrashLoopBackOff).

## Future Work
* **OpenTelemetry SDK Integration:** Instrument code for distributed tracing to monitor inter-service API call latency.
* **Grafana Dashboard Templating:** Standardize multi-tenant developer dashboard layouts.

## References
* [Prometheus Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
* [Loki LogQL Reference](https://grafana.com/docs/loki/latest/query/)
