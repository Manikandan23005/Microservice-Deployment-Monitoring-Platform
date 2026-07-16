# Installation Guide

## Overview
This document guides administrators and developers through installing the core components of DevOps Nexus.

## Goals
- Detail multi-environment installation strategies (Local, Staging, Production).
- Walk through namespace creation and base service configuration bindings.
- Establish values overrides schema validation patterns.

## Implementation Plan
1. **Local Compose Sandbox Installation:**
   - Run Docker Compose to boot applications and monitoring skeletons side-by-side.
   - Run `scripts/setup.sh` to populate mock credentials and database directories.
2. **Kubernetes Manual Installation:**
   - Execute `kubectl apply -f kubernetes/namespace.yaml` to define target spaces.
   - Deploy configurations (`configmap.yaml` and `secret.example.yaml`).
   - Run `helm install devops-nexus ./helm --values ./helm/values-dev.yaml`.
3. **ArgoCD Declarative Installation:**
   - Install the ArgoCD Custom Resource Definitions (CRDs).
   - Apply environment Application manifests under `gitops/argocd/`.

## Future Work
* **SSL/TLS Certificates Integration:** Introduce cert-manager for automatic Let's Encrypt certificates.
* **Database migrations pipeline:** Integrate database migration jobs prior to starting service deployments.

## References
* [ArgoCD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
* [Kubernetes Namespaces Guide](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
