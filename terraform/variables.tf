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

variable "tags" {
  description = "Extra tags to apply to all resources."
  type        = map(string)
  default = {
    owner = "devops-practice"
  }
}
