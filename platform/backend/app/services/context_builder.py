# --- AI Incident Context Builder ---
from typing import Dict, Any, List, Optional
from app.services.pod_service import pod_service
from app.services.deployment_service import deployment_service
from app.services.node_service import node_service
from app.services.namespace_service import namespace_service
from app.services.monitoring_service import monitoring_service
from app.services.argocd_service import argocd_service
from app.services.incident_analyzer import incident_analyzer
from app.services.scope_engine import scope_engine
from shared.scope import OperationsScope
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

    def _get_metrics(Self) -> Dict[str, Any]:
        cached = ttl_cache.get("metrics")
        if cached is not None:
            return cached
        try:
            val = monitoring_service.get_cluster_metrics()
            ttl_cache.set("metrics", val, ttl=5.0)
            return val
        except Exception as e:
            logger.warning(f"Failed to get metrics: {str(e)}")
            return {"cpu_utilization": 0.0, "memory_utilization": 0.0, "network_throughput_bytes": 0.0}

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
        
        if any(w in lower for w in ["health", "status", "ready", "running"]):
            categories.append("Cluster Health")
        if "pod" in lower:
            categories.append("Pods")
        if any(w in lower for w in ["deployment", "rollout", "replica"]):
            categories.append("Deployments")
        if "namespace" in lower:
            categories.append("Namespaces")
        if "node" in lower:
            categories.append("Nodes")
        if any(w in lower for w in ["metric", "prometheus", "gauge"]):
            categories.append("Metrics")
        if "cpu" in lower:
            categories.append("CPU")
        if "memory" in lower or "oom" in lower:
            categories.append("Memory")
        if any(w in lower for w in ["log", "loki", "message"]):
            categories.append("Logs")
        if any(w in lower for w in ["event", "schedule"]):
            categories.append("Events")
        if "restart" in lower:
            categories.append("Restart Analysis")
        if any(w in lower for w in ["gitops", "argocd"]):
            categories.append("GitOps")
        if any(w in lower for w in ["incident", "outage", "error", "fail"]):
            categories.append("Incidents")
            
        return categories if categories else ["General Operations"]

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

    def build_query_context(self, prompt: str, session_id: Optional[str] = None, scope: Optional[OperationsScope] = None) -> Dict[str, Any]:
        """Detects query intent, applies inherited operations scope, and selectively queries runtime resources."""
        current_scope = scope or scope_engine.resolve_scope()
        categories = self.classify_query(prompt)
        
        context = {
            "operations_scope": {
                "mode": current_scope.mode.value,
                "namespace": current_scope.namespace,
                "application": current_scope.application,
                "domain": current_scope.domain.value if current_scope.domain else None
            },
            "query_categories": categories,
            "resolved_service": None,
            "telemetry_diagnostics": []
        }

        # 1. Resolve mentioned or pronouns references
        resolved_service = session_manager.resolve_target_service(session_id, prompt)
        if resolved_service:
            context["resolved_service"] = resolved_service

        # 2. Selective scope-filtered queries
        raw_pods = self._get_pods()
        pods = scope_engine.filter_pods(raw_pods, current_scope)
        context["pods"] = pods

        raw_deps = self._get_deployments()
        deps = scope_engine.filter_deployments(raw_deps, current_scope)
        context["deployments"] = deps

        context["metrics"] = self._get_metrics()

        raw_apps = self._get_argocd_apps()
        apps = scope_engine.filter_argocd_apps(raw_apps, current_scope)
        context["argocd_status"] = apps

        raw_ns = self._get_namespaces()
        context["namespaces"] = scope_engine.filter_namespaces(raw_ns, current_scope)

        # 3. Incident heuristics analyzer
        diagnostics = incident_analyzer.analyze_active_incidents(pods, deps, context["metrics"], apps)
        context["telemetry_diagnostics"] = diagnostics

        return context

context_builder = ContextBuilder()
