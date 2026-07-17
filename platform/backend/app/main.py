# --- DevOps Nexus Core Platform API Backend ---
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# pyrefly: ignore [missing-import]
from app.core.settings import settings
from app.core.logging import setup_logging, RequestLoggingMiddleware
from app.middleware import RequestIDMiddleware, ProcessingTimeMiddleware, GlobalExceptionMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.routers import root_router, health_router, version_router
from app.routers.k8s import router as k8s_router
from app.routers.monitoring import router as monitoring_router
from app.routers.gitops import router as gitops_router
from app.routers.ai import router as ai_router

# Setup logger configurations on startup
setup_logging()

# Initialize FastAPI application
app = FastAPI(
    title="Microservice Deployment & Monitoring Platform",
    description="Unified DevOps Nexus Core REST API Engine.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# 1. CORS Middlewares Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Load from environment settings in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Register Custom Platform Middlewares (Execution runs bottom-to-top)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(ProcessingTimeMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(GlobalExceptionMiddleware)

# 3. Mount Endpoint Routers
app.include_router(root_router, tags=["Root"])
app.include_router(health_router, tags=["Probes"])
app.include_router(version_router, tags=["Version"])
app.include_router(k8s_router, tags=["Kubernetes"])
app.include_router(monitoring_router, tags=["Observability"])
app.include_router(gitops_router, tags=["GitOps"])
app.include_router(ai_router, tags=["AI Assistant"])
