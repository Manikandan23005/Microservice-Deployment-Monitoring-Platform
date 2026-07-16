# --- Node Monitoring Service ---
from typing import List, Dict, Any
from app.clients.kubernetes import k8s_client

class NodeService:
    def list_nodes(self) -> List[Dict[str, Any]]:
        nodes = k8s_client.list_nodes()
        result = []
        for node in nodes:
            # Detect node role from labels
            labels = node.metadata.labels or {}
            role = "worker"
            if "node-role.kubernetes.io/control-plane" in labels:
                role = "control-plane"
            elif "node-role.kubernetes.io/master" in labels:
                role = "master"

            # Parse status conditions
            conditions = node.status.conditions or []
            status = "Unknown"
            for cond in conditions:
                if cond.type == "Ready":
                    status = "Ready" if cond.status == "True" else "NotReady"
                    break

            result.append({
                "name": node.metadata.name,
                "status": status,
                "role": role,
                "ip_address": self._get_internal_ip(node),
                "cpu_capacity": node.status.capacity.get("cpu") if node.status.capacity else "unknown",
                "memory_capacity": node.status.capacity.get("memory") if node.status.capacity else "unknown"
            })
        return result

    def _get_internal_ip(self, node: Any) -> str:
        addresses = node.status.addresses or []
        for addr in addresses:
            if addr.type == "InternalIP":
                return addr.address
        return "unknown"

node_service = NodeService()
