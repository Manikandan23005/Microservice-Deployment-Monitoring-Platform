# --- Shared Pydantic Models & Schemas ---
from pydantic import BaseModel
from typing import List, Optional

class SystemStatus(BaseModel):
    status: str
    service: str
    version: str

class PodInfo(BaseModel):
    name: str
    namespace: str
    status: str
    restarts: int
    cpu_usage: Optional[float] = None
    memory_usage: Optional[float] = None

class DeploymentPayload(BaseModel):
    application_name: str
    environment: str
    version_tag: str

class RollbackPayload(BaseModel):
    application_name: str
    environment: str
    revision: int

class AIAnalysisRequest(BaseModel):
    pod_name: str
    namespace: str
    error_logs: str
