# Docker Commands Reference Guide

A complete guide to essential Docker commands used daily by DevOps and Cloud Engineers.

---

## 1. Image Management

| Command | Description & DevOps Use Case |
|---|---|
| `docker build -t <image-name>:<tag> .` | Build an image from a Dockerfile in the current directory. |
| `docker build --no-cache -t <image-name>:<tag> .` | Build image from scratch ignoring cached layers (troubleshooting build steps). |
| `docker images` | List all local images with repository, tag, ID, creation date, and size. |
| `docker tag <source-image> <target-repo>:<tag>` | Tag an existing image for pushing to ACR, ECR, or Docker Hub. |
| `docker push <registry>/<image>:<tag>` | Push an image to a remote container registry. |
| `docker pull <image>:<tag>` | Pull an image from Docker Hub or a private registry. |
| `docker rmi <image-id>` | Remove one or more local images. |
| `docker rmi $(docker images -f "dangling=true" -q)` | Clean up dangling (untagged) images. |
| `docker history <image-name>` | Inspect layers, size, and instructions of an image to optimize size. |

---

## 2. Container Lifecycle

| Command | Description & DevOps Use Case |
|---|---|
| `docker run -d --name <name> -p 8080:80 <image>` | Run container in background (detached), map host port 8080 to container port 80. |
| `docker run -d --restart=unless-stopped <image>` | Run container with automatic restart policy on failure/reboot. |
| `docker run -d --env-file .env -v $(pwd)/data:/app/data <image>` | Run with environment variables file and bind-mount persistent directory. |
| `docker ps` | List all running containers. |
| `docker ps -a` | List all containers including stopped/exited containers. |
| `docker stop <container-id>` | Gracefully stop running container (`SIGTERM`, then `SIGKILL` after 10s). |
| `docker start <container-id>` | Start one or more stopped containers. |
| `docker restart <container-id>` | Restart container (useful after config updates). |
| `docker kill <container-id>` | Forcefully terminate container immediately (`SIGKILL`). |
| `docker rm <container-id>` | Remove stopped container. |
| `docker rm -f <container-id>` | Force remove running container. |

---

## 3. Container Debugging & Inspection

| Command | Description & DevOps Use Case |
|---|---|
| `docker logs <container-name>` | Fetch stdout and stderr logs of a container. |
| `docker logs -f --tail 100 <container-name>` | Follow live logs, showing last 100 lines (critical during outages). |
| `docker exec -it <container-name> sh` | Open an interactive shell inside a running container for live troubleshooting. |
| `docker inspect <container-or-image>` | View full JSON metadata (IP address, mounts, environment, health check). |
| `docker top <container-name>` | Display running processes inside container. |
| `docker stats` | Live stream of container CPU, memory, network I/O, and block I/O usage. |
| `docker cp <src> <container>:<dest>` | Copy files between host and container without rebuilding. |
| `docker diff <container-name>` | Inspect file system changes made to container since launch. |

---

## 4. Networking

| Command | Description & DevOps Use Case |
|---|---|
| `docker network ls` | List networks (bridge, host, none, custom). |
| `docker network create --driver bridge my-net` | Create custom bridge network with built-in DNS service discovery between containers. |
| `docker network connect my-net <container>` | Connect a running container to an existing network. |
| `docker network disconnect my-net <container>` | Disconnect a container from a network. |
| `docker network inspect my-net` | Inspect connected containers, gateway, and IP allocations. |
| `docker network rm my-net` | Remove custom network. |

---

## 5. Volumes and Storage

| Command | Description & DevOps Use Case |
|---|---|
| `docker volume ls` | List all managed Docker volumes. |
| `docker volume create my-vol` | Create a persistent volume managed by Docker. |
| `docker run -d -v my-vol:/var/lib/mysql mysql:8` | Mount named volume into container for persistent data. |
| `docker volume inspect my-vol` | Show volume mount point on host filesystem. |
| `docker volume rm my-vol` | Delete volume (must not be attached to any container). |
| `docker volume prune -f` | Delete all unused volumes to recover disk space. |

---

## 6. System Cleanup

| Command | Description & DevOps Use Case |
|---|---|
| `docker system df` | Show Docker disk usage across images, containers, local volumes, and build cache. |
| `docker system prune -f` | Remove stopped containers, dangling images, and unused networks. |
| `docker system prune -a --volumes -f` | Nuclear clean: remove all stopped containers, unused networks, all unused images, and all unused volumes. |

---

## 7. Docker Compose

| Command | Description & DevOps Use Case |
|---|---|
| `docker compose up -d` | Build, create, and start containers defined in `docker-compose.yml` in background. |
| `docker compose down` | Stop and remove containers, networks, and images created by `up`. |
| `docker compose down -v` | Stop containers and also delete named volumes. |
| `docker compose ps` | List status of services in the compose project. |
| `docker compose logs -f <service-name>` | Follow logs for a specific service. |
| `docker compose exec <service-name> sh` | Execute command in a running service container. |
| `docker compose build --no-cache` | Rebuild images defined in compose file. |
