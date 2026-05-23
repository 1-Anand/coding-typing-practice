# Coding Typing Practice

A static typing-practice app for DevOps and cloud syntax. The practice page now works like a compact VS Code-style editor: type directly on the code, complete one file, then move to the next file in the lesson.

## Run locally

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/typing.html`.

## Azure Terraform practice

Terraform examples live in `terraform/`. They create a practice stack with provider config, resource group, VNet, subnet, NSG, storage account, public IP, NIC, and Linux VM.

```powershell
cd terraform
copy terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan
```

The sample Azure DevOps pipeline is in `devops/azure-pipelines/terraform.yml`.
