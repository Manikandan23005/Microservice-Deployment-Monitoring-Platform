# Installation Guide

## Overview
This document guides administrators and developers through installing the core components of the DevOps Nexus platform.

## Goals
- Detail multi-environment platform installation strategies (Local Docker Compose, Staging, and Production Kubernetes).
- Establish value override configurations for Poetry dependency structures.

## Implementation Plan
1. **Local Compose Sandbox Installation:**
   - Copy `.env.example` to `.env` in the root workspace.
   - Run `docker compose up --build -d` to spin up React UI, FastAPI, Redis cache, and Ollama models.
2. **Local Python Poetry Installation (Development):**
   - Run `poetry install` in the root workspace directory.
   - Boot uvicorn using `poetry run uvicorn app.main:app --reload` on port 8000.
3. **Kubernetes Platform Installation:**
   - Package the backend using the root `Dockerfile`.
   - Deploy values configurations using Helm templates.

## Future Work
* **Automatic Database Migrations:** Integrate automatic migrations via Alembic inside the FastAPI startup events context.
* **Pluggable Local LLM Models script:** Build automation scripts to pull Ollama models (e.g. `llama3`) during container initialization.

## References
* [Poetry Package Manager](https://python-poetry.org/)
* [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
