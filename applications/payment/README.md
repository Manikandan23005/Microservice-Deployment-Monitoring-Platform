# Payment Service

## Overview
This service interfaces with external payment processors (e.g. Stripe, PayPal) and manages transaction states.

## Development Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --port 8004
```
