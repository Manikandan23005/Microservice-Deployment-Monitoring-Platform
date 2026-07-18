import os
import json

SERVICES = ["auth", "users", "products", "orders", "payment", "notification"]
NODE_SERVICES = ["gateway", "frontend"]

ROOT_DIR = "/home/satoru/Projects/Microservice-Deployment-Monitoring-Platform"

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content.strip())
    print(f"Wrote: {path}")

# ==========================================
# 1. PYTHON BACKEND SERVICES SOURCE CODE
# ==========================================
TELEMETRY_PYTHON = """
import time
import os
import logging
import json
from fastapi import Request, Response
from prometheus_client import generate_latest, Counter, Histogram, CONTENT_TYPE_LATEST

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": self.formatTime(record, "%Y-%m-%d %H:%M:%S"),
            "service": os.getenv("SERVICE_NAME", "unknown-service"),
            "level": record.levelname,
            "request_id": getattr(record, "request_id", "none"),
            "message": record.getMessage()
        }
        if record.exc_info:
            log_obj["error"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

logger = logging.getLogger("microservice")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setFormatter(JSONFormatter())
    logger.addHandler(ch)

REQUEST_COUNT = Counter(
    "http_requests_total", 
    "Total HTTP Requests", 
    ["method", "endpoint", "http_status"]
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds", 
    "HTTP Request Latency", 
    ["method", "endpoint"]
)

def instrument_app(app, service_name: str):
    os.environ["SERVICE_NAME"] = service_name
    
    @app.middleware("http")
    async def log_and_metrics_middleware(request: Request, call_next):
        start_time = time.time()
        request_id = request.headers.get("X-Request-ID", "none")
        
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            logger.error(f"Request failed: {str(e)}", exc_info=True, extra={"request_id": request_id})
            status_code = 500
            raise e
        finally:
            duration = time.time() - start_time
            endpoint = request.url.path
            
            if endpoint not in ["/health", "/ready", "/metrics", "/healthz", "/version"]:
                REQUEST_COUNT.labels(method=request.method, endpoint=endpoint, http_status=status_code).inc()
                REQUEST_LATENCY.labels(method=request.method, endpoint=endpoint).observe(duration)
                
            logger.info(
                f"{request.method} {request.url.path} responded {status_code} in {duration:.4f}s", 
                extra={"request_id": request_id}
            )
            
        return response

    @app.get("/health")
    def health():
        return {"status": "healthy", "service": service_name}

    @app.get("/ready")
    def ready():
        return {"status": "ready", "service": service_name}

    @app.get("/version")
    def version():
        return {"version": "0.1.0", "service": service_name}

    @app.get("/metrics")
    def metrics():
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
"""

for svc in SERVICES:
    write_file(f"{ROOT_DIR}/applications/{svc}/src/telemetry.py", TELEMETRY_PYTHON)

# Auth src/main.py
write_file(f"{ROOT_DIR}/applications/auth/src/main.py", """
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
""")

# Users src/main.py
write_file(f"{ROOT_DIR}/applications/users/src/main.py", """
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
""")

# Products src/main.py
write_file(f"{ROOT_DIR}/applications/products/src/main.py", """
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
""")

# Orders src/main.py
write_file(f"{ROOT_DIR}/applications/orders/src/main.py", """
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from .telemetry import instrument_app

app = FastAPI(title="Orders Service")
instrument_app(app, "orders-service")

class OrderRequest(BaseModel):
    product_id: int
    quantity: int

@app.post("/orders")
def create_order(request: OrderRequest):
    try:
        response = httpx.get(f"http://products-service:8000/products/{request.product_id}", timeout=2.0)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid product ID")
        product = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reach products service: {str(e)}")
        
    total_price = product["price"] * request.quantity
    
    try:
        pay_resp = httpx.post("http://payment-service:8000/pay", json={"amount": total_price}, timeout=2.0)
        payment_status = pay_resp.json().get("status", "failed")
    except Exception as e:
        payment_status = "failed"
        
    try:
        httpx.post("http://notification-service:8000/notify", json={"message": f"Order created. Status: {payment_status}"}, timeout=2.0)
    except Exception:
        pass
        
    if payment_status != "success":
        raise HTTPException(status_code=402, detail="Payment verification failed")
        
    return {"order_status": "created", "total_price": total_price}
""")

# Payment src/main.py
write_file(f"{ROOT_DIR}/applications/payment/src/main.py", """
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
from .telemetry import instrument_app

app = FastAPI(title="Payment Service")
instrument_app(app, "payment-service")

class PaymentRequest(BaseModel):
    amount: float

@app.post("/pay")
def pay(request: PaymentRequest):
    if random.random() < 0.1:
        raise HTTPException(status_code=500, detail="Payment gateway connection timeout")
    return {"status": "success", "transaction_id": f"tx-{random.randint(1000, 9999)}"}
""")

