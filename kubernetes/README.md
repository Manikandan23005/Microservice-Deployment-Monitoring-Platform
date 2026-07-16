# Kubernetes Resource Manifests

## Overview
This directory contains raw Kubernetes manifest skeletons for deployable components of DevOps Nexus.

## Structure
* `namespace.yaml`: System namespace container definition.
* `deployment.yaml` / `service.yaml`: Pod topology and routing definitions.
* `ingress.yaml`: Ingress controller routing configuration mapping rules.
* `configmap.yaml` / `secret.example.yaml`: Environment values injection.
* `serviceaccount.yaml` / `role.yaml` / `rolebinding.yaml`: RBAC permission parameters.
* `networkpolicy.yaml`: Pod network isolation rules.
* `hpa.yaml`: Horizontal scaling limits.
