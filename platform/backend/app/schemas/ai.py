# --- AI Assistant Validation Schemas ---
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class AIChatRequest(BaseModel):
    """Payload to prompt a chat response."""
    prompt: str = Field(..., description="The user query or context to analyze.")
    provider: Optional[str] = Field(None, description="Select client AI provider: openai, groq, ollama, lmstudio.")

class AIIncidentRequest(BaseModel):
    """Payload to trigger detailed incident diagnostics."""
    pod_name: str = Field(..., description="Target pod identifier.")
    namespace: str = Field(..., description="Namespace scope.")
    logs: str = Field("", description="Snippet of container logs.")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="CPU/Memory utilization gauges.")
    events: List[Dict[str, Any]] = Field(default_factory=list, description="Kubernetes lifecycle events list.")
    provider: Optional[str] = Field(None, description="Select client AI provider.")
