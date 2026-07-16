# --- Backend Platform Settings Loader ---
from shared.config import settings

# Export the configuration settings singleton for use in FastAPI
__all__ = ["settings"]
