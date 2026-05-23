output "resource_group_name" {
  description = "Resource group created for the practice lab."
  value       = azurerm_resource_group.main.name
}

output "storage_account_name" {
  description = "Storage account that hosts the static website endpoint."
  value       = azurerm_storage_account.static_site.name
}

output "static_website_url" {
  description = "Azure Storage static website endpoint."
  value       = azurerm_storage_account.static_site.primary_web_endpoint
  depends_on  = [azurerm_storage_account_static_website.main]
}
