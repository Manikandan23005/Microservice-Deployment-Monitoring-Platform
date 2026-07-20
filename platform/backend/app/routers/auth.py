from fastapi import APIRouter, Response, HTTPException, status, Request, Depends
from pydantic import BaseModel
from app.core.security import create_access_token
from app.schemas.responses import BaseResponse
from app.services.iam_service import iam_service
from app.services.audit_service import audit_service
from shared.iam import UserStatus
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/auth")

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=BaseResponse)
async def login(body: LoginRequest, response: Response, request: Request):
    username = body.username.strip().lower()
    password = body.password
    request_id = getattr(request.state, "request_id", None)
    
    user = iam_service.get_user(username)
    if not user or user.password_hash != password:
        audit_service.log_action(
            username=username,
            role_name="Unknown",
            action="login",
            target_resource="system/login",
            status="FAILED",
            client_ip=request.client.host if request.client else "127.0.0.1"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password credentials."
        )
        
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User account '{username}' is disabled by Administrator."
        )

    role = user.role_name
    token = create_access_token({"sub": username, "username": username, "role": role})
    
    audit_service.log_action(
        username=username,
        role_name=role,
        action="login",
        target_resource="system/login",
        status="SUCCESS",
        client_ip=request.client.host if request.client else "127.0.0.1"
    )

    # Set secure HttpOnly cookie with 30 days expiration
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 30
    )
    
    return BaseResponse(
        success=True,
        data={
            "token": token,
            "username": username,
            "role": role,
            "full_name": user.full_name,
            "assigned_workspaces": user.assigned_workspaces,
            "assigned_namespaces": user.assigned_namespaces,
            "assigned_apps": user.assigned_apps
        },
        request_id=request_id
    )

@router.post("/logout", response_model=BaseResponse)
async def logout(response: Response, request: Request):
    request_id = getattr(request.state, "request_id", None)
    response.delete_cookie(key="session_token")
    return BaseResponse(success=True, data={"message": "Logged out successfully"}, request_id=request_id)
