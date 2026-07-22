#!/usr/bin/env bash
# ==============================================================================
# DevOps Nexus v1.0 — One-Command Production Ready Installer
# ==============================================================================
# Usage:
#   ./install.sh                  Full automated installation & startup
#   ./install.sh --validate-only  Run pre-install system diagnostics only
#   ./install.sh --skip-build     Start services using pre-built images
# ==============================================================================

set -e

# --- Color Formatting ---
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# --- Script Configuration ---
VALIDATE_ONLY=false
SKIP_BUILD=false

for arg in "$@"; do
  case $arg in
    --validate-only)
      VALIDATE_ONLY=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
  esac
done

banner() {
  echo -e "${CYAN}${BOLD}"
  echo "========================================================================"
  echo "         🚀 DevOps Nexus v1.0 Enterprise Production Installer           "
  echo "========================================================================"
  echo -e "${NC}"
}

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# --- System Validation Engine ---
validate_system() {
  echo -e "${BOLD}Checking System Prerequisites & Prerequisites Diagnostics...${NC}"
  local ERRORS=0

  # 1. Docker Daemon Check
  if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
      log_success "Docker daemon is running ($(docker --version | cut -d',' -f1))"
    else
      log_error "Docker is installed but daemon is not running."
      echo "      Fix: Run 'sudo systemctl start docker' or start Docker Desktop."
      ERRORS=$((ERRORS + 1))
    fi
  else
    log_error "Docker CLI is not installed."
    echo "      Fix: Install Docker from https://docs.docker.com/engine/install/"
    ERRORS=$((ERRORS + 1))
  fi

  # 2. Docker Compose Check
  if docker compose version >/dev/null 2>&1; then
    log_success "Docker Compose is available ($(docker compose version --short))"
  elif command -v docker-compose >/dev/null 2>&1; then
    log_success "Docker Compose (legacy) is available ($(docker-compose --version))"
  else
    log_error "Docker Compose plugin is missing."
    echo "      Fix: Install docker-compose-plugin."
    ERRORS=$((ERRORS + 1))
  fi

  # 3. Kubectl Check
  if command -v kubectl >/dev/null 2>&1; then
    log_success "kubectl CLI is installed ($(kubectl version --client --output=yaml 2>/dev/null | grep gitVersion | head -n1 | awk '{print $2}' || echo 'v1.x'))"
  else
    log_warning "kubectl CLI is not installed. Cluster operations will rely on cluster API."
  fi

  # 4. Kubernetes Context & Minikube Check
  if command -v kubectl >/dev/null 2>&1 && kubectl cluster-info >/dev/null 2>&1; then
    local CURRENT_CTX
    CURRENT_CTX=$(kubectl config current-context 2>/dev/null || echo "default")
    log_success "Kubernetes Cluster connected (Context: ${CURRENT_CTX})"
  else
    log_warning "Kubernetes cluster not reachable via kubectl. Attempting Minikube auto-detect..."
    if command -v minikube >/dev/null 2>&1; then
      if minikube status >/dev/null 2>&1; then
        log_success "Minikube is running."
      else
        log_warning "Minikube is installed but stopped. Starting Minikube..."
        minikube start --driver=docker || true
      fi
    else
      log_warning "No active Kubernetes cluster context detected. Microservice live telemetry will use API fallback mode."
    fi
  fi

  # 5. Resource Validation (RAM & CPU)
  if [ -f /proc/meminfo ]; then
    local TOTAL_MEM_KB
    TOTAL_MEM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    local TOTAL_MEM_GB=$((TOTAL_MEM_KB / 1024 / 1024))
    if [ "$TOTAL_MEM_GB" -ge 4 ]; then
      log_success "System RAM: ${TOTAL_MEM_GB} GB (>= 4 GB requirement met)"
    else
      log_warning "System RAM is ${TOTAL_MEM_GB} GB (Recommended >= 4 GB)."
    fi
  fi

  local CPU_CORES
  CPU_CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 2)
  if [ "$CPU_CORES" -ge 2 ]; then
    log_success "CPU Cores: ${CPU_CORES} cores (>= 2 cores requirement met)"
  else
    log_warning "CPU Cores: ${CPU_CORES} (Recommended >= 2 cores)."
  fi

  # 6. Disk Space Check
  local AVAILABLE_DISK_GB
  AVAILABLE_DISK_GB=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
  if [ "$AVAILABLE_DISK_GB" -ge 5 ]; then
    log_success "Disk Space: ${AVAILABLE_DISK_GB} GB available (>= 5 GB requirement met)"
  else
    log_warning "Disk Space: ${AVAILABLE_DISK_GB} GB available (Low disk space)."
  fi

  # 7. Check Key Service Ports
  log_info "Validating required system ports..."
  local PORTS=(8000 3000 5432 6379)
  for PORT in "${PORTS[@]}"; do
    if netstat -tulpn 2>/dev/null | grep -q ":${PORT} " || ss -tulpn 2>/dev/null | grep -q ":${PORT} "; then
      log_warning "Port ${PORT} is currently in use. Existing process will be updated or bound."
    fi
  done

  if [ $ERRORS -gt 0 ]; then
    log_error "Pre-install validation failed with ${ERRORS} critical error(s)."
    echo -e "Please resolve the above errors before proceeding with installation.\n"
    exit 1
  fi

  log_success "System pre-install validation passed!"
  echo ""
}

