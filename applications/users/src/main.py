from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .telemetry import instrument_app

app = FastAPI(title="Users Service")
instrument_app(app, "users-service")

class UserProfile(BaseModel):
    username: str
    email: str
    full_name: str

@app.get("/users/{username}")
def get_user_profile(username: str):
    if username == "admin":
        return {
            "username": "admin",
            "email": "admin@devopsnexus.io",
            "full_name": "DevOps Nexus Administrator"
        }
    raise HTTPException(status_code=404, detail="User not found")