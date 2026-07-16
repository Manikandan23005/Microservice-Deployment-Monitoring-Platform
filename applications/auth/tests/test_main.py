from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "auth"}

def test_invalid_login():
    response = client.post("/login", json={"username": "wrong", "password": "user"})
    assert response.status_code == 401
