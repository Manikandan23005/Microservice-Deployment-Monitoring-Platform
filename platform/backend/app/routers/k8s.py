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
from shared.exceptions import KubernetesClientException

router = APIRouter(prefix="/api/v1/k8s")

@router.get("/namespaces", response_model=BaseResponse)
async def list_namespaces(request: Request):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = namespace_service.list_namespaces()
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
async def list_pods(request: Request, namespace: Optional[str] = Query(None, description="Optional namespace filter.")):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = pod_service.list_pods(namespace)
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
async def list_deployments(request: Request, namespace: Optional[str] = Query(None, description="Optional namespace filter.")):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = deployment_service.list_deployments(namespace)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/deployments/{namespace}/{deployment_name}/restart", response_model=BaseResponse)
async def restart_deployment(
    request: Request,
    namespace: str = Path(..., description="Namespace scope."),
    deployment_name: str = Path(..., description="Target deployment identifier.")
):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = deployment_service.restart_deployment(namespace, deployment_name)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/deployments/{namespace}/{deployment_name}/scale", response_model=BaseResponse)
async def scale_deployment(
    request: Request,
    body: ScaleRequest,
    namespace: str = Path(..., description="Namespace scope."),
    deployment_name: str = Path(..., description="Target deployment identifier.")
):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = deployment_service.scale_deployment(namespace, deployment_name, body.replicas)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except KubernetesClientException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/deployments/{namespace}/{deployment_name}/rollout-status", response_model=BaseResponse)
async def get_rollout_status(
    request: Request,
    namespace: str = Path(..., description="Namespace scope."),
    deployment_name: str = Path(..., description="Target deployment identifier.")
):
    request_id = getattr(request.state, "request_id", None)
    try:
        data = deployment_service.get_rollout_status(namespace, deployment_name)
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
