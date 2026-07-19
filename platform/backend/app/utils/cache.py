import time
from typing import Dict, Any, Optional

class TTLCache:
    """Thread-safe simple in-memory key-value cache with Time-To-Live (TTL) expiration."""
    def __init__(self, default_ttl: float = 5.0):
        self.default_ttl = default_ttl
        self.store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self.store:
            return None
        
        entry = self.store[key]
        if time.time() > entry["expires_at"]:
            del self.store[key]
            return None
        
        return entry["value"]

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        duration = ttl if ttl is not None else self.default_ttl
        self.store[key] = {
            "value": value,
            "expires_at": time.time() + duration
        }

    def clear(self) -> None:
        self.store.clear()

ttl_cache = TTLCache()
