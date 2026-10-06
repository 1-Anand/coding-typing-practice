variable "name" {
  description = "Storage account name."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name."
  type        = string
}

variable "location" {
  description = "Azure region."
  type        = string
}

variable "account_tier" {
  description = "Tier (Standard/Premium)."
  type        = string
  default     = "Standard"
}

variable "account_replication_type" {
  description = "Replication (LRS/GRS/ZRS)."
  type        = string
  default     = "LRS"
}

variable "container_name" {
  description = "Optional container to create."
  type        = string
  default     = null
}

variable "tags" {
  description = "Resource tags."
  type        = map(string)
  default     = {}
}
