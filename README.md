# Coding Typing Practice

A static typing-practice app for DevOps and cloud syntax. The practice page includes guided lessons, uploadable `.txt` content, WPM, accuracy, timer, progress, character feedback, and an on-screen keyboard.

## Run locally

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/typing.html`.

## Azure Terraform practice

Terraform examples live in `terraform/`. They create a small Azure Storage static website practice stack.

```powershell
cd terraform
copy terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan
```

The sample Azure DevOps pipeline is in `devops/azure-pipelines/terraform.yml`.
