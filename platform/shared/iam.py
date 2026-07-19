# --- DevOps Nexus Shared IAM & Security Schemas ---
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
import datetime

class UserStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"

class Resource(str, Enum):
    PODS = "pods"
    DEPLOYMENTS = "deployments"
    REPLICASETS = "replicasets"
    SERVICES = "services"
    INGRESS = "ingress"
    NAMESPACES = "namespaces"
    NODES = "nodes"
    EVENTS = "events"
    METRICS = "metrics"
    LOGS = "logs"
    ALERTS = "alerts"
    GITOPS = "gitops"
    AI = "ai"
    SETTINGS = "settings"
    SECRETS = "secrets"
    PVC = "pvc"

class Action(str, Enum):
    VIEW = "view"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    RESTART_DEPLOYMENT = "restart_deployment"
    SCALE_DEPLOYMENT = "scale_deployment"
    SYNC_APPLICATION = "sync_application"
    ROLLBACK_APPLICATION = "rollback_application"
    EXEC_POD = "exec_pod"
    AI_CHAT = "ai_chat"
    AI_INCIDENT = "ai_incident"

class Role(BaseModel):
    name: str = Field(..., description="Role unique identifier name.")
    description: str = Field("", description="Human-readable role description.")
    is_system: bool = Field(False, description="System default template protection flag.")
    allowed_workspaces: List[str] = Field(default_factory=lambda: ["cluster", "namespace", "app", "infra"])
    allowed_namespaces: List[str] = Field(default_factory=lambda: ["*"])  # "*" or explicit list
    allowed_apps: List[str] = Field(default_factory=lambda: ["*"])
    permissions: Dict[str, Dict[str, bool]] = Field(
        default_factory=dict,
        description="Matrix of {resource: {action: allow_bool}}"
    )

class User(BaseModel):
    username: str = Field(..., description="Unique username handle.")
    full_name: str = Field("", description="User display full name.")
    email: str = Field("", description="User corporate email address.")
    role_name: str = Field(..., description="Assigned role name.")
    status: UserStatus = Field(UserStatus.ACTIVE, description="Account status.")
    assigned_workspaces: List[str] = Field(default_factory=lambda: ["cluster", "namespace", "app", "infra"])
    assigned_namespaces: List[str] = Field(default_factory=lambda: ["devops-nexus-prod"])
    assigned_apps: List[str] = Field(default_factory=lambda: ["payment-service", "auth-service"])
    created_at: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())
    last_login: Optional[str] = Field(None, description="Last authenticated timestamp.")
    password_hash: str = Field("admin123", description="Password credential string or hash.")

class AuditLogEntry(BaseModel):
    id: str = Field(..., description="Unique audit event ID.")
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())
    username: str = Field(..., description="Executing user handle.")
    role_name: str = Field(..., description="Active user role.")
    workspace: str = Field("cluster", description="Active scope mode.")
    namespace: Optional[str] = Field(None, description="Target namespace.")
    application: Optional[str] = Field(None, description="Target application.")
    action: str = Field(..., description="Privileged action identifier.")
    target_resource: str = Field(..., description="Target affected resource.")
    old_value: Optional[str] = Field(None, description="Previous state string.")
    new_value: Optional[str] = Field(None, description="New state string.")
    status: str = Field("SUCCESS", description="SUCCESS or FAILED status.")
    client_ip: str = Field("127.0.0.1", description="Source client IP address.")
    user_agent: str = Field("Web-Dashboard", description="Client User Agent header.")
    ai_assisted: bool = Field(False, description="Flag indicating if triggered via AI Assistant.")
