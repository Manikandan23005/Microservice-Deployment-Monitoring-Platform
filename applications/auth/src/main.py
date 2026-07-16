# --- Auth Microservice API Skeleton ---
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI(title="Authentication Service", version="0.1.0")

class LoginRequest(BaseModel):
    username: str
    password: str

@app.get("/healthz")
def health_check():
    return {"status": "healthy", "service": "auth"}

@app.post("/login")
def login(request: LoginRequest):
    # TODO: Implement database lookup and password hashing validation
    if request.username == "admin" and request.password == "password":
        return {"access_token": "mock-jwt-token-xyz", "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password"
    )

@app.post("/verify")
def verify_token(token: str):
    # TODO: Decrypt and validate JWT token claims
    if token == "mock-jwt-token-xyz":
        return {"active": True, "username": "admin", "role": "administrator"}
    return {"active": False}
