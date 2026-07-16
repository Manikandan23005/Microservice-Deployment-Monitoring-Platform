# Installation Guide

This document describes how to set up, configure, and run the **DevOps Nexus** platform.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
* **Docker Engine** (v24.0+) & Docker Compose
* **Python** (v3.11) & **Poetry** (if running the platform backend locally without containers)
* **kubectl** & **Helm** (for deployment tasks targetable by the platform)

---

## 🚀 Running the Platform via Docker Compose

The easiest way to initialize DevOps Nexus locally is via Docker Compose. This starts the React frontend, FastAPI backend, a Redis cache, and a local Ollama AI model service.

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```
Open `.env` and fill in API keys if you plan to use remote services (like OpenAI/Groq). By default, local Ollama is selected.

### Step 2: Start Containers
```bash
docker compose up --build -d
```

### Step 3: Access Platform Portals
* **FastAPI Backend Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **React Dashboard Interface:** [http://localhost:3000](http://localhost:3000)

---

## 🐍 Running the Platform Backend Locally (Optional)

If you prefer to run the FastAPI server directly on your host machine for development:

### Step 1: Install Poetry Dependencies
```bash
# Install packages defined in pyproject.toml
poetry install
```

### Step 2: Activate Environment
```bash
poetry shell
```

### Step 3: Run FastAPI Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
FastAPI will scan environment properties from your local `.env` file and look for cluster configurations at `~/.kube/config`.
