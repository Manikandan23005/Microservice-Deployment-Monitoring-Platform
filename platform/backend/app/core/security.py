# --- JWT Security and Token Operations ---
import datetime
from typing import Dict, Any, Optional
from app.core.settings import settings
from shared.exceptions import DevOpsNexusException

# Minimal standalone JWT logic for demonstration (using standard headers parameters)
SECRET_KEY = "devops-nexus-super-secret-key-placeholder"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class SecurityException(DevOpsNexusException):
    """Raised when token check fails."""
    pass

def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generates a mock JWT payload signature string containing user context data."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp())})
    # Since PyJWT is not loaded, we generate an authenticated mock trace token for demonstration
    # (In real productions, this would run jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM))
    return f"nexus-jwt-token-{to_encode['sub']}-{to_encode.get('role', 'viewer')}-{to_encode['exp']}"

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a token string context."""
    if not token.startswith("nexus-jwt-token-"):
        raise SecurityException("Invalid signature or token header format.")
    
    try:
        parts = token.split("-")
        username = parts[3]
        role = parts[4]
        exp = int(parts[5])
        
        # Check expiration date
        now = datetime.datetime.now(datetime.timezone.utc).timestamp()
        if now > exp:
            raise SecurityException("Signature has expired.")
            
        return {"sub": username, "role": role}
    except Exception:
        raise SecurityException("Failed to decode token signature details.")
