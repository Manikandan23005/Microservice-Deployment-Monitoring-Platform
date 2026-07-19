from typing import Dict, Any, List, Optional, Tuple
from app.services.tool_executor import tool_executor

class QueryPlanner:
    """Classifies prompts and plans execution flows, prioritizing direct tool-execution before LLM reasoning."""

    def plan_execution(self, prompt: str) -> Tuple[List[str], bool, Optional[Dict[str, Any]]]:
        """
        Parses query intent, generates a plan sequence list, and checks if we can bypass the LLM.
        
        Returns:
            Tuple[plan_steps, bypass_llm, direct_result]
        """
        lower = prompt.lower()
        plan_steps = []
        bypass_llm = False
        direct_result = None

        # Heuristics for Direct Tool-First Execution (Bypass LLM)
        
        # 1. Pod count or list pods query
        if any(w in lower for w in ["how many pods", "pods count", "list pods", "show pods"]):
            plan_steps = ["Query Kubernetes Pods"]
            pods = tool_executor.get_pods()
            running = sum(1 for p in pods if p.get("status") == "Running")
            pending = sum(1 for p in pods if p.get("status") == "Pending")
            failed = sum(1 for p in pods if p.get("status") not in ["Running", "Pending"])
            
            bypass_llm = True
            direct_result = {
                "summary": f"Kubernetes Pods Status Summary: {len(pods)} total pods discovered.",
                "root_cause": "Live pods telemetry request directly resolved from Kubernetes API server.",
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
            deps = tool_executor.get_deployments()
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
                evidence.append(f"Deployment {name} ({ns}) desired {desired} but ready {ready}")
                affected.append(f"deployment/{name}")
                recs.append(f"Trigger rollout restart for deployment {name} in {ns}")
            
            direct_result = {
                "summary": f"Discovered {len(unhealthy)} unhealthy deployments in the cluster." if unhealthy else "All deployments are fully healthy and scaled.",
                "root_cause": "Replicas checks verification directly resolved from Kubernetes API.",
                "evidence": evidence if unhealthy else ["All deployments ready replica counts match desired specs."],
                "affected_resources": affected,
                "recommendations": recs,
                "severity": "Critical" if unhealthy else "Info",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # 3. Cluster Health
        if any(w in lower for w in ["cluster health", "show cluster health", "is the cluster healthy"]):
            plan_steps = ["Query Cluster Health"]
            health = tool_executor.get_cluster_health()
            metrics = tool_executor._get_metrics_summary()
            
            bypass_llm = True
            direct_result = {
                "summary": f"Cluster status is currently {health.get('status')}.",
                "root_cause": "Aggregated control plane telemetry resolved from Kubernetes API.",
                "evidence": [
                    f"Active Pods: {health.get('running_pods')}/{health.get('total_pods')} running",
                    f"Worker Nodes: {health.get('ready_nodes')}/{health.get('total_nodes')} ready",
                    f"Average CPU load: {metrics.get('cpu_utilization', 0.0):.1f}%",
                    f"Average Memory load: {metrics.get('memory_utilization', 0.0):.1f}%"
                ],
                "affected_resources": [],
                "recommendations": [
                    "Inspect non-ready pods or scaling configurations"
                ] if health.get("status") != "Healthy" else [],
                "severity": "Warning" if health.get("status") != "Healthy" else "Info",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # 4. CPU/Memory metrics
        if any(w in lower for w in ["cpu usage", "memory usage", "network usage", "metrics", "throughput"]):
            plan_steps = ["Query Prometheus Metrics"]
            metrics = tool_executor._get_metrics_summary()
            
            bypass_llm = True
            direct_result = {
                "summary": "Current cluster resource metrics load snapshot.",
                "root_cause": "Telemetry scraping resolved from active Prometheus server.",
                "evidence": [
                    f"CPU Utilization: {metrics.get('cpu_utilization', 0.0):.1f}%",
                    f"Memory Allocation: {metrics.get('memory_utilization', 0.0):.1f}%",
                    f"Network Throughput: {metrics.get('network_throughput_bytes', 0.0) / 1024:.1f} KB/s"
                ],
                "affected_resources": [],
                "recommendations": [],
                "severity": "Info",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # 5. Nodes list
        if any(w in lower for w in ["nodes", "list nodes", "show nodes"]):
            plan_steps = ["Query Kubernetes Nodes"]
            nodes = tool_executor.get_nodes()
            ready = sum(1 for n in nodes if n.get("status") == "Ready")
            
            bypass_llm = True
            direct_result = {
                "summary": f"Discovered {len(nodes)} total nodes in the cluster. {ready} ready.",
                "root_cause": "Nodes validation resolved from Kubernetes API server.",
                "evidence": [f"Node {n.get('name')} is {n.get('status')} (Role: {n.get('role')})" for n in nodes],
                "affected_resources": [n.get("name") for n in nodes if n.get("status") != "Ready"],
                "recommendations": [],
                "severity": "Info",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # 6. Namespaces list
        if any(w in lower for w in ["namespaces", "list namespaces", "show namespaces"]):
            plan_steps = ["Query Kubernetes Namespaces"]
            ns = tool_executor.get_namespaces()
            
            bypass_llm = True
            direct_result = {
                "summary": f"Discovered {len(ns)} active namespaces in the cluster.",
                "root_cause": "Namespaces catalog resolved from Kubernetes API server.",
                "evidence": [f"Namespace: {n.get('name')} ({n.get('status')})" for n in ns],
                "affected_resources": [],
                "recommendations": [],
                "severity": "Info",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # 7. ArgoCD GitOps applications
        if any(w in lower for w in ["applications", "list applications", "argocd", "gitops status"]):
            plan_steps = ["Query ArgoCD Applications status"]
            apps = tool_executor.get_applications()
            synced = sum(1 for a in apps if a.get("sync_status") == "Synced")
            
            bypass_llm = True
            direct_result = {
                "summary": f"Discovered {len(apps)} GitOps applications monitored by ArgoCD. {synced} synced.",
                "root_cause": "Sync metrics fetched programmatically from ArgoCD API server.",
                "evidence": [f"App {a.get('name')}: sync={a.get('sync_status')}, health={a.get('health_status')}" for a in apps],
                "affected_resources": [a.get("name") for a in apps if a.get("sync_status") != "Synced"],
                "recommendations": [f"Review Git commits for app {a.get('name')}" for a in apps if a.get("sync_status") != "Synced"],
                "severity": "Warning" if synced < len(apps) else "Info",
                "confidence": 100
            }
            return plan_steps, bypass_llm, direct_result

        # Fallback to LLM Triage Reasoning Plan (For diagnosis and incident correlations)
        plan_steps = ["Query Kubernetes configuration", "Query Prometheus Metrics", "Query Loki Logs", "Query ArgoCD Sync State", "Correlate Infrastructure telemetry", "Invoke LLM diagnostics"]
        return plan_steps, False, None

query_planner = QueryPlanner()
