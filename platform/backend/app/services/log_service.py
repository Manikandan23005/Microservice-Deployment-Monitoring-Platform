# --- Loki logs Aggregator Service ---
import time
from typing import List, Dict, Any, Optional
from app.clients.loki import loki_client
from shared.exceptions import TelemetryFetchException
from app.core.logging import logger

class LogService:
    def get_logs(self, pod_name: str, search: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Queries Loki log streams for pods, with mock fallbacks."""
        # Simple LogQL selector matching pod labels
        logql = f'{{pod="{pod_name}"}}'
        if search:
            logql += f' |= "{search}"'

        try:
            res = loki_client.query_range(logql, limit=limit)
            result = []
            for stream in res.get("data", {}).get("result", []):
                pod = stream.get("stream", {}).get("pod", pod_name)
                for val in stream.get("values", []):
                    result.append({
                        "timestamp": self._nano_to_iso(val[0]),
                        "pod": pod,
                        "message": val[1]
                    })
            return result
        except TelemetryFetchException:
            logger.info(f"Loki connection failed. Generating logs fallback feed for pod {pod_name}.")
            # Fallback mock lines
            now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            mock_logs = [
                {"timestamp": now, "pod": pod_name, "message": f"[INFO] Listening on API routes configurations..."},
                {"timestamp": now, "pod": pod_name, "message": f"[INFO] Connection established to downstream clients."},
                {"timestamp": now, "pod": pod_name, "message": f"[WARN] Memory limits are nearing threshold limit > 70%."},
            ]
            if search:
                return [line for line in mock_logs if search.lower() in line["message"].lower()]
            return mock_logs

    def _nano_to_iso(self, nano_str: str) -> str:
        try:
            seconds = float(nano_str) / 1e9
            return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(seconds))
        except Exception:
            return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

log_service = LogService()
