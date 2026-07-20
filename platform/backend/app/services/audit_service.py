# --- DevOps Nexus Audit Logging Service ---
import uuid
import datetime
from typing import List, Dict, Any, Optional
from shared.iam import AuditLogEntry
from app.core.logging import logger
from app.db.postgres import SessionLocal, AuditLogModel, postgres_available

class AuditService:
    """Manages append-only enterprise audit log entries stored in PostgreSQL."""

    def __init__(self):
        self._logs: List[AuditLogEntry] = []
        self._seed_sample_logs()

    def _seed_sample_logs(self):
        # Only seed if table is empty
        if postgres_available and SessionLocal:
            try:
                db = SessionLocal()
                count = db.query(AuditLogModel).count()
                if count == 0:
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
                db.close()
            except Exception as e:
                logger.warning(f"Failed to seed audit logs in PostgreSQL: {str(e)}")

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
        self._logs.insert(0, entry)

        # Write to PostgreSQL DB
        if postgres_available and SessionLocal:
            try:
                db = SessionLocal()
                db_model = AuditLogModel(
                    id=entry.id,
                    timestamp=entry.timestamp,
                    username=entry.username,
                    role_name=entry.role_name,
                    workspace=entry.workspace,
                    namespace=entry.namespace,
                    application=entry.application,
                    action=entry.action,
                    target_resource=entry.target_resource,
                    old_value=entry.old_value,
                    new_value=entry.new_value,
                    status=entry.status,
                    client_ip=entry.client_ip,
                    user_agent=entry.user_agent,
                    ai_assisted=entry.ai_assisted
                )
                db.add(db_model)
                db.commit()
                db.close()
            except Exception as e:
                logger.error(f"Failed to persist audit log in PostgreSQL: {str(e)}")

        logger.info(f"[AUDIT] {username} ({role_name}) executed '{action}' on '{target_resource}' - Status: {status}")
        return entry

    def get_logs(
        self,
        search: Optional[str] = None,
        username: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 100
    ) -> List[AuditLogEntry]:
        if postgres_available and SessionLocal:
            try:
                db = SessionLocal()
                query = db.query(AuditLogModel)
                if username:
                    query = query.filter(AuditLogModel.username.ilike(username))
                if action:
                    query = query.filter(AuditLogModel.action.ilike(action))
                if search:
                    st = f"%{search}%"
                    query = query.filter(
                        (AuditLogModel.username.ilike(st)) |
                        (AuditLogModel.action.ilike(st)) |
                        (AuditLogModel.target_resource.ilike(st)) |
                        (AuditLogModel.namespace.ilike(st))
                    )
                db_logs = query.order_by(AuditLogModel.timestamp.desc()).limit(limit).all()
                result = [
                    AuditLogEntry(
                        id=l.id,
                        timestamp=l.timestamp,
                        username=l.username,
                        role_name=l.role_name,
                        workspace=l.workspace,
                        namespace=l.namespace,
                        application=l.application,
                        action=l.action,
                        target_resource=l.target_resource,
                        old_value=l.old_value,
                        new_value=l.new_value,
                        status=l.status,
                        client_ip=l.client_ip,
                        user_agent=l.user_agent,
                        ai_assisted=l.ai_assisted
                    )
                    for l in db_logs
                ]
                db.close()
                return result
            except Exception as e:
                logger.warning(f"Failed to fetch audit logs from PostgreSQL: {str(e)}")

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
