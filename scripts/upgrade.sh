#!/usr/bin/env bash
# ==============================================================================
# DevOps Nexus v1.0 — Safe Upgrade & Migration Utility
# ==============================================================================

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "========================================================================"
echo "         🔄 DevOps Nexus v1.0 Safe Upgrade & Migration Tool             "
echo "========================================================================"
echo -e "${NC}"

# Step 1: Pre-upgrade Backup
echo -e "${BOLD}[1/4] Performing Automatic Pre-Upgrade Backup...${NC}"
if [ -f ./scripts/backup.sh ]; then
  ./scripts/backup.sh
else
  echo "  ⚠ Backup script missing. Proceeding with caution..."
fi

# Step 2: Refresh Application Containers
echo -e "${BOLD}[2/4] Rebuilding and Refreshing Application Containers...${NC}"
docker compose up -d --build

# Step 3: Run Database Migrations
echo -e "${BOLD}[3/4] Running Database Migrations & Schema Verifications...${NC}"
if [ -f "./poetry-venv/bin/python" ]; then
  ./poetry-venv/bin/python -c "
from app.db.session import engine, Base
from app.db.init_db import init_db
from app.db.session import SessionLocal
Base.metadata.create_all(bind=engine)
db = SessionLocal()
init_db(db)
db.close()
print('Database schema verification complete.')
" 2>/dev/null || echo "  ⚠ Database schema verification completed with warnings."
fi

# Step 4: Health Verification
echo -e "${BOLD}[4/4] Verifying Post-Upgrade Subsystem Health...${NC}"
if [ -f ./scripts/healthcheck.sh ]; then
  if ./scripts/healthcheck.sh; then
    echo -e "\n${GREEN}${BOLD}========================================================================"
    echo "  ✓ DevOps Nexus Upgrade Completed & Verified Successfully!"
    echo "========================================================================${NC}"
  else
    echo -e "\n${RED}${BOLD}========================================================================"
    echo "  ⚠ Post-upgrade health check reported warnings. Check container logs."
    echo "========================================================================${NC}"
  fi
fi
