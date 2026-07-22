#!/usr/bin/env bash
# ==============================================================================
# DevOps Nexus v1.0 — Enterprise Support Bundle & Diagnostics Tool
# ==============================================================================

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DIAG_BASE="./diagnostics"
BUNDLE_DIR="${DIAG_BASE}/support_bundle_${TIMESTAMP}"
BUNDLE_TARBALL="${DIAG_BASE}/nexus_support_bundle_${TIMESTAMP}.tar.gz"

mkdir -p "${BUNDLE_DIR}" "${DIAG_BASE}"

echo -e "${CYAN}${BOLD}"
echo "========================================================================"
echo "      🩺 DevOps Nexus v1.0 Support Bundle & Diagnostics Tool            "
echo "========================================================================"
echo -e "${NC}"

echo -e "${BOLD}[1/5] Collecting System & OS Environment Info...${NC}"
{
  echo "=== System Info ==="
  uname -a
  echo ""
  echo "=== Memory & Disk ==="
  free -h 2>/dev/null || true
  df -h .
  echo ""
  echo "=== Docker & Compose Versions ==="
  docker --version 2>/dev/null || true
  docker compose version 2>/dev/null || true
  kubectl version --client 2>/dev/null || true
} > "${BUNDLE_DIR}/system_info.txt"
echo "  ✓ System environment captured"

echo -e "${BOLD}[2/5] Capturing Docker Container Logs & Status...${NC}"
docker compose ps > "${BUNDLE_DIR}/docker_ps.txt" 2>&1 || true
docker compose logs --tail=200 > "${BUNDLE_DIR}/docker_compose_logs.txt" 2>&1 || true
echo "  ✓ Docker logs & status captured"

echo -e "${BOLD}[3/5] Capturing Kubernetes Cluster Context & Telemetry...${NC}"
if command -v kubectl &>/dev/null && kubectl cluster-info &>/dev/null; then
  kubectl get nodes -o wide > "${BUNDLE_DIR}/k8s_nodes.txt" 2>&1 || true
  kubectl get pods -A -o wide > "${BUNDLE_DIR}/k8s_all_pods.txt" 2>&1 || true
  kubectl get deployments -A > "${BUNDLE_DIR}/k8s_all_deployments.txt" 2>&1 || true
  kubectl get events -n devops-nexus-prod --sort-by='.lastTimestamp' > "${BUNDLE_DIR}/k8s_nexus_events.txt" 2>&1 || true
  echo "  ✓ Kubernetes cluster state captured"
else
  echo "Kubernetes cluster not reachable" > "${BUNDLE_DIR}/k8s_nodes.txt"
fi

echo -e "${BOLD}[4/5] Running Subsystem Health Diagnostics...${NC}"
if [ -f ./scripts/healthcheck.sh ]; then
  ./scripts/healthcheck.sh > "${BUNDLE_DIR}/healthcheck_report.txt" 2>&1 || true
  echo "  ✓ Subsystem health report generated"
fi

echo -e "${BOLD}[5/5] Packaging Diagnostics Support Bundle Tarball...${NC}"
tar -czf "${BUNDLE_TARBALL}" -C "${DIAG_BASE}" "support_bundle_${TIMESTAMP}"
rm -rf "${BUNDLE_DIR}"

echo -e "\n${GREEN}${BOLD}"
echo "========================================================================"
echo "  ✓ Support Bundle Successfully Created! File Location:"
echo "    ${BUNDLE_TARBALL} ($(du -sh "${BUNDLE_TARBALL}" | cut -f1))"
echo "========================================================================"
echo -e "${NC}"
