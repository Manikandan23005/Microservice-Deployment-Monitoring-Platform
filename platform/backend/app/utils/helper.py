# --- Shared Utility Helper Methods ---
from datetime import datetime, timezone

def get_current_timestamp() -> str:
    """Returns the current UTC date string formatted in ISO 8601."""
    return datetime.now(timezone.utc).isoformat()
