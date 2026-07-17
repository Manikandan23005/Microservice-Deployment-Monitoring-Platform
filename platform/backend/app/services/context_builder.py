# --- AI Incident Context Builder ---
from typing import Dict, Any
from app.services.pod_service import pod_service
from app.services.deployment_service import deployment_service
from app.services.node_service import node_service
from app.services.monitoring_service import monitoring_service
from app.services.argocd_service import argocd_service
from app.core.logging import logger

class ContextBuilder:
    """Collects live cluster configurations, events, metrics, logs, and GitOps sync states into a unified dictionary."""
    def build_incident_context(self, pod_name: str, namespace: str) -> Dict[str, Any]:
        context = {
            "target_pod": pod_name,
            "target_namespace": namespace,
            "kubernetes_state": {},
            "prometheus_metrics": {},
            "argocd_status": []
        }

        # 1. Gather Pod specifications, lifecycle events, and states
        try:
            pod_details = pod_service.describe_pod(namespace, pod_name)
            context["kubernetes_state"]["pod_details"] = pod_details
        except Exception as e:
            logger.warning(f"ContextBuilder failed to read pod details: {str(e)}")
            context["kubernetes_state"]["pod_details"] = {"name": pod_name, "error": str(e)}

        # 2. Gather recent logs logs stream
        try:
            logs = pod_service.get_pod_logs(namespace, pod_name, tail_lines=50)
            context["kubernetes_state"]["pod_recent_logs"] = logs
        except Exception as e:
            logger.warning(f"ContextBuilder failed to read logs: {str(e)}")
            context["kubernetes_state"]["pod_recent_logs"] = f"Unavailable: {str(e)}"

        # 3. Gather deployments and nodes statuses
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

        # 4. Gather Prometheus metrics
        try:
            metrics = monitoring_service.get_cluster_metrics()
            context["prometheus_metrics"] = metrics
        except Exception as e:
            logger.warning(f"ContextBuilder failed to get cluster metrics: {str(e)}")

        # 5. Gather ArgoCD applications states
        try:
            apps = argocd_service.list_applications()
            context["argocd_status"] = apps
        except Exception as e:
            logger.warning(f"ContextBuilder failed to list ArgoCD apps: {str(e)}")

        return context

context_builder = ContextBuilder()
