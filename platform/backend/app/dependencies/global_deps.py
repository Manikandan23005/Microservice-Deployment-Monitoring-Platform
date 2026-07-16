# --- Global FastAPI Dependency Injections ---
from fastapi import Request, Header, HTTPException, status

async def verify_request_tracing(request: Request) -> str:
    """Verifies that request tracing UUID is attached to the active request context."""
    request_id = getattr(request.state, "request_id", None)
    if not request_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request context is missing trace parameters."
        )
    return request_id
