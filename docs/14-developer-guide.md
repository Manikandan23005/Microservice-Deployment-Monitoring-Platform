# 💻 DevOps Nexus v1.0 — Developer Guide

Welcome to the **DevOps Nexus Developer Guide**. This document provides instructions for local development, frontend design system customization, testing, and contributions.

---

## 🛠️ 1. Local Development Setup

### Backend (FastAPI Async)
```bash
# Install dependencies via Poetry
poetry install

# Start FastAPI backend development server
cd platform/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (React + TypeScript + Vite)
```bash
# Install Node dependencies
cd platform/frontend
npm install

# Start Vite frontend development server
npm run dev
```

---

## 🎨 2. Enterprise Design System & Tokens

The frontend uses a centralized design system:
- **Design Tokens (`platform/frontend/src/theme/designTokens.ts`)**: Colors, status chip presets, typography tokens, animation ease.
- **Design System CSS (`platform/frontend/src/styles/design-system.css`)**: Elevation shadows, `@keyframes shimmer`, font imports (Inter, Fira Code).

### Key Components
- `<EnterpriseTable />`: Generic sortable table with sticky headers and pagination.
- `<SkeletonLoader />`: Shimmer loaders for tables, cards, charts, and lists.
- `<EnterpriseEmptyState />`: Contextual empty state with action buttons.
- `<CommandPalette />`: `Ctrl + K` spotlight search modal.

---

## 🧪 3. Running Test Suites

```bash
# Run 30 backend Pytest test cases
./poetry-venv/bin/poetry run pytest

# Verify TypeScript build
cd platform/frontend && npm run build
```

---

## 🔗 Related Documentation
- 🏗️ [03-system-architecture.md](03-system-architecture.md) — System architecture
- 🔌 [11-api-reference.md](11-api-reference.md) — REST API specification
- 🔧 [15-administrator-guide.md](15-administrator-guide.md) — Operations guide
