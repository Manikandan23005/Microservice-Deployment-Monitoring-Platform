# Notification Service

## Overview
This service processes notification dispatches (e.g. order confirmation emails, system status alerts) via SMTP or SMS APIs.

## Development Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --port 8005
```
