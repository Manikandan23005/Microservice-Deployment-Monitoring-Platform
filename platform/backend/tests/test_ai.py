# --- AI Router Unit Tests ---
from unittest.mock import patch, MagicMock

def test_ai_chat_completions(client):
    mock_json = '{"summary": "Test Summary", "root_cause": "Test Analysis", "evidence": ["Test Evidence"], "recommendations": ["Test Action"], "affected_resources": ["auth-service"], "severity": "Info", "confidence": 95}'
    with patch("app.clients.llm.llm_client.generate_chat_response", return_value=mock_json):
        response = client.post(
            "/api/v1/ai/chat",
            json={"prompt": "why is the container crashing?", "provider": "groq"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["summary"] == "Test Summary"
        assert data["data"]["root_cause"] == "Test Analysis"
        assert data["data"]["severity"] == "Info"

def test_ai_incident_analysis(client):
    mock_json = '{"summary": "Pod Incident Summary", "root_cause": "Detailed Crash Analysis", "evidence": ["OOMKilled"], "recommendations": ["Increase memory limits"], "affected_resources": ["payment-pod"], "severity": "Critical", "confidence": 100}'
    with patch("app.clients.llm.llm_client.generate_chat_response", return_value=mock_json):
        response = client.post(
            "/api/v1/ai/analyze-incident",
            json={
                "pod_name": "payment-pod",
                "namespace": "dev",
                "logs": "Stripe connect timed out",
                "metrics": {"cpu": 45.0},
                "events": [{"reason": "BackOff"}],
                "provider": "groq"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["summary"] == "Pod Incident Summary"
        assert data["data"]["root_cause"] == "Detailed Crash Analysis"
        assert data["data"]["severity"] == "Critical"

def test_context_builder():
    from app.services.context_builder import context_builder
    from app.utils.cache import ttl_cache
    ttl_cache.clear()
    # Mock services outputs
    with patch("app.services.pod_service.pod_service.describe_pod", return_value={"name": "test-pod", "restarts": 0}), \
         patch("app.services.pod_service.pod_service.get_pod_logs", return_value="standard logs output"), \
         patch("app.services.deployment_service.deployment_service.list_deployments", return_value=[]), \
         patch("app.services.node_service.node_service.list_nodes", return_value=[]), \
         patch("app.services.monitoring_service.monitoring_service.get_cluster_metrics", return_value={"cpu": 10.0}), \
         patch("app.services.argocd_service.argocd_service.list_applications", return_value=[]):
         
        ctx = context_builder.build_incident_context("test-pod", "default")
        assert ctx["target_pod"] == "test-pod"
        assert ctx["kubernetes_state"]["pod_details"]["name"] == "test-pod"
        assert ctx["kubernetes_state"]["pod_recent_logs"] == "standard logs output"
        assert ctx["prometheus_metrics"]["cpu"] == 10.0

