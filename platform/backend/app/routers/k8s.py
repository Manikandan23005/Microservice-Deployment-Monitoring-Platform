# --- Kubernetes REST Router ---
from fastapi import APIRouter, Request, Query, Path, HTTPException, status
from typing import Optional
from app.schemas.responses import BaseResponse
from app.schemas.k8s import ScaleRequest
from app.services.namespace_service import namespace_service
from app.services.node_service import node_service
from app.services.pod_service import pod_service
from app.services.deployment_service import deployment_service
from app.services.ingress_service import ingress_service
from app.services.scope_engine import scope_engine
from shared.exceptions import KubernetesClientException
from fastapi import Depends
from app.dependencies.auth import get_current_user, check_role

router = APIRouter(
    prefix="/api/v1/k8s",
    dependencies=[Depends(get_current_user)]
)

@router.get("/namespaces", response_model=BaseResponse)
async def list_namespaces(
    request: Request,
    scope_mode: Optional[str] = Query("cluster"),
    namespace: Optional[str] = Query(None),
    app: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        scope = scope_engine.resolve_scope(scope_mode, namespace, app, domain)
        raw_data = namespace_service.list_namespaces()
        data = scope_engine.filter_namespaces(raw_data, scope)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/nodes", response_model=BaseResponse)
async def list_nodes(request: Request):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = node_service.list_nodes()
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/pods", response_model=BaseResponse)
async def list_pods(
    request: Request,
    namespace: Optional[str] = Query(None, description="Optional namespace filter."),
    scope_mode: Optional[str] = Query("cluster"),
    app: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        scope = scope_engine.resolve_scope(scope_mode, namespace, app, domain)
        effective_ns = scope.get_effective_namespaces()
        ns_param = effective_ns[0] if (len(effective_ns) == 1) else None
        
        raw_pods = pod_service.list_pods(ns_param)
        data = scope_engine.filter_pods(raw_pods, scope)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/pods/{namespace}/{pod_name}", response_model=BaseResponse)
async def describe_pod(
    request: Request,
    namespace: str = Path(..., description="Namespace scope."),
    pod_name: str = Path(..., description="Target pod identifier.")
):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = pod_service.describe_pod(namespace, pod_name)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/pods/{namespace}/{pod_name}/logs", response_model=BaseResponse)
async def get_pod_logs(
    request: Request,
    namespace: str = Path(..., description="Namespace scope."),
    pod_name: str = Path(..., description="Target pod identifier."),
    tail_lines: int = Query(100, ge=1, description="Lines offset limit.")
):
    request_id = getattr(request.state, "request_id", None)
    try:
        logs_text = pod_service.get_pod_logs(namespace, pod_name, tail_lines)
        return BaseResponse(success=True, data={"logs": logs_text}, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/deployments", response_model=BaseResponse)
async def list_deployments(
    request: Request,
    namespace: Optional[str] = Query(None, description="Optional namespace filter."),
    scope_mode: Optional[str] = Query("cluster"),
    app: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        scope = scope_engine.resolve_scope(scope_mode, namespace, app, domain)
        effective_ns = scope.get_effective_namespaces()
        ns_param = effective_ns[0] if (len(effective_ns) == 1) else None

        raw_deployments = deployment_service.list_deployments(ns_param)
        data = scope_engine.filter_deployments(raw_deployments, scope)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

from app.services.authz_engine import authz_engine
from app.services.audit_service import audit_service

@router.post("/deployments/{namespace}/{name}/restart", response_model=BaseResponse)
async def restart_deployment(
    request: Request,
    namespace: str = Path(..., description="Namespace scope."),
    name: str = Path(..., description="Target deployment identifier.")
):
    request_id = getattr(request.state, "request_id", None)
    user_dict = get_current_user(request)
    username = user_dict.get("username") or user_dict.get("sub") or "viewer"
    
    authz_engine.authorize(username, "deployments", "restart_deployment", namespace=namespace, application=name)
    try:
        data = deployment_service.restart_deployment(namespace, name)
        audit_service.log_action(
            username=username,
            role_name=user_dict.get("role", "Viewer"),
            action="restart_deployment",
            target_resource=f"deployment/{name}",
            namespace=namespace,
            application=name,
            client_ip=request.client.host if request.client else "127.0.0.1"
        )
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/deployments/{namespace}/{name}/scale", response_model=BaseResponse)
async def scale_deployment(
    request: Request,
    body: ScaleRequest,
    namespace: str = Path(..., description="Namespace scope."),
    name: str = Path(..., description="Target deployment identifier.")
):
    request_id = getattr(request.state, "request_id", None)
    user_dict = get_current_user(request)
    username = user_dict.get("username") or user_dict.get("sub") or "viewer"

    authz_engine.authorize(username, "deployments", "scale_deployment", namespace=namespace, application=name)
    try:
        data = deployment_service.scale_deployment(namespace, name, body.replicas)
        audit_service.log_action(
            username=username,
            role_name=user_dict.get("role", "Viewer"),
            action="scale_deployment",
            target_resource=f"deployment/{name}",
            namespace=namespace,
            application=name,
            new_value=f"replicas={body.replicas}",
            client_ip=request.client.host if request.client else "127.0.0.1"
        )
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/ingresses", response_model=BaseResponse)
async def list_ingresses(request: Request, namespace: Optional[str] = Query(None, description="Optional namespace filter.")):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = ingress_service.list_ingresses(namespace)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
