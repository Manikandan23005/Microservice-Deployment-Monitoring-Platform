# Kubernetes Cluster Manifests Guide

## Overview
This document guides developers and platform engineers on the structure and configurations of Kubernetes manifests defined under `/kubernetes` and `/helm`.

## Goals
- Establish rules for writing resource limits (CPU/Memory requests and limits).
- Document ingress rules, routing mappings, and SSL certificate annotations.
- Provide templates for Role-Based Access Control (RBAC) and network isolation.

## Implementation Plan
1. **Application Deployment Topology:**
   - Define a single Namespace template (`namespace.yaml`).
   - Standardize deployments with healthy liveness/readiness probes.
2. **Access Control (RBAC):**
   - ServiceAccount configurations (`serviceaccount.yaml`).
   - Define Roles for cluster resource reads and Bindings mapping to ServiceAccounts.
3. **Network Isolation:**
   - Apply `networkpolicy.yaml` to restrict egress/ingress routes (e.g. only gateway can hit auth directly).

## Future Work
* **Network Policies Enforcement:** Fully lock down namespaces so only monitored paths are open.
* **Auto-Scaling Optimization:** Refine Horizontal Pod Autoscaler (HPA) targets using custom metrics (e.g., Request Rate) instead of raw CPU/Memory metrics.

## References
* [Kubernetes Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
* [Kubernetes RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
