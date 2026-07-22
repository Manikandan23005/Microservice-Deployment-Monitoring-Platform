# 🧠 DevOps Nexus v1.0 — Nexus AI Autonomous Investigation Engine

This document details the architecture, reasoning pipeline, and execution workflows of **Nexus AI** in **DevOps Nexus v1.0**.

---

## 🤖 1. Nexus AI Architecture & Investigation Pipeline

```
[ User Query / Right-Click Action ]
                 |
                 v
+----------------------------------+
|  Autonomous AIOps Copilot Drawer |  (Ctrl + Shift + K)
+----------------+-----------------+
                 |
                 v
+----------------------------------+
|  Reasoning Synthesis Engine      |  (app/services/ai_agent_pipeline.py)
+----------------+-----------------+
                 |
    +------------+------------+
    |                         |
    v                         v
[ K8s Pod Telemetry ]   [ Prometheus Metrics & Loki Error Logs ]
    |                         |
    +------------+------------+
                 |
                 v
+----------------------------------+
| Root Cause Diagnostic Report     |  - Incident Type & Severity
| - Verified Evidence              |  - Evidence Quality Badge (HIGH/MED)
| - Supporting Telemetry Traces    |  - Preventive Recommendation
+----------------+-----------------+
                 |
                 v
+----------------------------------+
| Multi-Step Execution Plan        |  - Step Timeline with Connector Dots
| - Risk Level & Downtime Est.     |  - High-Risk 'CONFIRM' Guardrail
| - Post-Remediation Verification  |  - Automated 100% Health Check
+----------------------------------+
```

---

## 🛠️ 2. Core Capabilities

1. **Prompt Synthesis Engine**: Grounded incident investigation synthesizing K8s container restarts, Prometheus metric anomalies, and Loki error logs.
2. **Evidence Quality Classification**: Assigns color-coded evidence badges (`HIGH`, `MEDIUM`, `LOW`) based on real-time empirical telemetry.
3. **Execution Plan Timeline**: Interactive step timeline with live execution indicators and automated post-remediation health verification.
4. **Safety Authorization Guardrail**: High-risk remediation plans require the operator to type `CONFIRM` before authorization.

---

## 🔗 Related Documentation
- 🏗️ [03-system-architecture.md](03-system-architecture.md) — System architecture
- 📊 [06-observability.md](06-observability.md) — Telemetry & log pipeline
- 🛡️ [12-rbac-security.md](12-rbac-security.md) — Security guardrails
