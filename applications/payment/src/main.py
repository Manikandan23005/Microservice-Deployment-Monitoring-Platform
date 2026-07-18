from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
from .telemetry import instrument_app

app = FastAPI(title="Payment Service")
instrument_app(app, "payment-service")

class PaymentRequest(BaseModel):
    amount: float

@app.post("/pay")
def pay(request: PaymentRequest):
    if random.random() < 0.1:
        raise HTTPException(status_code=500, detail="Payment gateway connection timeout")
    return {"status": "success", "transaction_id": f"tx-{random.randint(1000, 9999)}"}