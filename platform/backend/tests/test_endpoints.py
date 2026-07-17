# --- Endpoint Validation Assertions ---

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "X-Request-ID" in response.headers
    assert "X-Process-Time" in response.headers

def test_health_liveness_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["data"]["status"] == "healthy"
    assert json_data["data"]["ready"] is True

def test_health_readiness_endpoint(client):
    from unittest.mock import patch
    with patch("app.clients.kubernetes.k8s_client.list_namespaces", return_value=[]), \
         patch("app.core.cache.cache_client.ping", return_value=True):
        response = client.get("/ready")
        assert response.status_code == 200
        json_data = response.json()
        assert json_data["success"] is True
        assert json_data["data"]["status"] == "healthy"
        assert json_data["data"]["ready"] is True

def test_version_endpoint(client):
    response = client.get("/version")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["data"]["version"] == "0.1.0"
