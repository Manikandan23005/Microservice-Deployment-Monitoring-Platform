# --- Kubernetes Router Unit Tests ---
from unittest.mock import patch, MagicMock

# Mock Objects setup
class MockObject:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

def test_list_namespaces(client):
    mock_ns = [
        MockObject(
            metadata=MockObject(name="devops-nexus"),
            status=MockObject(phase="Active")
        )
    ]
    # Set creation timestamp attribute dynamically to bypass mock errors
    mock_ns[0].metadata.creation_timestamp = MagicMock()
    mock_ns[0].metadata.creation_timestamp.isoformat.return_value = "2026-07-16T18:00:00Z"

    with patch("app.clients.kubernetes.k8s_client.list_namespaces", return_value=mock_ns):
        response = client.get("/api/v1/k8s/namespaces")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["name"] == "devops-nexus"

def test_list_nodes(client):
    mock_node = [
        MockObject(
            metadata=MockObject(name="node-worker-1", labels={"node-role.kubernetes.io/control-plane": "true"}),
            status=MockObject(
                conditions=[MockObject(type="Ready", status="True")],
                addresses=[MockObject(type="InternalIP", address="192.168.1.100")],
                capacity={"cpu": "4", "memory": "8Gi"}
            )
        )
    ]
    with patch("app.clients.kubernetes.k8s_client.list_nodes", return_value=mock_node):
        response = client.get("/api/v1/k8s/nodes")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"][0]["name"] == "node-worker-1"
        assert data["data"][0]["role"] == "control-plane"

def test_list_pods(client):
    mock_pod = [
        MockObject(
            metadata=MockObject(name="auth-pod-123", namespace="devops-nexus"),
            status=MockObject(phase="Running", pod_ip="10.244.0.5", container_statuses=[MockObject(restart_count=2)]),
            spec=MockObject(node_name="node-worker-1")
        )
    ]
    mock_pod[0].metadata.creation_timestamp = MagicMock()
    mock_pod[0].metadata.creation_timestamp.isoformat.return_value = "2026-07-16T18:00:00Z"

    with patch("app.clients.kubernetes.k8s_client.list_pods", return_value=mock_pod):
        response = client.get("/api/v1/k8s/pods")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"][0]["name"] == "auth-pod-123"
        assert data["data"][0]["restarts"] == 2

def test_get_pod_logs(client):
    with patch("app.clients.kubernetes.k8s_client.get_pod_logs", return_value="mock pod log logs"):
        response = client.get("/api/v1/k8s/pods/devops-nexus/auth-pod-123/logs")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "logs" in data["data"]
        assert data["data"]["logs"] == "mock pod log logs"

def test_scale_deployment(client):
    with patch("app.clients.kubernetes.k8s_client.scale_deployment", return_value=MagicMock()):
        response = client.post(
            "/api/v1/k8s/deployments/devops-nexus/auth-service/scale",
            json={"replicas": 3}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "scaled" in data["data"]["message"]

def test_restart_deployment(client):
    with patch("app.clients.kubernetes.k8s_client.restart_deployment", return_value=MagicMock()):
        response = client.post("/api/v1/k8s/deployments/devops-nexus/auth-service/restart")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "restart triggered" in data["data"]["message"]

def test_list_ingresses(client):
    mock_ing = [
        MockObject(
            metadata=MockObject(name="devops-nexus-ingress", namespace="devops-nexus"),
            spec=MockObject(rules=[MockObject(host="nexus.local")])
        )
    ]
    mock_ing[0].metadata.creation_timestamp = MagicMock()
    mock_ing[0].metadata.creation_timestamp.isoformat.return_value = "2026-07-16T18:00:00Z"

    with patch("app.clients.kubernetes.k8s_client.list_ingresses", return_value=mock_ing):
        response = client.get("/api/v1/k8s/ingresses")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"][0]["name"] == "devops-nexus-ingress"
        assert "nexus.local" in data["data"][0]["hosts"]
