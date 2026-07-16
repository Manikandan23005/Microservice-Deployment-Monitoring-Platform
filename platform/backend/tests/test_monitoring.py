# --- Observability Router Unit Tests ---
from unittest.mock import patch, MagicMock

def test_get_cluster_metrics(client):
    mock_metric = {"data": {"result": [{"value": [123456.7, "75.4"]}]}}
    with patch("app.clients.prometheus.prometheus_client.query", return_value=mock_metric):
        response = client.get("/api/v1/monitoring/metrics")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["cpu_utilization"] == 75.4

def test_get_metrics_range(client):
    mock_range = {"data": {"result": [{"values": [[123456.7, "45.0"], [123457.7, "52.0"]]}]}}
    with patch("app.clients.prometheus.prometheus_client.query_range", return_value=mock_range):
        response = client.get("/api/v1/monitoring/metrics/range?metric_type=cpu")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["values"]) == 2
        assert data["data"]["values"][0][1] == 45.0

def test_get_logs_loki(client):
    mock_loki = {
        "data": {
            "result": [
                {
                    "stream": {"pod": "auth-pod-123"},
                    "values": [["1718561131000000000", "[INFO] Authentication success."]]
                }
            ]
        }
    }
    with patch("app.clients.loki.loki_client.query_range", return_value=mock_loki):
        response = client.get("/api/v1/monitoring/logs?pod=auth-pod-123")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["pod"] == "auth-pod-123"
        assert "Authentication success." in data["data"][0]["message"]
