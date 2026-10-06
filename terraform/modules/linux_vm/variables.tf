variable "vm_name" {
  description = "Virtual machine name."
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

variable "subnet_id" {
  description = "Subnet ID."
  type        = string
}

variable "vm_size" {
  description = "VM size SKU."
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "Linux admin username."
  type        = string
  default     = "azureuser"
}

variable "admin_ssh_public_key" {
  description = "SSH public key string."
  type        = string
}

variable "tags" {
  description = "Resource tags."
  type        = map(string)
  default     = {}
}
