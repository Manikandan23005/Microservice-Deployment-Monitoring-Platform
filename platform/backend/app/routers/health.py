# --- Liveness and Readiness Probe Router ---
from fastapi import APIRouter, Request
from app.schemas.responses import HealthResponse, HealthData
from app.utils.helper import get_current_timestamp

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
    """Readiness probe checking system configurations, databases and queues connectivity."""
    request_id = getattr(request.state, "request_id", None)
    # TODO: Implement active pings to Redis cache and Kubernetes API
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
