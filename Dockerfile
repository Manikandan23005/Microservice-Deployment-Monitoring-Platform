# --- Build Stage ---
FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1

ENV PATH="$POETRY_HOME/bin:$PATH"

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y curl build-essential \
    && curl -sSL https://install.python-poetry.org | python3 -

COPY pyproject.toml poetry.lock* ./
COPY platform/backend/README.md ./platform/backend/
COPY platform/shared ./platform/shared

# Install runtime dependencies only
RUN poetry install --only main --no-root

# --- Runtime Stage ---
FROM python:3.11-slim AS runner
WORKDIR /app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/platform:/app"

COPY --from=builder /app/.venv /app/.venv
COPY pyproject.toml ./
COPY platform/backend/app ./app
COPY platform/shared ./platform/shared

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
