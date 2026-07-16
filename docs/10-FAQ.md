# Frequently Asked Questions (FAQ)

## Overview
This document addresses standard questions developers, security teams, and platform operators have regarding DevOps Nexus.

## Goals
- Address architectural design questions.
- Assist developers with microservice addition and helm customizations.
- Detail licensing constraints.

## Implementation Plan
1. **Can I use DevOps Nexus for non-Kubernetes workloads?**
   - DevOps Nexus is designed for containerized Kubernetes workloads. However, the CI/CD pipeline structures can output standard Docker images targetable to other container runtimes.
2. **How does the AI analyzer access cluster log data?**
   - The AI analyzer queries the Loki API endpoint directly, limiting its scope to security-cleared namespaces.
3. **Is DevOps Nexus production-ready?**
   - Version 0.1.0 is a project skeleton. Production deployment will be supported starting in the v1.0 releases.

## Future Work
* **Community FAQ Integration:** Add questions raised in GitHub Discussions directly into this document.

## References
* [DevOps Nexus GitHub Discussions](#)
* [Community Support Channel](#)
