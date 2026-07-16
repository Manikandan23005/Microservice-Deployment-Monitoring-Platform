from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "payment"}

def test_invalid_payment():
    payload = {"order_id": 5001, "amount": -10.0, "currency": "USD"}
    response = client.post("/charge", json=payload)
    assert response.status_code == 400
