# --- Routers Package ---
from app.routers.root import router as root_router
from app.routers.health import router as health_router
from app.routers.version import router as version_router
from app.routers.auth import router as auth_router

__all__ = [
    "root_router",
    "health_router",
    "version_router",
    "auth_router"
]
