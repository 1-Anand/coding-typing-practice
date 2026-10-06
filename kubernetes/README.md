# Kubernetes Manifests Practice Guide

All essential Kubernetes production manifests, written with clean, standard 2-space indentation and minimal required spacing for easy reading and typing practice.

## Manifest Overview

| File | Resource | Description |
|---|---|---|
| `01-namespace.yaml` | `Namespace` | Creates isolated `devops-practice` environment |
| `02-configmap.yaml` | `ConfigMap` | Plaintext configuration and JSON appsettings |
| `03-secret.yaml` | `Secret` | Sensitive credentials (passwords, tokens, API keys) |
| `04-pv.yaml` | `PersistentVolume` | Cluster-wide persistent storage allocation |
| `05-pvc.yaml` | `PersistentVolumeClaim` | Namespace-bound request for storage |
| `06-deployment.yaml` | `Deployment` | 3 replicas, RollingUpdate, security context, probes, resources |
| `07-service.yaml` | `Service` | ClusterIP, NodePort, LoadBalancer, and Headless services |
| `08-ingress.yaml` | `Ingress` | TLS routing and ingress controller path rules |
| `09-hpa.yaml` | `HorizontalPodAutoscaler` | Autoscales pods dynamically on CPU & Memory |
| `10-statefulset.yaml` | `StatefulSet` | Stateful workload with stable network IDs and volume templates |
| `11-daemonset.yaml` | `DaemonSet` | Runs agent on every node in the cluster |
| `12-jobs-cronjobs.yaml` | `Job` & `CronJob` | One-off batch jobs and scheduled cron tasks |
| `13-rbac.yaml` | `RBAC` | ServiceAccount, Role, and RoleBinding permissions |
| `14-networkpolicy.yaml` | `NetworkPolicy` | Pod network isolation for ingress and egress |

## Quick Apply & Verification Commands

```bash
# 1. Apply namespace first
kubectl apply -f 01-namespace.yaml

# 2. Apply config, secrets, and storage
kubectl apply -f 02-configmap.yaml
kubectl apply -f 03-secret.yaml
kubectl apply -f 04-pv.yaml
kubectl apply -f 05-pvc.yaml

# 3. Apply workloads and networking
kubectl apply -f 06-deployment.yaml
kubectl apply -f 07-service.yaml
kubectl apply -f 08-ingress.yaml
kubectl apply -f 09-hpa.yaml

# 4. Check status
kubectl get all -n devops-practice
kubectl get pvc,pv -n devops-practice
kubectl get ingress -n devops-practice
kubectl describe deployment web-api -n devops-practice
```
