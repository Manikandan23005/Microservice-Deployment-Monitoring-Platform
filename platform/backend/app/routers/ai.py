# --- AI REST Router ---
from fastapi import APIRouter, Request, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from app.schemas.responses import BaseResponse
from app.schemas.ai import AIChatRequest, AIIncidentRequest
from app.services.ai_service import ai_service
from shared.exceptions import DevOpsNexusException
import asyncio
import json
from typing import Optional

router = APIRouter(prefix="/api/v1/ai")

@router.post("/chat", response_model=BaseResponse)
async def chat_troubleshoot(request: Request, body: AIChatRequest):
    """Answers DevOps incident queries using a conversational AI interface."""
    request_id = getattr(request.state, "request_id", None)
    try:
        response_data = ai_service.chat_troubleshoot(body.prompt, provider=body.provider, session_id=body.session_id)
        return BaseResponse(success=True, data=response_data, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/chat/stream")
async def chat_troubleshoot_stream(
    prompt: str = Query(..., description="The user query or context to analyze."),
    provider: Optional[str] = Query(None, description="AI completions client provider."),
    session_id: Optional[str] = Query(None, description="Conversational session tracking identifier.")
):
    """Streams AIOps agent execution phases and final diagnostics payload using Server-Sent Events (SSE)."""
    
    async def event_generator():
        try:
            yield f"event: progress\ndata: {json.dumps({'status': 'Thinking'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Building Context'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Metrics'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Collecting Logs'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Analyzing'})}\n\n"
            await asyncio.sleep(0.3)
            
            yield f"event: progress\ndata: {json.dumps({'status': 'Generating Analysis'})}\n\n"
            
            # Execute LLM call in a worker thread to avoid blocking the main async loop
            loop = asyncio.get_event_loop()
            response_data = await loop.run_in_executor(
                None,
                ai_service.chat_troubleshoot,
                prompt,
                provider,
                session_id
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
