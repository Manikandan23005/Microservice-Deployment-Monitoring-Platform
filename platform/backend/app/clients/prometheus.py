# --- Prometheus client Wrapper ---
import httpx
from typing import Dict, Any, Optional
from app.core.settings import settings
from shared.exceptions import TelemetryFetchException
from app.core.logging import logger
from app.services.port_supervisor import port_supervisor

class PrometheusClient:
    """Sends queries to Prometheus HTTP API endpoints with automatic port supervisor self-repair."""
    def __init__(self):
        self.base_url = settings.PROMETHEUS_URL or "http://localhost:9090"

    def query(self, query_string: str) -> Dict[str, Any]:
        """Runs instantaneous vector queries at a single point in time."""
        url = f"{self.base_url}/api/v1/query"
        params = {"query": query_string}
        try:
            with httpx.Client(timeout=1.5) as client:
                response = client.get(url, params=params)
                if response.status_code != 200:
                    raise TelemetryFetchException(f"Prometheus query returned status {response.status_code}: {response.text}")
                return response.json()
        except Exception:
            # Auto-repair port-forward if connection was refused
            port_supervisor.ensure_telemetry_ports()
            try:
                with httpx.Client(timeout=1.5) as client:
                    response = client.get(url, params=params)
                    if response.status_code == 200:
                        return response.json()
            except Exception as e:
                logger.error(f"Prometheus query failed after auto-repair: {str(e)}")
            raise TelemetryFetchException("Prometheus server unavailable.")

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
            with httpx.Client(timeout=1.5) as client:
                response = client.get(url, params=params)
                if response.status_code != 200:
                    raise TelemetryFetchException(f"Prometheus query_range returned status {response.status_code}: {response.text}")
                return response.json()
        except Exception:
            # Auto-repair port-forward if connection was refused
            port_supervisor.ensure_telemetry_ports()
            try:
                with httpx.Client(timeout=1.5) as client:
                    response = client.get(url, params=params)
                    if response.status_code == 200:
                        return response.json()
            except Exception as e:
                logger.error(f"Prometheus range query failed after auto-repair: {str(e)}")
            raise TelemetryFetchException("Prometheus server unavailable.")

prometheus_client = PrometheusClient()
