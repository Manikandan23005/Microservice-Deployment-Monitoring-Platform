import time
import random
import httpx

GATEWAY_URL = "http://gateway-service:8080"

print("Starting Nexus Traffic Generator...")

while True:
    try:
        # 1. List all products (GET)
        httpx.get(f"{GATEWAY_URL}/api/v1/products/products", timeout=3.0)
        
        # 2. Get specific product profile (random IDs to trigger some 404 errors)
        prod_id = random.choice([1, 2, 3, 4, 999])
        httpx.get(f"{GATEWAY_URL}/api/v1/products/products/{prod_id}", timeout=3.0)
        
        # 3. Log in validations (Successful admin vs failing user logins)
        username = random.choice(["admin", "invalid_operator", "test_devops"])
        password = "password" if username == "admin" else "wrong"
        httpx.post(f"{GATEWAY_URL}/api/v1/auth/login", json={"username": username, "password": password}, timeout=3.0)
        
        # 4. Order creation (GET product details -> POST order checkout -> Pay transactional logs)
        target_prod = random.choice([1, 2, 3, 99])
        httpx.post(f"{GATEWAY_URL}/api/v1/orders/orders", json={"product_id": target_prod, "quantity": random.randint(1, 3)}, timeout=3.0)
        
        print("Completed one lifecycle traffic iteration.")
    except Exception as e:
        print(f"Request failed: {str(e)}")
        
    time.sleep(random.uniform(0.1, 1.0))
