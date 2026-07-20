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

from app.services.scope_engine import scope_engine

@router.get("/metrics", response_model=BaseResponse)
async def get_cluster_metrics(
    request: Request,
    scope_mode: Optional[str] = Query("cluster"),
    namespace: Optional[str] = Query(None),
    app: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    """Retrieves cluster performance summary metrics."""
    request_id = getattr(request.state, "request_id", None)
    try:
        scope = scope_engine.resolve_scope(scope_mode, namespace, app, domain)
        promql_clause = scope_engine.build_promql_filter(scope)
        data = monitoring_service.get_cluster_metrics()
        return BaseResponse(success=True, data=data, request_id=request_id)
    except TelemetryFetchException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/metrics/range", response_model=BaseResponse)
async def get_metrics_range(
    request: Request,
    metric_type: str = Query("cpu", pattern="^(cpu|memory|network)$", description="Target metric telemetry type."),
    scope_mode: Optional[str] = Query("cluster"),
    namespace: Optional[str] = Query(None),
    app: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    """Retrieves metrics range data points for graphic rendering."""
    request_id = getattr(request.state, "request_id", None)
    try:
        scope = scope_engine.resolve_scope(scope_mode, namespace, app, domain)
        data = monitoring_service.get_performance_range(metric_type)
        return BaseResponse(success=True, data={"values": data}, request_id=request_id)
    except TelemetryFetchException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/logs", response_model=BaseResponse)
async def get_logs(
    request: Request,
    pod: Optional[str] = Query("all", description="Target pod identifier."),
    search: Optional[str] = Query(None, description="Optional search keywords filter."),
    limit: int = Query(100, ge=1, le=1000, description="Log lines limit offset."),
    scope_mode: Optional[str] = Query("cluster"),
    namespace: Optional[str] = Query(None),
    app: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    """Retrieves container logs fetched from Loki logs indexes."""
    request_id = getattr(request.state, "request_id", None)
    try:
        scope = scope_engine.resolve_scope(scope_mode, namespace, app, domain)
        log_query_pod = pod if pod and pod != "all" else scope_engine.build_logql_selector(scope)
        data = log_service.get_logs(log_query_pod, search=search, limit=limit)
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

@router.get("/alerts", response_model=BaseResponse)
async def get_alerts(
    request: Request,
    scope_mode: Optional[str] = Query("cluster"),
    namespace: Optional[str] = Query(None),
    app: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    """Retrieves active Prometheus AlertManager & Kubernetes workload firing alerts."""
    request_id = getattr(request.state, "request_id", None)
    try:
        scope = scope_engine.resolve_scope(scope_mode, namespace, app, domain)
        alerts = monitoring_service.get_active_alerts(scope)
        return BaseResponse(success=True, data=alerts, request_id=request_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
