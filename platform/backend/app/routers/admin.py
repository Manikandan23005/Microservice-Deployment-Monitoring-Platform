# --- Administration & IAM REST Router ---
from fastapi import APIRouter, Request, Query, Path, HTTPException, status, Depends
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from shared.iam import User, Role, UserStatus
from app.schemas.responses import BaseResponse
from app.services.iam_service import iam_service
from app.services.audit_service import audit_service
from app.services.authz_engine import authz_engine
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/admin",
    dependencies=[Depends(get_current_user)]
)

def verify_admin_access(request: Request):
    user_dict = get_current_user(request)
    username = user_dict.get("username") or user_dict.get("sub") or "viewer"
    authz_engine.authorize(username, "settings", "view")
    return username

class ResetPasswordPayload(BaseModel):
    new_password: str

class CloneRolePayload(BaseModel):
    new_role_name: str

@router.get("/users", response_model=BaseResponse)
async def list_users(
    request: Request,
    search: Optional[str] = Query(None),
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    users = iam_service.get_users()
    if search:
        st = search.lower()
        users = [u for u in users if st in u.username.lower() or st in u.full_name.lower() or st in u.role_name.lower()]
    return BaseResponse(success=True, data=[u.model_dump() for u in users], request_id=request_id)

@router.post("/users", response_model=BaseResponse)
async def create_user(
    request: Request,
    body: User,
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        created = iam_service.create_user(body)
        audit_service.log_action(
            username=admin_user,
            role_name="Administrator",
            action="create_user",
            target_resource=f"user/{created.username}",
            new_value=f"role={created.role_name}, status={created.status}"
        )
        return BaseResponse(success=True, data=created.model_dump(), request_id=request_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/users/{username}", response_model=BaseResponse)
async def update_user(
    request: Request,
    body: Dict[str, Any],
    username: str = Path(...),
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        updated = iam_service.update_user(username, body)
        audit_service.log_action(
            username=admin_user,
            role_name="Administrator",
            action="update_user",
            target_resource=f"user/{username}",
            new_value=str(body)
        )
        return BaseResponse(success=True, data=updated.model_dump(), request_id=request_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/users/{username}", response_model=BaseResponse)
async def delete_user(
    request: Request,
    username: str = Path(...),
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        success = iam_service.delete_user(username)
        if success:
            audit_service.log_action(
                username=admin_user,
                role_name="Administrator",
                action="delete_user",
                target_resource=f"user/{username}"
            )
        return BaseResponse(success=True, data={"deleted": success}, request_id=request_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/users/{username}/reset-password", response_model=BaseResponse)
async def reset_password(
    request: Request,
    body: ResetPasswordPayload,
    username: str = Path(...),
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        updated = iam_service.update_user(username, {"password_hash": body.new_password})
        audit_service.log_action(
            username=admin_user,
            role_name="Administrator",
            action="reset_password",
            target_resource=f"user/{username}"
        )
        return BaseResponse(success=True, data={"message": "Password reset successfully."}, request_id=request_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/roles", response_model=BaseResponse)
async def list_roles(
    request: Request,
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    roles = iam_service.get_roles()
    return BaseResponse(success=True, data=[r.model_dump() for r in roles], request_id=request_id)

@router.post("/roles", response_model=BaseResponse)
async def create_role(
    request: Request,
    body: Role,
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        created = iam_service.create_role(body)
        audit_service.log_action(
            username=admin_user,
            role_name="Administrator",
            action="create_role",
            target_resource=f"role/{created.name}"
        )
        return BaseResponse(success=True, data=created.model_dump(), request_id=request_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/roles/{name}", response_model=BaseResponse)
async def update_role(
    request: Request,
    body: Role,
    name: str = Path(...),
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        updated = iam_service.update_role(name, body)
        audit_service.log_action(
            username=admin_user,
            role_name="Administrator",
            action="update_role",
            target_resource=f"role/{name}"
        )
        return BaseResponse(success=True, data=updated.model_dump(), request_id=request_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/roles/{name}", response_model=BaseResponse)
async def delete_role(
    request: Request,
    name: str = Path(...),
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        success = iam_service.delete_role(name)
        if success:
            audit_service.log_action(
                username=admin_user,
                role_name="Administrator",
                action="delete_role",
                target_resource=f"role/{name}"
            )
        return BaseResponse(success=True, data={"deleted": success}, request_id=request_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/roles/{name}/clone", response_model=BaseResponse)
async def clone_role(
    request: Request,
    body: CloneRolePayload,
    name: str = Path(...),
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    try:
        cloned = iam_service.clone_role(name, body.new_role_name)
        audit_service.log_action(
            username=admin_user,
            role_name="Administrator",
            action="clone_role",
            target_resource=f"role/{body.new_role_name}",
            old_value=f"source={name}"
        )
        return BaseResponse(success=True, data=cloned.model_dump(), request_id=request_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/audit-logs", response_model=BaseResponse)
async def get_audit_logs(
    request: Request,
    search: Optional[str] = Query(None),
    username: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    admin_user: str = Depends(verify_admin_access)
):
    request_id = getattr(request.state, "request_id", None)
    logs = audit_service.get_logs(search=search, username=username, action=action, limit=limit)
    return BaseResponse(success=True, data=[l.model_dump() for l in logs], request_id=request_id)
