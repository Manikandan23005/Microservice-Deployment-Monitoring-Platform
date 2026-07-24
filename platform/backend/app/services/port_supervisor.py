# --- Automatic Telemetry Port Supervisor Service ---
import subprocess
import socket
import time
import threading
from app.core.logging import logger

class TelemetryPortSupervisor:
    """Monitors and automatically spawns port-forwards for Prometheus (9090), Loki (3100), and Grafana (8082)."""

    def __init__(self):
        self._prometheus_proc = None
        self._loki_proc = None
        self._grafana_proc = None
        self._monitoring = False
        self._thread = None
        self.start_supervisor_daemon()

    def is_port_open(self, host: str, port: int) -> bool:
        try:
            with socket.create_connection((host, port), timeout=0.8):
                return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False

    def ensure_telemetry_ports(self):
        """Checks ports 9090, 3100, and 8082. If closed, spawns background kubectl port-forwards."""
        # 1. Prometheus check & auto-repair
        if not self.is_port_open("127.0.0.1", 9090):
            try:
                self._prometheus_proc = subprocess.Popen(
                    ["kubectl", "port-forward", "-n", "monitoring", "svc/kube-prometheus-stack-prometheus", "9090:9090", "--address=0.0.0.0"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                time.sleep(0.3)
            except Exception as e:
                logger.warning(f"Failed to spawn Prometheus port-forward: {str(e)}")

        # 2. Loki check & auto-repair
        if not self.is_port_open("127.0.0.1", 3100):
            try:
                self._loki_proc = subprocess.Popen(
                    ["kubectl", "port-forward", "-n", "logging-lab", "svc/loki", "3100:3100", "--address=0.0.0.0"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                time.sleep(0.3)
            except Exception as e:
                logger.warning(f"Failed to spawn Loki port-forward: {str(e)}")

        # 3. Grafana check & auto-repair
        if not self.is_port_open("127.0.0.1", 8082):
            try:
                self._grafana_proc = subprocess.Popen(
                    ["kubectl", "port-forward", "-n", "monitoring", "svc/kube-prometheus-stack-grafana", "8082:80", "--address=0.0.0.0"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                time.sleep(0.3)
            except Exception as e:
                logger.warning(f"Failed to spawn Grafana port-forward: {str(e)}")

    def _daemon_loop(self):
        """Continuous background thread to auto-heal telemetry ports."""
        while self._monitoring:
            try:
                self.ensure_telemetry_ports()
            except Exception:
                pass
            time.sleep(3.0)

    def start_supervisor_daemon(self):
        if not self._monitoring:
            self._monitoring = True
            self._thread = threading.Thread(target=self._daemon_loop, daemon=True)
            self._thread.start()

port_supervisor = TelemetryPortSupervisor()
