# Autonomous AIOps Assistant Guide

## Overview

The **AIOps Assistant** in DevOps Nexus is an autonomous SRE investigation engine. It goes beyond simple chatbot prompting by formulating diagnostic plans, executing parallel telemetry queries, detecting missing evidence, correlating cross-domain signals, and calculating deterministic confidence scores.

---

## 🧠 SRE Investigation Workflow

```mermaid
flowchart TD
    Query["User Query"] --> Intent["1. Intent Classification"]
    Intent --> Plan["2. Investigation Planner"]
    Plan --> Schedule["3. Parallel Tool Scheduler"]
    Schedule --> Execute["4. K8s / ArgoCD / Prom / Loki Queries"]
    Execute --> Graph["5. Evidence Graph Builder"]
    Graph --> Missing["6. Missing Evidence Detector"]
    Missing --> Correlate["7. Correlation Engine"]
    Correlate --> Confidence["8. Confidence Engine (0%-100%)"]
    Confidence --> Reasoning["9. LLM Reasoning & Synthesis"]
    Reasoning --> Response["10. Grounded Diagnostic Report"]
```

---

## 🔑 Key Diagnostic Concepts

* **Tool-First Execution**: The AI executes tool queries against live cluster infrastructure before formulating diagnostic explanations.
* **Evidence Correlation**: Automatically correlates container exit codes (`Exit 137` OOMKilled), image pull errors, deployment sync drifts, and node memory pressure.
* **Confidence Scoring**: Computes mathematical confidence scores based on evidence completeness, tool success rates, and correlation strength.
* **Zero-Hallucination Assurance**: Every reported fact or metric must cite a specific line in the Evidence Graph.
