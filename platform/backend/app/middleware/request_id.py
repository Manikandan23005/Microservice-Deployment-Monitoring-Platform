# --- Request ID Injection Middleware ---
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Generates a unique request ID for tracing and sets X-Request-ID header."""
    async def dispatch(self, request: Request, call_next) -> Response:
        # Check if X-Request-ID was already set by gateway/ingress
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        
        # Attach request ID to request state for router access
        request.state.request_id = request_id
        
        response = await call_next(request)
        
        # Attach request ID to response headers
        response.headers["X-Request-ID"] = request_id
        return response
