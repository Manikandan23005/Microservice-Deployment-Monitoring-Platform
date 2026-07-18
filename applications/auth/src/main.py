from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .telemetry import instrument_app

app = FastAPI(title="Auth Service")
instrument_app(app, "auth-service")

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(request: LoginRequest):
    if request.username == "admin" and request.password == "password":
        return {"access_token": "mock-jwt-token-xyz", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Incorrect username or password")

@app.post("/verify")
def verify_token(token: str):
    if token == "mock-jwt-token-xyz":
        return {"active": True, "username": "admin", "role": "administrator"}
    return {"active": False}