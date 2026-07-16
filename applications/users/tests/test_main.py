from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "users"}

def test_get_nonexistent_user():
    response = client.get("/users/unknown")
    assert response.status_code == 404
