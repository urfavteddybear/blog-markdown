# Simple Docker Deployment Guide

Deploy your Next.js blog using Docker - the easiest and most reliable method.

## Prerequisites

- A server with Docker and Docker Compose installed
- Git installed on your server
- Your domain pointed to your server's IP

## Quick Deployment Steps

1. **Clone your project to the server:**
   ```bash
   git clone <your-repository-url> blog-next
   cd blog-next
   ```

2. **Configure your domain:**
   - Edit `nginx.conf` and replace `your-domain.com` with your actual domain
   - Or remove the nginx service from `docker-compose.yml` if you don't need a reverse proxy

3. **Deploy:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

That's it! Your blog will be running.

## What Each File Does

- **Dockerfile**: Builds your blog into a container
- **docker-compose.yml**: Runs your blog + nginx reverse proxy
- **nginx.conf**: Routes traffic from port 80 to your blog
- **deploy.sh**: Simple script that builds and starts everything

## URLs After Deployment

- **With nginx**: `http://your-domain.com` (port 80)
- **Direct access**: `http://your-server-ip:3000`
- **Health check**: `http://your-server-ip:3000/api/health`

## Managing Your Deployment

```bash
# View logs
docker-compose logs -f blog

# Restart
docker-compose restart blog

# Stop
docker-compose down

# Update after changes
git pull
./deploy.sh
```

## SSL/HTTPS Setup (Optional)

Once your blog is running, you can add SSL:

```bash
# Install certbot on your server
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically update your nginx config
```

## Troubleshooting

**Port already in use:**
```bash
docker-compose down
docker-compose up -d
```

**Check what's running:**
```bash
docker-compose ps
docker-compose logs blog
```

**Domain not working:**
- Make sure your domain's DNS points to your server's IP
- Check if port 80 is open: `sudo ufw allow 80`

That's all you need! Simple Docker deployment with optional nginx reverse proxy.
