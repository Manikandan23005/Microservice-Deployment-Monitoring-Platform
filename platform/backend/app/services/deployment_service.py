# --- Deployment Management Service ---
from typing import List, Dict, Any, Optional
from app.clients.kubernetes import k8s_client
from app.core.logging import logger

class DeploymentService:
    def _resolve_k8s_name(self, namespace: str, name: str) -> str:
        """Resolves ArgoCD app alias names (e.g. auth-prod) to K8s deployment names (e.g. auth-service)."""
        try:
            deployments = self.list_deployments(namespace)
            dep_names = [d["name"] for d in deployments]
            if name in dep_names:
                return name
            
            # Map suffix '-prod' or '-dev' to '-service'
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
        result = []
        for dep in deployments:
            result.append({
                "name": dep.metadata.name,
                "namespace": dep.metadata.namespace,
                "replicas": dep.spec.replicas,
                "ready_replicas": dep.status.ready_replicas or 0,
                "updated_replicas": dep.status.updated_replicas or 0,
                "available_replicas": dep.status.available_replicas or 0,
                "creation_timestamp": dep.metadata.creation_timestamp.isoformat() if dep.metadata.creation_timestamp else None
            })
        return result

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
