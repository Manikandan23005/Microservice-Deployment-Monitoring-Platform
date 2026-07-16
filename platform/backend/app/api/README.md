# API Endpoint Controllers

## Purpose
This directory houses FastAPI routers and route handlers mapping HTTP paths to business logic services.

## Planned Modules
* `deployments.py`: Routes for triggering deployments, listing states, and rolling back releases.
* `kubernetes.py`: Routes for fetching cluster resources, pod lists, and service states.
* `telemetry.py`: Routes for fetching Prometheus metrics and Loki aggregated logs.
* `ai.py`: Routes for managing AI analyzer reports and interactive operational chats.
