# --- API Root Router ---
from fastapi import APIRouter, Request
from app.schemas.responses import BaseResponse

router = APIRouter()

@router.get("/", response_model=BaseResponse)
async def get_root(request: Request):
    request_id = getattr(request.state, "request_id", None)
    return BaseResponse(
        success=True,
        data={
            "message": "Welcome to the DevOps Nexus Core Platform API Portal.",
            "documentation": "/docs"
        },
        request_id=request_id
    )
