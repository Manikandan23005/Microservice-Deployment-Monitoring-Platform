# --- Notification Service API Skeleton ---
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Notification Service", version="0.1.0")

class NotificationRequest(BaseModel):
    recipient: str
    subject: str
    message: str
    channel: str # "email" or "sms"

@app.get("/healthz")
def health_check():
    return {"status": "healthy", "service": "notification"}

@app.post("/send")
def send_notification(request: NotificationRequest):
    # TODO: Connect to email SMTP server or SMS service provider API
    if request.recipient:
        return {
            "status": "queued",
            "channel": request.channel,
            "recipient": request.recipient
        }
    raise HTTPException(status_code=400, detail="Invalid recipient address")
