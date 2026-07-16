# Orders Service

## Overview
This service processes e-commerce orders, managing order states (Pending, Paid, Shipped, Cancelled).

## Development Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --port 8003
```
