# --- AI Router Unit Tests ---
from unittest.mock import patch

def test_ai_chat_completions(client):
    with patch("app.clients.ai.ai_client.generate_chat_response", return_value="mock completions response"):
        response = client.post(
            "/api/v1/ai/chat",
            json={"prompt": "why is the container crashing?", "provider": "ollama"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["response"] == "mock completions response"

def test_ai_incident_analysis(client):
    with patch("app.clients.ai.ai_client.generate_chat_response", return_value="mock diagnostics report"):
        response = client.post(
            "/api/v1/ai/analyze-incident",
            json={
                "pod_name": "payment-pod",
                "namespace": "dev",
                "logs": "Stripe connect timed out",
                "metrics": {"cpu": 45.0},
                "events": [{"reason": "BackOff"}],
                "provider": "openai"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "mock diagnostics report" in data["data"]["analysis"]
