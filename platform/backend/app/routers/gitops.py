# --- GitOps REST Router ---
from fastapi import APIRouter, Request, Query, Path, HTTPException, status
from typing import Optional
from app.schemas.responses import BaseResponse
from app.services.gitops_service import gitops_service
from app.services.argocd_service import argocd_service
from shared.exceptions import DevOpsNexusException
from fastapi import Depends
from app.dependencies.auth import get_current_user, check_role

router = APIRouter(
    prefix="/api/v1/gitops",
    dependencies=[Depends(get_current_user)]
)

@router.get("/github/workflows", response_model=BaseResponse)
async def get_github_workflows(
    request: Request,
    owner: str = Query("Manikandan23005", description="Repository owner."),
    repo: str = Query("Microservice-Deployment-Monitoring-Platform", description="Repository name.")
):
    """Fetches GitHub Action CI/CD workflow runs."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = gitops_service.get_workflows_status(owner, repo)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/github/repo-details", response_model=BaseResponse)
async def get_github_repo_details(
    request: Request,
    owner: str = Query("Manikandan23005", description="Repository owner."),
    repo: str = Query("Microservice-Deployment-Monitoring-Platform", description="Repository name.")
):
    """Retrieves branches and latest commits from GitHub."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = gitops_service.get_repository_details(owner, repo)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/argocd/applications", response_model=BaseResponse)
async def list_argocd_applications(request: Request):
    """Lists applications synchronizations status registered in ArgoCD."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = argocd_service.list_applications()
        return BaseResponse(success=True, data=data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/argocd/applications/{app_name}/sync", response_model=BaseResponse, dependencies=[Depends(check_role(["Administrator", "DevOps Engineer"]))])
async def sync_argocd_application(
    request: Request,
    app_name: str = Path(..., description="Target application name.")
):
    """Triggers sync deployment inside ArgoCD."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = argocd_service.sync_application(app_name)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/argocd/applications/{app_name}/refresh", response_model=BaseResponse, dependencies=[Depends(check_role(["Administrator", "DevOps Engineer"]))])
async def refresh_argocd_application(
    request: Request,
    app_name: str = Path(..., description="Target application name.")
):
    """Triggers refresh manifests check in ArgoCD."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = argocd_service.refresh_application(app_name)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/argocd/applications/{app_name}/rollback", response_model=BaseResponse, dependencies=[Depends(check_role(["Administrator", "DevOps Engineer"]))])
async def rollback_argocd_application(
    request: Request,
    app_name: str = Path(..., description="Target application name."),
    revision: int = Query(..., ge=0, description="Target history revision ID.")
):
    """Triggers rollback operation in ArgoCD to target revision ID."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = argocd_service.rollback_application(app_name, revision)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/argocd/applications/{app_name}/history", response_model=BaseResponse)
async def get_argocd_application_history(
    request: Request,
    app_name: str = Path(..., description="Target application name.")
):
    """Retrieves list of deploy records and revisions tags from ArgoCD."""
    request_id = getattr(request.state, "request_id", None)
    try:
        data = argocd_service.get_application_history(app_name)
        return BaseResponse(success=True, data=data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
