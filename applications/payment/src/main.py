# --- Payment Service API Skeleton ---
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Payment Service", version="0.1.0")

class TransactionRequest(BaseModel):
    order_id: int
    amount: float
    currency: str

@app.get("/healthz")
def health_check():
    return {"status": "healthy", "service": "payment"}

@app.post("/charge")
def process_payment(request: TransactionRequest):
    # TODO: Connect to external payment processor API
    if request.amount > 0:
        return {
            "transaction_id": "tx_998877",
            "status": "success",
            "order_id": request.order_id
        }
    raise HTTPException(status_code=400, detail="Invalid payment amount")
