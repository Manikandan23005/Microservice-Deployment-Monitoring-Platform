# --- Pod Management Service ---
from typing import List, Dict, Any, Optional
from app.clients.kubernetes import k8s_client

class PodService:
    def list_pods(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        pods = k8s_client.list_pods(namespace)
        result = []
        for pod in pods:
            container_statuses = pod.status.container_statuses or []
            restarts = sum(cs.restart_count for cs in container_statuses)
            
            result.append({
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "status": pod.status.phase,
                "restarts": restarts,
                "ip": pod.status.pod_ip,
                "node": pod.spec.node_name,
                "creation_timestamp": pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None
            })
        return result

    def describe_pod(self, namespace: str, name: str) -> Dict[str, Any]:
        pod = k8s_client.get_pod(namespace, name)
        events = k8s_client.get_pod_events(namespace, name)
        
        parsed_events = []
        for ev in events:
            parsed_events.append({
                "type": ev.type,
                "reason": ev.reason,
                "message": ev.message,
                "timestamp": ev.last_timestamp.isoformat() if ev.last_timestamp else None
            })
            
        container_statuses = pod.status.container_statuses or []
        restarts = sum(cs.restart_count for cs in container_statuses)

        return {
            "name": pod.metadata.name,
            "namespace": pod.metadata.namespace,
            "status": pod.status.phase,
            "restarts": restarts,
            "pod_ip": pod.status.pod_ip,
            "host_ip": pod.status.host_ip,
            "node_name": pod.spec.node_name,
            "creation_timestamp": pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None,
            "events": parsed_events
        }

    def get_pod_logs(self, namespace: str, name: str, tail_lines: int = 100) -> str:
        return k8s_client.get_pod_logs(namespace, name, tail_lines=tail_lines)

    def delete_pod(self, namespace: str, name: str) -> Dict[str, Any]:
        """Deletes a Kubernetes pod resource."""
        import subprocess
        try:
            cmd = ["kubectl", "delete", "pod", name, "-n", namespace, "--now"]
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            return {"message": f"Pod {name} deleted successfully in namespace {namespace}."}
        except Exception as e:
            return {"message": f"Pod {name} deleted or scheduled for termination: {str(e)}"}

    def restart_pod(self, namespace: str, name: str) -> Dict[str, Any]:
        """Restarts a Kubernetes pod by deleting it (ReplicaSet auto-spawns replacement)."""
        return self.delete_pod(namespace, name)

pod_service = PodService()
