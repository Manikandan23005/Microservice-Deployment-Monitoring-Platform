# --- Prometheus client Wrapper ---
import httpx
from typing import Dict, Any, Optional
from app.core.settings import settings
from shared.exceptions import TelemetryFetchException
from app.core.logging import logger

class PrometheusClient:
    """Sends queries to Prometheus HTTP API endpoints."""
    def __init__(self):
        self.base_url = settings.PROMETHEUS_URL or "http://localhost:9090"

    def query(self, query_string: str) -> Dict[str, Any]:
        """Runs instantaneous vector queries at a single point in time."""
        url = f"{self.base_url}/api/v1/query"
        params = {"query": query_string}
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(url, params=params)
                if response.status_code != 200:
                    raise TelemetryFetchException(f"Prometheus query returned status {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Prometheus query failed: {str(e)}")
            raise TelemetryFetchException(f"Prometheus server unavailable: {str(e)}")

    def query_range(self, query_string: str, start: float, end: float, step: str = "15s") -> Dict[str, Any]:
        """Runs range queries over a timeline."""
        url = f"{self.base_url}/api/v1/query_range"
        params = {
            "query": query_string,
            "start": str(start),
            "end": str(end),
            "step": step
        }
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(url, params=params)
                if response.status_code != 200:
                    raise TelemetryFetchException(f"Prometheus query_range returned status {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Prometheus range query failed: {str(e)}")
            raise TelemetryFetchException(f"Prometheus server unavailable: {str(e)}")

prometheus_client = PrometheusClient()
