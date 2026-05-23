# Azure Terraform practice

This folder contains a small Azure practice stack for a static website:

- Resource group
- Storage account
- Azure Storage static website hosting
- Basic tags, TLS, retention, and versioning settings

## Local workflow

```powershell
az login
az account set --subscription "<subscription-id>"
copy terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

For team or Azure DevOps practice, create a separate storage account for Terraform state and copy `backend.tf.example` to `backend.tf` before running `terraform init`.

After apply, upload the static files to the `$web` container:

```powershell
$account = terraform output -raw storage_account_name
az storage blob upload-batch --account-name $account --destination '$web' --source .. --pattern "*.html" --auth-mode login
az storage blob upload-batch --account-name $account --destination '$web' --source .. --pattern "*.css" --auth-mode login
az storage blob upload-batch --account-name $account --destination '$web' --source .. --pattern "*.js" --auth-mode login
terraform output static_website_url
```

Clean up when you are finished:

```powershell
terraform destroy
```
