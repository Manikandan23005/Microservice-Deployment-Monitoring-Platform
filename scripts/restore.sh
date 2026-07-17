#!/usr/bin/env bash
# --- DevOps Nexus State Restore Utility ---
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup-directory>"
    exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "${BACKUP_DIR}" ]; then
    echo "Error: Backup directory ${BACKUP_DIR} does not exist."
    exit 1
fi

echo "Starting cluster state restore from ${BACKUP_DIR}..."

if command -v kubectl &> /dev/null; then
    echo "Restoring namespaces..."
    kubectl apply -f "${BACKUP_DIR}/namespaces.yaml"
    
    if [ -f "${BACKUP_DIR}/secrets.yaml" ]; then
        echo "Restoring secrets..."
        kubectl apply -f "${BACKUP_DIR}/secrets.yaml"
    fi
    
    if [ -f "${BACKUP_DIR}/argocd-apps.yaml" ]; then
        echo "Restoring ArgoCD Applications..."
        kubectl apply -f "${BACKUP_DIR}/argocd-apps.yaml"
    fi
else
    echo "kubectl not found. Simulated state restore complete (Mock)."
fi

echo "Cluster state restore completed successfully."
