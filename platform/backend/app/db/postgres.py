# --- PostgreSQL Database Client & ORM connection ---
import os
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.logging import logger

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "devops_nexus")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

Base = declarative_base()

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True)
    timestamp = Column(String(64), nullable=False)
    username = Column(String(128), nullable=False)
    role_name = Column(String(64), nullable=False)
    workspace = Column(String(64), default="cluster")
    namespace = Column(String(128), nullable=True)
    application = Column(String(128), nullable=True)
    action = Column(String(128), nullable=False)
    target_resource = Column(String(256), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    status = Column(String(64), default="SUCCESS")
    client_ip = Column(String(64), default="127.0.0.1")
    user_agent = Column(String(256), default="Web-Dashboard")
    ai_assisted = Column(Boolean, default=False)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    username = Column(String(128), unique=True, nullable=False)
    email = Column(String(256), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(64), nullable=False)
    status = Column(String(64), default="ACTIVE")
    created_at = Column(String(64), nullable=False)
    last_login = Column(String(64), nullable=True)

class ClusterModel(Base):
    __tablename__ = "clusters"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    description = Column(String(256), nullable=True)
    environment = Column(String(64), nullable=False, default="Development")
    provider = Column(String(64), nullable=False, default="Minikube")
    context_name = Column(String(128), nullable=False)
    kubeconfig_content = Column(Text, nullable=True)
    api_server = Column(String(256), nullable=True)
    authentication_type = Column(String(64), default="Kubeconfig")
    default_namespace = Column(String(128), default="devops-nexus-prod")
    status = Column(String(64), default="CONNECTED")
    is_default = Column(Boolean, default=False)
    argocd_url = Column(String(256), nullable=True)
    argocd_token = Column(String(512), nullable=True)
    prometheus_url = Column(String(256), nullable=True)
    loki_url = Column(String(256), nullable=True)
    created_at = Column(String(64), nullable=False)
    updated_at = Column(String(64), nullable=False)


try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("Successfully connected to PostgreSQL and initialized tables.")
    postgres_available = True
except Exception as e:
    logger.warning(f"PostgreSQL connection initialization failed: {str(e)}")
    engine = None
    SessionLocal = None
    postgres_available = False
