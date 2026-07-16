#!/usr/bin/env bash
# --- Cluster/Platform Healthcheck Script ---
set -euo pipefail

echo "=========================================="
echo "Checking DevOps Nexus System Health"
echo "=========================================="

if command -v kubectl &> /dev/null; then
  echo "Checking Kubernetes Cluster connection..."
  if kubectl cluster-info &> /dev/null; then
    echo "✔ Cluster connection is healthy."
    echo "Checking deployments state..."
    # kubectl get deployments -n devops-nexus
  else
    echo "✖ Unable to connect to Kubernetes cluster."
  fi
else
  echo "⚠ kubectl utility not found."
fi

# Checking local docker containers if running
if command -v docker &> /dev/null; then
  echo "Checking local Docker daemon status..."
  docker ps --filter "name=devops-nexus"
fi

echo "Healthcheck execution completed."
