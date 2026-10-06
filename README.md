# Coding Typing Practice - DevOps & Cloud Engineering

A static VS Code-style typing-practice app and complete reference repository for DevOps and Cloud infrastructure syntax. Includes smart auto-indentation and required-spaces mode so you can build muscle memory for real-world syntax without fighting whitespace.

## 🚀 Run Web Practice Locally

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/typing.html` in your browser.

- **Smart Indent on Enter:** Pressing `Enter` automatically carries over the leading indent of the next line, exactly like VS Code.
- **Single-Press Space:** Pressing `Space` once handles multi-space gaps and indentation.
- **Direct Character Matching:** Typing code characters automatically handles intermediate spaces.

---

## 📁 Repository Structure & DevOps Curriculum

### 1. Terraform Infrastructure as Code (`terraform/`)

- **Root Practice (`terraform/`):** Original Azure storage account with static website.
- **Normal Single Resources:**
  - `terraform/storage_account_single/`: Standard single Azure Storage Account.
  - `terraform/linux_vm_normal/`: Standard single Azure Linux Virtual Machine (VNet, Subnet, Public IP, NIC, and VM).
- **Reusable Modules:**
  - `terraform/modules/storage_account/`: Reusable storage account module (`main.tf`, `variables.tf`, `outputs.tf`).
  - `terraform/modules/linux_vm/`: Reusable Linux VM module with NIC and Public IP (`main.tf`, `variables.tf`, `outputs.tf`).
- **Module with `for_each` Pattern:**
  - `terraform/for_each_practice/`: Clean, normal code demonstrating `for_each` module instantiation for multiple storage accounts (logs, data) and multiple Linux VMs (web, api).

Quick validation:
```powershell
terraform -chdir=terraform/for_each_practice init -backend=false
terraform -chdir=terraform/for_each_practice validate
```

---

### 2. Multi-Stage Dockerfiles (`docker/`)

- **React Application (`docker/react/`):**
  - Stage 1: `node:20-alpine` builder (`npm ci`, `npm run build`).
  - Stage 2: `nginx:1.27-alpine` runner with custom `nginx.conf` (SPA routing, gzip, security headers).
- **.NET 8 Application (`docker/dotnet/`):**
  - Stage 1: `mcr.microsoft.com/dotnet/sdk:8.0` build & publish.
  - Stage 2: `mcr.microsoft.com/dotnet/aspnet:8.0-alpine` minimal runtime with non-root user `app`.
- **Python Application (`docker/python/`):**
  - Stage 1: `python:3.12-slim` builder creating isolated virtual environment in `/opt/venv`.
  - Stage 2: `python:3.12-slim` runner copying venv without compilers, non-root user `appuser`.
- **Docker Commands Guide (`docker/commands-cheat-sheet.md`):** Complete reference of all Docker commands (Lifecycle, Troubleshooting, Networking, Volumes, System Cleanup, Compose).
- **Docker Practice Script (`docker/commands-practice.sh`):** Ready-to-run shell script with everyday commands.

---

### 3. Kubernetes Manifests (`kubernetes/`)

Production-ready YAML declarations formatted with clean 2-space indentation and standard conventions:

1. `01-namespace.yaml` - Team & environment isolation.
2. `02-configmap.yaml` - Plaintext environment variables and JSON config.
3. `03-secret.yaml` - Sensitive credentials and passwords.
4. `04-pv.yaml` & `05-pvc.yaml` - PersistentVolume and PersistentVolumeClaim storage.
5. `06-deployment.yaml` - 3 replicas, RollingUpdate, probes, security context, resource requests/limits.
6. `07-service.yaml` - ClusterIP, NodePort, LoadBalancer, and Headless service types.
7. `08-ingress.yaml` - NGINX Ingress controller routing and TLS termination.
8. `09-hpa.yaml` - Autoscaling based on CPU and memory thresholds.
9. `10-statefulset.yaml` - Stateful workload with volumeClaimTemplates.
10. `11-daemonset.yaml` - Cluster-wide node agent.
11. `12-jobs-cronjobs.yaml` - One-time Batch Job and nightly scheduled CronJob.
12. `13-rbac.yaml` - ServiceAccount, Role, and RoleBinding least-privilege security.
13. `14-networkpolicy.yaml` - Pod network isolation rules.

---

### 4. Interactive Typing Lessons

In `typing.html`, select any lesson from the dropdown:
- **Terraform: Storage Account (Normal & for_each Module)**
- **Terraform: Linux VM (Normal & for_each Module)**
- **Docker: Multi-Stage Dockerfiles (React, .NET, Python)**
- **Docker: Essential Commands & Uses**
- **Kubernetes: Core Manifests**
- **Kubernetes: Storage & Advanced Manifests**
- **AKS Basic Commands & Top 20 Troubleshooting**
