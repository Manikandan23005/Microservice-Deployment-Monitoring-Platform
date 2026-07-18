from fastapi import FastAPI
from pydantic import BaseModel
from .telemetry import instrument_app

app = FastAPI(title="Notification Service")
instrument_app(app, "notification-service")

class NotifyRequest(BaseModel):
    message: str

@app.post("/notify")
def notify(request: NotifyRequest):
    return {"status": "dispatched", "notification_sent": request.message}