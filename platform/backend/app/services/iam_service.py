# --- DevOps Nexus IAM & Role Service ---
import uuid
import datetime
from typing import Dict, Any, List, Optional
from shared.iam import User, Role, UserStatus, Resource, Action
from app.core.logging import logger

class IAMService:
    """Manages dynamic Users, Roles, and Permission Matrices in memory/cache storage."""

    def __init__(self):
        self._roles: Dict[str, Role] = {}
        self._users: Dict[str, User] = {}
        self._init_default_roles()
        self._init_default_users()

    def _init_default_roles(self):
        resources = [r.value for r in Resource]
        actions = [a.value for a in Action]

        # 1. Administrator Template (All Allowed)
        admin_matrix = {
            res: {act: True for act in actions}
            for res in resources
        }
        self._roles["Administrator"] = Role(
            name="Administrator",
            description="Full root administrative access across all workspaces, nodes, and platform settings.",
            is_system=True,
            allowed_workspaces=["cluster", "namespace", "app", "infra"],
            allowed_namespaces=["*"],
            allowed_apps=["*"],
            permissions=admin_matrix
        )

        # 2. Platform Engineer Template
        pe_matrix = {
            res: {act: (act in ["view", "create", "update", "restart_deployment", "scale_deployment", "ai_chat", "ai_incident"]) for act in actions}
            for res in resources
        }
        pe_matrix["settings"]["delete"] = False
        self._roles["Platform Engineer"] = Role(
            name="Platform Engineer",
            description="Infrastructure and cluster-wide maintenance access excluding sensitive setting deletion.",
            is_system=True,
            allowed_workspaces=["cluster", "namespace", "app", "infra"],
            allowed_namespaces=["*"],
            allowed_apps=["*"],
            permissions=pe_matrix
        )

        # 3. DevOps Engineer Template
        devops_matrix = {
            res: {
                act: (act in ["view", "create", "update", "restart_deployment", "scale_deployment", "sync_application", "rollback_application", "ai_chat", "ai_incident"])
                for act in actions
            }
            for res in resources
        }
        devops_matrix["nodes"]["create"] = False
        devops_matrix["nodes"]["delete"] = False
        devops_matrix["settings"]["view"] = False
        self._roles["DevOps Engineer"] = Role(
            name="DevOps Engineer",
            description="Deployment lifecycle, GitOps synchronization, and incident triage scope.",
            is_system=True,
            allowed_workspaces=["namespace", "app", "infra"],
            allowed_namespaces=["devops-nexus-prod", "monitoring", "logging-lab", "argocd"],
            allowed_apps=["*"],
            permissions=devops_matrix
        )

        # 4. Application DevOps Template
        app_devops_matrix = {
            res: {
                act: (act in ["view", "restart_deployment", "scale_deployment", "sync_application", "ai_chat", "ai_incident"])
                for act in actions
            }
            for res in resources
        }
        app_devops_matrix["nodes"]["view"] = False
        app_devops_matrix["settings"]["view"] = False
        self._roles["Application DevOps"] = Role(
            name="Application DevOps",
            description="Application-level rollout management and telemetry monitoring.",
            is_system=True,
            allowed_workspaces=["app"],
            allowed_namespaces=["devops-nexus-prod"],
            allowed_apps=["payment-service", "orders-service", "auth-service"],
            permissions=app_devops_matrix
        )

        # 5. Developer Template
        dev_matrix = {
            res: {
                act: (act in ["view", "restart_deployment", "scale_deployment", "ai_chat"])
                for act in actions
            }
            for res in resources
        }
        dev_matrix["nodes"]["view"] = False
        dev_matrix["settings"]["view"] = False
        dev_matrix["gitops"]["sync_application"] = False
        dev_matrix["gitops"]["rollback_application"] = False
        self._roles["Developer"] = Role(
            name="Developer",
            description="Application developer access with restart and scaling on assigned workloads.",
            is_system=True,
            allowed_workspaces=["namespace", "app"],
            allowed_namespaces=["devops-nexus-prod"],
            allowed_apps=["payment-service", "auth-service"],
            permissions=dev_matrix
        )

        # 6. Viewer Template
        viewer_matrix = {
            res: {
                act: (act == "view" or act == "ai_chat")
                for act in actions
            }
            for res in resources
        }
        viewer_matrix["nodes"]["view"] = False
        viewer_matrix["settings"]["view"] = False
        self._roles["Viewer"] = Role(
            name="Viewer",
            description="Read-only observational access across authorized namespaces.",
            is_system=True,
            allowed_workspaces=["namespace", "app"],
            allowed_namespaces=["devops-nexus-prod"],
            allowed_apps=["*"],
            permissions=viewer_matrix
        )

    def _init_default_users(self):
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self._users["admin"] = User(
            username="admin",
            full_name="Platform Administrator",
            email="admin@devopsnexus.io",
            role_name="Administrator",
            status=UserStatus.ACTIVE,
            assigned_workspaces=["cluster", "namespace", "app", "infra"],
            assigned_namespaces=["*"],
            assigned_apps=["*"],
            created_at=now,
            last_login=now,
            password_hash="admin123"
        )
        self._users["devops"] = User(
            username="devops",
            full_name="Lead DevOps Engineer",
            email="devops@devopsnexus.io",
            role_name="DevOps Engineer",
            status=UserStatus.ACTIVE,
            assigned_workspaces=["namespace", "app", "infra"],
            assigned_namespaces=["devops-nexus-prod", "monitoring", "logging-lab", "argocd"],
            assigned_apps=["*"],
            created_at=now,
            last_login=now,
            password_hash="devops123"
        )
        self._users["developer"] = User(
            username="developer",
            full_name="Backend Application Developer",
            email="developer@devopsnexus.io",
            role_name="Developer",
            status=UserStatus.ACTIVE,
            assigned_workspaces=["namespace", "app"],
            assigned_namespaces=["devops-nexus-prod"],
            assigned_apps=["payment-service", "auth-service"],
            created_at=now,
            last_login=now,
            password_hash="developer123"
        )
        self._users["viewer"] = User(
            username="viewer",
            full_name="Read-Only Observability Auditor",
            email="viewer@devopsnexus.io",
            role_name="Viewer",
            status=UserStatus.ACTIVE,
            assigned_workspaces=["namespace", "app"],
            assigned_namespaces=["devops-nexus-prod"],
            assigned_apps=["*"],
            created_at=now,
            last_login=now,
            password_hash="viewer123"
        )

    # --- Role CRUD ---
    def get_roles(self) -> List[Role]:
        return list(self._roles.values())

    def get_role(self, name: str) -> Optional[Role]:
        return self._roles.get(name)

    def create_role(self, role: Role) -> Role:
        if role.name in self._roles:
            raise ValueError(f"Role '{role.name}' already exists.")
        self._roles[role.name] = role
        logger.info(f"Created new IAM role: {role.name}")
        return role

    def update_role(self, name: str, updated: Role) -> Role:
        if name not in self._roles:
            raise ValueError(f"Role '{name}' not found.")
        self._roles[name] = updated
        logger.info(f"Updated IAM role: {name}")
        return updated

    def delete_role(self, name: str) -> bool:
        if name not in self._roles:
            return False
        if self._roles[name].is_system:
            raise ValueError(f"Cannot delete system role template '{name}'.")
        del self._roles[name]
        logger.info(f"Deleted IAM role: {name}")
        return True

    def clone_role(self, source_name: str, new_name: str) -> Role:
        source = self.get_role(source_name)
        if not source:
            raise ValueError(f"Source role '{source_name}' not found.")
        cloned = Role(
            name=new_name,
            description=f"Cloned from {source_name}",
            is_system=False,
            allowed_workspaces=list(source.allowed_workspaces),
            allowed_namespaces=list(source.allowed_namespaces),
            allowed_apps=list(source.allowed_apps),
            permissions=dict(source.permissions)
        )
        return self.create_role(cloned)

    # --- User CRUD ---
    def get_users(self) -> List[User]:
        return list(self._users.values())

    def get_user(self, username: str) -> Optional[User]:
        return self._users.get(username.lower())

    def create_user(self, user: User) -> User:
        uname = user.username.lower()
        if uname in self._users:
            raise ValueError(f"User '{user.username}' already exists.")
        user.username = uname
        self._users[uname] = user
        logger.info(f"Created new IAM user: {user.username}")
        return user

    def update_user(self, username: str, user_data: Dict[str, Any]) -> User:
        uname = username.lower()
        user = self._users.get(uname)
        if not user:
            raise ValueError(f"User '{username}' not found.")
        
        for k, v in user_data.items():
            if hasattr(user, k) and v is not None:
                setattr(user, k, v)
        
        logger.info(f"Updated IAM user: {username}")
        return user

    def delete_user(self, username: str) -> bool:
        uname = username.lower()
        if uname not in self._users:
            return False
        if uname == "admin":
            raise ValueError("Root 'admin' account cannot be deleted.")
        del self._users[uname]
        logger.info(f"Deleted IAM user: {username}")
        return True

    def set_user_status(self, username: str, status: UserStatus) -> User:
        uname = username.lower()
        user = self._users.get(uname)
        if not user:
            raise ValueError(f"User '{username}' not found.")
        user.status = status
        logger.info(f"Set status of user '{username}' to {status}")
        return user

iam_service = IAMService()
