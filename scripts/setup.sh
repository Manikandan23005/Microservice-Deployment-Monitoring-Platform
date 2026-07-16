#!/usr/bin/env bash
# --- DevOps Nexus Local Sandbox Setup ---
set -euo pipefail

echo "=========================================="
echo "Initializing DevOps Nexus Local Sandbox"
echo "=========================================="

# Create local directories
echo "Creating data directories..."
mkdir -p data/prometheus data/grafana data/loki

# Create Kubernetes resources
echo "Applying base Kubernetes namespace..."
if command -v kubectl &> /dev/null; then
  kubectl apply -f kubernetes/namespace.yaml --dry-run=client
  echo "✔ Kubernetes dry-run validation passed."
else
  echo "⚠ kubectl not found, skipping cluster namespace apply. Check INSTALLATION.md"
fi

echo "Initialization completed successfully!"
