#!/usr/bin/env bash
# --- DevOps Nexus Local Sandbox Cleanup ---
set -euo pipefail

echo "=========================================="
echo "Cleaning up DevOps Nexus local footprints"
echo "=========================================="

echo "Removing data directories..."
rm -rf data/

if command -v kubectl &> /dev/null; then
  echo "Wiping resources in devops-nexus namespace..."
  # kubectl delete namespace devops-nexus --ignore-not-found
fi

echo "Cleanup completed successfully!"
