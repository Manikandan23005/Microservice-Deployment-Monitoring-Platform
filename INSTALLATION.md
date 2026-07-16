# Installation Guide

This document describes how to set up, configure, and install the **DevOps Nexus** platform skeleton.

---

## 📋 Prerequisites

Before starting, ensure you have the following CLI utilities installed:
* **Docker Engine** (v20.10+) or Docker Desktop
* **Minikube** (v1.30+) or **Kind** for local Kubernetes simulation
* **kubectl** (v1.28+) configured to communicate with your cluster
* **Helm** (v3.0+) for package deployments
* **Git** for source-control management

See [01-Prerequisites.md](docs/01-Prerequisites.md) for direct installation instructions per OS.

---

## 🚀 Local Developer Sandbox Setup

### Step 1: Clone the Project
```bash
git clone https://github.com/Manikandan23005/Microservice-Deployment-Monitoring-Platform.git
cd Microservice-Deployment-Monitoring-Platform
```

### Step 2: Set Executable Permissions on Utility Scripts
```bash
chmod +x scripts/*.sh
```

### Step 3: Run the Initialization Helper
The `setup.sh` script installs base namespace records, local dummy secrets, and directories:
```bash
./scripts/setup.sh
```

---

## ☸️ Deploying to Kubernetes

To deploy the template skeleton onto your cluster:

### Step 1: Create Namespace Structures
```bash
kubectl apply -f kubernetes/namespace.yaml
```

### Step 2: Deploy Infrastructure Secret and Config templates
Ensure you fill in your local keys in the template files beforehand:
```bash
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.example.yaml
```

### Step 3: Deploy Helm Chart Packages
Navigate to the Helm folder and dry-run/install templates:
```bash
# Verify Helm template generation
helm template devops-nexus ./helm --values ./helm/values-dev.yaml

# Install the application
helm install devops-nexus ./helm --namespace devops-nexus --values ./helm/values-dev.yaml
```

### Step 4: Configure ArgoCD Application Syncs
Apply ArgoCD application wrappers to monitor the environment configurations:
```bash
kubectl apply -f gitops/argocd/dev/application.yaml
```
Refer to [02-Installation.md](docs/02-Installation.md) for production environment installations and SSL configurations.
