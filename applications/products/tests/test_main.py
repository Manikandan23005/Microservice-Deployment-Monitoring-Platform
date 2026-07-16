from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "products"}

def test_get_nonexistent_product():
    response = client.get("/products/999")
    assert response.status_code == 404
