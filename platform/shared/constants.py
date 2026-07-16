# --- Shared Global Constants ---

# System Namespace Definitions
DEFAULT_NAMESPACE = "devops-nexus"
ALLOWED_NAMESPACES = ["devops-nexus-dev", "devops-nexus-qa", "devops-nexus-stage", "devops-nexus-prod"]

# Application Status Strings
STATUS_SYNCED = "Synced"
STATUS_OUT_OF_SYNC = "OutOfSync"
STATUS_PROGRESSING = "Progressing"
STATUS_DEGRADED = "Degraded"

# Resource Threshold Limits (Default triggers)
CRITICAL_CPU_UTILIZATION = 85.0
CRITICAL_MEM_UTILIZATION = 85.0
MAX_POD_RESTARTS_LIMIT = 5
