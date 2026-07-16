# --- Pytest Configuration Fixtures ---
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    """Provides a TestClient initialized with the platform app instance."""
    with TestClient(app) as test_client:
        yield test_client
