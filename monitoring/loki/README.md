# Grafana Loki Logging Stack

## Purpose
Loki acts as a cost-effective, highly scalable log aggregation system that gathers stdout/stderr logs from all pods in our microservice namespaces.

## Architecture
Logs are scraped from nodes by Promtail/Fluentbit and shipped to Loki. Loki indexes metadata labels (such as namespace, app name, container) rather than complete log contents, enabling fast queries using LogQL.

## Future Dashboards
- **Error log aggregator:** Consolidated list of errors filtering by namespace.
- **Triage panel:** Log overlay synced to deployment update timestamps.
