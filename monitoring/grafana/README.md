# Grafana Dashboards

## Purpose
Grafana provides visual analytics. It queries metrics databases (Prometheus) and logs clusters (Loki) to build panels tracking application health.

## Architecture
Grafana connects to Prometheus and Loki datasources inside the cluster. Dashboard JSON models are mounted into Grafana via Kubernetes ConfigMaps for automated deployment lifecycle.

## Future Dashboards
- **API Gateway Panel:** Request volume, failure rate, latency per route.
- **AI Diagnostics logs view:** Panel mapping AI recommendations directly against high-severity logs.
