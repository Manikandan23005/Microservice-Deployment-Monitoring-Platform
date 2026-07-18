#!/bin/bash
set -e

echo "Pointing shell to Minikube's Docker daemon..."
eval $(minikube -p minikube docker-env)

SERVICES=("auth" "users" "products" "orders" "payment" "notification" "gateway" "frontend")

for svc in "${SERVICES[@]}"; do
  echo "Building docker image for: $svc..."
  docker build -t "$svc:latest" "applications/$svc"
done

echo "All images compiled and loaded into Minikube's Docker daemon registry successfully!"
