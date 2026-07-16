# AI Engine Architecture

## Overview
This document outlines the architecture for the AI Incident Aggregator module.

## Triage Flow

```
 +------------------------+      +------------------------+      +------------------------+
 |  1. Alert Received     |=====>|  2. Query Loki Logs     |=====>|  3. Fetch K8s Events   |
 |  (Alertmanager Hook)   |      |  (LogQL aggregation)   |      |  (describe pod stubs)  |
 +------------------------+      +------------------------+      +------------------------+
                                                                             ||
                                                                             \/
 +------------------------+      +------------------------+      +------------------------+
 |  6. Return Remediation |<=====|  5. Context Synthesis  |<=====|  4. Fetch Git Commits  |
 |  (Nexus Dashboard UI)  |      |  (LLM Prompt Payload)  |      |  (recent code updates) |
 +------------------------+      +------------------------+      +------------------------+
```

## Integration Details
* **Webhook Endpoint:** Exposes `/alerts` endpoint to listen to Alertmanager payloads.
* **Vector Store Integration:** Uses a vector database (e.g. pgvector or Qdrant) to index historic incidents and resolution playbooks.
* **LLM Engine:** Integrates with local LLM models (e.g., Ollama/Llama-3) or enterprise APIs (e.g., Gemini API) to synthesize diagnostics reports.
