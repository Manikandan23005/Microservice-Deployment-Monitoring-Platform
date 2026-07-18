from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from .telemetry import instrument_app

app = FastAPI(title="Orders Service")
instrument_app(app, "orders-service")

class OrderRequest(BaseModel):
    product_id: int
    quantity: int

@app.post("/orders")
def create_order(request: OrderRequest):
    try:
        response = httpx.get(f"http://products-service:8000/products/{request.product_id}", timeout=2.0)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid product ID")
        product = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reach products service: {str(e)}")
        
    total_price = product["price"] * request.quantity
    
    try:
        pay_resp = httpx.post("http://payment-service:8000/pay", json={"amount": total_price}, timeout=2.0)
        payment_status = pay_resp.json().get("status", "failed")
    except Exception as e:
        payment_status = "failed"
        
    try:
        httpx.post("http://notification-service:8000/notify", json={"message": f"Order created. Status: {payment_status}"}, timeout=2.0)
    except Exception:
        pass
        
    if payment_status != "success":
        raise HTTPException(status_code=402, detail="Payment verification failed")
        
    return {"order_status": "created", "total_price": total_price}