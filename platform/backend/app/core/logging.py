# --- Production Logging Configurations ---
import time
import json
import logging
import sys
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from shared.logger import get_platform_logger

logger = get_platform_logger("devops-nexus-backend")

class JSONFormatter(logging.Formatter):
    """Formats log records into structured JSON lines."""
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record, "%Y-%m-%d %H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage()
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

def setup_logging():
    """Initializes logging settings for standard packages."""
    # Set levels for noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    
    # Configure production JSON output logger
    root_logger = logging.getLogger()
    for handler in root_logger.handlers:
        root_logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root_logger.addHandler(handler)
    
    logger.info("Structured JSON Logging configuration active.")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware logging HTTP requests, response status codes, and execution timings."""
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"
        
        try:
            response = await call_next(request)
            duration = (time.perf_counter() - start_time) * 1000.0
            
            logger.info(
                f"[{request.method}] {request.url.path} - "
                f"Status: {response.status_code} - Duration: {duration:.2f}ms from {client_ip}"
            )
            return response
            
        except Exception as e:
            duration = (time.perf_counter() - start_time) * 1000.0
            logger.error(
                f"[{request.method}] {request.url.path} - "
                f"Error: {str(e)} - Duration: {duration:.2f}ms"
            )
            raise e
