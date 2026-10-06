output "storage_account_names" {
  description = "Storage account names created with for_each."
  value       = { for k, v in module.storage_accounts : k => v.name }
}

output "storage_account_endpoints" {
  description = "Primary blob endpoints."
  value       = { for k, v in module.storage_accounts : k => v.primary_blob_endpoint }
}

output "vm_private_ips" {
  description = "Linux VM private IPs created with for_each."
  value       = { for k, v in module.linux_vms : k => v.private_ip_address }
}
