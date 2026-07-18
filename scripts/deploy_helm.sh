#!/bin/bash
set -e

echo "Deploying microservices using Helm to namespace: devops-nexus-prod..."

SERVICES=("auth" "users" "products" "orders" "payment" "notification" "gateway" "frontend")

for svc in "${SERVICES[@]}"; do
  echo "Installing Helm chart for: $svc..."
  helm upgrade --install "$svc" "helm/$svc" \
    --namespace devops-nexus-prod \
    --create-namespace \
    --values "helm/$svc/values-prod.yaml"
done

echo "All Helm charts deployed successfully to devops-nexus-prod namespace!"
