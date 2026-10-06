variable "location" {
  description = "Azure region."
  type        = string
  default     = "eastus"
}

variable "ssh_public_key" {
  description = "SSH public key string."
  type        = string
  default     = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyForPracticeOnlyDevOpsLab azureuser@practice"
}
