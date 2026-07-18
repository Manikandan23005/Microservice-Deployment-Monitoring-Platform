import time
import os
import logging
import json
from fastapi import Request, Response
from prometheus_client import generate_latest, Counter, Histogram, CONTENT_TYPE_LATEST

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": self.formatTime(record, "%Y-%m-%d %H:%M:%S"),
            "service": os.getenv("SERVICE_NAME", "unknown-service"),
            "level": record.levelname,
            "request_id": getattr(record, "request_id", "none"),
            "message": record.getMessage()
        }
        if record.exc_info:
            log_obj["error"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

logger = logging.getLogger("microservice")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setFormatter(JSONFormatter())
    logger.addHandler(ch)

REQUEST_COUNT = Counter(
    "http_requests_total", 
    "Total HTTP Requests", 
    ["method", "endpoint", "http_status"]
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds", 
    "HTTP Request Latency", 
    ["method", "endpoint"]
)

def instrument_app(app, service_name: str):
    os.environ["SERVICE_NAME"] = service_name
    
    @app.middleware("http")
    async def log_and_metrics_middleware(request: Request, call_next):
        start_time = time.time()
        request_id = request.headers.get("X-Request-ID", "none")
        
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            logger.error(f"Request failed: {str(e)}", exc_info=True, extra={"request_id": request_id})
            status_code = 500
            raise e
        finally:
            duration = time.time() - start_time
            endpoint = request.url.path
            
            if endpoint not in ["/health", "/ready", "/metrics", "/healthz", "/version"]:
                REQUEST_COUNT.labels(method=request.method, endpoint=endpoint, http_status=status_code).inc()
                REQUEST_LATENCY.labels(method=request.method, endpoint=endpoint).observe(duration)
                
            logger.info(
                f"{request.method} {request.url.path} responded {status_code} in {duration:.4f}s", 
                extra={"request_id": request_id}
            )
            
        return response

    @app.get("/health")
    def health():
        return {"status": "healthy", "service": service_name}

    @app.get("/ready")
    def ready():
        return {"status": "ready", "service": service_name}

    @app.get("/version")
    def version():
        return {"version": "0.1.0", "service": service_name}

    @app.get("/metrics")
    def metrics():
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)