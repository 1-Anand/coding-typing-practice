output "resource_group_name" {
  description = "Resource group created for the practice lab."
  value       = azurerm_resource_group.main.name
}

output "storage_account_name" {
  description = "Storage account that hosts the static website endpoint."
  value       = azurerm_storage_account.static_site.name
}

output "virtual_network_name" {
  description = "Practice virtual network name."
  value       = azurerm_virtual_network.main.name
}

output "vm_subnet_name" {
  description = "Subnet used by the Linux VM."
  value       = azurerm_subnet.vm.name
}

output "linux_vm_name" {
  description = "Linux VM created for DevOps practice."
  value       = azurerm_linux_virtual_machine.vm.name
}

output "linux_vm_public_ip" {
  description = "Public IP address for the Linux VM."
  value       = azurerm_public_ip.vm.ip_address
}

output "ssh_command" {
  description = "SSH command for the Linux VM after apply."
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.vm.ip_address}"
}

output "static_website_url" {
  description = "Azure Storage static website endpoint."
  value       = azurerm_storage_account.static_site.primary_web_endpoint
  depends_on  = [azurerm_storage_account_static_website.main]
}
