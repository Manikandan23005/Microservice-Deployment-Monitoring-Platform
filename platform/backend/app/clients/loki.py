# --- Loki Client Wrapper ---
import httpx
from typing import Dict, Any, Optional
from app.core.settings import settings
from shared.exceptions import TelemetryFetchException
from app.core.logging import logger

class LokiClient:
    """Sends queries to Loki LogQL HTTP API endpoints."""
    def __init__(self):
        self.base_url = settings.LOKI_URL or "http://localhost:3100"

    def query_range(self, query_string: str, limit: int = 100, start: Optional[float] = None, end: Optional[float] = None) -> Dict[str, Any]:
        """Queries log streams over a range with LogQL parameters."""
        url = f"{self.base_url}/loki/api/v1/query_range"
        params = {
            "query": query_string,
            "limit": str(limit)
        }
        if start:
            params["start"] = str(int(start * 1e9))  # Loki uses nanoseconds
        if end:
            params["end"] = str(int(end * 1e9))

        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(url, params=params)
                if response.status_code != 200:
                    raise TelemetryFetchException(f"Loki query_range returned status {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Loki range query failed: {str(e)}")
            raise TelemetryFetchException(f"Loki server unavailable: {str(e)}")

loki_client = LokiClient()
