terraform {
  required_version = ">= 1.6.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-practice-dev"
  location = var.location
  tags = {
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-practice"
  address_space       = ["10.30.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "snet-default"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.30.1.0/24"]
}

# 1. Storage Accounts using module with for_each
module "storage_accounts" {
  source   = "../modules/storage_account"
  for_each = var.storage_accounts

  name                     = each.value.name
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = each.value.tier
  account_replication_type = each.value.replication
  tags = {
    Environment = "dev"
    Role        = each.key
  }
}

# 2. Linux VMs using module with for_each
module "linux_vms" {
  source   = "../modules/linux_vm"
  for_each = var.virtual_machines

  vm_name              = each.key
  resource_group_name  = azurerm_resource_group.rg.name
  location             = azurerm_resource_group.rg.location
  subnet_id            = azurerm_subnet.subnet.id
  vm_size              = each.value.size
  admin_username       = "azureuser"
  admin_ssh_public_key = var.ssh_public_key
  tags = {
    Environment = "dev"
    Role        = each.key
  }
}
