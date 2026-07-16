# --- Global Exception Interceptor Middleware ---
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger

class GlobalExceptionMiddleware(BaseHTTPMiddleware):
    """Intercepts unhandled server exceptions, logs errors, and returns standard JSON responses."""
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            request_id = getattr(request.state, "request_id", "unknown")
            logger.error(f"[X-Request-ID: {request_id}] Unhandled Server Error: {str(exc)}", exc_info=True)
            
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred on the server.",
                        "details": str(exc)
                    },
                    "request_id": request_id
                }
            )
