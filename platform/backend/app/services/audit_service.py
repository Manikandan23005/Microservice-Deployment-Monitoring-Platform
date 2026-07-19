# --- DevOps Nexus Audit Logging Service ---
import uuid
import datetime
from typing import List, Dict, Any, Optional
from shared.iam import AuditLogEntry
from app.core.logging import logger

class AuditService:
    """Manages append-only enterprise audit log entries for all privileged platform actions."""

    def __init__(self):
        self._logs: List[AuditLogEntry] = []
        self._seed_sample_logs()

    def _seed_sample_logs(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        self.log_action(
            username="admin",
            role_name="Administrator",
            action="scale_deployment",
            target_resource="deployment/payment-service",
            workspace="namespace",
            namespace="devops-nexus-prod",
            application="payment-service",
            old_value="replicas=2",
            new_value="replicas=3",
            status="SUCCESS",
            client_ip="127.0.0.1",
            user_agent="Mozilla/5.0 Chrome/122.0",
            ai_assisted=False
        )
        self.log_action(
            username="devops",
            role_name="DevOps Engineer",
            action="sync_application",
            target_resource="argocd/payment-service",
            workspace="namespace",
            namespace="devops-nexus-prod",
            application="payment-service",
            old_value="sync_status=OutOfSync",
            new_value="sync_status=Synced",
            status="SUCCESS",
            client_ip="127.0.0.1",
            user_agent="Mozilla/5.0 Chrome/122.0",
            ai_assisted=True
        )

    def log_action(
        self,
        username: str,
        role_name: str,
        action: str,
        target_resource: str,
        workspace: str = "cluster",
        namespace: Optional[str] = None,
        application: Optional[str] = None,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None,
        status: str = "SUCCESS",
        client_ip: str = "127.0.0.1",
        user_agent: str = "Web-Dashboard",
        ai_assisted: bool = False
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            id=str(uuid.uuid4()),
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            username=username,
            role_name=role_name,
            workspace=workspace,
            namespace=namespace,
            application=application,
            action=action,
            target_resource=target_resource,
            old_value=old_value,
            new_value=new_value,
            status=status,
            client_ip=client_ip,
            user_agent=user_agent,
            ai_assisted=ai_assisted
        )
        self._logs.insert(0, entry)  # Prepend newest entries first
        logger.info(f"[AUDIT] {username} ({role_name}) executed '{action}' on '{target_resource}' - Status: {status}")
        return entry

    def get_logs(
        self,
        search: Optional[str] = None,
        username: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 100
    ) -> List[AuditLogEntry]:
        filtered = self._logs
        if username:
            filtered = [l for l in filtered if l.username.lower() == username.lower()]
        if action:
            filtered = [l for l in filtered if l.action.lower() == action.lower()]
        if search:
            st = search.lower()
            filtered = [
                l for l in filtered 
                if st in l.username.lower() or st in l.action.lower() or st in l.target_resource.lower() or st in (l.namespace or "").lower()
            ]
        return filtered[:limit]

audit_service = AuditService()
