# --- Automatic Telemetry Port Supervisor Service ---
import subprocess
import socket
import time
import httpx
from app.core.logging import logger

class TelemetryPortSupervisor:
    """Monitors and automatically spawns port-forwards for Prometheus (9090) and Loki (3100)."""

    def __init__(self):
        self._prometheus_proc = None
        self._loki_proc = None

    def is_port_open(self, host: str, port: int) -> bool:
        try:
            with socket.create_connection((host, port), timeout=1.0):
                return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False

    def ensure_telemetry_ports(self):
        """Checks ports 9090 and 3100. If closed, spawns background kubectl port-forwards."""
        # 1. Prometheus check & auto-repair
        if not self.is_port_open("127.0.0.1", 9090):
            logger.info("Prometheus port 9090 is closed. Attempting auto port-forward spawn...")
            try:
                self._prometheus_proc = subprocess.Popen(
                    ["kubectl", "port-forward", "-n", "monitoring", "svc/kube-prometheus-stack-prometheus", "9090:9090", "--address=127.0.0.1"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                time.sleep(0.5)
            except Exception as e:
                logger.warning(f"Failed to spawn Prometheus port-forward: {str(e)}")

        # 2. Loki check & auto-repair
        if not self.is_port_open("127.0.0.1", 3100):
            logger.info("Loki port 3100 is closed. Attempting auto port-forward spawn...")
            try:
                self._loki_proc = subprocess.Popen(
                    ["kubectl", "port-forward", "-n", "logging-lab", "svc/loki", "3100:3100", "--address=127.0.0.1"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                time.sleep(0.5)
            except Exception as e:
                logger.warning(f"Failed to spawn Loki port-forward: {str(e)}")

port_supervisor = TelemetryPortSupervisor()
