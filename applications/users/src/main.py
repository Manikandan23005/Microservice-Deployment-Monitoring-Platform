# --- Users Service API Skeleton ---
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Users Service", version="0.1.0")

class UserProfile(BaseModel):
    username: str
    email: str
    full_name: str

@app.get("/healthz")
def health_check():
    return {"status": "healthy", "service": "users"}

@app.get("/users/{username}")
def get_user_profile(username: str):
    # TODO: Implement database lookup for user profile records
    if username == "admin":
        return {
            "username": "admin",
            "email": "admin@devopsnexus.io",
            "full_name": "DevOps Nexus Administrator"
        }
    raise HTTPException(status_code=404, detail="User not found")
