# Prerequisites

## Overview
This document outlines the software dependencies, runtime requirements, and developer environment configurations needed to deploy, build, and operate the **DevOps Nexus** platform.

## Goals
- Provide clear instructions on what CLI utilities and environments must be initialized.
- Match specific vendor and open-source tool versions for reliable operations.
- Avoid runtime deviations across development machines.

## Implementation Plan
1. **Container Runtimes:**
   - Docker Engine (v24.0.0+) or Docker Desktop.
   - Containerd daemon configure setups.
2. **Kubernetes Cluster Environment:**
   - Local options: Minikube (v1.32.0+) with `ingress` and `metrics-server` addons enabled, or Kind (v0.20.0+).
   - Remote options: Amazon EKS (v1.28+), Google GKE (v1.28+), or self-managed clusters.
3. **Core CLI Utilities:**
   - `kubectl` matching the cluster version.
   - `helm` (v3.12.0+) for package configuration.
   - Git (v2.38+) for GitOps repo management.

## Future Work
* **Automatic Prerequisite Check Script:** Add pre-flight validations in `setup.sh` to check for missing packages.
* **Devcontainer Configuration:** Build a shared `.devcontainer` configuration so developers can load dependencies directly inside VSCode/GitHub Codespaces.

## References
* [Docker Installation Guide](https://docs.docker.com/engine/install/)
* [Minikube Setup Guide](https://minikube.sigs.k8s.io/docs/start/)
* [Helm Package Manager Documentation](https://helm.sh/docs/)
