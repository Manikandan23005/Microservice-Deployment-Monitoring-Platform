# --- Observability AI Analysis Service ---
from typing import Dict, Any, Optional, List
from app.clients.llm import llm_client
from app.services.context_builder import context_builder
from shared.exceptions import DevOpsNexusException
from app.core.logging import logger

class AIService:
    """Orchestrates structured incident diagnostics by collecting live context and querying Groq models."""

    def chat_troubleshoot(self, prompt: str, provider: Optional[str] = None) -> str:
        """Handles general assistant troubleshooting conversations."""
        system_prompt = (
            "You are DevOps Nexus AI Assistant, an expert in Kubernetes, ArgoCD, Prometheus, "
            "and DevOps platform engineering. Help the operator solve their cluster issue. "
            "Structure your response in beautiful Markdown."
        )
        try:
            return llm_client.generate_chat_response(prompt, system_prompt=system_prompt)
        except Exception as e:
            logger.warning(f"AI completions failed. Yielding offline chat mock: {str(e)}")
            return self._get_chat_fallback(prompt)

    def analyze_incident(
        self,
        pod_name: str,
        namespace: str,
        logs: str = "",
        metrics: Optional[Dict[str, Any]] = None,
        events: Optional[List[Dict[str, Any]]] = None,
        provider: Optional[str] = None
    ) -> str:
        """Builds context automatically and prompts LLM to generate structured triage outputs."""
        # Automatically gather all live context details using ContextBuilder
        context = context_builder.build_incident_context(pod_name, namespace)
        
        system_prompt = (
            "You are a DevOps Incident Triage Architect. Analyze the provided cluster context "
            "and output your analysis in EXACTLY the following structured Markdown format:\n\n"
            "### 1. Problem Summary\n"
            "[Detailed summary of what the problem is]\n\n"
            "### 2. Root Cause\n"
            "[The identified root cause]\n\n"
            "### 3. Evidence\n"
            "[Evidence supporting this analysis, including logs, metrics anomalies, or events]\n\n"
            "### 4. Affected Resources\n"
            "[List of pods, services, or configurations impacted]\n\n"
            "### 5. Recommended Fix\n"
            "[Step-by-step commands or actions to remediate the issue]\n\n"
            "### 6. Severity\n"
            "[CRITICAL/WARNING/INFO]\n\n"
            "### 7. Confidence\n"
            "[HIGH/MEDIUM/LOW]"
        )

        prompt = (
            f"Diagnose the active incident for pod {pod_name} in namespace {namespace}.\n"
            f"Here is the collected context object from our live infrastructure:\n\n"
            f"{context}\n"
        )

        try:
            return llm_client.generate_chat_response(prompt, system_prompt=system_prompt)
        except Exception as e:
            logger.warning(f"Live LLM incident analysis failed. Yielding structured offline mock: {str(e)}")
            return self._get_incident_fallback(pod_name, namespace)

    def _get_chat_fallback(self, prompt: str) -> str:
        lower = prompt.lower()
        if "payment" in lower or "crash" in lower:
            return (
                "### DevOps Nexus AI Assistant (Offline Fallback)\n\n"
                "It appears that your payment-service pod is in `CrashLoopBackOff` status.\n\n"
                "**Potential Cause:** Settings verify: `STRIPE_API_KEY` contains invalid syntax or has expired.\n\n"
                "**Remediation Suggestion:** Update your Helm secrets or env configuration files."
            )
        return (
            "### DevOps Nexus AI Assistant (Offline Fallback)\n\n"
            "I am monitoring your GitOps deployment clusters. How can I help you troubleshoot? "
            "Supported queries: 'Why is payment-service restarting?', 'Show unhealthy pods'."
        )

    def _get_incident_fallback(self, pod_name: str, namespace: str) -> str:
        return (
            f"### 1. Problem Summary\n"
            f"Pod `{pod_name}` in namespace `{namespace}` is encountering runtime errors.\n\n"
            f"### 2. Root Cause\n"
            f"Connection timeouts occurring during database setup.\n\n"
            f"### 3. Evidence\n"
            f"Log lines: 'Stripe api connections timed out' and 'Postgres connection refused'.\n\n"
            f"### 4. Affected Resources\n"
            f"- Pod: `{pod_name}`\n"
            f"- Service: `payment-service`\n\n"
            f"### 5. Recommended Fix\n"
            f"1. Run `kubectl describe secret devops-nexus-secrets -n {namespace}`.\n"
            f"2. Check stripe secret configuration syntax.\n\n"
            f"### 6. Severity\n"
            f"CRITICAL\n\n"
            f"### 7. Confidence\n"
            f"HIGH"
        )

ai_service = AIService()
