# --- AI REST Router ---
from fastapi import APIRouter, Request, HTTPException, status
from app.schemas.responses import BaseResponse
from app.schemas.ai import AIChatRequest, AIIncidentRequest
from app.services.ai_service import ai_service
from shared.exceptions import DevOpsNexusException

router = APIRouter(prefix="/api/v1/ai")

@router.post("/chat", response_model=BaseResponse)
async def chat_troubleshoot(request: Request, body: AIChatRequest):
    """Answers DevOps incident queries using a conversational AI interface."""
    request_id = getattr(request.state, "request_id", None)
    try:
        response_text = ai_service.chat_troubleshoot(body.prompt, provider=body.provider)
        return BaseResponse(success=True, data={"response": response_text}, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/analyze-incident", response_model=BaseResponse)
async def analyze_incident(request: Request, body: AIIncidentRequest):
    """Performs detailed root cause analysis on container logs, metrics and events."""
    request_id = getattr(request.state, "request_id", None)
    try:
        analysis_text = ai_service.analyze_incident(
            pod_name=body.pod_name,
            namespace=body.namespace,
            logs=body.logs,
            metrics=body.metrics,
            events=body.events,
            provider=body.provider
        )
        return BaseResponse(success=True, data={"analysis": analysis_text}, request_id=request_id)
    except DevOpsNexusException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