# Notification src/main.py
write_file(f"{ROOT_DIR}/applications/notification/src/main.py", """
from fastapi import FastAPI
from pydantic import BaseModel
from .telemetry import instrument_app

app = FastAPI(title="Notification Service")
instrument_app(app, "notification-service")

class NotifyRequest(BaseModel):
    message: str

@app.post("/notify")
def notify(request: NotifyRequest):
    return {"status": "dispatched", "notification_sent": request.message}
""")

# ==========================================
# 2. PYTHON PACKAGING (Poetry configuration)
# ==========================================
for svc in SERVICES:
    toml = f"""
[tool.poetry]
name = "{svc}-service"
version = "0.1.0"
description = "FastAPI {svc} microservice"
authors = ["Nexus Team <support@devopsnexus.io>"]
readme = "README.md"

[tool.poetry.dependencies]
python = ">=3.11,<3.15"
fastapi = "^0.110.0"
uvicorn = "^0.28.0"
pydantic = "^2.6.4"
prometheus-client = "^0.20.0"
httpx = "^0.27.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"""
    write_file(f"{ROOT_DIR}/applications/{svc}/pyproject.toml", toml)
    reqs = "fastapi==0.110.0\nuvicorn==0.28.0\npydantic==2.6.4\nprometheus-client==0.20.0\nhttpx==0.27.0\n"
    write_file(f"{ROOT_DIR}/applications/{svc}/requirements.txt", reqs)

# ==========================================
# 3. DOCKER PACKAGING (Dockerfiles & ignores)
# ==========================================
DOCKER_PYTHON = """
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim AS runner
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
ENV PORT=8000
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

for svc in SERVICES:
    write_file(f"{ROOT_DIR}/applications/{svc}/Dockerfile", DOCKER_PYTHON)
    write_file(f"{ROOT_DIR}/applications/{svc}/.dockerignore", "__pycache__/\n*.pyc\n.venv/\npoetry.lock\npyproject.toml\n")

# ==========================================
# 4. NODE SERVICES SOURCE CODE
# ==========================================
write_file(f"{ROOT_DIR}/applications/gateway/package.json", """
{
  "name": "ecommerce-gateway",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "http-proxy-middleware": "^3.0.0",
    "prom-client": "^15.1.0"
  }
}
""")

write_file(f"{ROOT_DIR}/applications/gateway/src/index.js", """
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 8080;

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const requestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP Requests',
  labelNames: ['method', 'endpoint', 'http_status'],
  registers: [register]
});

const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP Request Latency',
  labelNames: ['method', 'endpoint'],
  registers: [register]
});

app.use((req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || 'none';
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    if (req.path !== '/metrics' && req.path !== '/health' && req.path !== '/ready') {
      requestCounter.labels(req.method, req.path, res.statusCode).inc();
      requestDuration.labels(req.method, req.path).observe(duration);
    }
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'gateway',
      level: 'INFO',
      request_id: requestId,
      message: `${req.method} ${req.path} responded ${res.statusCode} in ${duration.toFixed(4)}s`
    }));
  });
  next();
});

app.use('/api/v1/auth', createProxyMiddleware({ target: 'http://auth-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/auth': ''} }));
app.use('/api/v1/users', createProxyMiddleware({ target: 'http://users-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/users': ''} }));
app.use('/api/v1/products', createProxyMiddleware({ target: 'http://products-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/products': ''} }));
app.use('/api/v1/orders', createProxyMiddleware({ target: 'http://orders-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/orders': ''} }));
app.use('/api/v1/payment', createProxyMiddleware({ target: 'http://payment-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/payment': ''} }));
app.use('/api/v1/notification', createProxyMiddleware({ target: 'http://notification-service:8000', changeOrigin: true, pathRewrite: {'^/api/v1/notification': ''} }));

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'gateway' }));
app.get('/ready', (req, res) => res.json({ status: 'ready', service: 'gateway' }));
app.get('/version', (req, res) => res.json({ version: '0.1.0', service: 'gateway' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`API Gateway proxy running on port ${PORT}`);
});
""")

write_file(f"{ROOT_DIR}/applications/gateway/Dockerfile", """
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY . .
EXPOSE 8080
ENV PORT=8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 CMD node -e "require('http').get('http://localhost:8080/health', (r) => { if (r.statusCode === 200) process.exit(0); else process.exit(1); })"
CMD ["npm", "start"]
""")
write_file(f"{ROOT_DIR}/applications/gateway/.dockerignore", "node_modules/\nnpm-debug.log\n")

# Frontend package.json
write_file(f"{ROOT_DIR}/applications/frontend/package.json", """
{
  "name": "ecommerce-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "prom-client": "^15.1.0"
  }
}
""")

# Frontend src/index.js
write_file(f"{ROOT_DIR}/applications/frontend/src/index.js", """
const express = require('express');
const path = require('path');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

