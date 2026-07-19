# Changelog

All notable changes to the **DevOps Nexus** platform will be documented in this file. This project adheres to Semantic Versioning.

---

## [v1.0.0-rc1] - 2026-07-19

### Added
- **Intelligent Query Router:** Rule-based parser mapping operator queries to 24 telemetry categories.
- **Smart Tool Executor:** Strongly typed functions connecting directly to live cluster APIs (`get_pods()`, `get_deployments()`, `get_cluster_health()`, etc.).
- **Tool-First LLM Bypass:** Intercepts direct status queries (e.g. *"how many pods"*, *"show nodes"*) and executes platform APIs directly to respond at 100% telemetry accuracy without LLM completions overhead.
- **Observability Telemetry Integration:** Active Prometheus HTTP gauges queries and Loki log streams ranges scrapper.
- **Incident Analysis Engine:** Custom validation heuristics scanner to identify `CrashLoopBackOff`, replica discrepancies, CPU bottlenecks, and GitOps sync drifts.
- **Conversational Memory Manager:** Thread-safe Redis/Cache session storage tracking lookup memory and resolving pronouns (e.g. *"restart it"* maps to previously triaged service).
- **JWT Auth & RBAC controls:** HS256-compliant JWT authentication with secure HTTP-Only cookies. RBAC checkers blocking scaling, rollout restarts, and GitOps syncs for Developer and Read Only roles.
- **SRE Latency Metrics:** Custom registry tracking roundtrip durations, error ratios, cache hits, AI completions, and tool execution times.
- **Dashboard Enhancements:** Premium dark glassmorphism layout, streaming loaders, suggested actions rollout triggers, user profiles, and route protection elements.

### Fixed
- Cache TTL expiration logic to resolve permanent 429 rate limit exceptions on local in-memory fallback.
- CORS middleware ordering bugs preventing headers on backend errors responses.
- ArgoCD autovacuum auth session fetching credentials programmatically from Kubernetes Secrets.

---

[v1.0.0-rc1]: https://github.com/Manikandan23005/Microservice-Deployment-Monitoring-Platform/releases/tag/v1.0.0-rc1
