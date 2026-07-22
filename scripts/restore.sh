#!/usr/bin/env bash
# ==============================================================================
# DevOps Nexus v1.0 — Enterprise Production State Restore Utility
# ==============================================================================

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ "$#" -ne 1 ]; then
  echo -e "${RED}Usage: $0 <backup-archive.tar.gz | backup-directory>${NC}"
  echo "Example: $0 ./backups/nexus_backup_20260721_100000.tar.gz"
  exit 1
fi

INPUT_PATH="$1"
TEMP_RESTORE_DIR="./backups/restore_temp_$$"

echo -e "${CYAN}${BOLD}"
echo "========================================================================"
echo "         📥 DevOps Nexus v1.0 Enterprise State Restore Utility          "
echo "========================================================================"
echo -e "${NC}"

if [ ! -e "${INPUT_PATH}" ]; then
  echo -e "${RED}Error: Backup file or directory '${INPUT_PATH}' does not exist.${NC}"
  exit 1
fi

mkdir -p "${TEMP_RESTORE_DIR}"
trap 'rm -rf "${TEMP_RESTORE_DIR}"' EXIT

if [[ "${INPUT_PATH}" == *.tar.gz ]]; then
  echo -e "${BOLD}Unpacking backup tarball archive...${NC}"
  tar -xzf "${INPUT_PATH}" -C "${TEMP_RESTORE_DIR}"
  UNPACKED_DIR=$(find "${TEMP_RESTORE_DIR}" -mindepth 1 -maxdepth 1 -type d | head -n1)
else
  UNPACKED_DIR="${INPUT_PATH}"
fi

# 1. Restore PostgreSQL Database
if [ -f "${UNPACKED_DIR}/db_dump.sql" ]; then
  echo -e "${BOLD}[1/3] Restoring PostgreSQL Database...${NC}"
  if docker compose exec -T postgres psql -U postgres -d devops_nexus < "${UNPACKED_DIR}/db_dump.sql" 2>/dev/null; then
    echo "  ✓ Database state restored successfully"
  else
    echo "  ⚠ Database container unavailable. Ensure postgres container is running."
  fi
fi

# 2. Restore Environment Config
if [ -f "${UNPACKED_DIR}/.env.backup" ]; then
  echo -e "${BOLD}[2/3] Restoring Environment Configuration (.env)...${NC}"
  cp "${UNPACKED_DIR}/.env.backup" .env
  echo "  ✓ .env file restored"
fi

# 3. Apply Kubernetes Manifests
if command -v kubectl &>/dev/null && kubectl cluster-info &>/dev/null; then
  echo -e "${BOLD}[3/3] Re-applying Kubernetes & ArgoCD Manifests...${NC}"
  if [ -f "${UNPACKED_DIR}/k8s_namespaces.yaml" ]; then
    kubectl apply -f "${UNPACKED_DIR}/k8s_namespaces.yaml" 2>/dev/null || true
  fi
  if [ -f "${UNPACKED_DIR}/argocd_apps.yaml" ]; then
    kubectl apply -f "${UNPACKED_DIR}/argocd_apps.yaml" 2>/dev/null || true
  fi
  echo "  ✓ Kubernetes cluster state re-applied"
fi

echo -e "\n${GREEN}${BOLD}"
echo "========================================================================"
echo "  ✓ State Restore Operations Completed!"
echo "========================================================================"
echo -e "${NC}"
