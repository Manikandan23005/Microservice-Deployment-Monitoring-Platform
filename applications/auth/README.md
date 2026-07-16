# Authentication Service

## Overview
This is the authentication microservice. It manages user credentials, issues JWT tokens, and performs token validation for the API gateway.

## Development Setup
Set up Python environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Run application:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```
