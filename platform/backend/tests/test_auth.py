# --- Authentication and RBAC Test Cases ---
from unittest.mock import patch

def test_auth_login_success(client):
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "token" in json_data["data"]
    assert json_data["data"]["username"] == "admin"
    assert json_data["data"]["role"] == "Administrator"
    assert "session_token" in response.cookies

def test_auth_login_invalid_credentials(client):
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401
    json_data = response.json()
    assert json_data["success"] is False

def test_auth_logout(client):
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    # Verify cookie deletion
    assert response.cookies.get("session_token") is None
