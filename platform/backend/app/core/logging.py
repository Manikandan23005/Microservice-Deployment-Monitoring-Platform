# --- Production Logging Configurations ---
import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from shared.logger import get_platform_logger

# Initialize central backend logger
logger = get_platform_logger("devops-nexus-backend")

def setup_logging():
    """Initializes logging settings for standard packages."""
    # Set levels for noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logger.info("DevOps Nexus logging configuration initialized.")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware logging HTTP requests, response status codes, and execution timings."""
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        
        # Log inbound request
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Inbound Request: [{request.method}] {request.url.path} from {client_ip}")
        
        try:
            response = await call_next(request)
            duration = (time.perf_counter() - start_time) * 1000.0
            
            # Log successful response
            logger.info(
                f"Outbound Response: [{request.method}] {request.url.path} - "
                f"Status: {response.status_code} - Duration: {duration:.2f}ms"
            )
            return response
            
        except Exception as e:
            duration = (time.perf_counter() - start_time) * 1000.0
            logger.error(
                f"Request Failed: [{request.method}] {request.url.path} - "
                f"Error: {str(e)} - Duration: {duration:.2f}ms"
            )
            raise e
