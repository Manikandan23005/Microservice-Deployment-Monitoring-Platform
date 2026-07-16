# --- Processing Time Tracker Middleware ---
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class ProcessingTimeMiddleware(BaseHTTPMiddleware):
    """Calculates request processing durations and appends X-Process-Time response header."""
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time"] = f"{process_time * 1000.0:.2f}ms"
        return response
