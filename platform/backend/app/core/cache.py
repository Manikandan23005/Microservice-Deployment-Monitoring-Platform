# --- Redis Platform Cache Wrapper ---
import logging
from typing import Optional, Any
from app.core.settings import settings

logger = logging.getLogger("devops-nexus-cache")

class PlatformCache:
    """Manages Redis metrics and logs query cache with local fallback."""
    def __init__(self):
        self.client = None
        self._local_cache = {}
        self._init_cache()

    def _init_cache(self):
        try:
            # We don't import redis directly to prevent import fails if not loaded
            import redis
            url = settings.REDIS_URL or "redis://localhost:6379/0"
            self.client = redis.from_url(url, decode_responses=True)
            self.client.ping()
            logger.info("Redis cache backend connected successfully.")
        except Exception as e:
            logger.warning(
                f"Redis client connection failed: {str(e)}. "
                "Operating with temporary local in-memory caching backend."
            )
            self.client = None

    def get(self, key: str) -> Optional[str]:
        val = None
        if self.client:
            try:
                val = self.client.get(key)
            except Exception:
                pass
        else:
            import time
            if key in self._local_cache:
                entry = self._local_cache[key]
                if time.time() > entry["expires_at"]:
                    del self._local_cache[key]
                else:
                    val = entry["value"]
        
        try:
            from app.utils.observability import observability_metrics
            observability_metrics.record_cache(val is not None)
        except Exception:
            pass
            
        return val

    def set(self, key: str, value: str, ex_seconds: int = 300) -> bool:
        if self.client:
            try:
                self.client.set(key, value, ex=ex_seconds)
                return True
            except Exception:
                pass
        
        import time
        self._local_cache[key] = {
            "value": value,
            "expires_at": time.time() + ex_seconds
        }
        return True

    def ping(self) -> bool:
        if self.client:
            try:
                return self.client.ping()
            except Exception:
                pass
        return False

# Export cache singleton
cache_client = PlatformCache()
