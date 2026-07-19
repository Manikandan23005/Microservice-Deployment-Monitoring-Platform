# --- Observability REST Router ---
from fastapi import APIRouter, Request, Query, HTTPException, status
from typing import Optional
from app.schemas.responses import BaseResponse
from app.services.monitoring_service import monitoring_service
from app.services.log_service import log_service
from shared.exceptions import TelemetryFetchException
from fastapi import Depends
from app.dependencies.auth import get_current_user
from app.utils.observability import observability_metrics

router = APIRouter(
    prefix="/api/v1/monitoring",
    dependencies=[Depends(get_current_user)]
)

@router.get("/metrics", response_model=BaseResponse)
async def get_cluster_metrics(request: Request):
    """Retrieves cluster performance summary metrics."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = monitoring_service.get_cluster_metrics()
        return BaseResponse(success=True, data=data, request_id=request_id)
    except TelemetryFetchException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/metrics/range", response_model=BaseResponse)
async def get_metrics_range(
    request: Request,
    metric_type: str = Query("cpu", pattern="^(cpu|memory|network)$", description="Target metric telemetry type.")
):
    """Retrieves metrics range data points for graphic rendering."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = monitoring_service.get_performance_range(metric_type)
        return BaseResponse(success=True, data={"values": data}, request_id=request_id)
    except TelemetryFetchException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/logs", response_model=BaseResponse)
async def get_logs(
    request: Request,
    pod: str = Query(..., description="Target pod identifier."),
    search: Optional[str] = Query(None, description="Optional search keywords filter."),
    limit: int = Query(100, ge=1, le=1000, description="Log lines limit offset.")
):
    """Retrieves container logs fetched from Loki logs indexes."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = log_service.get_logs(pod, search=search, limit=limit)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except TelemetryFetchException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/platform-metrics", response_model=BaseResponse)
async def get_platform_metrics(request: Request):
    """Retrieves custom platform instrumentation and latency performance metrics."""
    request_id = getattr(request.state, "request_id", None)
    return BaseResponse(
        success=True,
        data=observability_metrics.get_summary(),
        request_id=request_id
    )
