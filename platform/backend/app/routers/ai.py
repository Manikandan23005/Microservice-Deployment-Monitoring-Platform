# --- AI REST Router ---
from fastapi import APIRouter, Request, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from app.schemas.responses import BaseResponse
from app.schemas.ai import AIChatRequest, AIIncidentRequest
from app.services.ai_service import ai_service
from app.services.query_planner import query_planner
from shared.exceptions import DevOpsNexusException
import asyncio
import json
from typing import Optional
from fastapi import Depends
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/ai",
    dependencies=[Depends(get_current_user)]
)

from app.services.scope_engine import scope_engine

@router.post("/chat", response_model=BaseResponse)
async def chat_troubleshoot(request: Request, body: AIChatRequest):
    """Answers DevOps incident queries using a conversational AI interface."""
    request_id = getattr(request.state, "request_id", None)
    try:
        scope = scope_engine.resolve_scope(body.scope_mode, body.scope_namespace, body.scope_app, body.scope_domain)
        response_data = ai_service.chat_troubleshoot(body.prompt, provider=body.provider, session_id=body.session_id, scope=scope)
        return BaseResponse(success=True, data=response_data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/chat/stream")
async def chat_troubleshoot_stream(
    prompt: str = Query(..., description="The user query or context to analyze."),
    provider: Optional[str] = Query(None, description="AI completions client provider."),
    session_id: Optional[str] = Query(None, description="Conversational session tracking identifier."),
    scope_mode: Optional[str] = Query("cluster"),
    namespace: Optional[str] = Query(None),
    app: Optional[str] = Query(None),
    domain: Optional[str] = Query(None)
):
    """Streams AIOps agent execution phases and final diagnostics payload using Server-Sent Events (SSE)."""
    scope = scope_engine.resolve_scope(scope_mode, namespace, app, domain)
    
    async def event_generator():
        try:
            # 1. Ask Query Planner for the checklist
            plan_steps, bypass_llm, direct_result = query_planner.plan_execution(prompt, scope=scope)
            
            if bypass_llm and direct_result:
                # Direct tool execution path
                if "Query Kubernetes Pods" in plan_steps:
                    yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Pods...'})}\n\n"
                elif "Query Prometheus Metrics" in plan_steps:
                    yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Metrics...'})}\n\n"
                elif "Query ArgoCD Applications status" in plan_steps:
                    yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Deployments...'})}\n\n"
                else:
                    yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Metrics...'})}\n\n"
                
                await asyncio.sleep(0.4)
                yield f"event: progress\ndata: {json.dumps({'status': 'Analyzing...'})}\n\n"
                await asyncio.sleep(0.3)
                
                yield f"event: done\ndata: {json.dumps(direct_result)}\n\n"
                return

            # Conversational/Reasoning path
            yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Pods...'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Metrics...'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Logs...'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Analyzing...'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Generating Response...'})}\n\n"
            
            # Execute LLM call in worker thread
            loop = asyncio.get_event_loop()
            response_data = await loop.run_in_executor(
                None,
                lambda: ai_service.chat_troubleshoot(prompt, provider=provider, session_id=session_id, scope=scope)
            )
            
            yield f"event: done\ndata: {json.dumps(response_data)}\n\n"
        except Exception as e:
            err_payload = {
                "summary": "AI Diagnostics Connection Offline",
                "root_cause": f"An unhandled error occurred during pipeline execution: {str(e)}",
                "evidence": ["Server-Sent Events pipeline generator failed."],
                "affected_resources": [],
                "recommendations": ["Try refreshing or check application settings."],
                "severity": "Critical",
                "confidence": 0
            }
            yield f"event: done\ndata: {json.dumps(err_payload)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/analyze-incident", response_model=BaseResponse)
async def analyze_incident(request: Request, body: AIIncidentRequest):
    """Performs detailed root cause analysis on container logs, metrics and events."""
    request_id = getattr(request.state, "request_id", None)
    try:
        analysis_data = ai_service.analyze_incident(
            pod_name=body.pod_name,
            namespace=body.namespace,
            logs=body.logs,
            metrics=body.metrics,
            events=body.events,
            provider=body.provider
        )
        return BaseResponse(success=True, data=analysis_data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
