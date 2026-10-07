const lessons = [
  {
    title: 'Terraform: Storage Account (Normal & for_each Module)',
    type: 'Terraform lesson',
    pages: [
      {
        fileName: 'storage-normal.tf',
        text: `resource "azurerm_resource_group" "rg" {
  name = "rg-devops-dev"
  location = "eastus"
  tags = {
    Environment = "dev"
    ManagedBy = "Terraform"
  }
}

resource "azurerm_storage_account" "sa" {
  name = "stdevops01"
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  account_tier = "Standard"
  account_replication_type = "LRS"
  account_kind = "StorageV2"
  min_tls_version = "TLS1_2"
  https_traffic_only_enabled = true

  blob_properties {
    versioning_enabled = true
    delete_retention_policy {
      days = 7
    }
  }

  tags = {
    Environment = "dev"
  }
}

resource "azurerm_storage_container" "data" {
  name = "data-container"
  storage_account_id = azurerm_storage_account.sa.id
  container_access_type = "private"
}`
      },
      {
        fileName: 'modules/storage_account/main.tf',
        text: `resource "azurerm_storage_account" "this" {
  name = var.name
  resource_group_name = var.resource_group_name
  location = var.location
  account_tier = var.account_tier
  account_replication_type = var.account_replication_type
  min_tls_version = "TLS1_2"
  tags = var.tags
}

resource "azurerm_storage_container" "this" {
  count = var.container_name != null ? 1 : 0
  name = var.container_name
  storage_account_id = azurerm_storage_account.this.id
  container_access_type = "private"
}`
      },
      {
        fileName: 'storage-for-each.tf',
        text: `locals {
  storage_accounts = {
    logs = {
      name = "stdevopslogs01"
      tier = "Standard"
      replication = "LRS"
    }
    data = {
      name = "stdevopsdata01"
      tier = "Standard"
      replication = "ZRS"
    }
    backups = {
      name = "stdevopsbkp01"
      tier = "Standard"
      replication = "GRS"
    }
  }
}

module "storage_accounts" {
  source = "./modules/storage_account"
  for_each = local.storage_accounts

  name = each.value.name
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  account_tier = each.value.tier
  account_replication_type = each.value.replication
  tags = {
    Role = each.key
    Environment = "dev"
  }
}`
      }
    ]
  },
  {
    title: 'Terraform: Linux VM (Normal & for_each Module)',
    type: 'Terraform lesson',
    pages: [
      {
        fileName: 'linux-vm-normal.tf',
        text: `resource "azurerm_public_ip" "pip" {
  name = "pip-vm-dev"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method = "Static"
  sku = "Standard"
}

resource "azurerm_network_interface" "nic" {
  name = "nic-vm-dev"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name = "internal"
    subnet_id = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id = azurerm_public_ip.pip.id
  }
}

resource "azurerm_linux_virtual_machine" "vm" {
  name = "vm-dev-web"
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  size = "Standard_B2s"
  admin_username = "azureuser"
  disable_password_authentication = true
  network_interface_ids = [azurerm_network_interface.nic.id]

  admin_ssh_key {
    username = "azureuser"
    public_key = var.ssh_public_key
  }

  os_disk {
    caching = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer = "0001-com-ubuntu-server-jammy"
    sku = "22_04-lts"
    version = "latest"
  }
}`
      },
      {
        fileName: 'modules/linux_vm/main.tf',
        text: `resource "azurerm_public_ip" "this" {
  name = "pip-\${var.vm_name}"
  location = var.location
  resource_group_name = var.resource_group_name
  allocation_method = "Static"
  sku = "Standard"
  tags = var.tags
}

resource "azurerm_network_interface" "this" {
  name = "nic-\${var.vm_name}"
  location = var.location
  resource_group_name = var.resource_group_name
  tags = var.tags

  ip_configuration {
    name = "internal"
    subnet_id = var.subnet_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id = azurerm_public_ip.this.id
  }
}

resource "azurerm_linux_virtual_machine" "this" {
  name = var.vm_name
  resource_group_name = var.resource_group_name
  location = var.location
  size = var.vm_size
  admin_username = var.admin_username
  disable_password_authentication = true
  network_interface_ids = [azurerm_network_interface.this.id]
  tags = var.tags

  admin_ssh_key {
    username = var.admin_username
    public_key = var.admin_ssh_public_key
  }

  os_disk {
    caching = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer = "0001-com-ubuntu-server-jammy"
    sku = "22_04-lts"
    version = "latest"
  }
}`
      },
      {
        fileName: 'linux-vm-for-each.tf',
        text: `locals {
  vms = {
    web = {
      size = "Standard_B2s"
      role = "frontend"
    }
    api = {
      size = "Standard_B2s"
      role = "backend"
    }
  }
}

module "linux_vms" {
  source = "./modules/linux_vm"
  for_each = local.vms

  vm_name = each.key
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  subnet_id = azurerm_subnet.subnet.id
  vm_size = each.value.size
  admin_username = "azureuser"
  admin_ssh_public_key = var.ssh_public_key
  tags = {
    Role = each.value.role
    Environment = "dev"
  }
}`
      }
    ]
  },
  {
    title: 'Docker: Multi-Stage Dockerfiles (React, Java, .NET, Python)',
    type: 'Docker lesson',
    pages: [
      {
        fileName: 'react.Dockerfile',
        text: `# Stage 1: Build React app
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
      },
      {
        fileName: 'java-maven.Dockerfile',
        text: `# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]`
      },
      {
        fileName: 'dotnet.Dockerfile',
        text: `# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "YourApp.dll"]`
      },
      {
        fileName: 'python.Dockerfile',
        text: `# Stage 1: Build dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps -r requirements.txt -w /wheels

# Stage 2: Run
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache /wheels/*
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]`
      }
    ]
  },
  {
    title: 'Docker: Essential Commands & Uses',
    type: 'Docker lesson',
    pages: [
      {
        fileName: '01-docker-lifecycle.sh',
        text: `# Build and tag images
docker build -t myapp:1.0 .
docker build --no-cache -t myapp:latest .
docker tag myapp:latest myregistry.azurecr.io/myapp:1.0
docker images
docker history myapp:latest

# Run containers with port and environment
docker run -d --name web -p 8080:80 myapp:1.0
docker run -d --name db -e MYSQL_ROOT_PASSWORD=secret -v db-data:/var/lib/mysql mysql:8
docker ps
docker ps -a
docker stop web db
docker start web
docker restart web
docker rm -f web db
docker rmi myapp:1.0`
      },
      {
        fileName: '02-docker-inspect-troubleshoot.sh',
        text: `# Follow container logs live
docker logs -f --tail 100 web

# Open interactive shell inside running container
docker exec -it web sh

# Inspect container metadata and IP address
docker inspect web --format='{{.NetworkSettings.IPAddress}}'

# Stream container resource consumption
docker stats --no-stream

# View running processes inside container
docker top web

# Copy file into or out of container
docker cp web:/app/config.json ./config.json`
      },
      {
        fileName: '03-docker-network-volumes-compose.sh',
        text: `# Create and inspect custom bridge network
docker network create --driver bridge app-net
docker network connect app-net web
docker network inspect app-net

# Create and manage persistent volumes
docker volume create app-storage
docker volume ls
docker volume inspect app-storage

# System cleanup (reclaim disk space)
docker system df
docker system prune -f
docker system prune -a --volumes -f

# Docker Compose workflows
docker compose up -d
docker compose ps
docker compose logs -f web
docker compose down -v`
      }
    ]
  },
  {
    title: 'Kubernetes: Core Manifests',
    type: 'Kubernetes lesson',
    pages: [
      {
        fileName: '01-namespace.yaml',
        text: `apiVersion: v1
kind: Namespace
metadata:
  name: devops-practice
  labels:
    environment: dev
    team: devops`
      },
      {
        fileName: '02-configmap.yaml',
        text: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: devops-practice
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  PORT: "8080"`
      },
      {
        fileName: '03-secret.yaml',
        text: `apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: devops-practice
type: Opaque
stringData:
  DB_PASSWORD: "SuperSecretPassword123!"
  API_KEY: "prod-key-xyz-98765"`
      },
      {
        fileName: '06-deployment.yaml',
        text: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api
  namespace: devops-practice
  labels:
    app: web-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web-api
  template:
    metadata:
      labels:
        app: web-api
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
      containers:
        - name: api
          image: nginx:1.27-alpine
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secret
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5`
      },
      {
        fileName: '07-service.yaml',
        text: `apiVersion: v1
kind: Service
metadata:
  name: web-api-service
  namespace: devops-practice
spec:
  type: ClusterIP
  selector:
    app: web-api
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 8080`
      },
      {
        fileName: '08-ingress.yaml',
        text: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-api-ingress
  namespace: devops-practice
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: api.devops.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-api-service
                port:
                  number: 80`
      }
    ]
  },
  {
    title: 'Kubernetes: Storage & Advanced Manifests',
    type: 'Kubernetes lesson',
    pages: [
      {
        fileName: '04-pv.yaml',
        text: `apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-storage-pv
spec:
  storageClassName: standard
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data/app-storage`
      },
      {
        fileName: '05-pvc.yaml',
        text: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage-pvc
  namespace: devops-practice
spec:
  storageClassName: standard
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi`
      },
      {
        fileName: '09-hpa.yaml',
        text: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-api-hpa
  namespace: devops-practice
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 75`
      },
      {
        fileName: '10-statefulset.yaml',
        text: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database
  namespace: devops-practice
spec:
  serviceName: "db-headless"
  replicas: 2
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        storageClassName: standard
        resources:
          requests:
            storage: 5Gi`
      },
      {
        fileName: '13-rbac.yaml',
        text: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: devops-practice

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: devops-practice
rules:
  - apiGroups: [""]
    resources: ["pods", "configmaps"]
    verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: devops-practice
subjects:
  - kind: ServiceAccount
    name: app-sa
    namespace: devops-practice
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io`
      },
      {
        fileName: '14-networkpolicy.yaml',
        text: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: devops-practice
spec:
  podSelector:
    matchLabels:
      app: web-api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080`
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
az group create --name <resource-group> --location eastus
az aks get-versions --location eastus --output table
az aks create --name <cluster-name> --resource-group <resource-group> --node-count 3
az aks get-credentials --name <cluster-name> --resource-group <resource-group> --overwrite-existing
kubectl cluster-info
kubectl get nodes -o wide`
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
kubectl describe deployment web-api -n dev
kubectl logs deployment/web-api -n dev
kubectl exec -it deployment/web-api -n dev -- sh`
      }
    ]
  },
  {
    title: 'AKS Top 20 Troubleshooting',
    type: 'AKS troubleshooting lesson',
    pages: [
      {
        fileName: '01-nodes-and-system.sh',
        text: `# 01 Check connection and context
az aks get-credentials -g <resource-group> -n <cluster-name> --overwrite-existing
kubectl cluster-info
kubectl config get-contexts

# 02 Node status and events
kubectl get nodes -o wide
kubectl describe node <node-name>
kubectl get events -A --sort-by=.lastTimestamp
kubectl top nodes
kubectl top pods -A

# 03 kube-system health
kubectl get pods -n kube-system
kubectl logs <pod-name> -n kube-system --previous`
      },
      {
        fileName: '02-pods-and-workloads.sh',
        text: `# 04 Pods stuck Pending
kubectl get pods -A --field-selector=status.phase=Pending
kubectl describe pod <pod-name> -n <namespace>

# 05 CrashLoopBackOff & OOMKilled
kubectl get pods -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
kubectl describe pod <pod-name> -n <namespace>
kubectl top pod <pod-name> -n <namespace>

# 06 Network endpoints & Ingress
kubectl get svc -n <namespace>
kubectl get endpoints <service-name> -n <namespace>
kubectl get ingress -A
kubectl describe ingress <ingress-name> -n <namespace>`
      }
    ]
  },
  {
    title: 'Terraform CI/CD Pipelines',
    type: 'CI/CD lesson',
    pages: [
      {
        fileName: 'github-actions.yml',
        text: `name: Terraform CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  terraform:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./terraform

    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.9.8"

      - name: Terraform Init
        run: terraform init

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        run: terraform plan

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve`
      },
      {
        fileName: 'azure-pipelines.yml',
        text: `trigger:
  - main

pool:
  vmImage: ubuntu-latest

steps:
- task: TerraformInstaller@0
  inputs:
    terraformVersion: '1.9.8'

- task: TerraformTaskV2@2
  inputs:
    command: 'init'
    workingDirectory: 'terraform'

- task: TerraformTaskV2@2
  inputs:
    command: 'plan'
    workingDirectory: 'terraform'

- task: ManualValidation@0
  inputs:
    instructions: 'Approve Terraform Changes?'

- task: TerraformTaskV2@2
  inputs:
    command: 'apply'
    workingDirectory: 'terraform'`
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
  accuracy: document.getElementById('accuracy'),
  progressText: document.getElementById('progressText'),
  bestWpm: document.getElementById('bestWpm'),
  mistakes: document.getElementById('mistakes'),
  timer: document.getElementById('timer'),
  nextKey: document.getElementById('nextKey')
};

let activeLessonIndex = 0;
let activePageIndex = 0;
let targetText = '';
let typedText = '';
let startedAt = null;
let timerId = null;
let completionTimer = null;
let pageCompleted = false;
let inputHistory = [];
const completedPages = new Map();

function init() {
  renderLessonOptions();
  bindEvents();
  loadLesson(0, 0);
}

function bindEvents() {
  elements.lessonSelect.addEventListener('change', (event) => {
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
}

function renderLessonOptions() {
  elements.lessonSelect.innerHTML = '';
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
  inputHistory = [];
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
  setStatus('Smart typing active: Enter auto-indents. Type code directly without spacing hassle.');
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
    };

    const existingCustomIndex = lessons.findIndex((lesson) => lesson.title === 'Custom Upload');
    if (existingCustomIndex >= 0) {
      lessons[existingCustomIndex] = customLesson;
      elements.lessonSelect.options[existingCustomIndex].textContent = customLesson.title;
      loadLesson(existingCustomIndex, 0);
    } else {
      lessons.push(customLesson);
      const option = document.createElement('option');
      option.value = lessons.length - 1;
      option.textContent = customLesson.title;
      elements.lessonSelect.appendChild(option);
      loadLesson(lessons.length - 1, 0);
    }
  };
  reader.readAsText(file);
}

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
    button.innerHTML = `<span>${completedSet.has(index) ? 'ok' : 'code'}</span><strong></strong>`;
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

/* SMART TYPING ENGINE (VS CODE STYLE: AUTO-INDENT & REQUIRED SPACES ONLY) */

function handleKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (event.key === 'Backspace') {
    event.preventDefault();
    if (typedText.length > 0) {
      const step = inputHistory.pop() || 1;
      typedText = typedText.slice(0, Math.max(0, typedText.length - step));
      pageCompleted = false;
      elements.editorSurface.classList.remove('page-complete');
      afterTypingChange();
    }
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    handleEnterKey();
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    handleTabKey();
    return;
  }

  if (event.key === ' ') {
    event.preventDefault();
    handleSpaceKey();
    return;
  }

  if (event.key.length === 1) {
    event.preventDefault();
    handleCharacterKey(event.key);
    return;
  }
}

function handleEnterKey() {
  if (pageCompleted) return;

  // If next expected character is newline
  if (typedText.length < targetText.length && targetText[typedText.length] === '\n') {
    let toAdd = '\n';
    let nextIdx = typedText.length + 1;

    // Auto-advance past consecutive blank lines
    while (nextIdx < targetText.length && targetText[nextIdx] === '\n') {
      toAdd += '\n';
      nextIdx++;
    }

    // Auto-indent: include leading spaces of the new line so human does not type them
    while (nextIdx < targetText.length && targetText[nextIdx] === ' ') {
      toAdd += ' ';
      nextIdx++;
    }

    inputHistory.push(toAdd.length);
    addTypedText(toAdd);
  } else {
    // If user hit Enter before end of line, still record action
    inputHistory.push(1);
    addTypedText('\n');
  }
}

function handleSpaceKey() {
  if (pageCompleted) return;

  if (typedText.length < targetText.length && targetText[typedText.length] === ' ') {
    // Advance through ALL consecutive spaces in one single press
    let count = 0;
    while (typedText.length + count < targetText.length && targetText[typedText.length + count] === ' ') {
      count++;
    }
    const toAdd = targetText.slice(typedText.length, typedText.length + count);
    inputHistory.push(toAdd.length);
    addTypedText(toAdd);
  } else {
    inputHistory.push(1);
    addTypedText(' ');
  }
}

function handleTabKey() {
  if (pageCompleted) return;

  if (typedText.length < targetText.length && targetText[typedText.length] === ' ') {
    handleSpaceKey();
  } else {
    const indent = getIndentText();
    inputHistory.push(indent.length);
    addTypedText(indent);
  }
}

function handleCharacterKey(char) {
  if (pageCompleted) return;

  // Check if expected position starts with spaces and matches character right after
  let spaceCount = 0;
  while (typedText.length + spaceCount < targetText.length && targetText[typedText.length + spaceCount] === ' ') {
    spaceCount++;
  }

  if (spaceCount > 0 && typedText.length + spaceCount < targetText.length && targetText[typedText.length + spaceCount] === char) {
    // Automatically advance through intermediate spaces and accept the matching character
    const toAdd = targetText.slice(typedText.length, typedText.length + spaceCount) + char;
    inputHistory.push(toAdd.length);
    addTypedText(toAdd);
    return;
  }

  // Standard character matching
  inputHistory.push(1);
  addTypedText(char);
}

function handleCaptureInput() {
  const value = elements.typingCapture.value;
  elements.typingCapture.value = '';

  if (value) {
    const cleanValue = value.replace(/\r\n/g, '\n');
    for (const ch of cleanValue) {
      if (ch === '\n') {
        handleEnterKey();
      } else if (ch === ' ') {
        handleSpaceKey();
      } else {
        handleCharacterKey(ch);
      }
    }
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
    setStatus('End reached. Use Backspace and fix the red characters.');
  } else if (typedText.length > 0) {
    setStatus(mistakes ? 'Fix red characters as you go.' : 'Typing in VS Code smart-indent mode.');
  } else {
    setStatus('Click the editor and start typing code.');
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
    setStatus('File complete! Next file is loading...');
    completionTimer = window.setTimeout(() => goToNextPage(false), 800);
  } else {
    setStatus('Lesson complete! Choose another lesson from the dropdown.');
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
  const accuracy = typedText.length ? Math.round((correctCharacters / typedText.length) * 100) : 100;
  const minutes = Math.max(elapsedSeconds / 60, 1 / 60);
  const wpm = startedAt ? Math.round((correctCharacters / 5) / minutes) : 0;
  const progress = getLessonProgress();
  const location = getLineColumn(typedText.length);

  elements.wpm.textContent = String(wpm);
  elements.accuracy.textContent = `${accuracy}%`;
  elements.progressText.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;
  elements.bestWpm.textContent = getBestWpm() || '-';
  elements.mistakes.textContent = `Mistakes ${mistakes}`;
  elements.timer.textContent = formatTime(elapsedSeconds);
  elements.nextKey.textContent = getNextKeyLabel();
  elements.lineColumn.textContent = `Ln ${location.line}, Col ${location.column}`;
}

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
}

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
}

function getNextKeyLabel() {
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

  if (remaining.startsWith('  ')) {
    return '  ';
  }

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
