from typing import List, Dict, Any, Optional

class IncidentAnalyzer:
    """Telemetry diagnostic pipeline that rules checks live states for standard DevOps incidents."""
    
    def analyze_active_incidents(
        self,
        pods: List[Dict[str, Any]],
        deployments: List[Dict[str, Any]],
        metrics: Dict[str, Any],
        argocd_apps: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        incidents = []

        # 1. Check Pod failures, CrashLoops, Restarts
        for pod in pods:
            name = pod.get("name", "")
            ns = pod.get("namespace", "")
            status = pod.get("status", "Unknown")
            restarts = pod.get("restarts", 0)

            # Detect CrashLoopBackOff or high restarts
            if restarts > 3:
                incidents.append({
                    "type": "Restart Storm / CrashLoopBackOff",
                    "resource": f"pod/{name} ({ns})",
                    "severity": "Critical",
                    "evidence": f"Pod has restarted {restarts} times.",
                    "impact": "Degraded service availability and intermittent request drops.",
                    "recommendations": [
                        f"View logs for pod {name} using `kubectl logs -n {ns} {name}`",
                        f"Check resource limits (memory/CPU limits) configuration in Helm templates",
                        f"Describe pod lifecycle events using `kubectl describe pod -n {ns} {name}`"
                    ]
                })
            
            # Detect ImagePullBackOff / Pending
            if status in ["Pending", "ImagePullBackOff", "ErrImagePull"]:
                incidents.append({
                    "type": "Pod Lifecycle Stalled",
                    "resource": f"pod/{name} ({ns})",
                    "severity": "Critical",
                    "evidence": f"Pod state is {status}.",
                    "impact": "Pod is unscheduled or failing to download the required container image.",
                    "recommendations": [
                        f"Check Kubernetes scheduling limits or node capacity",
                        f"Validate that container image tag exist in Minikube registry",
                        f"Describe pod events to inspect scheduling failures"
                    ]
                })

        # 2. Check Deployments failures
        for dep in deployments:
            name = dep.get("name", "")
            ns = dep.get("namespace", "")
            desired = dep.get("replicas", 0)
            ready = dep.get("ready_replicas", 0)
            
            if desired != ready:
                incidents.append({
                    "type": "Deployment Scale Discrepancy",
                    "resource": f"deployment/{name} ({ns})",
                    "severity": "Warning",
                    "evidence": f"Ready replicas ({ready}) does not match desired target ({desired}).",
                    "impact": "Reduced traffic processing capacity and container rollout delays.",
                    "recommendations": [
                        f"Restart deployment using `kubectl rollout restart deployment/{name} -n {ns}`",
                        f"Inspect deployment conditions and replica count limits"
                    ]
                })

        # 3. Check Prometheus Metrics high utilization
        cpu = metrics.get("cpu_utilization", 0.0)
        mem = metrics.get("memory_utilization", 0.0)
        
        if cpu > 80.0:
            incidents.append({
                "type": "High Cluster CPU Load",
                "resource": "cluster",
                "severity": "Warning",
                "evidence": f"Cluster CPU utilization is at {cpu:.1f}%.",
                "impact": "Potential performance degradation and high request latency.",
                "recommendations": [
                    "Scale down non-critical deployments to free up node capacity",
                    "Check for resource limit leaks in the traffic generator"
                ]
            })

        if mem > 80.0:
            incidents.append({
                "type": "High Cluster Memory Pressure",
                "resource": "cluster",
                "severity": "Warning",
                "evidence": f"Cluster Memory allocation is at {mem:.1f}%.",
                "impact": "Risk of node OOMKilled events eviction warnings.",
                "recommendations": [
                    "Scale down deployments to release cache capacity",
                    "Inspect memory usage profiles of backend services"
                ]
            })

        # 4. Check ArgoCD OutOfSync or Degraded Apps
        for app in argocd_apps:
            name = app.get("name", "")
            sync = app.get("sync_status", "Synced")
            health = app.get("health_status", "Healthy")
            
            if sync == "OutOfSync" or health in ["Degraded", "Missing"]:
                incidents.append({
                    "type": "GitOps OutOfSync or Unhealthy Application",
                    "resource": f"argocd/{name}",
                    "severity": "Warning",
                    "evidence": f"Sync is {sync}, health is {health}.",
                    "impact": "Drift detected between git repository manifests and cluster state.",
                    "recommendations": [
                        f"Sync app manually or trigger auto-sync in ArgoCD for {name}",
                        f"Review Git commits configuration history for deployment drifts"
                    ]
                })

        return incidents

incident_analyzer = IncidentAnalyzer()
