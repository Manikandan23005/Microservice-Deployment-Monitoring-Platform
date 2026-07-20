# --- Kubernetes Client Wrapper ---
import datetime
from typing import List, Dict, Any, Optional
from kubernetes import client, config
from shared.exceptions import KubernetesClientException
from app.core.logging import logger

class KubernetesClient:
    """Manages low-level connections and queries to the active Kubernetes API cluster."""
    def __init__(self):
        self._initialized = False
        self.v1 = None
        self.apps_v1 = None
        self.networking_v1 = None
        self._init_client()

    def _init_client(self):
        try:
            # Try to load configuration when running inside pod container
            config.load_incluster_config()
            logger.info("Loaded in-cluster Kubernetes configuration.")
            self._initialized = True
        except Exception:
            try:
                # Fall back to local kubeconfig context
                config.load_kube_config()
                logger.info("Loaded external context from local Kubeconfig file.")
                self._initialized = True
            except Exception as e:
                logger.warning(
                    f"Unable to initialize Kubernetes API client connection: {str(e)}. "
                    "Operating in offline/fallback status."
                )
                self._initialized = False

        if self._initialized:
            self.v1 = client.CoreV1Api()
            self.apps_v1 = client.AppsV1Api()
            self.networking_v1 = client.NetworkingV1Api()

    def _check_connection(self):
        if not self._initialized or not self.v1:
            raise KubernetesClientException("Kubernetes client is not initialized or has no active cluster connection.")

    # CoreV1 Mappings
    def list_namespaces(self) -> List[Any]:
        self._check_connection()
        try:
            return self.v1.list_namespace().items
        except Exception as e:
            raise KubernetesClientException(f"Failed to list namespaces: {str(e)}")

    def list_nodes(self) -> List[Any]:
        self._check_connection()
        try:
            return self.v1.list_node().items
        except Exception as e:
            raise KubernetesClientException(f"Failed to list worker nodes: {str(e)}")

    def list_pods(self, namespace: Optional[str] = None) -> List[Any]:
        self._check_connection()
        try:
            if namespace:
                return self.v1.list_namespaced_pod(namespace).items
            return self.v1.list_pod_for_all_namespaces().items
        except Exception as e:
            raise KubernetesClientException(f"Failed to list pods: {str(e)}")

    def get_pod(self, namespace: str, name: str) -> Any:
        self._check_connection()
        try:
            return self.v1.read_namespaced_pod(name, namespace)
        except Exception as e:
            raise KubernetesClientException(f"Failed to read pod {name} in {namespace}: {str(e)}")

    def get_pod_events(self, namespace: str, pod_name: str) -> List[Any]:
        self._check_connection()
        try:
            field_selector = f"involvedObject.name={pod_name},involvedObject.kind=Pod"
            return self.v1.list_namespaced_event(namespace, field_selector=field_selector).items
        except Exception as e:
            raise KubernetesClientException(f"Failed to fetch events for pod {pod_name}: {str(e)}")

    def get_pod_logs(self, namespace: str, name: str, tail_lines: int = 100) -> str:
        self._check_connection()
        try:
            return self.v1.read_namespaced_pod_log(name, namespace, tail_lines=tail_lines)
        except Exception as e:
            raise KubernetesClientException(f"Failed to fetch logs for pod {name}: {str(e)}")

    def list_services(self, namespace: Optional[str] = None) -> List[Any]:
        self._check_connection()
        try:
            if namespace:
                return self.v1.list_namespaced_service(namespace).items
            return self.v1.list_service_for_all_namespaces().items
        except Exception as e:
            raise KubernetesClientException(f"Failed to list services: {str(e)}")

    # AppsV1 Mappings
    def list_deployments(self, namespace: Optional[str] = None) -> List[Any]:
        self._check_connection()
        try:
            if namespace:
                return self.apps_v1.list_namespaced_deployment(namespace).items
            return self.apps_v1.list_deployment_for_all_namespaces().items
        except Exception as e:
            raise KubernetesClientException(f"Failed to list deployments: {str(e)}")

    def get_deployment(self, namespace: str, name: str) -> Any:
        self._check_connection()
        try:
            return self.apps_v1.read_namespaced_deployment(name, namespace)
        except Exception as e:
            raise KubernetesClientException(f"Failed to read deployment {name} in {namespace}: {str(e)}")

    def scale_deployment(self, namespace: str, name: str, replicas: int) -> Any:
        self._check_connection()
        try:
            body = {"spec": {"replicas": replicas}}
            return self.apps_v1.patch_namespaced_deployment_scale(name, namespace, body)
        except Exception as e:
            raise KubernetesClientException(f"Failed to scale deployment {name} to {replicas}: {str(e)}")

    def restart_deployment(self, namespace: str, name: str) -> Any:
        self._check_connection()
        try:
            # Trigger standard Kubernetes rollout restart by setting the template annotation
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            body = {
                "spec": {
                    "template": {
                        "metadata": {
                            "annotations": {
                                "kubectl.kubernetes.io/restartedAt": now
                            }
                        }
                    }
                }
            }
            return self.apps_v1.patch_namespaced_deployment(name, namespace, body)
        except Exception as e:
            raise KubernetesClientException(f"Failed to restart rollout for deployment {name}: {str(e)}")

    def delete_pod(self, namespace: str, name: str) -> Any:
        self._check_connection()
        try:
            return self.v1.delete_namespaced_pod(name, namespace)
        except Exception as e:
            raise KubernetesClientException(f"Failed to delete pod {name}: {str(e)}")

    def delete_deployment(self, namespace: str, name: str) -> Any:
        self._check_connection()
        try:
            return self.apps_v1.delete_namespaced_deployment(name, namespace)
        except Exception as e:
            raise KubernetesClientException(f"Failed to delete deployment {name}: {str(e)}")

    def create_namespace(self, name: str) -> Any:
        self._check_connection()
        try:
            body = client.V1Namespace(metadata=client.V1ObjectMeta(name=name))
            return self.v1.create_namespace(body)
        except Exception as e:
            raise KubernetesClientException(f"Failed to create namespace {name}: {str(e)}")

    def delete_namespace(self, name: str) -> Any:
        self._check_connection()
        try:
            return self.v1.delete_namespace(name)
        except Exception as e:
            raise KubernetesClientException(f"Failed to delete namespace {name}: {str(e)}")

    # NetworkingV1 Mappings
    def list_ingresses(self, namespace: Optional[str] = None) -> List[Any]:
        self._check_connection()
        try:
            if namespace:
                return self.networking_v1.list_namespaced_ingress(namespace).items
            return self.networking_v1.list_ingress_for_all_namespaces().items
        except Exception as e:
            raise KubernetesClientException(f"Failed to list ingresses: {str(e)}")

# Export single global client instance
k8s_client = KubernetesClient()
