# DevOps Nexus Project Roadmap

This document outlines the planned future enhancements and milestones for the **DevOps Nexus** platform.

---

## 🗺️ Milestone Releases & Timeline

### Phase 1: Security Hardening & Session Offloads (Current)
* **Goal:** Release Candidate 1 (RC1) stabilization.
* **Scope:** Completed JWT credentials authentication, RBAC policy checks, SRE latency tracking middleware, and Redis-backed session management caches.

### Phase 2: Multi-Cluster Management & Network Mesh Visualization (Q3 2026)
* **Scope:**
  - Multi-Kubeconfig contexts switcher to orchestrate multiple Kubernetes clusters from a single panel.
  - Interactive network topologies map using Loki logs correlation and service mesh queries (e.g. Istio mesh traces).
  - Grafana dashboard embeds inside metrics views.

### Phase 3: Autonomous Incident Self-Healing (Q4 2026)
* **Scope:**
  - Pluggable Slack/Microsoft Teams alerting notification hooks.
  - AI auto-mitigation option: allowing the AIOps engine to automatically scale, roll back, or reboot pods based on pre-approved playbooks and thresholds without human validation.
  - Direct integration with vault services (e.g. HashiCorp Vault) for credential storage.
