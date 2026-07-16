# System Architecture Guide

This document details the architectural principles and flow mechanics within **DevOps Nexus**.

---

## 🏛️ Architecture Overview

DevOps Nexus operates as an **Internal Developer Platform (IDP)** overlay that orchestrates and monitors application microservices running on Kubernetes. It is built on three pillars:

1. **Declarative GitOps Delivery:** Continuous alignment between Git source manifests and Kubernetes live states via ArgoCD.
2. **Integrated Telemetry Loop:** Full-stack metric collection and log aggregation using Prometheus, Grafana, and Loki.
3. **AI-Powered Diagnostics:** Machine-assisted triage correlating events, logs, and trace parameters to resolve service degradation.

---

## 🔁 Communication Flows

```
 +-------------------------------------------------------------------------------+
 |                              Developer Git Push                               |
 +-------------------------------------------------------------------------------+
                                         |
                                         v
 +-------------------------------------------------------------------------------+
 |                        GitHub Actions Build & Test                            |
 +-------------------------------------------------------------------------------+
                                         |
                       +-----------------+-----------------+
                       | Pushes Images                     | Modifies Configs
                       v                                   v
 +-----------------------------+                   +-----------------------------+
 |     Container Registry      |                   |       Helm Chart Git        |
 +-----------------------------+                   +-----------------------------+
                       ^                                           |
                       | Pulls images                              | Syncs State
                       v                                           v
 +-------------------------------------------------------------------------------+
 |                              ArgoCD Controller                                |
 +-------------------------------------------------------------------------------+
                                         |
                                         v
 +-------------------------------------------------------------------------------+
 |                           Kubernetes Runtime                                  |
 |  +--------------------+  +--------------------+  +--------------------+       |
 |  |  Frontend Service  |  |  Gateway Service   |  |   Auth Service     |  ...  |
 |  +--------------------+  +--------------------+  +--------------------+       |
 +-------------------------------------------------------------------------------+
                                         |
                                         v  (Logs & Metrics)
 +-------------------------------------------------------------------------------+
 |                         Observability Scrapers                                |
 |  * Prometheus Engine                         * Grafana Dashboard              |
 |  * Loki Collector                            * Alertmanager Node              |
 +-------------------------------------------------------------------------------+
                                         |
                                         v  (Correlates Alerts & Logs)
 +-------------------------------------------------------------------------------+
 |                           AI Incident Analyzer                                |
 +-------------------------------------------------------------------------------+
```

---

## 🧩 Architectural Layers

### Microservice Tier
Applications run inside distinct Pod topologies with resource constraints (`hpa.yaml`). They communicate through the API `gateway` which acts as the perimeter ingress path. Inter-service communications are isolated using `networkpolicy.yaml` configuration parameters.

### Observability Tier
* **Prometheus:** Pull-based metrics collector querying pods exposing `/metrics` endpoints.
* **Loki:** DaemonSet log collector streaming pod stdout/stderr payloads.
* **Alertmanager:** Evaluation engine parsing thresholds and forwarding warnings.

### GitOps Tier
ArgoCD uses the pull pattern, checking the application declarations under `/gitops/argocd` against target cluster states. All environment overrides (`dev`, `qa`, `stage`, `prod`) are managed in Git, making configuration updates auditable and reversible.
