# DevOps Nexus Helm Chart

## Overview
This directory contains the Helm chart for deploying the DevOps Nexus microservice components.

## Structure
* `Chart.yaml`: Chart metadata and requirements declaration.
* `values.yaml`: Base parameters defaults across all installations.
* `values-dev.yaml` / `values-qa.yaml` / `values-stage.yaml` / `values-prod.yaml`: Environment values overrides.
* `templates/`: Resource manifest templates populated via parameters.

## Usage

Dry-run rendering of local templates:
```bash
helm template devops-nexus . --values values-dev.yaml
```

Install standard development chart:
```bash
helm install devops-nexus . -f values-dev.yaml --namespace devops-nexus
```
