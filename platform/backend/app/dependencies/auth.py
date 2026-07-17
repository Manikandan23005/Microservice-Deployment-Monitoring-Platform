# --- RBAC User Authentication Dependencies ---
from fastapi import Header, HTTPException, status, Depends
from app.core.security import decode_access_token, SecurityException

async def get_current_user(authorization: str = Header(..., description="Bearer JWT token header.")) -> str:
    """Extracts credentials context and validates token."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header scheme."
        )
    token = authorization.split(" ")[1]
    try:
        payload = decode_access_token(token)
        return payload
    except SecurityException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

class RoleChecker:
    """Enforces Role-Based Access Control (RBAC) scopes checks on routers."""
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        role = user.get("role", "viewer")
        if role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User lacks permission scopes required to perform this action."
            )
        return user
