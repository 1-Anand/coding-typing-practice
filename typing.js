const lessons = [
  {
    title: 'Azure Terraform Lab',
    type: 'Terraform lesson',
    pages: [
      {
        fileName: 'providers.tf',
        text: `terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  subscription_id                 = var.subscription_id
  resource_provider_registrations = "core"

  features {}
}`
      },
      {
        fileName: 'resource-group.tf',
        text: `locals {
  name_prefix = "\${var.project_name}-\${var.environment}"

  common_tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-\${local.name_prefix}"
  location = var.location
  tags     = local.common_tags
}`
      },
      {
        fileName: 'network.tf',
        text: `resource "azurerm_virtual_network" "main" {
  name                = "vnet-\${local.name_prefix}"
  address_space       = ["10.40.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}

resource "azurerm_subnet" "vm" {
  name                 = "snet-vm"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.40.1.0/24"]
}`
      },
      {
        fileName: 'security.tf',
        text: `resource "azurerm_network_security_group" "vm" {
  name                = "nsg-vm-\${local.name_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags

  security_rule {
    name                       = "AllowSSH"
    priority                   = 1000
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.ssh_source_address_prefix
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "vm" {
  subnet_id                 = azurerm_subnet.vm.id
  network_security_group_id = azurerm_network_security_group.vm.id
}`
      },
      {
        fileName: 'storage.tf',
        text: `resource "random_string" "suffix" {
  length  = 6
  lower   = true
  numeric = true
  special = false
  upper   = false
}

resource "azurerm_storage_account" "main" {
  name                            = "st\${var.project_name}\${var.environment}\${random_string.suffix.result}"
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  allow_nested_items_to_be_public = false
  tags                            = local.common_tags
}`
      },
      {
        fileName: 'vm.tf',
        text: `resource "azurerm_public_ip" "vm" {
  name                = "pip-vm-\${local.name_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}

resource "azurerm_network_interface" "vm" {
  name                = "nic-vm-\${local.name_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "primary"
    subnet_id                     = azurerm_subnet.vm.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm.id
  }
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                  = "vm-\${local.name_prefix}"
  location              = azurerm_resource_group.main.location
  resource_group_name   = azurerm_resource_group.main.name
  size                  = var.vm_size
  admin_username        = var.admin_username
  network_interface_ids = [azurerm_network_interface.vm.id]

  disable_password_authentication = true

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.admin_ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  tags = local.common_tags
}`
      }
    ]
  },
  {
    title: 'Azure CLI Warmup',
    type: 'Azure lesson',
    pages: [
      {
        fileName: 'azure-cli.txt',
        text: `az login
az account show
az account set --subscription "<subscription-id>"
az group create --name rg-devops-lab --location eastus
az deployment group what-if --resource-group rg-devops-lab`
      }
    ]
    title: 'Azure Terraform Lab',
    type: 'Terraform lesson',
    pages: [
      {
        fileName: 'providers.tf',
        text: `terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  subscription_id                 = var.subscription_id
  resource_provider_registrations = "core"

  features {}
}`
      },
      {
        fileName: 'resource-group.tf',
        text: `locals {
  name_prefix = "\${var.project_name}-\${var.environment}"

  common_tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-\${local.name_prefix}"
  location = var.location
  tags     = local.common_tags
}`
      },
      {
        fileName: 'network.tf',
        text: `resource "azurerm_virtual_network" "main" {
  name                = "vnet-\${local.name_prefix}"
  address_space       = ["10.40.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}

resource "azurerm_subnet" "vm" {
  name                 = "snet-vm"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.40.1.0/24"]
}`
      },
      {
        fileName: 'security.tf',
        text: `resource "azurerm_network_security_group" "vm" {
  name                = "nsg-vm-\${local.name_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags

  security_rule {
    name                       = "AllowSSH"
    priority                   = 1000
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.ssh_source_address_prefix
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "vm" {
  subnet_id                 = azurerm_subnet.vm.id
  network_security_group_id = azurerm_network_security_group.vm.id
}`
      },
      {
        fileName: 'storage.tf',
        text: `resource "random_string" "suffix" {
  length  = 6
  lower   = true
  numeric = true
  special = false
  upper   = false
}

resource "azurerm_storage_account" "main" {
  name                            = "st\${var.project_name}\${var.environment}\${random_string.suffix.result}"
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  allow_nested_items_to_be_public = false
  tags                            = local.common_tags
}`
      },
      {
        fileName: 'vm.tf',
        text: `resource "azurerm_public_ip" "vm" {
  name                = "pip-vm-\${local.name_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.common_tags
}

resource "azurerm_network_interface" "vm" {
  name                = "nic-vm-\${local.name_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "primary"
    subnet_id                     = azurerm_subnet.vm.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm.id
  }
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                  = "vm-\${local.name_prefix}"
  location              = azurerm_resource_group.main.location
  resource_group_name   = azurerm_resource_group.main.name
  size                  = var.vm_size
  admin_username        = var.admin_username
  network_interface_ids = [azurerm_network_interface.vm.id]

  disable_password_authentication = true

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.admin_ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  tags = local.common_tags
}`
      }
    ]
  },
  {
    title: 'Azure CLI Warmup',
    type: 'Azure lesson',
    pages: [
      {
        fileName: 'azure-cli.txt',
        text: `az login
az account show
az account set --subscription "<subscription-id>"
az group create --name rg-devops-lab --location eastus
az deployment group what-if --resource-group rg-devops-lab`
      }
    ]
  },
  {
    title: 'Kubernetes Manifest',
    title: 'Kubernetes Manifest',
    type: 'Kubernetes lesson',
    pages: [
      {
        fileName: 'deployment.yaml',
        text: `apiVersion: apps/v1
    pages: [
      {
        fileName: 'deployment.yaml',
        text: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: typing-practice
  labels:
    app: typing-practice
  labels:
    app: typing-practice
spec:
  replicas: 2
  selector:
    matchLabels:
      app: typing-practice
  template:
    metadata:
      labels:
        app: typing-practice
    spec:
      containers:
        - name: web
          image: nginx:1.27
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi`
      },
      {
        fileName: 'service.yaml',
        text: `apiVersion: v1
kind: Service
metadata:
  name: typing-practice
  labels:
    app: typing-practice
spec:
  type: ClusterIP
  selector:
    app: typing-practice
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 80`
      },
      {
        fileName: 'ingress.yaml',
        text: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: typing-practice
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: typing-practice.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: typing-practice
                port:
                  number: 80`
      },
      {
        fileName: 'HPA.yaml',
        text: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: typing-practice
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: typing-practice
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`
      },
      {
        fileName: 'PV.yaml',
        text: `apiVersion: v1
kind: PersistentVolume
metadata:
  name: typing-practice-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data/typing-practice`
      },
      {
        fileName: 'PVC.yaml',
        text: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: typing-practice-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  resources:
    requests:
      storage: 5Gi`
      }
    ]
  },
  {
    title: 'AKS Basic Commands',
    type: 'AKS command lesson',
    pages: [
      {
        fileName: 'aks-create-and-connect.sh',
        text: `az login
  selector:
    matchLabels:
      app: typing-practice
  template:
    metadata:
      labels:
        app: typing-practice
    spec:
      containers:
        - name: web
          image: nginx:1.27
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi`
      },
      {
        fileName: 'service.yaml',
        text: `apiVersion: v1
kind: Service
metadata:
  name: typing-practice
  labels:
    app: typing-practice
spec:
  type: ClusterIP
  selector:
    app: typing-practice
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 80`
      },
      {
        fileName: 'ingress.yaml',
        text: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: typing-practice
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: typing-practice.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: typing-practice
                port:
                  number: 80`
      },
      {
        fileName: 'HPA.yaml',
        text: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: typing-practice
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: typing-practice
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`
      },
      {
        fileName: 'PV.yaml',
        text: `apiVersion: v1
kind: PersistentVolume
metadata:
  name: typing-practice-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data/typing-practice`
      },
      {
        fileName: 'PVC.yaml',
        text: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: typing-practice-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  resources:
    requests:
      storage: 5Gi`
      }
    ]
  },
  {
    title: 'AKS Basic Commands',
    type: 'AKS command lesson',
    pages: [
      {
        fileName: 'aks-create-and-connect.sh',
        text: `az login
az account show
az group create --name <resource-group> --location <location>
az aks get-versions --location <location> --output table
az aks create --name <cluster-name> --resource-group <resource-group> --sku automatic --network-plugin azure --network-plugin-mode overlay --enable-oidc-issuer --enable-workload-identity
az aks get-credentials --name <cluster-name> --resource-group <resource-group> --overwrite-existing
kubectl cluster-info
kubectl get nodes -o wide`
      },
      {
        fileName: 'aks-standard-cluster.sh',
        text: `az aks create --name <cluster-name> --resource-group <resource-group> --node-count 3 --zones 1 2 3 --network-plugin azure --network-plugin-mode overlay --enable-cluster-autoscaler --min-count 1 --max-count 10 --enable-oidc-issuer --enable-workload-identity
az aks show --name <cluster-name> --resource-group <resource-group> --query kubernetesVersion
az aks nodepool list --cluster-name <cluster-name> --resource-group <resource-group> --output table
az aks nodepool add --cluster-name <cluster-name> --resource-group <resource-group> --name userpool --node-count 2 --mode User
az aks update --name <cluster-name> --resource-group <resource-group> --enable-oidc-issuer --enable-workload-identity`
      },
      {
        fileName: 'kubectl-daily-use.sh',
        text: `kubectl config get-contexts
kubectl config current-context
kubectl create namespace dev
kubectl get namespaces
kubectl apply -f deployment.yaml -n dev
kubectl apply -f service.yaml -n dev
kubectl get all -n dev
kubectl describe deployment typing-practice -n dev
kubectl logs deployment/typing-practice -n dev
kubectl exec -it deployment/typing-practice -n dev -- sh`
      },
      {
        fileName: 'aks-operate-and-monitor.sh',
        text: `kubectl scale deployment typing-practice --replicas=3 -n dev
kubectl rollout status deployment/typing-practice -n dev
kubectl top nodes
kubectl top pods -A
az aks enable-addons --name <cluster-name> --resource-group <resource-group> --addons monitoring --workspace-resource-id <workspace-resource-id>
az aks update --name <cluster-name> --resource-group <resource-group> --enable-cluster-autoscaler --min-count 1 --max-count 5
az aks stop --name <cluster-name> --resource-group <resource-group>
az aks start --name <cluster-name> --resource-group <resource-group>`
      }
    ]
  },
  {
    title: 'AKS Top 20 Troubleshooting',
    type: 'AKS troubleshooting lesson',
    pages: [
      {
        fileName: '01-access-nodes-kubesystem.sh',
        text: `# 01 kubectl cannot connect
az aks show -g <resource-group> -n <cluster-name>
az aks get-credentials -g <resource-group> -n <cluster-name> --overwrite-existing
kubectl cluster-info

# 02 wrong context or namespace
kubectl config get-contexts
kubectl config use-context <context-name>
kubectl get ns

# 03 nodes are NotReady
kubectl get nodes -o wide
kubectl describe node <node-name>
kubectl get events -A --sort-by=.lastTimestamp

# 04 node pressure
kubectl describe node <node-name>
kubectl top nodes
kubectl top pods -A

# 05 kube-system pods failing
kubectl get pods -n kube-system
kubectl describe pod <pod-name> -n kube-system
kubectl logs <pod-name> -n kube-system --previous`
      },
      {
        fileName: '02-pods-images-health.sh',
        text: `# 06 pods stuck Pending
kubectl get pods -A --field-selector=status.phase=Pending
kubectl describe pod <pod-name> -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp

# 07 CrashLoopBackOff
kubectl get pods -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
kubectl describe pod <pod-name> -n <namespace>

# 08 ImagePullBackOff
kubectl describe pod <pod-name> -n <namespace>
kubectl get secret -n <namespace>
az acr repository list --name <acr-name> --output table

# 09 OOMKilled
kubectl describe pod <pod-name> -n <namespace>
kubectl top pod <pod-name> -n <namespace>
kubectl get pod <pod-name> -n <namespace> -o yaml

# 10 readiness or liveness probe failing
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
kubectl get endpoints <service-name> -n <namespace>`
      },
      {
        fileName: '03-network-storage.sh',
        text: `# 11 service has no endpoints
kubectl get svc -n <namespace>
kubectl get endpoints -n <namespace>
kubectl get pods --show-labels -n <namespace>

# 12 ingress not routing
kubectl get ingress -A
kubectl describe ingress <ingress-name> -n <namespace>
kubectl get svc <service-name> -n <namespace>

# 13 DNS or CoreDNS issue
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns
kubectl run dns-test --image=busybox:1.36 --restart=Never -- nslookup kubernetes.default

# 14 network policy blocking traffic
kubectl get networkpolicy -A
kubectl describe networkpolicy <policy-name> -n <namespace>
kubectl exec -it <pod-name> -n <namespace> -- wget -S <service-name>

# 15 PVC stuck Pending
kubectl get pv
kubectl get pvc -A
kubectl describe pvc <claim-name> -n <namespace>`
      },
      {
        fileName: '04-scaling-upgrades-quota.sh',
        text: `# 16 HPA not scaling
kubectl get hpa -A
kubectl describe hpa <hpa-name> -n <namespace>
kubectl top pods -n <namespace>

# 17 cluster autoscaler not adding nodes
az aks nodepool list -g <resource-group> --cluster-name <cluster-name> --output table
kubectl get pods -A --field-selector=status.phase=Pending
kubectl describe pod <pod-name> -n <namespace>

# 18 Azure quota or subnet IP exhaustion
az vm list-usage --location <location> --output table
az network vnet subnet show -g <resource-group> --vnet-name <vnet-name> --name <subnet-name>
kubectl get events -A --sort-by=.lastTimestamp

# 19 upgrade blocked or failed
az aks get-upgrades -g <resource-group> -n <cluster-name> --output table
az aks show -g <resource-group> -n <cluster-name> --query provisioningState
az monitor activity-log list -g <resource-group> --max-events 20

# 20 recent change caused outage
kubectl rollout history deployment/<deployment-name> -n <namespace>
kubectl rollout status deployment/<deployment-name> -n <namespace>
kubectl get events -A --sort-by=.lastTimestamp`
      }
    ]
  }
az group create --name <resource-group> --location <location>
az aks get-versions --location <location> --output table
az aks create --name <cluster-name> --resource-group <resource-group> --sku automatic --network-plugin azure --network-plugin-mode overlay --enable-oidc-issuer --enable-workload-identity
az aks get-credentials --name <cluster-name> --resource-group <resource-group> --overwrite-existing
kubectl cluster-info
kubectl get nodes -o wide`
      },
      {
        fileName: 'aks-standard-cluster.sh',
        text: `az aks create --name <cluster-name> --resource-group <resource-group> --node-count 3 --zones 1 2 3 --network-plugin azure --network-plugin-mode overlay --enable-cluster-autoscaler --min-count 1 --max-count 10 --enable-oidc-issuer --enable-workload-identity
az aks show --name <cluster-name> --resource-group <resource-group> --query kubernetesVersion
az aks nodepool list --cluster-name <cluster-name> --resource-group <resource-group> --output table
az aks nodepool add --cluster-name <cluster-name> --resource-group <resource-group> --name userpool --node-count 2 --mode User
az aks update --name <cluster-name> --resource-group <resource-group> --enable-oidc-issuer --enable-workload-identity`
      },
      {
        fileName: 'kubectl-daily-use.sh',
        text: `kubectl config get-contexts
kubectl config current-context
kubectl create namespace dev
kubectl get namespaces
kubectl apply -f deployment.yaml -n dev
kubectl apply -f service.yaml -n dev
kubectl get all -n dev
kubectl describe deployment typing-practice -n dev
kubectl logs deployment/typing-practice -n dev
kubectl exec -it deployment/typing-practice -n dev -- sh`
      },
      {
        fileName: 'aks-operate-and-monitor.sh',
        text: `kubectl scale deployment typing-practice --replicas=3 -n dev
kubectl rollout status deployment/typing-practice -n dev
kubectl top nodes
kubectl top pods -A
az aks enable-addons --name <cluster-name> --resource-group <resource-group> --addons monitoring --workspace-resource-id <workspace-resource-id>
az aks update --name <cluster-name> --resource-group <resource-group> --enable-cluster-autoscaler --min-count 1 --max-count 5
az aks stop --name <cluster-name> --resource-group <resource-group>
az aks start --name <cluster-name> --resource-group <resource-group>`
      }
    ]
  },
  {
    title: 'AKS Top 20 Troubleshooting',
    type: 'AKS troubleshooting lesson',
    pages: [
      {
        fileName: '01-access-nodes-kubesystem.sh',
        text: `# 01 kubectl cannot connect
az aks show -g <resource-group> -n <cluster-name>
az aks get-credentials -g <resource-group> -n <cluster-name> --overwrite-existing
kubectl cluster-info

# 02 wrong context or namespace
kubectl config get-contexts
kubectl config use-context <context-name>
kubectl get ns

# 03 nodes are NotReady
kubectl get nodes -o wide
kubectl describe node <node-name>
kubectl get events -A --sort-by=.lastTimestamp

# 04 node pressure
kubectl describe node <node-name>
kubectl top nodes
kubectl top pods -A

# 05 kube-system pods failing
kubectl get pods -n kube-system
kubectl describe pod <pod-name> -n kube-system
kubectl logs <pod-name> -n kube-system --previous`
      },
      {
        fileName: '02-pods-images-health.sh',
        text: `# 06 pods stuck Pending
kubectl get pods -A --field-selector=status.phase=Pending
kubectl describe pod <pod-name> -n <namespace>
kubectl get events -n <namespace> --sort-by=.lastTimestamp

# 07 CrashLoopBackOff
kubectl get pods -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
kubectl describe pod <pod-name> -n <namespace>

# 08 ImagePullBackOff
kubectl describe pod <pod-name> -n <namespace>
kubectl get secret -n <namespace>
az acr repository list --name <acr-name> --output table

# 09 OOMKilled
kubectl describe pod <pod-name> -n <namespace>
kubectl top pod <pod-name> -n <namespace>
kubectl get pod <pod-name> -n <namespace> -o yaml

# 10 readiness or liveness probe failing
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
kubectl get endpoints <service-name> -n <namespace>`
      },
      {
        fileName: '03-network-storage.sh',
        text: `# 11 service has no endpoints
kubectl get svc -n <namespace>
kubectl get endpoints -n <namespace>
kubectl get pods --show-labels -n <namespace>

# 12 ingress not routing
kubectl get ingress -A
kubectl describe ingress <ingress-name> -n <namespace>
kubectl get svc <service-name> -n <namespace>

# 13 DNS or CoreDNS issue
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns
kubectl run dns-test --image=busybox:1.36 --restart=Never -- nslookup kubernetes.default

# 14 network policy blocking traffic
kubectl get networkpolicy -A
kubectl describe networkpolicy <policy-name> -n <namespace>
kubectl exec -it <pod-name> -n <namespace> -- wget -S <service-name>

# 15 PVC stuck Pending
kubectl get pv
kubectl get pvc -A
kubectl describe pvc <claim-name> -n <namespace>`
      },
      {
        fileName: '04-scaling-upgrades-quota.sh',
        text: `# 16 HPA not scaling
kubectl get hpa -A
kubectl describe hpa <hpa-name> -n <namespace>
kubectl top pods -n <namespace>

# 17 cluster autoscaler not adding nodes
az aks nodepool list -g <resource-group> --cluster-name <cluster-name> --output table
kubectl get pods -A --field-selector=status.phase=Pending
kubectl describe pod <pod-name> -n <namespace>

# 18 Azure quota or subnet IP exhaustion
az vm list-usage --location <location> --output table
az network vnet subnet show -g <resource-group> --vnet-name <vnet-name> --name <subnet-name>
kubectl get events -A --sort-by=.lastTimestamp

# 19 upgrade blocked or failed
az aks get-upgrades -g <resource-group> -n <cluster-name> --output table
az aks show -g <resource-group> -n <cluster-name> --query provisioningState
az monitor activity-log list -g <resource-group> --max-events 20

# 20 recent change caused outage
kubectl rollout history deployment/<deployment-name> -n <namespace>
kubectl rollout status deployment/<deployment-name> -n <namespace>
kubectl get events -A --sort-by=.lastTimestamp`
      }
    ]
  }
];

const elements = {
  lessonSelect: document.getElementById('lessonSelect'),
  fileInput: document.getElementById('fileInput'),
  resetButton: document.getElementById('resetButton'),
  nextPageButton: document.getElementById('nextPageButton'),
  fileTree: document.getElementById('fileTree'),
  activeTab: document.getElementById('activeTab'),
  progressBar: document.getElementById('progressBar'),
  lessonType: document.getElementById('lessonType'),
  lessonTitle: document.getElementById('lessonTitle'),
  pageCounter: document.getElementById('pageCounter'),
  statusMessage: document.getElementById('statusMessage'),
  editorSurface: document.getElementById('editorSurface'),
  editorLines: document.getElementById('editorLines'),
  typingCapture: document.getElementById('typingCapture'),
  lineColumn: document.getElementById('lineColumn'),
  wpm: document.getElementById('wpm'),
  nextPageButton: document.getElementById('nextPageButton'),
  fileTree: document.getElementById('fileTree'),
  activeTab: document.getElementById('activeTab'),
  progressBar: document.getElementById('progressBar'),
  lessonType: document.getElementById('lessonType'),
  lessonTitle: document.getElementById('lessonTitle'),
  pageCounter: document.getElementById('pageCounter'),
  statusMessage: document.getElementById('statusMessage'),
  editorSurface: document.getElementById('editorSurface'),
  editorLines: document.getElementById('editorLines'),
  typingCapture: document.getElementById('typingCapture'),
  lineColumn: document.getElementById('lineColumn'),
  wpm: document.getElementById('wpm'),
  accuracy: document.getElementById('accuracy'),
  progressText: document.getElementById('progressText'),
  bestWpm: document.getElementById('bestWpm'),
  mistakes: document.getElementById('mistakes'),
  timer: document.getElementById('timer'),
  nextKey: document.getElementById('nextKey')
  timer: document.getElementById('timer'),
  nextKey: document.getElementById('nextKey')
};

let activeLessonIndex = 0;
let activePageIndex = 0;
let activePageIndex = 0;
let targetText = '';
let typedText = '';
let typedText = '';
let startedAt = null;
let timerId = null;
let completionTimer = null;
let pageCompleted = false;
const completedPages = new Map();
let completionTimer = null;
let pageCompleted = false;
const completedPages = new Map();

function init() {
  renderLessonOptions();
  bindEvents();
  loadLesson(0, 0);
  loadLesson(0, 0);
}

function bindEvents() {
  elements.lessonSelect.addEventListener('change', (event) => {
    loadLesson(Number(event.target.value), 0);
    loadLesson(Number(event.target.value), 0);
  });

  elements.fileInput.addEventListener('change', handleFileUpload);
  elements.resetButton.addEventListener('click', resetPage);
  elements.nextPageButton.addEventListener('click', () => goToNextPage(true));
  elements.editorSurface.addEventListener('click', focusEditor);
  elements.editorSurface.addEventListener('focus', focusEditor);
  elements.typingCapture.addEventListener('keydown', handleKeydown);
  elements.typingCapture.addEventListener('input', handleCaptureInput);
  elements.typingCapture.addEventListener('paste', (event) => event.preventDefault());
  elements.typingCapture.addEventListener('copy', (event) => event.preventDefault());

  document.addEventListener('keydown', (event) => {
    if (event.target === elements.typingCapture || shouldIgnoreGlobalKey(event)) {
      return;
    }

    focusEditor();
    handleKeydown(event);
  });
  elements.resetButton.addEventListener('click', resetPage);
  elements.nextPageButton.addEventListener('click', () => goToNextPage(true));
  elements.editorSurface.addEventListener('click', focusEditor);
  elements.editorSurface.addEventListener('focus', focusEditor);
  elements.typingCapture.addEventListener('keydown', handleKeydown);
  elements.typingCapture.addEventListener('input', handleCaptureInput);
  elements.typingCapture.addEventListener('paste', (event) => event.preventDefault());
  elements.typingCapture.addEventListener('copy', (event) => event.preventDefault());

  document.addEventListener('keydown', (event) => {
    if (event.target === elements.typingCapture || shouldIgnoreGlobalKey(event)) {
      return;
    }

    focusEditor();
    handleKeydown(event);
  });
}

function renderLessonOptions() {
  lessons.forEach((lesson, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = lesson.title;
    elements.lessonSelect.appendChild(option);
  });
}

function loadLesson(lessonIndex, pageIndex) {
  clearCompletionTimer();
  activeLessonIndex = lessonIndex;
  activePageIndex = pageIndex;
  elements.lessonSelect.value = String(lessonIndex);
  elements.lessonType.textContent = lessons[lessonIndex].type;
  elements.lessonTitle.textContent = lessons[lessonIndex].title;
  renderFileTree();
  loadPage(pageIndex);
}

function loadPage(pageIndex) {
  clearCompletionTimer();
  const lesson = getActiveLesson();
  const page = lesson.pages[pageIndex];

  activePageIndex = pageIndex;
  targetText = page.text;
  typedText = '';
  pageCompleted = false;
  startedAt = null;
  elements.activeTab.textContent = page.fileName;
  elements.pageCounter.textContent = `File ${pageIndex + 1} of ${lesson.pages.length}`;
  elements.editorSurface.classList.remove('page-complete');
  elements.editorSurface.scrollTop = 0;
  elements.typingCapture.value = '';

  stopTimer();
  renderFileTree();
  renderEditor();
  updateStats();
  setStatus('Click the editor and type directly on the code.');
  focusEditor();
function loadLesson(lessonIndex, pageIndex) {
  clearCompletionTimer();
  activeLessonIndex = lessonIndex;
  activePageIndex = pageIndex;
  elements.lessonSelect.value = String(lessonIndex);
  elements.lessonType.textContent = lessons[lessonIndex].type;
  elements.lessonTitle.textContent = lessons[lessonIndex].title;
  renderFileTree();
  loadPage(pageIndex);
}

function loadPage(pageIndex) {
  clearCompletionTimer();
  const lesson = getActiveLesson();
  const page = lesson.pages[pageIndex];

  activePageIndex = pageIndex;
  targetText = page.text;
  typedText = '';
  pageCompleted = false;
  startedAt = null;
  elements.activeTab.textContent = page.fileName;
  elements.pageCounter.textContent = `File ${pageIndex + 1} of ${lesson.pages.length}`;
  elements.editorSurface.classList.remove('page-complete');
  elements.editorSurface.scrollTop = 0;
  elements.typingCapture.value = '';

  stopTimer();
  renderFileTree();
  renderEditor();
  updateStats();
  setStatus('Click the editor and type directly on the code.');
  focusEditor();
}

function handleFileUpload() {
  const file = elements.fileInput.files[0];

  if (!file) {
    return;
  }

  if (!file.name.toLowerCase().endsWith('.txt')) {
    setStatus('Please upload a valid .txt file.');
    elements.fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const customText = String(event.target.result || '').trim();

    if (!customText) {
      setStatus('That text file is empty.');
      return;
    }

    const customLesson = {
      title: 'Custom Upload',
      type: 'Custom text',
      pages: [{ fileName: file.name, text: customText }]
      type: 'Custom text',
      pages: [{ fileName: file.name, text: customText }]
    };

    const existingCustomIndex = lessons.findIndex((lesson) => lesson.title === 'Custom Upload');
    const existingCustomIndex = lessons.findIndex((lesson) => lesson.title === 'Custom Upload');
    if (existingCustomIndex >= 0) {
      lessons[existingCustomIndex] = customLesson;
      elements.lessonSelect.options[existingCustomIndex].textContent = customLesson.title;
      loadLesson(existingCustomIndex, 0);
      loadLesson(existingCustomIndex, 0);
    } else {
      lessons.push(customLesson);
      const option = document.createElement('option');
      option.value = lessons.length - 1;
      option.textContent = customLesson.title;
      elements.lessonSelect.appendChild(option);
      loadLesson(lessons.length - 1, 0);
      loadLesson(lessons.length - 1, 0);
    }
  };
  reader.readAsText(file);
}

function resetPage() {
  loadPage(activePageIndex);
function resetPage() {
  loadPage(activePageIndex);
}

function renderFileTree() {
  const lesson = getActiveLesson();
  const completedSet = getCompletedSet(activeLessonIndex);
  elements.fileTree.innerHTML = '';

  lesson.pages.forEach((page, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'file-item';
    button.classList.toggle('active', index === activePageIndex);
    button.classList.toggle('done', completedSet.has(index));
    button.innerHTML = `<span>${completedSet.has(index) ? 'ok' : 'tf'}</span><strong></strong>`;
    button.querySelector('strong').textContent = page.fileName;
    button.addEventListener('click', () => loadPage(index));
    elements.fileTree.appendChild(button);
  });
}

function renderEditor() {
  const lines = targetText.split('\n');
  const location = getLineColumn(typedText.length);
  const activeTokenRange = getActiveTokenRange(typedText.length);
  let charIndex = 0;
  elements.editorLines.innerHTML = '';

  lines.forEach((line, lineIndex) => {
    const row = document.createElement('div');
    row.className = 'editor-line';
    row.classList.toggle('active-line', lineIndex + 1 === location.line);

    const gutter = document.createElement('span');
    gutter.className = 'line-number';
    gutter.textContent = String(lineIndex + 1);

    const code = document.createElement('span');
    code.className = 'line-code';

    for (const expectedChar of line) {
      code.appendChild(createCharacterSpan(expectedChar, charIndex, activeTokenRange));
      charIndex++;
    }

    if (lineIndex < lines.length - 1) {
      const newlineSpan = createCharacterSpan('\n', charIndex, activeTokenRange);
      newlineSpan.textContent = newlineSpan.classList.contains('current') || newlineSpan.classList.contains('incorrect') ? ' [enter]' : '';
      newlineSpan.classList.add('enter-char');
      code.appendChild(newlineSpan);
      charIndex++;
    }

    row.appendChild(gutter);
    row.appendChild(code);
    elements.editorLines.appendChild(row);
  });

  keepCursorVisible();
}

function createCharacterSpan(expectedChar, index, activeTokenRange) {
  const span = document.createElement('span');
  span.className = 'code-char';
  span.textContent = expectedChar;

  if (expectedChar === ' ') {
    span.classList.add('space-char');
  }

  if (index >= activeTokenRange.start && index < activeTokenRange.end) {
    span.classList.add('active-token');
  }
function renderFileTree() {
  const lesson = getActiveLesson();
  const completedSet = getCompletedSet(activeLessonIndex);
  elements.fileTree.innerHTML = '';

  lesson.pages.forEach((page, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'file-item';
    button.classList.toggle('active', index === activePageIndex);
    button.classList.toggle('done', completedSet.has(index));
    button.innerHTML = `<span>${completedSet.has(index) ? 'ok' : 'tf'}</span><strong></strong>`;
    button.querySelector('strong').textContent = page.fileName;
    button.addEventListener('click', () => loadPage(index));
    elements.fileTree.appendChild(button);
  });
}

function renderEditor() {
  const lines = targetText.split('\n');
  const location = getLineColumn(typedText.length);
  const activeTokenRange = getActiveTokenRange(typedText.length);
  let charIndex = 0;
  elements.editorLines.innerHTML = '';

  lines.forEach((line, lineIndex) => {
    const row = document.createElement('div');
    row.className = 'editor-line';
    row.classList.toggle('active-line', lineIndex + 1 === location.line);

    const gutter = document.createElement('span');
    gutter.className = 'line-number';
    gutter.textContent = String(lineIndex + 1);

    const code = document.createElement('span');
    code.className = 'line-code';

    for (const expectedChar of line) {
      code.appendChild(createCharacterSpan(expectedChar, charIndex, activeTokenRange));
      charIndex++;
    }

    if (lineIndex < lines.length - 1) {
      const newlineSpan = createCharacterSpan('\n', charIndex, activeTokenRange);
      newlineSpan.textContent = newlineSpan.classList.contains('current') || newlineSpan.classList.contains('incorrect') ? ' [enter]' : '';
      newlineSpan.classList.add('enter-char');
      code.appendChild(newlineSpan);
      charIndex++;
    }

    row.appendChild(gutter);
    row.appendChild(code);
    elements.editorLines.appendChild(row);
  });

  keepCursorVisible();
}

function createCharacterSpan(expectedChar, index, activeTokenRange) {
  const span = document.createElement('span');
  span.className = 'code-char';
  span.textContent = expectedChar;

  if (expectedChar === ' ') {
    span.classList.add('space-char');
  }

  if (index >= activeTokenRange.start && index < activeTokenRange.end) {
    span.classList.add('active-token');
  }

  if (index < typedText.length) {
    span.classList.add(typedText[index] === expectedChar ? 'correct' : 'incorrect');
  } else if (index === typedText.length) {
    span.classList.add('current');
  } else {
    span.classList.add('pending');
  }
  if (index < typedText.length) {
    span.classList.add(typedText[index] === expectedChar ? 'correct' : 'incorrect');
  } else if (index === typedText.length) {
    span.classList.add('current');
  } else {
    span.classList.add('pending');
  }

  return span;
}

function getActiveTokenRange(position) {
  if (!targetText.length) {
    return { start: 0, end: 0 };
  }

  const safePosition = Math.min(position, targetText.length - 1);
  const charAtCursor = targetText[safePosition];

  if (/\s/.test(charAtCursor)) {
    return { start: safePosition, end: safePosition + 1 };
  return span;
}

function getActiveTokenRange(position) {
  if (!targetText.length) {
    return { start: 0, end: 0 };
  }

  const safePosition = Math.min(position, targetText.length - 1);
  const charAtCursor = targetText[safePosition];

  if (/\s/.test(charAtCursor)) {
    return { start: safePosition, end: safePosition + 1 };
  }

  let start = safePosition;
  let end = safePosition + 1;

  while (start > 0 && !/\s/.test(targetText[start - 1])) {
    start--;
  }

  while (end < targetText.length && !/\s/.test(targetText[end])) {
    end++;
  }

  return { start, end };
}

function handleKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (event.key === 'Backspace') {
    event.preventDefault();
    typedText = typedText.slice(0, -1);
    pageCompleted = false;
    elements.editorSurface.classList.remove('page-complete');
    afterTypingChange();
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    addTypedText('\n');
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    addTypedText(getIndentText());
    return;
  let start = safePosition;
  let end = safePosition + 1;

  while (start > 0 && !/\s/.test(targetText[start - 1])) {
    start--;
  }

  while (end < targetText.length && !/\s/.test(targetText[end])) {
    end++;
  }

  return { start, end };
}

function handleKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (event.key === 'Backspace') {
    event.preventDefault();
    typedText = typedText.slice(0, -1);
    pageCompleted = false;
    elements.editorSurface.classList.remove('page-complete');
    afterTypingChange();
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    addTypedText('\n');
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    addTypedText(getIndentText());
    return;
  }

  if (event.key.length === 1) {
    event.preventDefault();
    addTypedText(event.key);
  }

  while (end < targetText.length && !/\s/.test(targetText[end])) {
    end++;
  }

  return { start, end };
}

function handleCaptureInput() {
  const value = elements.typingCapture.value;
  elements.typingCapture.value = '';

  if (value) {
    addTypedText(value.replace(/\r\n/g, '\n'));
  }
}

function addTypedText(value) {
  if (pageCompleted || !value) {
    return;
  }

  startTimer();
  typedText = (typedText + value).slice(0, targetText.length);
  afterTypingChange();
}

function afterTypingChange() {
  renderEditor();
  updateStats();

  const mistakes = getMistakeCount();
  if (typedText.length === targetText.length && mistakes === 0) {
    completePage();
  } else if (typedText.length === targetText.length && mistakes > 0) {
    setStatus('End reached. Use Backspace and fix the red code before continuing.');
  } else if (typedText.length > 0) {
    setStatus(mistakes ? 'Fix red characters as you go.' : 'Typing in editor mode.');
  } else {
    setStatus('Click the editor and type directly on the code.');
  }
}

function completePage() {
  pageCompleted = true;
  stopTimer();
  elements.editorSurface.classList.add('page-complete');
  getCompletedSet(activeLessonIndex).add(activePageIndex);
  saveBestWpm();
  renderFileTree();

  if (activePageIndex < getActiveLesson().pages.length - 1) {
    setStatus('File complete. Next file is loading...');
    completionTimer = window.setTimeout(() => goToNextPage(false), 800);
  } else {
    setStatus('Lesson complete. Reset or choose another lesson.');
  }
}

function goToNextPage(wrapAtEnd) {
  const lesson = getActiveLesson();
  const nextIndex = activePageIndex + 1;

  if (nextIndex < lesson.pages.length) {
    loadPage(nextIndex);
    return;
  }

  if (wrapAtEnd) {
    loadPage(0);
  if (activePageIndex < getActiveLesson().pages.length - 1) {
    setStatus('File complete. Next file is loading...');
    completionTimer = window.setTimeout(() => goToNextPage(false), 800);
  } else {
    setStatus('Lesson complete. Reset or choose another lesson.');
  }
}

function goToNextPage(wrapAtEnd) {
  const lesson = getActiveLesson();
  const nextIndex = activePageIndex + 1;

  if (nextIndex < lesson.pages.length) {
    loadPage(nextIndex);
    return;
  }

  if (wrapAtEnd) {
    loadPage(0);
  }
}

function updateStats() {
  const elapsedSeconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  const correctCharacters = getCorrectCharacterCount();
  const mistakes = getMistakeCount();
  const correctCharacters = getCorrectCharacterCount();
  const mistakes = getMistakeCount();
  const accuracy = typedText.length ? Math.round((correctCharacters / typedText.length) * 100) : 100;
  const minutes = Math.max(elapsedSeconds / 60, 1 / 60);
  const wpm = startedAt ? Math.round((correctCharacters / 5) / minutes) : 0;
  const progress = getLessonProgress();
  const location = getLineColumn(typedText.length);
  const progress = getLessonProgress();
  const location = getLineColumn(typedText.length);

  elements.wpm.textContent = String(wpm);
  elements.wpm.textContent = String(wpm);
  elements.accuracy.textContent = `${accuracy}%`;
  elements.progressText.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;
  elements.bestWpm.textContent = getBestWpm() || '-';
  elements.mistakes.textContent = `Mistakes ${mistakes}`;
  elements.timer.textContent = formatTime(elapsedSeconds);
  elements.bestWpm.textContent = getBestWpm() || '-';
  elements.mistakes.textContent = `Mistakes ${mistakes}`;
  elements.timer.textContent = formatTime(elapsedSeconds);
  elements.nextKey.textContent = getNextKeyLabel();
  elements.lineColumn.textContent = `Ln ${location.line}, Col ${location.column}`;
  elements.lineColumn.textContent = `Ln ${location.line}, Col ${location.column}`;
}

function getCorrectCharacterCount() {
function getCorrectCharacterCount() {
  let count = 0;

  for (let index = 0; index < typedText.length; index++) {
    if (typedText[index] === targetText[index]) {
      count++;
    }
  }

  return count;
}

function getMistakeCount() {
function getMistakeCount() {
  let count = 0;

  for (let index = 0; index < typedText.length; index++) {
    if (typedText[index] !== targetText[index]) {
      count++;
    }
  }

  return count;
}

function getLessonProgress() {
  const lesson = getActiveLesson();
  const totalCharacters = lesson.pages.reduce((sum, page) => sum + page.text.length, 0);
  const completedCharacters = lesson.pages
    .slice(0, activePageIndex)
    .reduce((sum, page) => sum + page.text.length, 0);

  return totalCharacters ? Math.round(((completedCharacters + typedText.length) / totalCharacters) * 100) : 0;
function getLessonProgress() {
  const lesson = getActiveLesson();
  const totalCharacters = lesson.pages.reduce((sum, page) => sum + page.text.length, 0);
  const completedCharacters = lesson.pages
    .slice(0, activePageIndex)
    .reduce((sum, page) => sum + page.text.length, 0);

  return totalCharacters ? Math.round(((completedCharacters + typedText.length) / totalCharacters) * 100) : 0;
}

function getLineColumn(position) {
  const beforeCursor = targetText.slice(0, position);
  const lines = beforeCursor.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
function getLineColumn(position) {
  const beforeCursor = targetText.slice(0, position);
  const lines = beforeCursor.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

function keepCursorVisible() {
  const currentChar = elements.editorLines.querySelector('.code-char.current');

  if (!currentChar) {
    return;
  }

  const container = elements.editorSurface;
  const row = currentChar.closest('.editor-line');
  const padding = 64;
  const rowTop = row.offsetTop - container.offsetTop;
  const rowBottom = rowTop + row.offsetHeight;

  if (rowTop < container.scrollTop + padding || rowBottom > container.scrollTop + container.clientHeight - padding) {
    container.scrollTop = Math.max(rowTop - container.clientHeight / 2, 0);
  }
function keepCursorVisible() {
  const currentChar = elements.editorLines.querySelector('.code-char.current');

  if (!currentChar) {
    return;
  }

  const container = elements.editorSurface;
  const row = currentChar.closest('.editor-line');
  const padding = 64;
  const rowTop = row.offsetTop - container.offsetTop;
  const rowBottom = rowTop + row.offsetHeight;

  if (rowTop < container.scrollTop + padding || rowBottom > container.scrollTop + container.clientHeight - padding) {
    container.scrollTop = Math.max(rowTop - container.clientHeight / 2, 0);
  }
}

function getNextKeyLabel() {
  const nextChar = targetText[typedText.length];
  const nextChar = targetText[typedText.length];

  if (!nextChar) {
    return 'Done';
  }

  if (nextChar === ' ') {
    return 'Space';
  }

  if (nextChar === '\n') {
    return 'Enter';
  }

  return nextChar;
}

function getIndentText() {
  const remaining = targetText.slice(typedText.length);

  if (remaining.startsWith('    ')) {
    return '    ';
  }
}

  if (remaining.startsWith('  ')) {
    return '  ';
  }
}

function saveBestWpm() {
  const currentWpm = Number(elements.wpm.textContent);
  const bestWpm = Number(getBestWpm()) || 0;

  return '\t';
}

function startTimer() {
  if (!startedAt) {
    startedAt = Date.now();
    timerId = window.setInterval(updateStats, 1000);
  }
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function saveBestWpm() {
  const currentWpm = Number(elements.wpm.textContent);
  const bestWpm = Number(getBestWpm()) || 0;

  if (currentWpm > bestWpm) {
    localStorage.setItem(getBestWpmKey(), String(currentWpm));
  }
}

function getBestWpm() {
  return localStorage.getItem(getBestWpmKey());
}

function getBestWpmKey() {
  return `bestWpm_${getActiveLesson().title}_${getActivePage().fileName}`;
}

function getCompletedSet(lessonIndex) {
  if (!completedPages.has(lessonIndex)) {
    completedPages.set(lessonIndex, new Set());
  }

  return completedPages.get(lessonIndex);
}

function getActiveLesson() {
  return lessons[activeLessonIndex];
}

function getActivePage() {
  return getActiveLesson().pages[activePageIndex];
}

function focusEditor() {
  elements.typingCapture.focus({ preventScroll: true });
  elements.editorSurface.classList.add('focused');
}

function shouldIgnoreGlobalKey(event) {
  const tagName = event.target.tagName;

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return true;
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function saveBestWpm() {
  const currentWpm = Number(elements.wpm.textContent);
  const bestWpm = Number(getBestWpm()) || 0;

  if (currentWpm > bestWpm) {
    localStorage.setItem(getBestWpmKey(), String(currentWpm));
  }
}

function getBestWpm() {
  return localStorage.getItem(getBestWpmKey());
}

function getBestWpmKey() {
  return `bestWpm_${getActiveLesson().title}_${getActivePage().fileName}`;
}

function getCompletedSet(lessonIndex) {
  if (!completedPages.has(lessonIndex)) {
    completedPages.set(lessonIndex, new Set());
  }

  return completedPages.get(lessonIndex);
}

function getActiveLesson() {
  return lessons[activeLessonIndex];
}

function getActivePage() {
  return getActiveLesson().pages[activePageIndex];
}

function focusEditor() {
  elements.typingCapture.focus({ preventScroll: true });
  elements.editorSurface.classList.add('focused');
}

function shouldIgnoreGlobalKey(event) {
  const tagName = event.target.tagName;

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return true;
  }

  return ['BUTTON', 'SELECT', 'INPUT'].includes(tagName);
}

function clearCompletionTimer() {
  if (completionTimer) {
    window.clearTimeout(completionTimer);
    completionTimer = null;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
  return ['BUTTON', 'SELECT', 'INPUT'].includes(tagName);
}

function clearCompletionTimer() {
  if (completionTimer) {
    window.clearTimeout(completionTimer);
    completionTimer = null;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
}

init();
