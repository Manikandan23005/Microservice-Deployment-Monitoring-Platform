# --- Namespace Management Service ---
from typing import List, Dict, Any
from app.clients.kubernetes import k8s_client

class NamespaceService:
    def list_namespaces(self) -> List[Dict[str, Any]]:
        namespaces = k8s_client.list_namespaces()
        result = []
        for ns in namespaces:
            result.append({
                "name": ns.metadata.name,
                "status": ns.status.phase,
                "creation_timestamp": ns.metadata.creation_timestamp.isoformat() if ns.metadata.creation_timestamp else None
            })
        return result

    def create_namespace(self, name: str) -> Dict[str, Any]:
        k8s_client.create_namespace(name)
        return {"message": f"Namespace '{name}' created successfully."}

    def delete_namespace(self, name: str) -> Dict[str, Any]:
        k8s_client.delete_namespace(name)
        return {"message": f"Namespace '{name}' deleted successfully."}

namespace_service = NamespaceService()
