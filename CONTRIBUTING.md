# Contributing to DevOps Nexus

Thank you for your interest in contributing to DevOps Nexus! We welcome all contributions, including bug fixes, feature proposals, documentation updates, and operational templates.

As an open-source GitOps and Observability project, we maintain high standards of code clarity, documentation coverage, and automated validations.

---

## 🛠️ Getting Started

1. **Fork the Repository** on GitHub.
2. **Clone your Fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Microservice-Deployment-Monitoring-Platform.git
   cd Microservice-Deployment-Monitoring-Platform
   ```
3. **Set Up Pre-requisites:**
   Ensure you have Docker, Helm, and `kubectl` installed on your machine. Run the local initialization script:
   ```bash
   ./scripts/setup.sh
   ```

---

## 🌿 Branch Naming Guidelines

Use descriptive prefixes for your git branches:
* `feature/` for new platforms, microservices, or dashboard updates (e.g., `feature/ai-log-analyzer`).
* `bugfix/` for resolving open bugs or broken deployments (e.g., `bugfix/helm-ingress-port`).
* `docs/` for improvements in the `/docs` folder or markdown files (e.g., `docs/add-argocd-setup`).
* `refactor/` for restructuring existing files without introducing new behavior.

---

## 📝 Commit Messages

We encourage semantic commit messages:
* `feat: add prometheus metric scraper stub`
* `fix: correct order service Dockerfile stage`
* `docs: update deployment architecture overview`
* `chore: refresh package dependencies`

---

## 🚀 Pull Request Process

1. Create your branch from `main`.
2. Implement your changes. Ensure you include relevant tests in the service's `tests/` directory if modifying code.
3. Update the corresponding `README.md` file if updating folder structure, configurations, or operational steps.
4. Run scripts to verify syntax correctness.
5. Push your branch to GitHub and open a Pull Request against `main`.
6. Maintainers will review the code within 2-3 business days. Ensure all CI pipeline checks pass.

---

## ⚖️ Code Style Requirements

* **YAML Formatter:** All Kubernetes and Helm templates must use 2-space indentation.
* **Shell Scripts:** Use standard bash directives (`#!/usr/bin/env bash`), implement `-e` error exits where applicable, and write output using standard logging functions.
* **Markdown:** Always use standard Markdown style. Files, variables, or functions should be referenced using markdown links or backticks.
