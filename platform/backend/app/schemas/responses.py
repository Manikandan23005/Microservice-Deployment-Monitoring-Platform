# --- Standard API Response Schemas ---
from pydantic import BaseModel, Field
from typing import Optional, Any

class ErrorDetail(BaseModel):
    code: str = Field(..., description="Machine-readable error classification code.")
    message: str = Field(..., description="Human-readable description of the error.")
    details: Optional[str] = Field(None, description="Detailed trace information or configuration details.")

class BaseResponse(BaseModel):
    """Base API response wrapping success flags, data, and request tracing properties."""
    success: bool = Field(True, description="Indicates if the API request completed successfully.")
    data: Optional[Any] = Field(None, description="HTTP response data payload.")
    error: Optional[ErrorDetail] = Field(None, description="Details of any runtime anomalies encountered.")
    request_id: Optional[str] = Field(None, description="Traced UUID request correlation ID.")

class HealthData(BaseModel):
    status: str = Field("healthy", description="Status code indicating server operational health.")
    service: str = Field("devops-nexus-backend", description="Service identifier tag.")
    ready: bool = Field(True, description="Indicates if active database and cache check limits pass.")
    timestamp: str = Field(..., description="ISO 8601 server current date string.")

class HealthResponse(BaseResponse):
    """Structured response return for health and ready probes."""
    data: HealthData

class VersionData(BaseModel):
    title: str = Field("Microservice Deployment & Monitoring Platform", description="Application Title.")
    version: str = Field("0.1.0", description="Semantic Versioning string.")
    environment: str = Field("development", description="Current cluster staging profile.")

class VersionResponse(BaseResponse):
    """Structured response return for versions requests."""
    data: VersionData
