# --- Shared Platform Domain Exceptions ---

class DevOpsNexusException(Exception):
    """Base exception for all DevOps Nexus errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class KubernetesClientException(DevOpsNexusException):
    """Raised when cluster API actions fail."""
    pass

class ArgoCDConnectionException(DevOpsNexusException):
    """Raised when sync checks fail."""
    pass

class TelemetryFetchException(DevOpsNexusException):
    """Raised when Prometheus or Loki endpoints timeout."""
    pass

class AIModelTriageException(DevOpsNexusException):
    """Raised when Ollama context triages fail."""
    pass
