# --- DevOps Nexus Centralized Scope Engine ---
from typing import List, Dict, Any, Optional
from shared.scope import OperationsScope, ScopeMode, InfrastructureDomain
from app.core.logging import logger

class ScopeEngine:
    """Centralized service providing unified scope filtering across K8s, Prometheus, Loki, and ArgoCD."""

    def resolve_scope(
        self,
        mode: Optional[str] = "cluster",
        namespace: Optional[str] = "devops-nexus-prod",
        application: Optional[str] = None,
        domain: Optional[str] = None
    ) -> OperationsScope:
        try:
            scope_mode = ScopeMode(mode) if mode else ScopeMode.CLUSTER
        except ValueError:
            scope_mode = ScopeMode.CLUSTER

        infra_domain = None
        if domain:
            try:
                infra_domain = InfrastructureDomain(domain)
            except ValueError:
                infra_domain = None

        return OperationsScope(
            mode=scope_mode,
            namespace=namespace or "devops-nexus-prod",
            application=application,
            domain=infra_domain
        )

    def filter_namespaces(self, namespaces: List[Dict[str, Any]], scope: OperationsScope) -> List[Dict[str, Any]]:
        """Filters namespace objects array according to the operational scope."""
        if not namespaces:
            return []
        if scope.mode == ScopeMode.CLUSTER:
            return namespaces
        target_namespaces = scope.get_effective_namespaces()
        if not target_namespaces:
            return namespaces
        return [ns for ns in namespaces if ns.get("name") in target_namespaces]

    def filter_pods(self, pods: List[Dict[str, Any]], scope: OperationsScope) -> List[Dict[str, Any]]:
        """Filters Kubernetes pod metadata array using scope parameters."""
        if scope.mode == ScopeMode.CLUSTER:
            return pods

        target_namespaces = scope.get_effective_namespaces()
        filtered = pods

        if target_namespaces:
            filtered = [p for p in filtered if p.get("namespace") in target_namespaces]

        if scope.mode == ScopeMode.APPLICATION and scope.application:
            app_name = scope.application.lower()
            filtered = [
                p for p in filtered 
                if app_name in p.get("name", "").lower() or app_name in p.get("labels", {}).get("app", "").lower()
            ]

        return filtered

    def filter_deployments(self, deployments: List[Dict[str, Any]], scope: OperationsScope) -> List[Dict[str, Any]]:
        """Filters deployment specifications matching the current scope."""
        if scope.mode == ScopeMode.CLUSTER:
            return deployments

        target_namespaces = scope.get_effective_namespaces()
        filtered = deployments

        if target_namespaces:
            filtered = [d for d in filtered if d.get("namespace") in target_namespaces]

        if scope.mode == ScopeMode.APPLICATION and scope.application:
            app_name = scope.application.lower()
            filtered = [
                d for d in filtered 
                if app_name in d.get("name", "").lower() or app_name in d.get("labels", {}).get("app", "").lower()
            ]

        return filtered

    def filter_argocd_apps(self, apps: List[Dict[str, Any]], scope: OperationsScope) -> List[Dict[str, Any]]:
        """Filters ArgoCD application declarations to match operational scope."""
        if scope.mode == ScopeMode.CLUSTER:
            return apps

        target_namespaces = scope.get_effective_namespaces()
        filtered = apps

        if scope.mode == ScopeMode.INFRASTRUCTURE:
            return [a for a in apps if "argocd" in a.get("name", "").lower() or "nexus" in a.get("name", "").lower()]

        if target_namespaces:
            filtered = [
                a for a in filtered 
                if a.get("destination_namespace") in target_namespaces or
                   any(ns in a.get("path", "") or ns in a.get("name", "") for ns in target_namespaces)
            ]

        if scope.mode == ScopeMode.APPLICATION and scope.application:
            app_name = scope.application.lower()
            filtered = [a for a in filtered if app_name in a.get("name", "").lower()]

        return filtered

    def build_promql_filter(self, scope: OperationsScope) -> str:
        """Constructs a PromQL label selector string matching scope specifications."""
        if scope.mode == ScopeMode.CLUSTER:
            return ""

        target_namespaces = scope.get_effective_namespaces()
        clauses = []

        if target_namespaces:
            ns_regex = "|".join(target_namespaces)
            clauses.append(f'namespace=~"{ns_regex}"')

        if scope.mode == ScopeMode.APPLICATION and scope.application:
            clauses.append(f'pod=~"{scope.application}.*"')

        if not clauses:
            return ""
        return "{" + ", ".join(clauses) + "}"

    def build_logql_filter(self, scope: OperationsScope) -> str:
        """Constructs a Loki LogQL stream selector string matching active scope."""
        if scope.mode == ScopeMode.CLUSTER:
            return '{job=~".*"}'

        target_namespaces = scope.get_effective_namespaces()
        clauses = []

        if target_namespaces:
            ns_regex = "|".join(target_namespaces)
            clauses.append(f'namespace=~"{ns_regex}"')

        if scope.mode == ScopeMode.APPLICATION and scope.application:
            clauses.append(f'app=~"{scope.application}.*"')

        if not clauses:
            return '{job=~".*"}'
        return "{" + ", ".join(clauses) + "}"

    def build_logql_selector(self, scope: OperationsScope) -> str:
        """Alias for build_logql_filter."""
        return self.build_logql_filter(scope)

scope_engine = ScopeEngine()
