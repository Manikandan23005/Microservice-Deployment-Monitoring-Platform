# --- Orders Service API Skeleton ---
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Orders Service", version="0.1.0")

class OrderItem(BaseModel):
    product_id: int
    quantity: int

class OrderRequest(BaseModel):
    user_id: int
    items: list[OrderItem]

@app.get("/healthz")
def health_check():
    return {"status": "healthy", "service": "orders"}

@app.post("/orders")
def create_order(request: OrderRequest):
    # TODO: Validate inventory with products service, authorize with users, verify with payments
    return {
        "order_id": 5001,
        "status": "pending_payment",
        "user_id": request.user_id,
        "items": request.items
    }
