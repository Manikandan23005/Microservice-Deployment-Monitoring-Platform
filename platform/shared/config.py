# --- Shared Platform Configurations Parser ---
from pydantic_settings import BaseSettings, SettingsConfigDict

class PlatformSettings(BaseSettings):
    # API Backend Server
    PORT: int = 8000
    LOG_LEVEL: str = "info"
    
    # Observability Stack
    PROMETHEUS_URL: str = "http://prometheus-service.devops-nexus.svc.cluster.local:9090"
    LOKI_URL: str = "http://loki-service.devops-nexus.svc.cluster.local:3100"
    
    # GitOps / ArgoCD
    ARGOCD_SERVER: str = "argocd-server.argocd.svc.cluster.local"
    ARGOCD_TOKEN: str = ""
    
    # AI Engine Settings
    AI_PROVIDER: str = "ollama"
    OLLAMA_HOST: str = "http://localhost:11434"
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    LMSTUDIO_HOST: str = "http://localhost:1234/v1"
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    
    # Caching
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings singleton
settings = PlatformSettings()
