variable "location" {
  description = "Azure region."
  type        = string
  default     = "eastus"
}

variable "ssh_public_key" {
  description = "SSH public key for Linux VMs."
  type        = string
  default     = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyForPracticeOnlyDevOpsLab azureuser@practice"
}

variable "storage_accounts" {
  description = "Simple map of storage accounts for for_each practice."
  type = map(object({
    name        = string
    tier        = string
    replication = string
  }))
  default = {
    logs = {
      name        = "stpracticelogs01"
      tier        = "Standard"
      replication = "LRS"
    }
    data = {
      name        = "stpracticedata01"
      tier        = "Standard"
      replication = "ZRS"
    }
  }
}

variable "virtual_machines" {
  description = "Simple map of Linux VMs for for_each practice."
  type = map(object({
    size = string
  }))
  default = {
    web = {
      size = "Standard_B2s"
    }
    api = {
      size = "Standard_B2s"
    }
  }
}
