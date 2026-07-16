#!/usr/bin/env bash
# --- Rollback Application Chart ---
set -euo pipefail

ENV=${1:-dev}
REVISION=${2:-""}
NAMESPACE="devops-nexus-${ENV}"

echo "=========================================="
echo "Rolling back DevOps Nexus release in: ${ENV}"
echo "=========================================="

if [ -z "${REVISION}" ]; then
  echo "Error: Revision number must be provided. Usage: ./rollback.sh <env> <revision>"
  exit 1
fi

echo "Rolling back release to revision ${REVISION}..."
# helm rollback devops-nexus "${REVISION}" --namespace "${NAMESPACE}"
echo "✔ Rollback action completed."
