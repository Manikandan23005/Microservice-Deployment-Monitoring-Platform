# --- AI Assistant Validation Schemas ---
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class AIChatRequest(BaseModel):
    """Payload to prompt a chat response."""
    prompt: str = Field(..., description="The user query or context to analyze.")
    provider: Optional[str] = Field(None, description="Select client AI provider: openai, groq, ollama, lmstudio.")
    session_id: Optional[str] = Field(None, description="Optional conversational session tracking identifier.")

class AIIncidentRequest(BaseModel):
    """Payload to trigger detailed incident diagnostics."""
    pod_name: str = Field(..., description="Target pod identifier.")
    namespace: str = Field(..., description="Namespace scope.")
    logs: str = Field("", description="Snippet of container logs.")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="CPU/Memory utilization gauges.")
    events: List[Dict[str, Any]] = Field(default_factory=list, description="Kubernetes lifecycle events list.")
    provider: Optional[str] = Field(None, description="Select client AI provider.")

class AIStructuredResponse(BaseModel):
    summary: str = Field(..., description="High-level summary of the operational status.")
    root_cause: str = Field(..., description="Deep-dive root cause analysis grounded in live telemetry.")
    evidence: List[str] = Field(default_factory=list, description="Concrete metrics, logs, or events logs serving as evidence.")
    affected_resources: List[str] = Field(default_factory=list, description="List of Kubernetes resources affected by the incident.")
    recommendations: List[str] = Field(default_factory=list, description="Actionable remediation steps to fix the issue.")
    severity: str = Field(..., description="Target severity indicator: Info, Warning, Critical.")
    confidence: int = Field(..., description="Analysis confidence percentage score between 0 and 100.")
