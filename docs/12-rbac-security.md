# 🛡️ DevOps Nexus v1.0 — RBAC & Security Guide

**DevOps Nexus v1.0** implements enterprise Role-Based Access Control (RBAC), JWT token authentication, immutable security audit logging, and GitOps lifecycle guardrails.

---

## 👥 1. Role Hierarchy

| Role | Permissions Overview | Intended Persona |
|------|----------------------|------------------|
| **Administrator** | Full platform control. Can register clusters, disconnect GitOps workloads, execute high-risk operations, and manage accounts. | Lead SRE / Platform Architect |
| **Platform Engineer** | Can scale workloads, restart rollouts, execute approved AI remediation plans, and trigger GitOps sync. | Senior DevOps / Platform Engineer |
| **DevOps Engineer** | Can trigger rolling restarts, sync GitOps apps, and execute approved remediation steps. | DevOps / Site Reliability Engineer |
| **Viewer** | Read-only access to metrics, logs, topologies, and AI investigation reports. Cannot modify workloads. | Developer / Security Auditor |

---

## 📊 2. Permission Matrix

| Operation | Administrator | Platform Engineer | DevOps Engineer | Viewer |
|-----------|---------------|-------------------|-----------------|--------|
| View Telemetry & Logs | ✓ | ✓ | ✓ | ✓ |
| View Nexus AI Diagnostics | ✓ | ✓ | ✓ | ✓ |
| Trigger GitOps Sync | ✓ | ✓ | ✓ | ✗ |
| Restart Deployment Rollout | ✓ | ✓ | ✓ | ✗ |
| Scale Deployment Replicas | ✓ | ✓ | ✗ | ✗ |
| Temporary Pod Delete | ✓ | ✓ | ✗ | ✗ |
| Disconnect GitOps Control | ✓ | ✗ | ✗ | ✗ |
| Permanent Delete Workload | ✓ | ✗ | ✗ | ✗ |
| Register New Cluster | ✓ | ✗ | ✗ | ✗ |

---

## 🔒 3. Security Guardrails

1. **JWT Auth Token Verification**: All backend API requests require `Authorization: Bearer <token>` signed with HS256 secret.
2. **GitOps Protection**: Workloads marked as `🟢 GitOps Managed` are locked against accidental permanent deletion.
3. **High-Risk Remediation Approval**: High-risk AI remediation steps require typing `CONFIRM` before execution authorization.
4. **Audit Log Persistence**: Every mutation operation (restart, scale, sync, delete) is saved to the PostgreSQL `audit_logs` table.

---

## 🔗 Related Documentation
- 🔌 [11-api-reference.md](11-api-reference.md) — Auth API specification
- 🔀 [13-gitops-cluster-registry.md](13-gitops-cluster-registry.md) — GitOps guardrails
- 🔧 [15-administrator-guide.md](15-administrator-guide.md) — Account management
