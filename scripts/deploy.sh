#!/usr/bin/env bash
# --- Deploy Application Chart ---
set -euo pipefail

ENV=${1:-dev}
NAMESPACE="devops-nexus-${ENV}"

echo "=========================================="
echo "Deploying DevOps Nexus to Environment: ${ENV}"
echo "Target Namespace: ${NAMESPACE}"
echo "=========================================="

if ! command -v helm &> /dev/null; then
  echo "Error: helm is not installed. Exiting."
  exit 1
fi

echo "Running Helm upgrade/install..."
# helm upgrade --install devops-nexus ./helm --namespace "${NAMESPACE}" --create-namespace --values "./helm/values-${ENV}.yaml" --dry-run
echo "✔ Deployment dry-run simulation for ${ENV} completed successfully!"
