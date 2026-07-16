# --- Kubernetes Validation Schemas ---
from pydantic import BaseModel, Field

class ScaleRequest(BaseModel):
    """Payload schema to request scaling a deployment."""
    replicas: int = Field(..., ge=0, description="Target number of replica pods (must be >= 0).")
