# --- Ingress Router Service ---
from typing import List, Dict, Any, Optional
from app.clients.kubernetes import k8s_client

class IngressService:
    def list_ingresses(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        ingresses = k8s_client.list_ingresses(namespace)
        result = []
        for ing in ingresses:
            rules = ing.spec.rules or []
            hosts = [rule.host for rule in rules if rule.host]
            result.append({
                "name": ing.metadata.name,
                "namespace": ing.metadata.namespace,
                "hosts": hosts,
                "creation_timestamp": ing.metadata.creation_timestamp.isoformat() if ing.metadata.creation_timestamp else None
            })
        return result

ingress_service = IngressService()
