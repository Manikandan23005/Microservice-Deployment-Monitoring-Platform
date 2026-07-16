# --- App Version Router ---
from fastapi import APIRouter, Request
from app.schemas.responses import VersionResponse, VersionData
from app.core.settings import settings

router = APIRouter()

@router.get("/version", response_model=VersionResponse)
async def get_version(request: Request):
    """Retrieves current application titles and semantic versions specifications."""
    request_id = getattr(request.state, "request_id", None)
    return VersionResponse(
        success=True,
        data=VersionData(
            title="Microservice Deployment & Monitoring Platform",
            version="0.1.0",
            environment=settings.global_environment if hasattr(settings, "global_environment") else "development"
        ),
        request_id=request_id
    )
