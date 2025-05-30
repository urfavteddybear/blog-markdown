---
title: "Setting Up Nginx Web Server: From Installation to SSL Configuration"
date: "2025-01-15"
description: "Complete guide to installing, configuring, and securing Nginx web server with SSL certificates, virtual hosts, and performance optimization."
tags: ["nginx", "web-server", "ssl", "linux", "devops", "security"]
image: "/images/Fallback.png"
---

# Setting Up Nginx Web Server: From Installation to SSL Configuration

Nginx is one of the most popular web servers in the world, known for its high performance, stability, and low resource consumption. This comprehensive guide will walk you through installing and configuring Nginx from scratch.

## What is Nginx?

Nginx (pronounced "engine-x") is a web server that can also be used as a reverse proxy, load balancer, mail proxy, and HTTP cache. It's designed to handle high-traffic websites and is used by major companies like Netflix, Airbnb, and GitHub.

## Installation

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install nginx -y
```

### CentOS/RHEL/Rocky Linux

```bash
sudo yum install epel-release -y
sudo yum install nginx -y
```

### Start and Enable Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

## Basic Configuration

### Main Configuration File

The main Nginx configuration file is located at `/etc/nginx/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss;

    # Include server blocks
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### Creating a Virtual Host

Create a new server block for your website:

```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/yourdomain.com;
    index index.html index.htm index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Optimize file serving
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Configuration with Let's Encrypt

### Install Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y
```

### Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Updated SSL Configuration

After running Certbot, your configuration will be updated automatically. Here's what it should look like:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    root /var/www/yourdomain.com;
    index index.html index.htm index.php;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## Performance Optimization

### Worker Processes and Connections

```nginx
worker_processes auto;
worker_connections 1024;
worker_rlimit_nofile 2048;
```

### Gzip Compression

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

### Caching Headers

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}
```

## Security Hardening

### Rate Limiting

```nginx
http {
    limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}

server {
    location / {
        limit_req zone=one burst=5;
    }
    
    location /api/ {
        limit_req zone=api burst=20;
    }
}
```

### Hide Nginx Version

```nginx
http {
    server_tokens off;
}
```

### Additional Security Headers

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## Load Balancing

### Upstream Configuration

```nginx
upstream backend {
    least_conn;
    server 192.168.1.10:8080 weight=3;
    server 192.168.1.11:8080 weight=2;
    server 192.168.1.12:8080 backup;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Common Use Cases

### Reverse Proxy for Node.js

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Static File Serving

```nginx
server {
    listen 80;
    server_name static.yourdomain.com;
    root /var/www/static;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

## Monitoring and Logging

### Enable Access Logs

```nginx
access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;
```

### Log Analysis with GoAccess

Install GoAccess for real-time log analysis:

```bash
sudo apt install goaccess -y
goaccess /var/log/nginx/access.log -c
```

## Maintenance Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check Nginx status
sudo systemctl status nginx
```

## Troubleshooting

### Common Issues

1. **Configuration Errors**: Always test with `nginx -t`
2. **Permission Issues**: Check file ownership and permissions
3. **Port Conflicts**: Ensure no other services use port 80/443
4. **Firewall**: Open necessary ports in firewall

### Useful Commands

```bash
# Check which process is using port 80
sudo netstat -tlnp | grep :80

# Check Nginx processes
ps aux | grep nginx

# Check configuration syntax
sudo nginx -T
```

## Conclusion

Nginx is a powerful and flexible web server that can handle high-traffic websites with ease. This guide covered the basics of installation, configuration, SSL setup, and optimization. With proper configuration, Nginx can significantly improve your website's performance and security.

Remember to regularly update Nginx, monitor your logs, and keep your SSL certificates renewed for optimal security and performance.
