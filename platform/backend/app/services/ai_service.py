# --- Observability AI Analysis Service ---
import re
import json
import time
from typing import Dict, Any, Optional, List
from app.clients.llm import llm_client
from app.services.context_builder import context_builder
from app.services.query_planner import query_planner
from app.services.scope_engine import scope_engine
from shared.scope import OperationsScope
from app.utils.session_manager import session_manager
from shared.exceptions import DevOpsNexusException
from app.core.logging import logger

class AIService:
    """Orchestrates structured incident diagnostics by planning execution, running tools, and querying models."""

    def chat_troubleshoot(
        self,
        prompt: str,
        provider: Optional[str] = None,
        session_id: Optional[str] = None,
        scope: Optional[OperationsScope] = None
    ) -> Dict[str, Any]:
        """Runs query through ai_agent_pipeline Tool-First Evidence-Grounded Engine."""
        current_scope = scope or scope_engine.resolve_scope()
        from app.services.ai_agent_pipeline import ai_agent_pipeline
        
        res = ai_agent_pipeline.run_pipeline(
            prompt=prompt,
            resource_name=current_scope.application,
            namespace=current_scope.namespace or "devops-nexus-prod",
            scope=current_scope
        )

        parsed_json = {
            "summary": res.get("executive_summary"),
            "root_cause": res.get("root_cause"),
            "evidence": res.get("verified_evidence"),
            "supporting_evidence": res.get("supporting_evidence"),
            "affected_resources": res.get("affected_resources"),
            "recommendations": [res.get("recommended_remediation")],
            "severity": res.get("risk_assessment"),
            "evidence_quality": res.get("evidence_quality"),
            "confidence": 100 if res.get("evidence_quality") == "HIGH" else (80 if res.get("evidence_quality") == "MEDIUM" else 50),
            "investigation_steps": res.get("investigation_steps"),
            "suggested_plan": res.get("suggested_plan")
        }

        session_manager.add_message(session_id, "user", prompt)
        session_manager.add_message(session_id, "assistant", parsed_json.get("summary", ""))
        return parsed_json

    def analyze_incident(
        self,
        pod_name: str,
        namespace: str,
        logs: str = "",
        metrics: Optional[Dict[str, Any]] = None,
        events: Optional[List[Dict[str, Any]]] = None,
        provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """Runs automated root-cause analysis on a pod failure incident."""
        context = context_builder.build_incident_context(pod_name, namespace)
        
        system_prompt = (
            "You are DevOps Nexus AI Assistant, an enterprise AIOps engine. "
            "Perform root cause analysis on the provided pod failure context.\n"
            "Output your entire response as a single, valid JSON object matching the AIStructuredResponse schema."
        )
        
        prompt_with_context = (
            f"Incident Analysis Request for Pod {pod_name} in namespace {namespace}:\n"
            f"Target Logs:\n{logs}\n\n"
            f"Target Metrics:\n{json.dumps(metrics or {})}\n\n"
            f"Target Events:\n{json.dumps(events or [])}\n\n"
            f"Full Cluster Context:\n{json.dumps(context, indent=2)}"
        )

        raw_response = llm_client.generate_chat_response(prompt_with_context, system_prompt=system_prompt)
        return self._parse_json_response(raw_response)

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Ensures the LLM output is stripped of markdown codeblocks and parsed into a valid dictionary."""
        cleaned = text.strip()
        cleaned = re.sub(r"^```json\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"^```\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"```$", "", cleaned, flags=re.MULTILINE).strip()
        
        try:
            return json.loads(cleaned)
        except Exception:
            return {
                "summary": "AI Diagnostics Completed",
                "root_cause": cleaned,
                "evidence": ["Raw completions text payload"],
                "affected_resources": [],
                "recommendations": ["Review live logs directly"],
                "severity": "Info",
                "confidence": 85
            }

ai_service = AIService()
