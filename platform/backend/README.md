# Platform Backend Engine

## Overview
This is the API backend core engine of the DevOps Nexus platform. It exposes REST endpoints managing Kubernetes deployment tasks and aggregating system telemetries.

## Directory Layout
* `app/core/`: Global configurations (`settings.py`) and loggers (`logging.py`).
* `app/middleware/`: ID tracing, exceptions interceptors, and CORS settings.
* `app/routers/`: Version controllers and liveness health checks.
* `app/schemas/`: Validation models defining response formats.
* `tests/`: Integration specs verifying endpoints.

## Startup
To run the server locally:
1. Initialize environment properties:
   ```bash
   cp ../../.env.example .env
   ```
2. Start the Uvicorn runtime:
   ```bash
   poetry install
   poetry run uvicorn app.main:app --reload
   ```

## API Docs URL
* **Swagger Interface:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Portal:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Testing
Run pytest from the backend folder:
```bash
poetry run pytest
```
