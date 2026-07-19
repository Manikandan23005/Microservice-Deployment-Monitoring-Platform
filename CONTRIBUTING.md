# Contributing to DevOps Nexus

Thank you for your interest in contributing to DevOps Nexus! We welcome issues, PRs, and suggestions to make this platform the best AIOps IDP for Kubernetes and GitOps workflows.

---

## 🛠️ Developer Setup Guide

### Backend (FastAPI)
1. Navigate to backend:
   ```bash
   cd platform/backend
   ```
2. Install dependencies using Poetry:
   ```bash
   poetry install
   ```
3. Run backend server:
   ```bash
   poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend (React + TS + Vite)
1. Navigate to frontend:
   ```bash
   cd platform/frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing Policy
Always run unit tests before submitting a PR:
```bash
poetry run pytest
```
Verify that the Vite static bundle compiles cleanly with 0 TypeScript/ESLint warnings:
```bash
npm run build
```

---

## 📜 Pull Request Guidelines
1. Fork the repository and create your feature branch (`git checkout -b feature/amazing-feature`).
2. Implement clean code following `black` and `ruff` guidelines.
3. Commit your changes (`git commit -m 'feat: add support for Y'`).
4. Ensure all unit and integration tests pass successfully.
5. Push to the branch and open a PR!
