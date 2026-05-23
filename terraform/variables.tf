variable "subscription_id" {
  description = "Azure subscription ID. Leave null to use ARM_SUBSCRIPTION_ID or the default Azure CLI subscription."
  type        = string
  default     = null
}

variable "resource_provider_registrations" {
  description = "AzureRM provider registration mode. Use none if your identity cannot register resource providers."
  type        = string
  default     = "core"

  validation {
    condition     = contains(["core", "extended", "all", "legacy", "none"], var.resource_provider_registrations)
    error_message = "Use one of: core, extended, all, legacy, none."
  }
}

variable "project_name" {
  description = "Short lowercase name used in Azure resource names."
  type        = string
  default     = "typinglab"

  validation {
    condition     = can(regex("^[a-z0-9]{3,14}$", var.project_name))
    error_message = "Use 3-14 lowercase letters or numbers only."
  }
}

variable "environment" {
  description = "Environment name for tags and resource names."
  type        = string
  default     = "dev"

  validation {
    condition     = can(regex("^[a-z0-9]{2,6}$", var.environment))
    error_message = "Use 2-6 lowercase letters or numbers only."
  }
}

variable "location" {
  description = "Azure region for the practice resources."
  type        = string
  default     = "eastus"
}

variable "vnet_address_space" {
  description = "Address space for the practice virtual network."
  type        = list(string)
  default     = ["10.40.0.0/16"]
}

variable "vm_subnet_prefixes" {
  description = "Address prefixes for the VM subnet."
  type        = list(string)
  default     = ["10.40.1.0/24"]
}

variable "ssh_source_address_prefix" {
  description = "Source address allowed to SSH to the VM. Prefer your public IP with /32."
  type        = string
}

variable "admin_username" {
  description = "Admin username for the Linux VM."
  type        = string
  default     = "azureuser"
}

variable "admin_ssh_public_key" {
  description = "SSH public key used to access the Linux VM."
  type        = string
  sensitive   = true
}

variable "vm_size" {
  description = "Azure VM size for the practice machine."
  type        = string
  default     = "Standard_B1s"
}

variable "tags" {
  description = "Extra tags to apply to all resources."
  type        = map(string)
  default = {
    owner = "devops-practice"
  }
}
