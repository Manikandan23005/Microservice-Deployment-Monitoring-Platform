# --- Observability AI Analysis Service ---
import re
import json
from typing import Dict, Any, Optional, List
from app.clients.llm import llm_client
from app.services.context_builder import context_builder
from shared.exceptions import DevOpsNexusException
from app.core.logging import logger

class AIService:
    """Orchestrates structured incident diagnostics by collecting live context and querying Groq models."""

    def chat_troubleshoot(self, prompt: str, provider: Optional[str] = None) -> Dict[str, Any]:
        """Handles conversational AI triage by pulling live context first and forcing a structured JSON output."""
        context = context_builder.build_query_context(prompt)
        
        system_prompt = (
            "You are DevOps Nexus AI Assistant, an enterprise AIOps engine. "
            "You answer questions ONLY using the provided runtime context. Do not invent details.\n"
            "If the context shows the cluster has no workloads or is empty, state so clearly.\n"
            "Do not recommend kubectl commands or PromQL unless explicitly asked.\n"
            "Do not provide tutorials.\n\n"
            "Output your entire response as a single, valid JSON object conforming exactly to this schema:\n"
            "{\n"
            '  "summary": "Short 1-sentence summary of the current operational status.",\n'
            '  "analysis": "Detailed explanation of the resource or query grounded solely in the context.",\n'
            '  "evidence": ["Specific metric values, status phases, or logs from the context"],\n'
            '  "recommendation": ["Actionable steps or recommendations for the operator"],\n'
            '  "severity": "Info | Warning | Critical",\n'
            '  "confidence": 100\n'
            "}"
        )
        
        prompt_with_context = (
            f"Runtime Context:\n{context}\n\n"
            f"User Question:\n{prompt}\n"
        )
        
        try:
            raw_response = llm_client.generate_chat_response(prompt_with_context, system_prompt=system_prompt)
            return self._parse_llm_json(raw_response)
        except Exception as e:
            logger.warning(f"AI chat troubleshooting failed: {str(e)}")
            # Return an honest configuration or connection error structured response
            return {
                "summary": "AI Diagnostics Connection Offline",
                "analysis": f"Failed to get live completions analysis: {str(e)}",
                "evidence": ["Groq or OpenAI completions client request failed."],
                "recommendation": ["Check GROQ_API_KEY settings inside your .env file."],
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
            '  "analysis": "Root cause analysis explanation grounded in the logs and metrics.",\n'
            '  "evidence": ["Specific errors, status logs, or restart counts from the context"],\n'
            '  "recommendation": ["Remediation actions to fix the pod crash loop"],\n'
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
                "analysis": f"Could not perform root cause analysis: {str(e)}",
                "evidence": [f"Pod name: {pod_name}", f"Namespace: {namespace}"],
                "recommendation": ["Verify that your Groq/OpenAI keys are active and configured in .env."],
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
            return {
                "summary": str(data.get("summary", "")),
                "analysis": str(data.get("analysis", "")),
                "evidence": list(data.get("evidence", [])),
                "recommendation": list(data.get("recommendation", [])),
                "severity": str(data.get("severity", "Info")),
                "confidence": int(data.get("confidence", 100))
            }
        except Exception as e:
            logger.error(f"Failed to parse LLM response as JSON: {str(e)}. Raw content was:\n{raw_text}")
            return {
                "summary": "AIOps Triage Output Parsing Failed",
                "analysis": f"The LLM completions response returned invalid JSON syntax: {str(e)}",
                "evidence": [f"Raw text fragment: {raw_text[:200]}"],
                "recommendation": ["Please retry the query or inspect LLM completions config logs."],
                "severity": "Warning",
                "confidence": 0
            }

ai_service = AIService()
