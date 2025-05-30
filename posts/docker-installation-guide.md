---
title: "Setting Up Docker on Ubuntu and Debian: Complete Guide"
date: "2024-01-25"
description: "A comprehensive tutorial on installing and configuring Docker on Ubuntu and Debian systems, including best practices and troubleshooting."
tags: ["docker", "ubuntu", "debian", "linux", "containers", "devops"]
image: "/images/docker-installation-guide.webp"
---

# Setting Up Docker on Ubuntu and Debian: Complete Guide

Docker has revolutionized how we deploy and manage applications. This comprehensive guide will walk you through installing Docker on Ubuntu and Debian systems, from basic installation to advanced configuration.

## Prerequisites

Before installing Docker, ensure your system meets these requirements:

- Ubuntu 20.04 LTS or later, or Debian 10 or later
- 64-bit processor
- At least 4GB of RAM (8GB recommended)
- Sudo privileges

## Method 1: Installing from Official Docker Repository (Recommended)

### Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### Install Prerequisites

```bash
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### Add Docker's Official GPG Key

```bash
# For Ubuntu
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# For Debian
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### Add Docker Repository

```bash
# For Ubuntu
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# For Debian
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Install Docker Engine

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

## Method 2: Using Convenience Script

Docker provides a convenience script for quick installation:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**Note**: Only use this method for development environments, not production.

## Post-Installation Setup

### Add User to Docker Group

To run Docker without sudo:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Enable Docker Service

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

### Verify Installation

```bash
docker --version
docker run hello-world
```

## Docker Compose Installation

Docker Compose is now included as a plugin. Verify it's installed:

```bash
docker compose version
```

If not available, install manually:

```bash
sudo apt install docker-compose-plugin
```

## Essential Docker Configuration

### Configure Docker Daemon

Create or edit `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "registry-mirrors": []
}
```

### Set Resource Limits

For production environments, configure resource limits:

```json
{
  "default-ulimits": {
    "nofile": {
      "Hard": 64000,
      "Name": "nofile",
      "Soft": 64000
    }
  }
}
```

## Basic Docker Commands

### Container Management

```bash
# Run a container
docker run -d --name nginx-server nginx

# List running containers
docker ps

# Stop a container
docker stop nginx-server

# Remove a container
docker rm nginx-server

# View container logs
docker logs nginx-server
```

### Image Management

```bash
# Pull an image
docker pull ubuntu:22.04

# List images
docker images

# Remove an image
docker rmi ubuntu:22.04

# Build an image
docker build -t myapp .
```

## Troubleshooting Common Issues

### Permission Denied Error

If you get permission denied errors:

```bash
sudo chmod 666 /var/run/docker.sock
```

### Docker Service Not Starting

Check service status and logs:

```bash
sudo systemctl status docker
sudo journalctl -u docker.service
```

### Storage Issues

Clean up unused resources:

```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes
docker volume prune
```

## Security Best Practices

### 1. Run Containers as Non-Root

```dockerfile
FROM ubuntu:22.04
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

### 2. Use Official Images

Always prefer official images from Docker Hub:

```bash
docker pull nginx:alpine
docker pull node:18-alpine
```

### 3. Scan Images for Vulnerabilities

```bash
docker scout quickview
docker scout cves ubuntu:22.04
```

### 4. Limit Container Resources

```bash
docker run -d --memory="512m" --cpus="0.5" nginx
```

## Performance Optimization

### Configure Storage Driver

For better performance on SSDs:

```json
{
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
```

### Enable BuildKit

Add to your shell profile:

```bash
export DOCKER_BUILDKIT=1
```

## Uninstalling Docker

If you need to remove Docker:

```bash
sudo apt purge docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

## Next Steps

With Docker installed, you can:

1. Create your first Dockerfile
2. Set up Docker Compose for multi-container applications
3. Explore container orchestration with Docker Swarm
4. Learn about Docker networking and volumes
5. Set up a container registry

Docker opens up endless possibilities for application deployment and development. Start with simple containers and gradually explore more advanced features as you become comfortable with the basics.
