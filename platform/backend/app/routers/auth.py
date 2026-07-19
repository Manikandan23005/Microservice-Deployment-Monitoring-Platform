from fastapi import APIRouter, Response, HTTPException, status, Request, Depends
from pydantic import BaseModel
from app.core.security import create_access_token
from app.schemas.responses import BaseResponse
from typing import Dict, Any
import os

router = APIRouter(prefix="/api/v1/auth")

class LoginRequest(BaseModel):
    username: str
    password: str

# Define registry with passwords loaded from environment or secure defaults
ADMIN_PASSWORD = os.getenv("PLATFORM_ADMIN_PASSWORD", "admin123")
DEVOPS_PASSWORD = os.getenv("PLATFORM_DEVOPS_PASSWORD", "devops123")
DEVELOPER_PASSWORD = os.getenv("PLATFORM_DEVELOPER_PASSWORD", "developer123")
VIEWER_PASSWORD = os.getenv("PLATFORM_VIEWER_PASSWORD", "viewer123")

USER_REGISTRY = {
    "admin": {"password": ADMIN_PASSWORD, "role": "Administrator"},
    "devops": {"password": DEVOPS_PASSWORD, "role": "DevOps Engineer"},
    "developer": {"password": DEVELOPER_PASSWORD, "role": "Developer"},
    "viewer": {"password": VIEWER_PASSWORD, "role": "Read Only"}
}

@router.post("/login", response_model=BaseResponse)
async def login(body: LoginRequest, response: Response, request: Request):
    username = body.username.strip().lower()
    password = body.password
    request_id = getattr(request.state, "request_id", None)
    
    user = USER_REGISTRY.get(username)
    if not user or user["password"] != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password credentials."
        )
        
    role = user["role"]
    token = create_access_token({"sub": username, "role": role})
    
    # Set secure HttpOnly cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=3600
    )
    
    return BaseResponse(
        success=True,
        data={
            "token": token,
            "username": username,
            "role": role
        },
        request_id=request_id
    )

@router.post("/logout", response_model=BaseResponse)
async def logout(response: Response, request: Request):
    request_id = getattr(request.state, "request_id", None)
    response.delete_cookie(key="session_token")
    return BaseResponse(success=True, data={"message": "Logged out successfully"}, request_id=request_id)
