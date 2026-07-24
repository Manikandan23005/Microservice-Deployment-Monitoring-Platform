from typing import List, Dict, Any, Optional
from app.clients.kubernetes import k8s_client

class NamespaceService:
    def list_namespaces(self, cluster_id: Optional[str] = None) -> List[Dict[str, Any]]:
        namespaces = k8s_client.list_namespaces(cluster_id=cluster_id)
        result = []
        for ns in namespaces:
            try:
                pods = k8s_client.list_pods(namespace=ns.metadata.name, cluster_id=cluster_id)
                pods_count = len(pods)
            except Exception:
                pods_count = 0
            result.append({
                "name": ns.metadata.name,
                "status": ns.status.phase,
                "pods_count": pods_count,
                "creation_timestamp": ns.metadata.creation_timestamp.isoformat() if ns.metadata.creation_timestamp else None
            })
        return result

    def create_namespace(self, name: str, cluster_id: Optional[str] = None) -> Dict[str, Any]:
        k8s_client.create_namespace(name, cluster_id=cluster_id)
        return {"message": f"Namespace '{name}' created successfully."}

    def delete_namespace(self, name: str, cluster_id: Optional[str] = None) -> Dict[str, Any]:
        k8s_client.delete_namespace(name, cluster_id=cluster_id)
        return {"message": f"Namespace '{name}' deleted successfully."}

namespace_service = NamespaceService()
