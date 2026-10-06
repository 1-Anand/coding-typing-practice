#!/usr/bin/env bash
# Everyday Docker commands practice script (clean required spaces)

# 1. Build and tag images
docker build -t myapp:1.0 .
docker build --no-cache -t myapp:latest .
docker tag myapp:latest myregistry.azurecr.io/myapp:1.0
docker images
docker history myapp:latest

# 2. Run containers with ports, env, and volumes
docker run -d --name web-app -p 8080:80 myapp:1.0
docker run -d --name db -e MYSQL_ROOT_PASSWORD=secret -v db-data:/var/lib/mysql mysql:8
docker ps
docker ps -a

# 3. Troubleshoot and inspect
docker logs -f --tail 50 web-app
docker exec -it web-app sh
docker inspect web-app
docker stats --no-stream
docker top web-app

# 4. Networking
docker network create --driver bridge app-net
docker network connect app-net web-app
docker network inspect app-net

# 5. Manage volumes
docker volume create app-storage
docker volume ls
docker volume inspect app-storage

# 6. Stop and cleanup
docker stop web-app db
docker restart web-app
docker rm web-app db
docker rmi myapp:1.0
docker system df
docker system prune -f

# 7. Docker Compose workflows
docker compose up -d
docker compose ps
docker compose logs -f web
docker compose down -v
