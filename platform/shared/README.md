# Platform Shared Module

## Purpose
This directory contains code and schema structures that are shared across the DevOps Nexus core platform. It houses unified configuration parsers, global constants, and reusable validation models.

## Structure
* `config.py`: Dynamic settings loader pulling configurations from environment scopes.
* `models.py`: Shared Pydantic data schemas representing cluster components (pods, nodes, deployments) and API responses.
