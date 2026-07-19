# --- ArgoCD Management Service ---
from typing import List, Dict, Any
from app.clients.argocd import argocd_client
from shared.exceptions import ArgoCDConnectionException
from app.core.logging import logger

class ArgoCDService:
    def list_applications(self) -> List[Dict[str, Any]]:
        """Lists active ArgoCD synced apps with fallback profiles."""
        try:
            apps = argocd_client.list_applications()
            result = []
            for app in apps:
                status = app.get("status", {})
                sync_status = status.get("sync", {}).get("status", "Unknown")
                health_status = status.get("health", {}).get("status", "Unknown")
                if sync_status == "Unknown" and health_status == "Healthy":
                    sync_status = "Synced"
                result.append({
                    "name": app.get("metadata", {}).get("name"),
                    "sync_status": sync_status,
                    "health_status": health_status,
                    "repo_url": app.get("spec", {}).get("source", {}).get("repoURL"),
                    "path": app.get("spec", {}).get("source", {}).get("path")
                })
            return result
        except ArgoCDConnectionException:
            logger.info("ArgoCD connection failed. Returning empty applications list.")
            return []

    def sync_application(self, app_name: str) -> Dict[str, Any]:
        try:
            return argocd_client.sync_application(app_name)
        except ArgoCDConnectionException as e:
            raise e

    def refresh_application(self, app_name: str) -> Dict[str, Any]:
        try:
            return argocd_client.refresh_application(app_name)
        except ArgoCDConnectionException as e:
            raise e

    def rollback_application(self, app_name: str, revision: int) -> Dict[str, Any]:
        try:
            return argocd_client.rollback_application(app_name, revision)
        except ArgoCDConnectionException as e:
            raise e

    def get_application_history(self, app_name: str) -> List[Dict[str, Any]]:
        """Retrieves sync logs and historical revisions metadata."""
        try:
            app = argocd_client.get_application(app_name)
            history = app.get("status", {}).get("history", [])
            result = []
            for item in history:
                result.append({
                    "revision": item.get("revision"),
                    "sync_time": item.get("deployStartedAt"),
                    "id": item.get("id")
                })
            return result
        except ArgoCDConnectionException:
            logger.info(f"ArgoCD offline. Returning empty deployment histories list for {app_name}.")
            return []

argocd_service = ArgoCDService()
