# --- Production Hardening Unit Tests ---
import datetime
import pytest
from fastapi import HTTPException
from app.core.security import create_access_token, decode_access_token, SecurityException
from app.dependencies.auth import RoleChecker

def test_jwt_token_generation_and_decoding():
    payload = {"sub": "satoru", "role": "admin"}
    token = create_access_token(payload)
    assert token.startswith("nexus-jwt-token-")
    
    decoded = decode_access_token(token)
    assert decoded["sub"] == "satoru"
    assert decoded["role"] == "admin"

def test_jwt_expiration():
    payload = {"sub": "satoru", "role": "admin"}
    # Generate token already expired
    token = create_access_token(payload, expires_delta=datetime.timedelta(seconds=-10))
    with pytest.raises(SecurityException):
        decode_access_token(token)

def test_rbac_check_allowed():
    checker = RoleChecker(allowed_roles=["admin"])
    # Should not raise exception
    res = checker(user={"sub": "satoru", "role": "admin"})
    assert res["sub"] == "satoru"

def test_rbac_check_denied():
    checker = RoleChecker(allowed_roles=["admin"])
    with pytest.raises(HTTPException) as excinfo:
        checker(user={"sub": "developer", "role": "developer"})
    assert excinfo.value.status_code == 403
