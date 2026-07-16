# --- Products Service API Skeleton ---
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Products Service", version="0.1.0")

class Product(BaseModel):
    id: int
    name: str
    price: float
    in_stock: bool

@app.get("/healthz")
def health_check():
    return {"status": "healthy", "service": "products"}

@app.get("/products/{product_id}")
def get_product(product_id: int):
    # TODO: Implement database lookup for products and inventory states
    if product_id == 101:
        return {
            "id": 101,
            "name": "Cloud Native Kubernetes Guide",
            "price": 29.99,
            "in_stock": True
        }
    raise HTTPException(status_code=404, detail="Product not found")
