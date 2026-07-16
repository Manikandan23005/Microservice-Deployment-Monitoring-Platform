# --- Deployment Management Service ---
from typing import List, Dict, Any, Optional
from app.clients.kubernetes import k8s_client

class DeploymentService:
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
        k8s_client.restart_deployment(namespace, name)
        return {
            "success": True,
            "message": f"Rollout restart triggered successfully for deployment {name}."
        }

    def scale_deployment(self, namespace: str, name: str, replicas: int) -> Dict[str, Any]:
        k8s_client.scale_deployment(namespace, name, replicas)
        return {
            "success": True,
            "message": f"Successfully scaled deployment {name} to {replicas} replicas."
        }

    def get_rollout_status(self, namespace: str, name: str) -> Dict[str, Any]:
        dep = k8s_client.get_deployment(namespace, name)
        status = dep.status
        spec = dep.spec
        
        # Rollout conditions analysis
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
