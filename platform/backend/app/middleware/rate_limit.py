# --- Request Rate Limiter Middleware ---
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.cache import cache_client

RATE_LIMIT_MAX = 100  # Max 100 requests per minute
RATE_LIMIT_WINDOW = 60  # Time window of 60 seconds

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Limits client requests count per IP address using cache storage keys."""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        
        # Bypass checks for health probes
        if request.url.path in ["/health", "/ready"]:
            return await call_next(request)
            
        key = f"rate_limit:{client_ip}"
        
        try:
            current_hits = cache_client.get(key)
            if current_hits is None:
                cache_client.set(key, "1", ex_seconds=RATE_LIMIT_WINDOW)
            else:
                hits = int(current_hits)
                if hits >= RATE_LIMIT_MAX:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "success": False,
                            "error": {
                                "code": "TOO_MANY_REQUESTS",
                                "message": "API request rate limit exceeded. Please try again later."
                            }
                        }
                    )
                cache_client.set(key, str(hits + 1), ex_seconds=RATE_LIMIT_WINDOW)
        except Exception:
            # Fallback gracefully if cache checks raise errors
            pass
            
        return await call_next(request)