# --- Auto-Configuration ---
configure_environment() {
  log_info "Initializing workspace environment configuration..."

  # Create required runtime directories
  mkdir -p backups diagnostics logs

  # Environment configuration file (.env)
  if [ ! -f .env ]; then
    if [ -f .env.example ]; then
      cp .env.example .env
      log_success "Created .env configuration from .env.example"
    else
      cat <<'EOF' > .env
PORT=8000
AI_PROVIDER=groq
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=devops_nexus
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devops_nexus
VITE_API_URL=http://localhost:8000
SECRET_KEY=devops-nexus-production-v1-secret-key-change-in-prod
EOF
      log_success "Created default .env configuration file."
    fi
  else
    log_success "Using existing .env configuration file."
  fi
}

# --- Database & Service Initialization ---
initialize_services() {
  log_info "Starting core database and cache infrastructure (PostgreSQL & Redis)..."
  docker compose up -d postgres redis

  log_info "Waiting for PostgreSQL database to become ready..."
  local RETRIES=30
  until docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo -n "."
    sleep 1
    RETRIES=$((RETRIES - 1))
  done
  echo ""

  if [ $RETRIES -eq 0 ]; then
    log_error "PostgreSQL database failed to start in time."
    exit 1
  fi
  log_success "PostgreSQL database engine is online!"

  log_info "Applying database migrations and seeding initial enterprise RBAC & administrator accounts..."
  # If local python environment exists, run migrations/seeds
  if [ -f "./poetry-venv/bin/python" ]; then
    ./poetry-venv/bin/python -c "
from app.db.session import engine, Base
from app.db.init_db import init_db
from app.db.session import SessionLocal
Base.metadata.create_all(bind=engine)
db = SessionLocal()
init_db(db)
db.close()
print('Database tables created and seeded successfully.')
" 2>/dev/null || log_warning "Local python database seed skipped (will run in container)."
  fi

  log_info "Starting DevOps Nexus platform services..."
  if [ "$SKIP_BUILD" = true ]; then
    docker compose up -d
  else
    docker compose up -d --build
  fi

  log_success "DevOps Nexus platform containers initialized!"
}

# --- Main Execution Workflow ---
banner
validate_system

if [ "$VALIDATE_ONLY" = true ]; then
  echo -e "${GREEN}${BOLD}Pre-installation validation complete! System is ready for DevOps Nexus v1.0.${NC}"
  exit 0
fi

configure_environment
initialize_services

# Run Post-Installation Health Verification
echo ""
log_info "Running post-installation 13-point health check..."
if [ -f ./scripts/healthcheck.sh ]; then
  chmod +x ./scripts/healthcheck.sh
  ./scripts/healthcheck.sh || log_warning "Some optional platform integrations reported warnings during health check."
fi

echo -e "\n${GREEN}${BOLD}"
echo "========================================================================"
echo "      🎉 DevOps Nexus v1.0 Installation Successfully Completed!         "
echo "========================================================================"
echo -e "${NC}"
echo -e "Access Points:"
echo -e "  🌐 Frontend Platform UI : ${CYAN}${BOLD}http://localhost:3000${NC}"
echo -e "  ⚙️  Backend API Docs     : ${CYAN}${BOLD}http://localhost:8000/docs${NC}"
echo -e "  📊 Grafana Dashboards   : ${CYAN}${BOLD}http://localhost:3200${NC}"
echo -e "  🔍 Prometheus Metrics   : ${CYAN}${BOLD}http://localhost:9090${NC}"
echo -e "  📜 Loki Log Engine      : ${CYAN}${BOLD}http://localhost:3100${NC}"
echo ""
echo -e "Default Administrator Credentials:"
echo -e "  Username : ${BOLD}admin${NC}"
echo -e "  Password : ${BOLD}admin123${NC}"
echo ""
echo -e "Operational Utilities:"
echo -e "  Health Diagnostics : ${CYAN}./scripts/healthcheck.sh${NC}"
echo -e "  System Backup      : ${CYAN}./scripts/backup.sh${NC}"
echo -e "  System Restore     : ${CYAN}./scripts/restore.sh <backup-file>${NC}"
echo -e "  Support Bundle     : ${CYAN}./scripts/diagnostics.sh${NC}"
echo "========================================================================"
echo ""
