# ArgoCD GitOps Configurations

## Overview
This directory maps our target environment deployment configurations to the live Kubernetes clusters using ArgoCD Application manifests.

## Structure
* `dev/application.yaml`: Application configurations for Development.
* `qa/application.yaml`: Application configurations for Quality Assurance.
* `stage/application.yaml`: Application configurations for Staging.
* `prod/application.yaml`: Application configurations for Production.

## Setup
Apply the Application resource to an active ArgoCD cluster:
```bash
kubectl apply -f dev/application.yaml
```
