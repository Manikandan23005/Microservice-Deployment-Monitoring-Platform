# --- Multi-Cluster Registry REST Router ---
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Request, Query, Path, HTTPException, status, Depends
from pydantic import BaseModel, Field
from app.schemas.responses import BaseResponse
from app.services.cluster_registry import cluster_registry, ClusterProvider, ClusterEnvironment
from app.services.audit_service import audit_service
from app.dependencies.auth import get_current_user, check_role
from shared.exceptions import DevOpsNexusException
from app.core.logging import logger

router = APIRouter(
    prefix="/api/v1/clusters",
    dependencies=[Depends(get_current_user)]
)

class AddClusterRequest(BaseModel):
    name: str = Field(..., description="Cluster display name.")
    description: Optional[str] = Field("", description="Cluster description.")
    environment: str = Field("Development", description="Cluster environment (Development, Staging, Production, QA).")
    provider: str = Field("Minikube", description="Provider (Minikube, kubeadm, EKS, GKE, AKS, Custom).")
    context_name: str = Field("default", description="Kubeconfig context name.")
    kubeconfig_content: Optional[str] = Field(None, description="Raw YAML content of kubeconfig.")
    api_server: Optional[str] = Field("https://localhost:6443", description="Kubernetes API server URL.")
    authentication_type: str = Field("Kubeconfig", description="Authentication type.")
    default_namespace: str = Field("devops-nexus-prod", description="Default working namespace.")
    is_default: bool = Field(False, description="Set as platform default cluster.")
    argocd_url: Optional[str] = Field(None, description="ArgoCD server URL for this cluster.")
    argocd_token: Optional[str] = Field(None, description="ArgoCD authentication token.")
    prometheus_url: Optional[str] = Field(None, description="Prometheus server URL.")
    loki_url: Optional[str] = Field(None, description="Loki log server URL.")

class ParseKubeconfigRequest(BaseModel):
    kubeconfig_content: str = Field(..., description="Kubeconfig raw text content.")

@router.get("", response_model=BaseResponse)
async def list_clusters(request: Request):
    """Lists all registered clusters in the Cluster Registry."""
    request_id = getattr(request.state, "request_id", None)
    clusters = cluster_registry.list_clusters()
    return BaseResponse(success=True, data=clusters, request_id=request_id)

@router.get("/{cluster_id}", response_model=BaseResponse)
async def get_cluster_details(request: Request, cluster_id: str = Path(...)):
    """Fetches details for a specific cluster."""
    request_id = getattr(request.state, "request_id", None)
    cluster = cluster_registry.get_cluster(cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail=f"Cluster '{cluster_id}' not found.")
    return BaseResponse(success=True, data=cluster, request_id=request_id)

@router.post("/parse-kubeconfig", response_model=BaseResponse)
async def parse_kubeconfig(request: Request, payload: ParseKubeconfigRequest):
    """Parses contexts and clusters from uploaded/provided kubeconfig content."""
    request_id = getattr(request.state, "request_id", None)
    contexts = cluster_registry.parse_kubeconfig_contexts(payload.kubeconfig_content)
    return BaseResponse(success=True, data={"contexts": contexts}, request_id=request_id)

@router.post("", response_model=BaseResponse)
async def add_cluster(request: Request, payload: AddClusterRequest):
    """Registers a new Kubernetes cluster in the Multi-Cluster Registry."""
    user = get_current_user(request)
    user_role = user.get("role", "Viewer")
    if user_role not in ["Administrator", "DevOps Engineer"]:
        raise HTTPException(status_code=403, detail="Operation not permitted for your current access level.")

    request_id = getattr(request.state, "request_id", None)
    cluster = cluster_registry.add_cluster(payload.model_dump())

    audit_service.log_action(
        username=user.get("username") or user.get("sub") or "admin",
        role_name=user_role,
        action="cluster_added",
        target_resource=f"cluster/{cluster['id']}",
        workspace="cluster",
        namespace=cluster.get("default_namespace"),
        old_value=None,
        new_value=f"name={cluster['name']}, provider={cluster['provider']}, env={cluster['environment']}",
        status="SUCCESS"
    )

    return BaseResponse(success=True, data=cluster, request_id=request_id)

@router.post("/{cluster_id}/test", response_model=BaseResponse)
async def test_cluster_connection(request: Request, cluster_id: str = Path(...)):
    """Tests connectivity to the specified cluster API server."""
    request_id = getattr(request.state, "request_id", None)
    cluster = cluster_registry.get_cluster(cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail=f"Cluster '{cluster_id}' not found.")

    try:
        clients = cluster_registry.get_k8s_clients(cluster_id)
        # Try listing namespaces to verify connection
        nodes = clients["v1"].list_node().items
        return BaseResponse(
            success=True,
            data={
                "connected": True,
                "message": f"Successfully connected to API server '{cluster.get('api_server')}' ({len(nodes)} nodes active).",
                "cluster": cluster
            },
            request_id=request_id
        )
    except Exception as e:
        return BaseResponse(
            success=True,
            data={
                "connected": False,
                "message": f"Failed connection test to '{cluster.get('api_server')}': {str(e)}",
                "cluster": cluster
            },
            request_id=request_id
        )

@router.post("/{cluster_id}/set-default", response_model=BaseResponse)
async def set_default_cluster(request: Request, cluster_id: str = Path(...)):
    """Marks the target cluster as the platform default."""
    user = get_current_user(request)
    user_role = user.get("role", "Viewer")
    if user_role not in ["Administrator", "DevOps Engineer"]:
        raise HTTPException(status_code=403, detail="Operation not permitted for your current access level.")

    request_id = getattr(request.state, "request_id", None)

    clusters = cluster_registry.list_clusters()
    target = None
    for c in clusters:
        if c["id"] == cluster_id:
            c["is_default"] = True
            target = c
        else:
            c["is_default"] = False

    audit_service.log_action(
        username=user.username if user else "admin",
        role_name=user.role_name if user else "Administrator",
        action="default_cluster_changed",
        target_resource=f"cluster/{cluster_id}",
        workspace="cluster",
        old_value=None,
        new_value=f"is_default=True",
        status="SUCCESS"
    )

    return BaseResponse(success=True, data=target, request_id=request_id)