app.use((req, res, next) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'frontend',
    level: 'INFO',
    message: `${req.method} ${req.path}`
  }));
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'frontend' }));
app.get('/ready', (req, res) => res.json({ status: 'ready', service: 'frontend' }));
app.get('/version', (req, res) => res.json({ version: '0.1.0', service: 'frontend' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Frontend service running on port ${PORT}`);
});
""")

# Frontend public index.html
write_file(f"{ROOT_DIR}/applications/frontend/src/public/index.html", """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DevOps Nexus Portal</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    h1 { color: #3b82f6; }
    .card { background: #1e293b; padding: 1.5rem; border-radius: 1rem; margin-top: 1rem; border: 1px border #334155; }
    button { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <h1>DevOps Nexus E-Commerce Portal</h1>
  <div class="card">
    <h3>Product Catalog</h3>
    <button onclick="loadProducts()">Fetch Products</button>
    <ul id="products-list" style="margin-top: 1rem;"></ul>
  </div>
  <script>
    async function loadProducts() {
      try {
        const res = await fetch('/api/v1/products/products');
        const data = await res.json();
        const list = document.getElementById('products-list');
        list.innerHTML = '';
        data.forEach(p => {
          const li = document.createElement('li');
          li.textContent = `${p.name} - $${p.price} (Stock: ${p.stock})`;
          list.appendChild(li);
        });
      } catch (e) {
        alert('Failed to load products: ' + e.message);
      }
    }
  </script>
</body>
</html>
""")

# Frontend Dockerfile
write_file(f"{ROOT_DIR}/applications/frontend/Dockerfile", """
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY . .
EXPOSE 3000
ENV PORT=3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 CMD node -e "require('http').get('http://localhost:3000/health', (r) => { if (r.statusCode === 200) process.exit(0); else process.exit(1); })"
CMD ["npm", "start"]
""")
write_file(f"{ROOT_DIR}/applications/frontend/.dockerignore", "node_modules/\nnpm-debug.log\n")


# ==========================================
# 5. HELM CHARTS FOR ALL 8 SERVICES
# ==========================================
ALL_APPS = ["auth", "users", "products", "orders", "payment", "notification", "gateway", "frontend"]

DEPLOYMENT_TPL = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.serviceName }}-service
  namespace: {{ .Release.Namespace }}
  labels:
    app: {{ .Values.serviceName }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.serviceName }}
  template:
    metadata:
      labels:
        app: {{ .Values.serviceName }}
    spec:
      serviceAccountName: {{ .Values.serviceName }}-sa
      containers:
      - name: {{ .Values.serviceName }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - containerPort: {{ .Values.containerPort }}
        envFrom:
        - configMapRef:
            name: {{ .Values.serviceName }}-config
        - secretRef:
            name: {{ .Values.serviceName }}-secret
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
        livenessProbe:
          httpGet:
            path: /health
            port: {{ .Values.containerPort }}
          initialDelaySeconds: 15
          periodSeconds: 15
        readinessProbe:
          httpGet:
            path: /ready
            port: {{ .Values.containerPort }}
          initialDelaySeconds: 10
          periodSeconds: 10
"""

SERVICE_TPL = """
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.serviceName }}-service
  namespace: {{ .Release.Namespace }}
  labels:
    app: {{ .Values.serviceName }}
spec:
  type: {{ .Values.service.type }}
  ports:
  - port: {{ .Values.service.port }}
    targetPort: {{ .Values.containerPort }}
  selector:
    app: {{ .Values.serviceName }}
"""

CONFIGMAP_TPL = """
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.serviceName }}-config
  namespace: {{ .Release.Namespace }}
data:
  ENVIRONMENT: {{ .Values.global.environment | quote }}
  LOG_LEVEL: "info"
"""

SECRET_TPL = """
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Values.serviceName }}-secret
  namespace: {{ .Release.Namespace }}
type: Opaque
data:
  API_KEY: {{ .Values.apiKey | default "mock-api-key" | b64enc | quote }}
"""

HPA_TPL = """
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Values.serviceName }}-hpa
  namespace: {{ .Release.Namespace }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Values.serviceName }}-service
  minReplicas: {{ .Values.hpa.minReplicas }}
  maxReplicas: {{ .Values.hpa.maxReplicas }}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: {{ .Values.hpa.targetCPU }}
"""

INGRESS_TPL = """
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Values.serviceName }}-ingress
  namespace: {{ .Release.Namespace }}
  annotations:
    {{- toYaml .Values.ingress.annotations | nindent 4 }}
spec:
  ingressClassName: {{ .Values.ingress.className }}
  rules:
  {{- range .Values.ingress.hosts }}
  - host: {{ .host }}
    http:
      paths:
      {{- range .paths }}
      - path: {{ .path }}
        pathType: {{ .pathType }}
        backend:
          service:
            name: {{ $.Values.serviceName }}-service
            port:
              number: {{ $.Values.service.port }}
      {{- end }}
  {{- end }}
{{- end }}
"""

SA_TPL = """
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ .Values.serviceName }}-sa
  namespace: {{ .Release.Namespace }}
"""

for app in ALL_APPS:
    write_file(f"{ROOT_DIR}/helm/{app}/templates/deployment.yaml", DEPLOYMENT_TPL)
    write_file(f"{ROOT_DIR}/helm/{app}/templates/service.yaml", SERVICE_TPL)
    write_file(f"{ROOT_DIR}/helm/{app}/templates/configmap.yaml", CONFIGMAP_TPL)
    write_file(f"{ROOT_DIR}/helm/{app}/templates/secret.yaml", SECRET_TPL)
    write_file(f"{ROOT_DIR}/helm/{app}/templates/hpa.yaml", HPA_TPL)
    write_file(f"{ROOT_DIR}/helm/{app}/templates/ingress.yaml", INGRESS_TPL)
    write_file(f"{ROOT_DIR}/helm/{app}/templates/serviceaccount.yaml", SA_TPL)

    chart_yaml = f"""
apiVersion: v2
name: {app}
description: Helm chart for {app} microservice
type: application
version: 0.1.0
appVersion: "0.1.0"
"""
    write_file(f"{ROOT_DIR}/helm/{app}/Chart.yaml", chart_yaml)

    port = 8080 if app == "gateway" else (3000 if app == "frontend" else 8000)
    
    values_dev = f"""
global:
  environment: "dev"
serviceName: "{app}"
replicaCount: 1
containerPort: {port}
image:
  repository: "{app}"
  tag: "latest"
  pullPolicy: "Never"
service:
  type: "ClusterIP"
  port: {port}
resources:
  limits:
    cpu: "200m"
    memory: "256Mi"
  requests:
    cpu: "50m"
    memory: "64Mi"
hpa:
  minReplicas: 1
  maxReplicas: 2
  targetCPU: 80
ingress:
  enabled: false
"""
    write_file(f"{ROOT_DIR}/helm/{app}/values.yaml", values_dev)
    write_file(f"{ROOT_DIR}/helm/{app}/values-dev.yaml", values_dev)
    
    values_qa = values_dev.replace('"dev"', '"qa"')
    write_file(f"{ROOT_DIR}/helm/{app}/values-qa.yaml", values_qa)
    
    values_prod = f"""
global:
  environment: "prod"
serviceName: "{app}"
replicaCount: 2
containerPort: {port}
image:
  repository: "{app}"
  tag: "latest"
  pullPolicy: "Never"
service:
  type: "ClusterIP"
  port: {port}
resources:
  limits:
    cpu: "500m"
    memory: "512Mi"
  requests:
    cpu: "100m"
    memory: "128Mi"
hpa:
  minReplicas: 2
  maxReplicas: 10
  targetCPU: 75
ingress:
  enabled: { "true" if app in ["gateway", "frontend"] else "false" }
  className: "nginx"
  annotations:
    kubernetes.io/ingress.class: "nginx"
  hosts:
    - host: "{app}.devopsnexus.prod"
      paths:
        - path: "/"
          pathType: "Prefix"
"""
    write_file(f"{ROOT_DIR}/helm/{app}/values-prod.yaml", values_prod)

# ==========================================
# 6. GITOPS ARGOCD APPLICATIONS Manifests
# ==========================================
for env in ["dev", "qa", "prod"]:
    os.makedirs(f"{ROOT_DIR}/gitops/argocd/{env}", exist_ok=True)
    for app in ALL_APPS:
        app_manifest = f"""
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: {app}-{env}
  namespace: argocd
spec:
  project: default
  source:
    repoURL: '/home/satoru/Projects/Microservice-Deployment-Monitoring-Platform'
    targetRevision: HEAD
    path: helm/{app}
    helm:
      valueFiles:
        - values-{env}.yaml
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: devops-nexus-{env}
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
"""
        write_file(f"{ROOT_DIR}/gitops/argocd/{env}/{app}-app.yaml", app_manifest)

print("All Sprint 12 microservices, packaging, Dockerfiles, Helm, and GitOps structures generated successfully!")
