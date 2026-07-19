# --- DevOps Nexus Global Operations Scope Models ---
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class ScopeMode(str, Enum):
    CLUSTER = "cluster"
    NAMESPACE = "namespace"
    APPLICATION = "app"
    INFRASTRUCTURE = "infra"

class InfrastructureDomain(str, Enum):
    MONITORING = "monitoring"
    LOGGING = "logging"
    GITOPS = "gitops"
    NETWORKING = "networking"
    STORAGE = "storage"

class OperationsScope(BaseModel):
    """Encapsulates the global operational scope active for queries and AI context."""
    mode: ScopeMode = Field(default=ScopeMode.CLUSTER, description="Active scope operating mode.")
    namespace: Optional[str] = Field(default="devops-nexus-prod", description="Target namespace when mode is namespace or app.")
    application: Optional[str] = Field(default=None, description="Target application name when mode is app.")
    domain: Optional[InfrastructureDomain] = Field(default=None, description="Target infrastructure domain when mode is infra.")

    def get_effective_namespaces(self) -> List[str]:
        """Resolves target Kubernetes namespaces for the scope configuration."""
        if self.mode == ScopeMode.CLUSTER:
            return []  # Empty list denotes cluster-wide querying
        elif self.mode in [ScopeMode.NAMESPACE, ScopeMode.APPLICATION]:
            return [self.namespace] if self.namespace else ["devops-nexus-prod"]
        elif self.mode == ScopeMode.INFRASTRUCTURE:
            if self.domain == InfrastructureDomain.MONITORING:
                return ["monitoring"]
            elif self.domain == InfrastructureDomain.LOGGING:
                return ["logging-lab"]
            elif self.domain == InfrastructureDomain.GITOPS:
                return ["argocd"]
            elif self.domain == InfrastructureDomain.NETWORKING:
                return ["ingress-nginx", "kube-system"]
            elif self.domain == InfrastructureDomain.STORAGE:
                return ["kube-system", "default"]
            return ["monitoring", "logging-lab", "argocd"]
        return []
