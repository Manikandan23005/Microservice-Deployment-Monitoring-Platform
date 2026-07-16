from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "orders"}

def test_create_order():
    payload = {"user_id": 12, "items": [{"product_id": 101, "quantity": 2}]}
    response = client.post("/orders", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "pending_payment"
