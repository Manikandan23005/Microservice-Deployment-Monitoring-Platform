from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "notification"}

def test_invalid_notification():
    payload = {"recipient": "", "subject": "hi", "message": "hello", "channel": "email"}
    response = client.post("/send", json=payload)
    assert response.status_code == 400
