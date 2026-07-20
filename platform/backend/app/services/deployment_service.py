# --- Deployment Management Service ---
from typing import List, Dict, Any, Optional
from app.clients.kubernetes import k8s_client
from app.core.logging import logger

class DeploymentService:
    def _resolve_k8s_name(self, namespace: str, name: str) -> str:
        """Resolves ArgoCD app alias names (e.g. auth-prod) to K8s deployment names (e.g. auth-service)."""
        try:
            deployments = k8s_client.list_deployments(namespace)
            dep_names = [d.metadata.name for d in deployments]
            if name in dep_names:
                return name
            
            clean_prefix = name.replace("-prod", "").replace("-dev", "").lower()
            for d_name in dep_names:
                if d_name == f"{clean_prefix}-service" or clean_prefix in d_name.lower():
                    logger.info(f"Resolved ArgoCD name '{name}' to Kubernetes deployment '{d_name}' in namespace '{namespace}'.")
                    return d_name
        except Exception:
            pass
        return name

    def list_deployments(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        deployments = k8s_client.list_deployments(namespace)
        
        # Fetch active ArgoCD applications to match ownership dynamically
        try:
            from app.services.argocd_service import argocd_service
            argocd_apps = argocd_service.list_applications()
        except Exception:
            argocd_apps = []

        result = []
        for dep in deployments:
            dep_name = dep.metadata.name
            dep_ns = dep.metadata.namespace
            labels = dep.metadata.labels or {}
            annotations = dep.metadata.annotations or {}

            matched_app = None
            for app in argocd_apps:
                app_dest_ns = app.get("destination_namespace", "devops-nexus-prod")
                app_name = app.get("name", "")
                clean_app_prefix = app_name.replace("-prod", "").replace("-dev", "").lower()
                clean_dep_prefix = dep_name.replace("-service", "").lower()

                if (dep_ns == app_dest_ns) and (
                    dep_name == app_name or
                    dep_name == f"{clean_app_prefix}-service" or
                    clean_app_prefix == clean_dep_prefix or
                    labels.get("app.kubernetes.io/instance") == app_name or
                    annotations.get("argocd.argoproj.io/tracking-id", "").startswith(app_name)
                ):
                    matched_app = app
                    break

            gitops_managed = matched_app is not None

            result.append({
                "name": dep_name,
                "namespace": dep_ns,
                "status": "Running" if (dep.status.available_replicas or 0) > 0 else "Pending",
                "replicas": dep.spec.replicas,
                "ready_replicas": dep.status.ready_replicas or 0,
                "updated_replicas": dep.status.updated_replicas or 0,
                "available_replicas": dep.status.available_replicas or 0,
                "creation_timestamp": dep.metadata.creation_timestamp.isoformat() if dep.metadata.creation_timestamp else None,
                "gitopsManaged": gitops_managed,
                "manager": "ArgoCD" if gitops_managed else "Kubernetes",
                "argocd_app_name": matched_app.get("name") if matched_app else None,
                "repo_url": matched_app.get("repo_url") if matched_app else None,
                "targetRevision": matched_app.get("targetRevision", "HEAD") if matched_app else None,
                "sync_status": matched_app.get("sync_status", "Synced") if matched_app else None,
                "health_status": matched_app.get("health_status", "Healthy") if matched_app else None,
            })
        return result

    def check_gitops_managed(self, namespace: str, name: str) -> bool:
        """Determines if target deployment is actively managed by ArgoCD."""
        deps = self.list_deployments(namespace)
        target_name = self._resolve_k8s_name(namespace, name)
        for d in deps:
            if d["name"] == target_name or d.get("argocd_app_name") == name:
                return d.get("gitopsManaged", False)
        return False

    def restart_deployment(self, namespace: str, name: str) -> Dict[str, Any]:
        target_name = self._resolve_k8s_name(namespace, name)
        k8s_client.restart_deployment(namespace, target_name)
        return {
            "success": True,
            "message": f"Rollout restart triggered successfully for deployment {target_name}."
        }

    def scale_deployment(self, namespace: str, name: str, replicas: int) -> Dict[str, Any]:
        target_name = self._resolve_k8s_name(namespace, name)
        k8s_client.scale_deployment(namespace, target_name, replicas)
        return {
            "success": True,
            "message": f"Successfully scaled deployment {target_name} to {replicas} replicas."
        }

    def get_rollout_status(self, namespace: str, name: str) -> Dict[str, Any]:
        target_name = self._resolve_k8s_name(namespace, name)
        dep = k8s_client.get_deployment(namespace, target_name)
        status = dep.status
        spec = dep.spec
        
        is_complete = (
            status.updated_replicas == spec.replicas and
            status.replicas == spec.replicas and
            status.available_replicas == spec.replicas and
            (status.observed_generation or 0) >= dep.metadata.generation
        )
        
        status_message = "Rollout complete" if is_complete else "Rollout in progress"
        
        return {
            "name": dep.metadata.name,
            "namespace": dep.metadata.namespace,
            "desired_replicas": spec.replicas,
            "updated_replicas": status.updated_replicas or 0,
            "ready_replicas": status.ready_replicas or 0,
            "available_replicas": status.available_replicas or 0,
            "is_complete": is_complete,
            "status_message": status_message
        }

deployment_service = DeploymentService()
