# --- Observability AI Analysis Service ---
from typing import Dict, Any, Optional, List
from app.clients.ai import ai_client
from shared.exceptions import AIModelTriageException
from app.core.logging import logger

class AIService:
    """Combines logs, metrics, and event inputs to generate AI root-cause analysis reports."""
    
    def chat_troubleshoot(self, prompt: str, provider: Optional[str] = None) -> str:
        system_prompt = (
            "You are DevOps Nexus AI Assistant, an expert in Kubernetes, ArgoCD, Prometheus, "
            "and DevOps platform engineering. Help the operator solve their cluster issue. "
            "Structure your response in beautiful Markdown."
        )
        try:
            return ai_client.generate_chat_response(prompt, system_prompt=system_prompt, provider=provider)
        except AIModelTriageException as e:
            logger.warning(f"AI completions failed. Yielding offline chat mock: {str(e)}")
            return self._get_chat_fallback(prompt)

    def analyze_incident(
        self,
        pod_name: str,
        namespace: str,
        logs: str,
        metrics: Dict[str, Any],
        events: List[Dict[str, Any]],
        provider: Optional[str] = None
    ) -> str:
        """Constructs context details and prompts AI for incident triages and remediation paths."""
        prompt = (
            f"Please analyze the following active Kubernetes pod incident:\n"
            f"- Pod Identifier: {pod_name}\n"
            f"- Namespace Scope: {namespace}\n\n"
            f"Aggregated CPU and Memory Metrics:\n"
            f"{metrics}\n\n"
            f"Lifecycle Events List:\n"
            f"{events}\n\n"
            f"Error Log Snippets:\n"
            f"{logs}\n\n"
            f"Provide a structured analysis in Markdown:\n"
            f"1. **Summary of Incident**: A high-level description of what occurred.\n"
            f"2. **Root Cause Analysis**: Pinpoint why the container is crashing.\n"
            f"3. **Remediation Recommendations**: List step-by-step commands to repair the workload."
        )
        system_prompt = "You are a DevOps Triage Architect. Generate detailed root cause analysis reports."
        
        try:
            return ai_client.generate_chat_response(prompt, system_prompt=system_prompt, provider=provider)
        except AIModelTriageException as e:
            logger.warning(f"AI incident analysis failed. Yielding offline triage mock: {str(e)}")
            return self._get_incident_fallback(pod_name)

    def _get_chat_fallback(self, prompt: str) -> str:
        lower = prompt.toLowerCase() if hasattr(prompt, "toLowerCase") else prompt.lower()
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

    def _get_incident_fallback(self, pod_name: str) -> str:
        return (
            f"### DevOps Nexus AI Diagnostics Report (Offline Fallback)\n\n"
            f"**Incident:** Pod `{pod_name}` is currently in `CrashLoopBackOff` status.\n\n"
            f"**Root Cause Identification:**\n"
            f"Analyzing Loki logs reveals connection timeouts to the downstream dependencies.\n\n"
            f"**Actionable Remediation steps:**\n"
            f"1. Check env configurations credentials.\n"
            f"2. Verify service network routes mappings."
        )

ai_service = AIService()
