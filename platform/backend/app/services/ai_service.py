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
        """Classifies prompt via Query Planner, runs Tool-First execution bypass if possible, or generates LLM triage output."""
        current_scope = scope or scope_engine.resolve_scope()
        
        # 1. Check Query Planner for Tool-First Bypassing
        plan_steps, bypass_llm, direct_result = query_planner.plan_execution(prompt, scope=current_scope)
        
        if bypass_llm and direct_result:
            logger.info(f"Query Planner bypassed LLM for direct prompt: {prompt}")
            session_manager.add_message(session_id, "user", prompt)
            session_manager.add_message(session_id, "assistant", direct_result.get("summary", ""))
            return direct_result

        # 2. Flow through Context Builder if reasoning/diagnostics are needed
        start_ctx = time.perf_counter()
        context = context_builder.build_query_context(prompt, session_id=session_id, scope=current_scope)
        duration_ctx = time.perf_counter() - start_ctx
        try:
            from app.utils.observability import observability_metrics
            observability_metrics.record_context(duration_ctx)
        except Exception:
            pass
        
        # Pull conversational history
        history = session_manager.get_history(session_id)
        history_str = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history[-4:]])

        # Force strict grounded reasoning without chatbot conversational filler
        system_prompt = (
            "You are DevOps Nexus AI Assistant, an enterprise AIOps engine. "
            "You answer questions ONLY using the provided runtime context and execution results. Do not invent details.\n"
            "If the context shows the cluster has no workloads or is empty, state so clearly.\n"
            "Output your entire response as a single, valid JSON object conforming exactly to this schema:\n"
            "{\n"
            '  "summary": "Short 1-sentence summary of the current operational status.",\n'
            '  "root_cause": "Detailed explanation of the resource or query grounded solely in the context.",\n'
            '  "evidence": ["Specific metric values, status phases, or logs from the context"],\n'
            '  "affected_resources": ["List of Kubernetes resources affected"],\n'
            '  "recommendations": ["Concrete remediation recommendations referencing actual resources"],\n'
            '  "severity": "Info | Warning | Critical",\n'
            '  "confidence": 100\n'
            "}"
        )
        
        prompt_with_context = (
            f"Current Operational Scope: Mode={current_scope.mode.value.upper()}, Namespace={current_scope.namespace}, App={current_scope.application}\n\n"
            f"User Session Context:\n{history_str}\n\n"
            f"Collected Telemetry Context:\n{json.dumps(context, indent=2)}\n\n"
            f"User Operational Query: {prompt}"
        )

        logger.info(f"Dispatching query with scope {current_scope.mode.value} to provider {provider or 'default'}")
        
        start_ai = time.perf_counter()
        raw_response = llm_client.generate_chat_response(prompt_with_context, system_prompt=system_prompt)
        duration_ai = time.perf_counter() - start_ai
        try:
            from app.utils.observability import observability_metrics
            observability_metrics.record_ai(duration_ai)
        except Exception:
            pass

        parsed_json = self._parse_json_response(raw_response)
        
        session_manager.add_message(session_id, "user", prompt)
        session_manager.add_message(session_id, "assistant", parsed_json.get("summary", raw_response))
        
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
