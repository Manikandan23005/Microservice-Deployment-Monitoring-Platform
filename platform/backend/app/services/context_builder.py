# --- AI Incident Context Builder ---
from typing import Dict, Any, List, Optional
from app.services.pod_service import pod_service
from app.services.deployment_service import deployment_service
from app.services.node_service import node_service
from app.services.namespace_service import namespace_service
from app.services.monitoring_service import monitoring_service
from app.services.argocd_service import argocd_service
from app.services.incident_analyzer import incident_analyzer
from app.utils.cache import ttl_cache
from app.utils.session_manager import session_manager
from app.core.logging import logger

class ContextBuilder:
    """Collects live cluster configurations, events, metrics, logs, and GitOps sync states into a unified dictionary."""

    def _get_pods(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("pods")
        if cached is not None:
            return cached
        try:
            val = pod_service.list_pods()
            ttl_cache.set("pods", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"Failed to list pods: {str(e)}")
            return []

    def _get_deployments(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("deployments")
        if cached is not None:
            return cached
        try:
            val = deployment_service.list_deployments()
            ttl_cache.set("deployments", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"Failed to list deployments: {str(e)}")
            return []

    def _get_nodes(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("nodes")
        if cached is not None:
            return cached
        try:
            val = node_service.list_nodes()
            ttl_cache.set("nodes", val, ttl=10.0)
            return val
        except Exception as e:
            logger.warning(f"Failed to list nodes: {str(e)}")
            return []

    def _get_metrics(self) -> Dict[str, Any]:
        cached = ttl_cache.get("metrics")
        if cached is not None:
            return cached
        try:
            val = monitoring_service.get_cluster_metrics()
            ttl_cache.set("metrics", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"Failed to get cluster metrics: {str(e)}")
            return {"cpu_utilization": 0.0, "memory_utilization": 0.0, "disk_utilization": 0.0, "network_throughput_bytes": 0.0}

    def _get_argocd_apps(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("argocd_apps")
        if cached is not None:
            return cached
        try:
            val = argocd_service.list_applications()
            ttl_cache.set("argocd_apps", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"Failed to list ArgoCD apps: {str(e)}")
            return []

    def _get_namespaces(self) -> List[Dict[str, Any]]:
        cached = ttl_cache.get("namespaces")
        if cached is not None:
            return cached
        try:
            val = namespace_service.list_namespaces()
            ttl_cache.set("namespaces", val, ttl=10.0)
            return val
        except Exception as e:
            logger.warning(f"Failed to list namespaces: {str(e)}")
            return []

    def classify_query(self, prompt: str) -> List[str]:
        lower = prompt.lower()
        categories = []
        
        # Categorization heuristics
        if any(w in lower for w in ["health", "status", "ready", "running"]):
            categories.append("Cluster Health")
        if "pod" in lower:
            categories.append("Pods")
        if any(w in lower for w in ["deployment", "rollout", "replica"]):
            categories.append("Deployments")
        if "namespace" in lower:
            categories.append("Namespaces")
        if "service" in lower and "pods" not in lower:
            categories.append("Services")
        if "node" in lower:
            categories.append("Nodes")
        if any(w in lower for w in ["metric", "prometheus", "gauge"]):
            categories.append("Metrics")
        if "cpu" in lower:
            categories.append("CPU")
        if "memory" in lower or "oom" in lower:
            categories.append("Memory")
        if any(w in lower for w in ["network", "speed", "throughput"]):
            categories.append("Network")
        if any(w in lower for w in ["storage", "disk", "pv", "pvc"]):
            categories.append("Storage")
        if any(w in lower for w in ["log", "loki", "message", "output"]):
            categories.append("Logs")
        if any(w in lower for w in ["event", "schedule", "scheduling"]):
            categories.append("Events")
        if "crashloop" in lower:
            categories.append("CrashLoopBackOff")
        if "restart" in lower:
            categories.append("Restart Analysis")
        if "gitops" in lower:
            categories.append("GitOps")
        if "argocd" in lower:
            categories.append("ArgoCD")
        if "prometheus" in lower:
            categories.append("Prometheus")
        if "loki" in lower:
            categories.append("Loki")
        if any(w in lower for w in ["performance", "latency", "slow"]):
            categories.append("Performance")
        if "usage" in lower or "load" in lower:
            categories.append("Resource Usage")
        if any(w in lower for w in ["incident", "outage", "down", "error", "fail"]):
            categories.append("Incidents")
        if any(w in lower for w in ["security", "secret", "rbac", "policy"]):
            categories.append("Security")
            
        if not categories:
            categories.append("General Cluster Questions")
            
        return categories

    def build_incident_context(self, pod_name: str, namespace: str) -> Dict[str, Any]:
        """Gathers complete context details for a specific pod incident."""
        context = {
            "target_pod": pod_name,
            "target_namespace": namespace,
            "kubernetes_state": {},
            "prometheus_metrics": {},
            "argocd_status": []
        }

        try:
            pod_details = pod_service.describe_pod(namespace, pod_name)
            context["kubernetes_state"]["pod_details"] = pod_details
        except Exception as e:
            logger.warning(f"ContextBuilder failed to read pod details: {str(e)}")
            context["kubernetes_state"]["pod_details"] = {"name": pod_name, "error": str(e)}

        try:
            logs = pod_service.get_pod_logs(namespace, pod_name, tail_lines=50)
            context["kubernetes_state"]["pod_recent_logs"] = logs
        except Exception as e:
            logger.warning(f"ContextBuilder failed to read logs: {str(e)}")
            context["kubernetes_state"]["pod_recent_logs"] = f"Unavailable: {str(e)}"

        try:
            deployments = self._get_deployments()
            context["kubernetes_state"]["deployments"] = deployments
        except Exception as e:
            logger.warning(f"ContextBuilder failed to list deployments: {str(e)}")

        try:
            nodes = self._get_nodes()
            context["kubernetes_state"]["nodes"] = nodes
        except Exception as e:
            logger.warning(f"ContextBuilder failed to list nodes: {str(e)}")

        try:
            metrics = self._get_metrics()
            context["prometheus_metrics"] = metrics
        except Exception as e:
            logger.warning(f"ContextBuilder failed to get cluster metrics: {str(e)}")

        try:
            apps = self._get_argocd_apps()
            context["argocd_status"] = apps
        except Exception as e:
            logger.warning(f"ContextBuilder failed to list ArgoCD apps: {str(e)}")

        return context

    def build_query_context(self, prompt: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Detects query intent, runs telemetry diagnostics, and selectively queries runtime resources."""
        categories = self.classify_query(prompt)
        context = {
            "query_categories": categories,
            "resolved_service": None,
            "telemetry_diagnostics": []
        }

        # 1. Resolve mentioned or pronouns references
        resolved_service = session_manager.resolve_target_service(session_id, prompt)
        if resolved_service:
            context["resolved_service"] = resolved_service

        # 2. Selective routing queries
        query_k8s = any(c in categories for c in ["Cluster Health", "Pods", "Deployments", "Namespaces", "Services", "Nodes", "Events", "CrashLoopBackOff", "Restart Analysis", "Incidents", "General Cluster Questions"])
        query_metrics = any(c in categories for c in ["Metrics", "CPU", "Memory", "Network", "Storage", "Performance", "Resource Usage", "Incidents", "General Cluster Questions"])
        query_gitops = any(c in categories for c in ["GitOps", "ArgoCD", "Incidents", "General Cluster Questions"])
        query_logs = any(c in categories for c in ["Logs", "Loki", "CrashLoopBackOff", "Restart Analysis", "Incidents"])

        pods = []
        deployments = []
        metrics = {}
        argocd_apps = []

        if query_k8s:
            pods = self._get_pods()
            deployments = self._get_deployments()
            context["kubernetes_summary"] = {
                "pods_count": len(pods),
                "deployments_count": len(deployments),
                "nodes_count": len(self._get_nodes()),
                "namespaces": [ns["name"] for ns in self._get_namespaces()]
            }

        if query_metrics:
            metrics = self._get_metrics()
            context["prometheus_metrics"] = metrics

        if query_gitops:
            argocd_apps = self._get_argocd_apps()
            context["argocd_applications"] = [
                {
                    "name": app.get("name"),
                    "sync_status": app.get("sync_status"),
                    "health_status": app.get("health_status"),
                    "revision": app.get("path")
                }
                for app in argocd_apps
            ]

        # 3. Microservice/Resource Focused Context Correlation
        if resolved_service and query_k8s:
            matching_pods = [p for p in pods if resolved_service in p["name"].lower()]
            if matching_pods:
                target_pod = matching_pods[0]
                focused_details = pod_service.describe_pod(target_pod["namespace"], target_pod["name"])
                
                context["focused_resource"] = {
                    "kind": "Pod",
                    "name": target_pod["name"],
                    "namespace": target_pod["namespace"],
                    "status": target_pod["status"],
                    "restarts": target_pod["restarts"],
                    "creation_timestamp": target_pod["creation_timestamp"],
                    "events": focused_details.get("events", [])
                }
                
                # Retrieve logs if requested or if crashing
                if query_logs or target_pod["restarts"] > 0 or target_pod["status"] != "Running":
                    try:
                        logs = pod_service.get_pod_logs(target_pod["namespace"], target_pod["name"], tail_lines=25)
                        context["focused_resource"]["recent_logs"] = logs
                    except Exception as e:
                        context["focused_resource"]["recent_logs"] = f"Unavailable: {str(e)}"

        # 4. Telemetry Incidents Analyzer Pipeline
        if pods or deployments or metrics or argocd_apps:
            detected = incident_analyzer.analyze_active_incidents(pods, deployments, metrics, argocd_apps)
            context["telemetry_diagnostics"] = detected

        return context

context_builder = ContextBuilder()
