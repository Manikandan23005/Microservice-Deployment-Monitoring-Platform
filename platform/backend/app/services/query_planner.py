from typing import Dict, Any, List, Optional, Tuple
from app.services.tool_executor import tool_executor
from app.services.scope_engine import scope_engine
from shared.scope import OperationsScope

class QueryPlanner:
    """Classifies prompts and plans execution flows, prioritizing direct tool-execution before LLM reasoning."""

    def plan_execution(self, prompt: str, scope: Optional[OperationsScope] = None) -> Tuple[List[str], bool, Optional[Dict[str, Any]]]:
        """
        Parses query intent, generates a plan sequence list, and checks if we can bypass the LLM.
        
        Returns:
            Tuple[plan_steps, bypass_llm, direct_result]
        """
        lower = prompt.lower()
        plan_steps = []
        bypass_llm = False
        direct_result = None
        current_scope = scope or scope_engine.resolve_scope()

        # Heuristics for Direct Tool-First Execution (Bypass LLM)
        
        # 1. Pod count or list pods query
        if any(w in lower for w in ["how many pods", "pods count", "list pods", "show pods"]):
            plan_steps = ["Query Kubernetes Pods"]
            raw_pods = tool_executor.get_pods()
            pods = scope_engine.filter_pods(raw_pods, current_scope)
            running = sum(1 for p in pods if p.get("status") == "Running")
            pending = sum(1 for p in pods if p.get("status") == "Pending")
            failed = sum(1 for p in pods if p.get("status") not in ["Running", "Pending"])
            
            scope_desc = f"Scope Mode: {current_scope.mode.value.upper()}"
            if current_scope.namespace:
                scope_desc += f" [{current_scope.namespace}]"

            bypass_llm = True
            direct_result = {
                "summary": f"Kubernetes Pods Summary ({scope_desc}): {len(pods)} pods discovered.",
                "root_cause": "Live pods telemetry request directly resolved from Kubernetes API server within current operational scope.",
                "evidence": [
                    f"Running Pods: {running}",
                    f"Pending Pods: {pending}",
                    f"Failed Pods: {failed}"
                ],
                "affected_resources": [p.get("name") for p in pods if p.get("status") != "Running"],
                "recommendations": [
                    "Inspect failed or pending pods using `kubectl describe pod`"
                ] if failed > 0 or pending > 0 else [],
                "severity": "Warning" if (failed > 0 or pending > 0) else "Info",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # 2. Unhealthy deployments
        if any(w in lower for w in ["unhealthy deployments", "failed deployments", "show unhealthy deployments"]):
            plan_steps = ["Query Deployments status"]
            raw_deps = tool_executor.get_deployments()
            deps = scope_engine.filter_deployments(raw_deps, current_scope)
            unhealthy = [d for d in deps if d.get("replicas") != d.get("ready_replicas")]
            
            bypass_llm = True
            evidence = []
            affected = []
            recs = []
            for d in unhealthy:
                name = d.get("name")
                ns = d.get("namespace")
                desired = d.get("replicas")
                ready = d.get("ready_replicas")
                evidence.append(f"Deployment {name} ({ns}): {ready}/{desired} ready replicas")
                affected.append(f"deployment/{name}")
                recs.append(f"restart deployment {name}")

            direct_result = {
                "summary": f"Unhealthy Deployments Audit: Found {len(unhealthy)} unhealthy deployments in current scope.",
                "root_cause": "Live deployment replicas inspection resolved directly from Kubernetes API server.",
                "evidence": evidence if evidence else ["All deployments in scope have 100% ready replicas."],
                "affected_resources": affected,
                "recommendations": recs if recs else ["No deployment remediation required."],
                "severity": "Critical" if len(unhealthy) > 0 else "Info",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # 3. Cluster health summary
        if any(w in lower for w in ["cluster health", "system health", "show cluster health"]):
            plan_steps = ["Query Cluster Health"]
            health = tool_executor.get_cluster_health()
            
            bypass_llm = True
            direct_result = {
                "summary": f"Cluster Health Status: {health.get('status')}",
                "root_cause": "Real-time cluster infrastructure health evaluated directly from live Kubernetes telemetry.",
                "evidence": [
                    f"Running Pods: {health.get('running_pods')}/{health.get('total_pods')}",
                    f"Ready Nodes: {health.get('ready_nodes')}/{health.get('total_nodes')}"
                ],
                "affected_resources": [],
                "recommendations": [] if health.get('status') == "Healthy" else ["Review degraded workloads"],
                "severity": "Info" if health.get('status') == "Healthy" else "Warning",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # Default: Full Reasoning Triage Flow
        plan_steps = [
            "Collect Pods & Deployments",
            "Collect Prometheus Metrics",
            "Collect Loki Logs",
            "Collect ArgoCD Applications",
            "Analyze Incident & Generate Diagnostics"
        ]
        return plan_steps, False, None

query_planner = QueryPlanner()
