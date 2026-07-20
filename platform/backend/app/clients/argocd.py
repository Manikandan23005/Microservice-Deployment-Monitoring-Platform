# --- ArgoCD REST API Client ---
import httpx
import base64
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
        if self.token and self.token != "my-argocd-token-placeholder":
            self.headers["Authorization"] = f"Bearer {self.token}"

    def _ensure_token(self):
        """Programmatically retrieves credentials from K8s secrets and generates a session token."""
        if "Authorization" in self.headers and self.token:
            return

        try:
            from app.clients.kubernetes import k8s_client
            # Fetch initial admin credentials directly from cluster secret
            secret = k8s_client.v1.read_namespaced_secret("argocd-initial-admin-secret", "argocd")
            password = base64.b64decode(secret.data["password"]).decode("utf-8").strip()

            url = f"{self.base_url}/session"
            with httpx.Client(verify=False, timeout=2.0) as client:
                response = client.post(url, json={"username": "admin", "password": password})
                if response.status_code == 200:
                    self.token = response.json()["token"]
                    self.headers["Authorization"] = f"Bearer {self.token}"
                    logger.info("Successfully auto-authenticated with ArgoCD server.")
                else:
                    logger.warning(f"ArgoCD session authorization rejected: {response.status_code} - {response.text}")
        except Exception as e:
            logger.warning(f"ArgoCD client failed to auto-authenticate: {str(e)}")

    def list_applications(self) -> List[Dict[str, Any]]:
        self._ensure_token()
        url = f"{self.base_url}/applications"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=2.0) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD returned status {response.status_code}: {response.text}")
                return response.json().get("items", [])
        except Exception as e:
            logger.error(f"Failed to list ArgoCD applications: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD server connection failed: {str(e)}")

    def sync_application(self, app_name: str) -> Dict[str, Any]:
        self._ensure_token()
        url = f"{self.base_url}/applications/{app_name}/sync"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=5.0) as client:
                response = client.post(url, json={})
                if response.status_code == 400 and "another operation is already in progress" in response.text:
                    logger.info(f"Sync already in progress for ArgoCD application {app_name}.")
                    return {"status": "Syncing", "message": f"ArgoCD sync operation for {app_name} is already in progress."}
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD sync failed {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            if "another operation is already in progress" in str(e):
                return {"status": "Syncing", "message": f"ArgoCD sync operation for {app_name} is already in progress."}
            logger.error(f"Failed to sync ArgoCD application {app_name}: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")

    def refresh_application(self, app_name: str) -> Dict[str, Any]:
        self._ensure_token()
        url = f"{self.base_url}/applications/{app_name}?refresh=normal"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=5.0) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD refresh failed {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to refresh ArgoCD application {app_name}: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")

    def rollback_application(self, app_name: str, revision: int) -> Dict[str, Any]:
        self._ensure_token()
        url = f"{self.base_url}/applications/{app_name}/rollback"
        body = {"revision": revision}
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=2.0) as client:
                response = client.post(url, json=body)
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD rollback failed {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to rollback ArgoCD application {app_name}: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")

    def get_application(self, app_name: str) -> Dict[str, Any]:
        self._ensure_token()
        url = f"{self.base_url}/applications/{app_name}"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=2.0) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise ArgoCDConnectionException(f"ArgoCD details request failed {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch ArgoCD application {app_name} details: {str(e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")
    def delete_application(self, app_name: str, cascade: bool = False) -> Dict[str, Any]:
        self._ensure_token()
        url = f"{self.base_url}/applications/{app_name}?cascade={str(cascade).lower()}"
        try:
            with httpx.Client(headers=self.headers, verify=False, timeout=5.0) as client:
                response = client.delete(url)
                if response.status_code not in (200, 204):
                    raise ArgoCDConnectionException(f"ArgoCD delete application failed {response.status_code}: {response.text}")
                return {"success": True, "message": f"ArgoCD Application '{app_name}' disconnected successfully."}
        except Exception as e:
            logger.error(f"Failed to delete ArgoCD application {app_name}: {str(e)}")
            # Fallback using K8s Custom Objects API if ArgoCD API token is unavailable
            try:
                from app.clients.kubernetes import k8s_client
                if k8s_client._initialized:
                    from kubernetes import client as k8s_sdk
                    custom_api = k8s_sdk.CustomObjectsApi()
                    custom_api.delete_namespaced_custom_object(
                        group="argoproj.io",
                        version="v1alpha1",
                        namespace="argocd",
                        plural="applications",
                        name=app_name
                    )
                    return {"success": True, "message": f"ArgoCD Application '{app_name}' disconnected via K8s CRD API."}
            except Exception as inner_e:
                logger.error(f"Fallback CRD deletion also failed: {str(inner_e)}")
            raise ArgoCDConnectionException(f"ArgoCD connection error: {str(e)}")

argocd_client = ArgoCDClient()
