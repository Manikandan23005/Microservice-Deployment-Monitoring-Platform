from typing import List, Dict, Any, Optional
from app.services.pod_service import pod_service
from app.services.deployment_service import deployment_service
from app.services.node_service import node_service
from app.services.namespace_service import namespace_service
from app.services.monitoring_service import monitoring_service
from app.services.argocd_service import argocd_service
from app.utils.cache import ttl_cache
from app.core.logging import logger

class ToolExecutor:
    """Strongly typed tool executor layer that fetches telemetry directly from infrastructure client APIs."""

    def get_pods(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("pods")
        if cached is not None:
            return cached
        try:
            val = pod_service.list_pods()
            ttl_cache.set("pods", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"ToolExecutor failed to get pods: {str(e)}")
            return []

    def get_deployments(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("deployments")
        if cached is not None:
            return cached
        try:
            val = deployment_service.list_deployments()
            ttl_cache.set("deployments", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"ToolExecutor failed to get deployments: {str(e)}")
            return []

    def get_nodes(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("nodes")
        if cached is not None:
            return cached
        try:
            val = node_service.list_nodes()
            ttl_cache.set("nodes", val, ttl=10.0)
            return val
        except Exception as e:
            logger.warning(f"ToolExecutor failed to get nodes: {str(e)}")
            return []

    def get_namespaces(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("namespaces")
        if cached is not None:
            return cached
        try:
            val = namespace_service.list_namespaces()
            ttl_cache.set("namespaces", val, ttl=10.0)
            return val
        except Exception as e:
            logger.warning(f"ToolExecutor failed to get namespaces: {str(e)}")
            return []

    def get_pod_logs(self, namespace: str, name: str) -> str:
        cache_key = f"logs:{namespace}:{name}"
        cached = ttl_cache.get(cache_key)
        if cached is not None:
            return cached
        try:
            val = pod_service.get_pod_logs(namespace, name, tail_lines=30)
            ttl_cache.set(cache_key, val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"ToolExecutor failed to get logs for {name}: {str(e)}")
            return f"Unavailable: {str(e)}"

    def get_events(self, namespace: str, name: str) -> List[Dict[str, Any]]:
        cache_key = f"events:{namespace}:{name}"
        cached = ttl_cache.get(cache_key)
        if cached is not None:
            return cached
        try:
            pod_desc = pod_service.describe_pod(namespace, name)
            val = pod_desc.get("events", [])
            ttl_cache.set(cache_key, val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"ToolExecutor failed to get events for {name}: {str(e)}")
            return []

    def get_cpu_usage(self) -> float:
        metrics = self._get_metrics_summary()
        return metrics.get("cpu_utilization", 0.0)

    def get_memory_usage(self) -> float:
        metrics = self._get_metrics_summary()
        return metrics.get("memory_utilization", 0.0)

    def get_network_usage(self) -> float:
        metrics = self._get_metrics_summary()
        return metrics.get("network_throughput_bytes", 0.0)

    def get_applications(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("argocd_apps")
        if cached is not None:
            return cached
        try:
            val = argocd_service.list_applications()
            ttl_cache.set("argocd_apps", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"ToolExecutor failed to get applications: {str(e)}")
            return []

    def get_sync_status(self) -> Dict[str, Any]:
        apps = self.get_applications()
        synced = sum(1 for a in apps if a.get("sync_status") == "Synced")
        total = len(apps)
        return {
            "synced_count": synced,
            "total_count": total,
            "out_of_sync": [a.get("name") for a in apps if a.get("sync_status") != "Synced"]
        }

    def get_cluster_health(self) -> Dict[str, Any]:
        pods = self.get_pods()
        running_pods = sum(1 for p in pods if p.get("status") == "Running")
        total_pods = len(pods)
        
        nodes = self.get_nodes()
        ready_nodes = sum(1 for n in nodes if n.get("status") == "Ready")
        total_nodes = len(nodes)
        
        status = "Healthy"
        if running_pods < total_pods or ready_nodes < total_nodes:
            status = "Degraded"
        if total_nodes == 0:
            status = "Offline"
            
        return {
            "status": status,
            "running_pods": running_pods,
            "total_pods": total_pods,
            "ready_nodes": ready_nodes,
            "total_nodes": total_nodes
        }

    def _get_metrics_summary(self) -> Dict[str, Any]:
        cached = ttl_cache.get("metrics")
        if cached is not None:
            return cached
        try:
            val = monitoring_service.get_cluster_metrics()
            ttl_cache.set("metrics", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"ToolExecutor failed to get metrics: {str(e)}")
            return {"cpu_utilization": 0.0, "memory_utilization": 0.0, "network_throughput_bytes": 0.0}

tool_executor = ToolExecutor()
