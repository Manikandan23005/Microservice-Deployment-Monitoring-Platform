# --- AI Incident Context Builder ---
from typing import Dict, Any, List
from app.services.pod_service import pod_service
from app.services.deployment_service import deployment_service
from app.services.node_service import node_service
from app.services.monitoring_service import monitoring_service
from app.services.argocd_service import argocd_service
from app.core.logging import logger

class ContextBuilder:
    """Collects live cluster configurations, events, metrics, logs, and GitOps sync states into a unified dictionary."""
    
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
            deployments = deployment_service.list_deployments(namespace)
            context["kubernetes_state"]["deployments"] = deployments
        except Exception as e:
            logger.warning(f"ContextBuilder failed to list deployments: {str(e)}")

        try:
            nodes = node_service.list_nodes()
            context["kubernetes_state"]["nodes"] = nodes
        except Exception as e:
            logger.warning(f"ContextBuilder failed to list nodes: {str(e)}")

        try:
            metrics = monitoring_service.get_cluster_metrics()
            context["prometheus_metrics"] = metrics
        except Exception as e:
            logger.warning(f"ContextBuilder failed to get cluster metrics: {str(e)}")

        try:
            apps = argocd_service.list_applications()
            context["argocd_status"] = apps
        except Exception as e:
            logger.warning(f"ContextBuilder failed to list ArgoCD apps: {str(e)}")

        return context

    def build_query_context(self, prompt: str) -> Dict[str, Any]:
        """Detects query intent and gathers only relevant live data from infrastructure."""
        lower = prompt.lower()
        context = {}
        
        # Determine intent routing
        is_metrics = any(w in lower for w in ["cpu", "memory", "network", "throughput", "utilization", "metrics"])
        is_pod_status = any(w in lower for w in ["pod", "container", "restart", "crash", "backoff", "unhealthy", "failing"])
        is_gitops = any(w in lower for w in ["argocd", "gitops", "sync", "outofsync", "health", "app"])
        is_logs = any(w in lower for w in ["log", "loki", "message", "stream"])

        # 1. Fetch relevant metrics if query is about CPU/Memory
        if is_metrics:
            try:
                context["prometheus_metrics"] = monitoring_service.get_cluster_metrics()
            except Exception as e:
                logger.warning(f"Failed to fetch Prometheus context: {str(e)}")
            try:
                context["nodes"] = node_service.list_nodes()
            except Exception as e:
                logger.warning(f"Failed to fetch Nodes context: {str(e)}")

        # 2. Fetch pods and nodes status if query is about workloads state/crash loops
        if is_pod_status:
            try:
                # Retrieve active pods
                pods = pod_service.list_pods()
                context["pods"] = pods
                # If specifically troubleshooting a crashing pod, grab its events/logs
                for pod in pods:
                    if pod["status"] != "Running" or pod["restarts"] > 0:
                        context["crashing_pod_details"] = pod_service.describe_pod(pod["namespace"], pod["name"])
                        break
            except Exception as e:
                logger.warning(f"Failed to fetch Pods/Events context: {str(e)}")

        # 3. Fetch ArgoCD states if GitOps query
        if is_gitops:
            try:
                context["argocd_applications"] = argocd_service.list_applications()
            except Exception as e:
                logger.warning(f"Failed to fetch ArgoCD context: {str(e)}")

        # 4. Fetch Loki log dumps if log query
        if is_logs:
            try:
                pods = pod_service.list_pods()
                target_pod = None
                for svc in ["auth", "users", "products", "orders", "payment", "notification", "gateway", "frontend"]:
                    if svc in lower:
                        for p in pods:
                            if svc in p["name"].lower() and p["namespace"] == "devops-nexus-prod":
                                target_pod = p
                                break
                    if target_pod:
                        break
                if not target_pod and pods:
                    # Filter for prod namespace pods if possible
                    prod_pods = [p for p in pods if p["namespace"] == "devops-nexus-prod"]
                    target_pod = prod_pods[0] if prod_pods else pods[0]
                    
                if target_pod:
                    context["target_logs"] = {
                        "pod": target_pod["name"],
                        "namespace": target_pod["namespace"],
                        "logs": pod_service.get_pod_logs(target_pod["namespace"], target_pod["name"], tail_lines=20)
                    }
            except Exception as e:
                logger.warning(f"Failed to fetch Logs context: {str(e)}")

        # 5. General fallback: Fetch general summary (Nodes, Deployments counts, Namespaces list)
        if not context:
            try:
                context["nodes_count"] = len(node_service.list_nodes())
            except Exception:
                context["nodes_count"] = 0
            try:
                context["deployments_count"] = len(deployment_service.list_deployments())
            except Exception:
                context["deployments_count"] = 0
            try:
                context["pods_count"] = len(pod_service.list_pods())
            except Exception:
                context["pods_count"] = 0

        return context

context_builder = ContextBuilder()
