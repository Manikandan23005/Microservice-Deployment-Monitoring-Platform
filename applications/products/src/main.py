from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from .telemetry import instrument_app

app = FastAPI(title="Products Service")
instrument_app(app, "products-service")

class Product(BaseModel):
    id: int
    name: str
    price: float
    stock: int

CATALOG = {
    1: {"id": 1, "name": "Kubernetes Mastery Book", "price": 49.99, "stock": 100},
    2: {"id": 2, "name": "Prometheus T-Shirt", "price": 25.00, "stock": 50},
    3: {"id": 3, "name": "Grafana Mug", "price": 15.50, "stock": 75}
}

@app.get("/products")
def list_products() -> List[Product]:
    return list(CATALOG.values())

@app.get("/products/{product_id}")
def get_product(product_id: int) -> Product:
    if product_id in CATALOG:
        return CATALOG[product_id]
    raise HTTPException(status_code=404, detail="Product not found")