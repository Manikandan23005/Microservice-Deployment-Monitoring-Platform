# --- Liveness and Readiness Probe Router ---
from fastapi import APIRouter, Request
from app.schemas.responses import HealthResponse, HealthData
from app.utils.helper import get_current_timestamp
from app.clients.kubernetes import k8s_client
from app.core.cache import cache_client

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request):
    """Liveness probe to verify FastAPI server is running."""
    request_id = getattr(request.state, "request_id", None)
    return HealthResponse(
        success=True,
        data=HealthData(
            status="healthy",
            service="devops-nexus-backend",
            ready=True,
            timestamp=get_current_timestamp()
        ),
        request_id=request_id
    )

@router.get("/ready", response_model=HealthResponse)
async def readiness_check(request: Request):
    """Readiness probe checking active connections to Redis and Kubernetes API."""
    request_id = getattr(request.state, "request_id", None)
    
    k8s_ok = False
    redis_ok = False
    
    # 1. Test Kubernetes API connection
    try:
        k8s_client.list_namespaces()
        k8s_ok = True
    except Exception:
        k8s_ok = False
        
    # 2. Test Redis connection
    try:
        redis_ok = cache_client.ping()
    except Exception:
        redis_ok = False
        
    is_ready = k8s_ok and redis_ok
    status_msg = "healthy" if is_ready else "degraded"
    
    return HealthResponse(
        success=True,
        data=HealthData(
            status=status_msg,
            service="devops-nexus-backend",
            ready=is_ready,
            timestamp=get_current_timestamp()
        ),
        request_id=request_id
    )
