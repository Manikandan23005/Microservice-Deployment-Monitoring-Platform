import time
from typing import Dict, Any, List
import threading

class PlatformMetricsCollector:
    """Tracks internal DevOps Nexus platform performance, latency, and cache hit metrics."""
    def __init__(self):
        self.lock = threading.Lock()
        
        # API request stats
        self.request_latencies: List[float] = []
        self.request_count = 0
        self.error_count = 0
        
        # Cache stats
        self.cache_hits = 0
        self.cache_misses = 0
        
        # AI & Tool execution stats
        self.ai_latencies: List[float] = []
        self.tool_latencies: List[float] = []
        self.context_latencies: List[float] = []

    def record_request(self, latency: float, is_error: bool):
        with self.lock:
            self.request_count += 1
            if is_error:
                self.error_count += 1
            self.request_latencies.append(latency)
            if len(self.request_latencies) > 1000:
                self.request_latencies = self.request_latencies[-1000:]

    def record_cache(self, hit: bool):
        with self.lock:
            if hit:
                self.cache_hits += 1
            else:
                self.cache_misses += 1

    def record_ai(self, latency: float):
        with self.lock:
            self.ai_latencies.append(latency)
            if len(self.ai_latencies) > 100:
                self.ai_latencies = self.ai_latencies[-100:]

    def record_tool(self, latency: float):
        with self.lock:
            self.tool_latencies.append(latency)
            if len(self.tool_latencies) > 500:
                self.tool_latencies = self.tool_latencies[-500:]

    def record_context(self, latency: float):
        with self.lock:
            self.context_latencies.append(latency)
            if len(self.context_latencies) > 100:
                self.context_latencies = self.context_latencies[-100:]

    def get_summary(self) -> Dict[str, Any]:
        with self.lock:
            total_cache = self.cache_hits + self.cache_misses
            hit_ratio = (self.cache_hits / total_cache * 100.0) if total_cache > 0 else 100.0
            
            error_rate = (self.error_count / self.request_count * 100.0) if self.request_count > 0 else 0.0
            
            avg_req = sum(self.request_latencies) / len(self.request_latencies) if self.request_latencies else 0.0
            avg_ai = sum(self.ai_latencies) / len(self.ai_latencies) if self.ai_latencies else 0.0
            avg_tool = sum(self.tool_latencies) / len(self.tool_latencies) if self.tool_latencies else 0.0
            avg_ctx = sum(self.context_latencies) / len(self.context_latencies) if self.context_latencies else 0.0
            
            return {
                "request_count": self.request_count,
                "error_rate_percent": round(error_rate, 2),
                "average_request_latency_ms": round(avg_req * 1000.0, 2),
                "cache_hit_ratio_percent": round(hit_ratio, 2),
                "average_ai_latency_ms": round(avg_ai * 1000.0, 2),
                "average_tool_latency_ms": round(avg_tool * 1000.0, 2),
                "average_context_builder_latency_ms": round(avg_ctx * 1000.0, 2)
            }

observability_metrics = PlatformMetricsCollector()
