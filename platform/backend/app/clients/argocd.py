# --- ArgoCD REST API Client ---
import httpx
from typing import List, Dict, Any, Optional
from app.core.settings import settings
from app.core.logging import logger
from shared.exceptions import ArgoCDConnectionException

class ArgoCDClient:
    """Manages connections to the ArgoCD API Server."""
    def __init__(self):
        self.server = settings.ARGOCD_SERVER or "localhost:8080"
        self.token = settings.ARGOCD_TOKEN
        self.base_url = f"https://{self.server}/api/v1"
        self.headers = {
            "Content-Type": "application/json"
        }
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

    def list_applications(self) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/applications"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=5.0) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD returned status {response.status_code}: {response.text}")
                return response.json().get("items", [])
        except Exception as e:
            logger.error(f"Failed to list ArgoCD applications: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD server connection failed: {str(e)}")

    def sync_application(self, app_name: str) -> Dict[str, Any]:
        url = f"{self.base_url}/applications/{app_name}/sync"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=5.0) as client:
                response = client.post(url, json={})
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD sync failed {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to sync ArgoCD application {app_name}: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")

    def refresh_application(self, app_name: str) -> Dict[str, Any]:
        url = f"{self.base_url}/applications/{app_name}/refresh"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=5.0) as client:
                response = client.post(url, json={})
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD refresh failed {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to refresh ArgoCD application {app_name}: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")

    def rollback_application(self, app_name: str, revision: int) -> Dict[str, Any]:
        url = f"{self.base_url}/applications/{app_name}/rollback"
        body = {"revision": revision}
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=5.0) as client:
                response = client.post(url, json=body)
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD rollback failed {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to rollback ArgoCD application {app_name}: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")

    def get_application(self, app_name: str) -> Dict[str, Any]:
        url = f"{self.base_url}/applications/{app_name}"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=5.0) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD details request failed {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch ArgoCD application {app_name} details: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")

argocd_client = ArgoCDClient()
