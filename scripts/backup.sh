#!/usr/bin/env bash
# --- Backup System State ---
set -euo pipefail

BACKUP_DIR="backups/$(date +%F_%H-%M-%S)"
mkdir -p "${BACKUP_DIR}"

echo "=========================================="
echo "Backing up DevOps Nexus States to: ${BACKUP_DIR}"
echo "=========================================="

if command -v kubectl &> /dev/null; then
  echo "Extracting configmaps..."
  # kubectl get configmaps -n devops-nexus -o yaml > "${BACKUP_DIR}/configmaps.yaml"
  echo "Extracting secrets..."
  # kubectl get secrets -n devops-nexus -o yaml > "${BACKUP_DIR}/secrets.yaml"
  echo "✔ Resources backup simulation completed."
else
  echo "Skipping kubectl resource backups. Cluster connection offline."
fi
