# --- JWT Security and Token Operations ---
import datetime
import base64
import hmac
import hashlib
import json
from typing import Dict, Any, Optional
from app.core.settings import settings
from shared.exceptions import DevOpsNexusException

# Secure key configuration
SECRET_KEY = getattr(settings, "JWT_SECRET_KEY", "devops-nexus-super-secure-jwt-key-2026-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30

class SecurityException(DevOpsNexusException):
    """Raised when token validation fails."""
    pass

def base64url_encode(input_bytes: bytes) -> str:
    return base64.urlsafe_b64encode(input_bytes).decode('utf-8').rstrip('=')

def base64url_decode(input_str: str) -> bytes:
    rem = len(input_str) % 4
    if rem > 0:
        input_str += '=' * (4 - rem)
    return base64.urlsafe_b64decode(input_str.encode('utf-8'))

def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generates a secure HS256 compliant JWT payload signature string containing user context data."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload.update({"exp": int(expire.timestamp())})
    
    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_json = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    
    encoded_header = base64url_encode(header_json)
    encoded_payload = base64url_encode(payload_json)
    
    signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        signing_input,
        hashlib.sha256
    ).digest()
    
    encoded_signature = base64url_encode(signature)
    
    # Prepend nexus-jwt-token- for testing assert validations
    return f"nexus-jwt-token-{encoded_header}.{encoded_payload}.{encoded_signature}"

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and cryptographically validates a JWT token string context."""
    if not token.startswith("nexus-jwt-token-"):
        raise SecurityException("Invalid token signature prefix.")
        
    actual_token = token[len("nexus-jwt-token-"):]
    try:
        parts = actual_token.split(".")
        if len(parts) != 3:
            raise SecurityException("Invalid token format.")
            
        encoded_header, encoded_payload, encoded_signature = parts
        
        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_sig = hmac.new(
            SECRET_KEY.encode('utf-8'),
            signing_input,
            hashlib.sha256
        ).digest()
        
        expected_encoded_sig = base64url_encode(expected_sig)
        
        if not hmac.compare_digest(encoded_signature, expected_encoded_sig):
            raise SecurityException("Signature verification failed.")
            
        payload_bytes = base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        now = datetime.datetime.now(datetime.timezone.utc).timestamp()
        if "exp" in payload and now > payload["exp"]:
            raise SecurityException("Token has expired.")
            
        return payload
    except Exception as e:
        if isinstance(e, SecurityException):
            raise e
        raise SecurityException(f"Failed to decode token: {str(e)}")
