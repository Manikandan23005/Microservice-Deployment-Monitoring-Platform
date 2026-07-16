# Infrastructure Automation Scripts

## Overview
This directory contains utility shell scripts used to initialize, configure, deploy, backup, and monitor DevOps Nexus environments.

## File Index
* `setup.sh`: Sets up namespaces, local directories, and configmaps.
* `cleanup.sh`: Wipes active deployments and namespaces.
* `deploy.sh`: Runs Helm upgrades on target environment inputs.
* `rollback.sh`: Performs Helm rollbacks.
* `backup.sh` / `restore.sh`: Core state backup/recovery tools.
* `healthcheck.sh`: Verifies cluster connection and pods state.

## Executing Scripts
Ensure executable permissions are set:
```bash
chmod +x scripts/*.sh
```
Run target scripts:
```bash
./scripts/healthcheck.sh
```
