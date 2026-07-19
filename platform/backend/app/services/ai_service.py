# --- Observability AI Analysis Service ---
import re
import json
from typing import Dict, Any, Optional, List
from app.clients.llm import llm_client
from app.services.context_builder import context_builder
from app.services.query_planner import query_planner
from app.utils.session_manager import session_manager
from shared.exceptions import DevOpsNexusException
from app.core.logging import logger

class AIService:
    """Orchestrates structured incident diagnostics by planning execution, running tools, and querying models."""

    def chat_troubleshoot(self, prompt: str, provider: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Classifies prompt via Query Planner, runs Tool-First execution bypass if possible, or generates LLM triage output."""
        
        # 1. Check Query Planner for Tool-First Bypassing
        plan_steps, bypass_llm, direct_result = query_planner.plan_execution(prompt)
        
        if bypass_llm and direct_result:
            logger.info(f"Query Planner bypassed LLM for direct prompt: {prompt}")
            session_manager.add_message(session_id, "user", prompt)
            session_manager.add_message(session_id, "assistant", direct_result.get("summary", ""))
            return direct_result

        # 2. Flow through Context Builder if reasoning/diagnostics are needed
        context = context_builder.build_query_context(prompt, session_id=session_id)
        
        # Pull conversational history
        history = session_manager.get_history(session_id)
        history_str = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history[-4:]])

        # Force strict grounded reasoning without chatbot conversational filler
        system_prompt = (
            "You are DevOps Nexus AI Assistant, an enterprise AIOps engine. "
            "You answer questions ONLY using the provided runtime context and execution results. Do not invent details.\n"
            "If the context shows the cluster has no workloads or is empty, state so clearly.\n"
            "Do not recommend general tutorial commands like 'Run kubectl...' or 'Try this PromQL...'. Instead, suggest remediation using actual resource details.\n"
            "Output your entire response as a single, valid JSON object conforming exactly to this schema:\n"
            "{\n"
            '  "summary": "Short 1-sentence summary of the current operational status.",\n'
            '  "root_cause": "Detailed explanation of the resource or query grounded solely in the context. Explain incident relationships (e.g. Pod -> Deployment -> Ingress) instead of isolated facts.",\n'
            '  "evidence": ["Specific metric values, status phases, or logs from the context"],\n'
            '  "affected_resources": ["List of Kubernetes resources (e.g. pods, deployments, namespaces) affected"],\n'
            '  "recommendations": ["Concrete remediation recommendations referencing actual resources (e.g. restart auth-service, scale deployment payment-service, view logs)"],\n'
            '  "severity": "Info | Warning | Critical",\n'
            '  "confidence": 100\n'
            "}"
        )
        
        prompt_with_context = (
            f"Chat History:\n{history_str}\n\n"
            f"Execution Results Context:\n{context}\n\n"
            f"User Question:\n{prompt}\n"
        )
        
        try:
            raw_response = llm_client.generate_chat_response(prompt_with_context, system_prompt=system_prompt)
            parsed_data = self._parse_llm_json(raw_response)
            
            # Save user prompt & AI summary to history for memory tracking
            session_manager.add_message(session_id, "user", prompt)
            session_manager.add_message(session_id, "assistant", parsed_data.get("summary", ""))
            
            return parsed_data
        except Exception as e:
            logger.warning(f"AI chat troubleshooting failed: {str(e)}")
            return {
                "summary": "AI Diagnostics Connection Offline",
                "root_cause": f"Failed to get live completions analysis: {str(e)}",
                "evidence": ["Groq or OpenAI completions client request failed."],
                "affected_resources": [],
                "recommendations": ["Check GROQ_API_KEY settings inside your .env file."],
                "severity": "Critical",
                "confidence": 0
            }

    def analyze_incident(
        self,
        pod_name: str,
        namespace: str,
        logs: str = "",
        metrics: Optional[Dict[str, Any]] = None,
        events: Optional[List[Dict[str, Any]]] = None,
        provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """Builds context automatically and prompts LLM to generate structured triage outputs."""
        context = context_builder.build_incident_context(pod_name, namespace)
        
        system_prompt = (
            "You are a DevOps Incident Triage Architect. Analyze the provided context "
            "and output your entire analysis as a single, valid JSON object conforming exactly to this schema:\n"
            "{\n"
            '  "summary": "Short summary of the pod incident.",\n'
            '  "root_cause": "Root cause analysis explanation grounded in the logs and metrics.",\n'
            '  "evidence": ["Specific errors, status logs, or restart counts from the context"],\n'
            '  "affected_resources": ["List of affected resources"],\n'
            '  "recommendations": ["Remediation actions to fix the pod crash loop"],\n'
            '  "severity": "Critical | Warning | Info",\n'
            '  "confidence": 100\n'
            "}"
        )

        prompt = (
            f"Runtime Context:\n{context}\n\n"
            f"Diagnose the active incident for pod {pod_name} in namespace {namespace}.\n"
        )

        try:
            raw_response = llm_client.generate_chat_response(prompt, system_prompt=system_prompt)
            return self._parse_llm_json(raw_response)
        except Exception as e:
            logger.warning(f"Live LLM incident analysis failed: {str(e)}")
            return {
                "summary": "Incident Diagnostics Offline",
                "root_cause": f"Could not perform root cause analysis: {str(e)}",
                "evidence": [f"Pod name: {pod_name}", f"Namespace: {namespace}"],
                "affected_resources": [f"pod/{pod_name}"],
                "recommendations": ["Verify that your Groq/OpenAI keys are active and configured in .env."],
                "severity": "Critical",
                "confidence": 0
            }

    def _parse_llm_json(self, raw_text: str) -> Dict[str, Any]:
        text = raw_text.strip()
        
        # Check if wrapped in markdown formatting (```json ... ```)
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            text = match.group(1)
            
        try:
            data = json.loads(text)
            
            # Extract recommendations supporting both 'recommendation' and 'recommendations' keys
            recs = data.get("recommendations", data.get("recommendation", []))
            if isinstance(recs, str):
                recs = [recs]
                
            # Extract root cause supporting both 'root_cause' and 'analysis' keys
            rc = data.get("root_cause", data.get("analysis", ""))
            
            # Extract affected resources
            aff = data.get("affected_resources", [])
            
            return {
                "summary": str(data.get("summary", "")),
                "root_cause": str(rc),
                "evidence": list(data.get("evidence", [])),
                "affected_resources": list(aff),
                "recommendations": list(recs),
                "severity": str(data.get("severity", "Info")),
                "confidence": int(data.get("confidence", 100))
            }
        except Exception as e:
            logger.error(f"Failed to parse LLM response as JSON: {str(e)}. Raw content was:\n{raw_text}")
            return {
                "summary": "AIOps Triage Output Parsing Failed",
                "root_cause": f"The LLM completions response returned invalid JSON syntax: {str(e)}",
                "evidence": [f"Raw text fragment: {raw_text[:200]}"],
                "affected_resources": [],
                "recommendations": ["Please retry the query or inspect LLM completions config logs."],
                "severity": "Warning",
                "confidence": 0
            }

ai_service = AIService()
