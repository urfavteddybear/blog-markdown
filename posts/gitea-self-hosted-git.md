---
title: "Complete Git Server Setup with Gitea: Self-Hosted Git Repository Management"
date: "2025-01-18"
description: "Learn how to set up and configure Gitea, a lightweight self-hosted Git service, including installation, SSL configuration, and advanced features."
tags: ["git", "gitea", "self-hosted", "version-control", "devops", "linux"]
image: "/images/Fallback.png"
---

# Complete Git Server Setup with Gitea: Self-Hosted Git Repository Management

Gitea is a lightweight, self-hosted Git service that provides a GitHub-like experience for managing your code repositories. This comprehensive guide will walk you through setting up Gitea from installation to advanced configuration.

## Why Choose Gitea?

Gitea offers several advantages over other Git hosting solutions:

- **Lightweight**: Low resource consumption
- **Fast**: Written in Go for optimal performance
- **Easy Installation**: Single binary deployment
- **Feature-Rich**: Issues, pull requests, wiki, and more
- **Self-Hosted**: Complete control over your data
- **Active Development**: Regular updates and improvements

## Prerequisites

Before starting, ensure you have:

- Linux server with at least 1GB RAM (2GB recommended)
- Domain name or static IP address
- SSL certificate (Let's Encrypt recommended)
- Database server (PostgreSQL, MySQL, or SQLite)
- Basic knowledge of Linux administration

## Installation Methods

### Method 1: Binary Installation (Recommended)

#### Step 1: Create Gitea User

```bash
sudo adduser --system --shell /bin/bash --gecos 'Git Version Control' --group --disabled-password --home /home/git git
```

#### Step 2: Download and Install Gitea

```bash
# Download latest Gitea binary
wget -O gitea https://dl.gitea.io/gitea/1.21.1/gitea-1.21.1-linux-amd64

# Make it executable and move to system path
chmod +x gitea
sudo mv gitea /usr/local/bin/gitea

# Verify installation
gitea --version
```

#### Step 3: Create Directory Structure

```bash
sudo mkdir -p /var/lib/gitea/{custom,data,log}
sudo chown -R git:git /var/lib/gitea/
sudo chmod -R 750 /var/lib/gitea/
sudo mkdir /etc/gitea
sudo chown root:git /etc/gitea
sudo chmod 770 /etc/gitea
```

### Method 2: Docker Installation

#### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: "3"

networks:
  gitea:
    external: false

services:
  server:
    image: gitea/gitea:1.21.1
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=db:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=gitea
    restart: always
    networks:
      - gitea
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
    depends_on:
      - db

  db:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=gitea
      - POSTGRES_DB=gitea
    networks:
      - gitea
    volumes:
      - ./postgres:/var/lib/postgresql/data
```

Start the services:

```bash
docker-compose up -d
```

## Database Configuration

### PostgreSQL Setup (Recommended)

#### Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

#### Create Database and User

```bash
sudo -u postgres psql

CREATE USER gitea WITH PASSWORD 'secure_password';
CREATE DATABASE gitea OWNER gitea;
GRANT ALL PRIVILEGES ON DATABASE gitea TO gitea;
\q
```

#### Configure PostgreSQL

Edit `/etc/postgresql/14/main/postgresql.conf`:

```conf
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:

```conf
local   gitea           gitea                                   md5
host    gitea           gitea           127.0.0.1/32            md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### MySQL Setup (Alternative)

```bash
sudo apt install mysql-server -y

sudo mysql_secure_installation

sudo mysql -u root -p

CREATE DATABASE gitea CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
CREATE USER 'gitea'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON gitea.* TO 'gitea'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Gitea Configuration

### Create Systemd Service

Create `/etc/systemd/system/gitea.service`:

```ini
[Unit]
Description=Gitea (Git with a cup of tea)
After=syslog.target
After=network.target
After=postgresql.service

[Service]
Type=simple
User=git
Group=git
WorkingDirectory=/var/lib/gitea/
ExecStart=/usr/local/bin/gitea web --config /etc/gitea/app.ini
Restart=always
Environment=USER=git HOME=/home/git GITEA_WORK_DIR=/var/lib/gitea

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gitea
sudo systemctl start gitea
```

### Initial Configuration

Open your browser and navigate to `http://your-server-ip:3000` to complete the setup.

#### Database Configuration
- **Database Type**: PostgreSQL
- **Host**: 127.0.0.1:5432
- **Username**: gitea
- **Password**: secure_password
- **Database Name**: gitea

#### General Settings
- **Site Title**: Your Gitea Instance
- **Repository Root Path**: /var/lib/gitea/data/gitea-repositories
- **Git LFS Root Path**: /var/lib/gitea/data/lfs
- **Run As Username**: git
- **SSH Server Domain**: your-domain.com
- **SSH Port**: 22
- **HTTP Port**: 3000
- **Application URL**: https://your-domain.com/

#### Administrator Account
- **Username**: admin
- **Password**: secure_admin_password
- **Email**: admin@your-domain.com

## SSL Configuration with Nginx

### Install Nginx

```bash
sudo apt install nginx -y
```

### Configure Nginx Virtual Host

Create `/etc/nginx/sites-available/gitea`:

```nginx
server {
    listen 80;
    server_name git.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name git.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/git.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/git.yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    client_max_body_size 512M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/gitea /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d git.yourdomain.com
```

## Advanced Configuration

### Edit Gitea Configuration

After initial setup, edit `/etc/gitea/app.ini`:

```ini
APP_NAME = Your Gitea Instance
RUN_USER = git
RUN_MODE = prod

[repository]
ROOT = /var/lib/gitea/data/gitea-repositories
SCRIPT_TYPE = bash
DEFAULT_BRANCH = main
DEFAULT_PRIVATE = last
MAX_CREATION_LIMIT = -1
MIRROR_QUEUE_LENGTH = 1000
PULL_REQUEST_QUEUE_LENGTH = 1000
PREFERRED_LICENSES = Apache License 2.0,MIT License
DISABLE_HTTP_GIT = false
ACCESS_CONTROL_ALLOW_ORIGIN = 
USE_COMPAT_SSH_URI = false

[repository.editor]
LINE_WRAP_EXTENSIONS = .txt,.md,.markdown,.mdown,.mkd,
PREVIEWABLE_FILE_MODES = markdown

[repository.local]
LOCAL_COPY_PATH = /tmp/gitea/local-repo

[repository.upload]
ENABLED = true
TEMP_PATH = /var/lib/gitea/data/tmp/uploads
ALLOWED_TYPES = 
FILE_MAX_SIZE = 3
MAX_FILES = 5

[ui]
EXPLORE_PAGING_NUM = 20
ISSUE_PAGING_NUM = 10
MEMBERS_PAGING_NUM = 20
FEED_MAX_COMMIT_NUM = 5
GRAPH_MAX_COMMIT_NUM = 100
CODE_COMMENT_LINES = 4
DEFAULT_SHOW_FULL_NAME = false
SEARCH_REPO_DESCRIPTION = true
USE_SERVICE_WORKER = true

[ui.admin]
USER_PAGING_NUM = 50
REPO_PAGING_NUM = 50
NOTICE_PAGING_NUM = 25
ORG_PAGING_NUM = 50

[ui.user]
REPO_PAGING_NUM = 15

[ui.meta]
AUTHOR = Your Gitea Instance
DESCRIPTION = Git with a cup of tea
KEYWORDS = go,git,self-hosted,gitea

[markdown]
ENABLE_HARD_LINE_BREAK_IN_COMMENTS = true
ENABLE_HARD_LINE_BREAK_IN_DOCUMENTS = false
CUSTOM_URL_SCHEMES = 
FILE_EXTENSIONS = .md,.markdown,.mdown,.mkd

[server]
APP_DATA_PATH = /var/lib/gitea/data
DOMAIN = git.yourdomain.com
HTTP_PORT = 3000
ROOT_URL = https://git.yourdomain.com/
DISABLE_SSH = false
SSH_PORT = 22
SSH_LISTEN_PORT = 22
SSH_DOMAIN = git.yourdomain.com
LFS_START_SERVER = true
LFS_CONTENT_PATH = /var/lib/gitea/data/lfs
LFS_JWT_SECRET = your-jwt-secret
OFFLINE_MODE = false

[database]
PATH = /var/lib/gitea/data/gitea.db
DB_TYPE = postgres
HOST = 127.0.0.1:5432
NAME = gitea
USER = gitea
PASSWD = secure_password
LOG_SQL = false
SCHEMA = 
SSL_MODE = disable
CHARSET = utf8

[indexer]
ISSUE_INDEXER_PATH = /var/lib/gitea/data/indexers/issues.bleve
ISSUE_INDEXER_QUEUE_TYPE = levelqueue
ISSUE_INDEXER_QUEUE_DIR = /var/lib/gitea/data/indexers/issues.queue
ISSUE_INDEXER_QUEUE_CONN_STR = 
ISSUE_INDEXER_QUEUE_BATCH_NUMBER = 20
REPO_INDEXER_ENABLED = false
REPO_INDEXER_PATH = /var/lib/gitea/data/indexers/repos.bleve
MAX_FILE_SIZE = 1048576

[admin]
DISABLE_REGULAR_ORG_CREATION = false

[security]
INSTALL_LOCK = true
SECRET_KEY = your-secret-key
LOGIN_REMEMBER_DAYS = 7
COOKIE_USERNAME = gitea_awesome
COOKIE_REMEMBER_NAME = gitea_incredible
REVERSE_PROXY_AUTHENTICATION_USER = X-FORWARDED-USER
REVERSE_PROXY_AUTHENTICATION_EMAIL = X-FORWARDED-EMAIL
MIN_PASSWORD_LENGTH = 8
IMPORT_LOCAL_PATHS = false
DISABLE_GIT_HOOKS = false

[openid]
ENABLE_OPENID_SIGNIN = true
ENABLE_OPENID_SIGNUP = true

[service]
ACTIVE_CODE_LIVE_MINUTES = 180
RESET_PASSWD_CODE_LIVE_MINUTES = 180
REGISTER_EMAIL_CONFIRM = false
DISABLE_REGISTRATION = false
ALLOW_ONLY_EXTERNAL_REGISTRATION = false
REQUIRE_SIGNIN_VIEW = false
ENABLE_NOTIFY_MAIL = false
ENABLE_REVERSE_PROXY_AUTO_REGISTRATION = false
ENABLE_CAPTCHA = false
DEFAULT_KEEP_EMAIL_PRIVATE = false
DEFAULT_ALLOW_CREATE_ORGANIZATION = true
DEFAULT_ENABLE_TIMETRACKING = true
NO_REPLY_ADDRESS = noreply.git.yourdomain.com

[webhook]
QUEUE_LENGTH = 1000
DELIVER_TIMEOUT = 5
SKIP_TLS_VERIFY = false
ALLOWED_HOST_LIST = 
PAGING_NUM = 10
PROXY_URL = 
PROXY_HOSTS = 

[mailer]
ENABLED = false

[cache]
ADAPTER = memory
INTERVAL = 60
HOST = 

[session]
PROVIDER = file
PROVIDER_CONFIG = /var/lib/gitea/data/sessions
COOKIE_SECURE = auto
COOKIE_NAME = i_like_gitea
GC_INTERVAL_TIME = 86400
SESSION_LIFE_TIME = 86400

[picture]
AVATAR_UPLOAD_PATH = /var/lib/gitea/data/avatars
REPOSITORY_AVATAR_UPLOAD_PATH = /var/lib/gitea/data/repo-avatars
DISABLE_GRAVATAR = false
ENABLE_FEDERATED_AVATAR = true

[attachment]
ENABLED = true
PATH = /var/lib/gitea/data/attachments
ALLOWED_TYPES = image/jpeg|image/png|application/zip|application/gzip
MAX_SIZE = 4
MAX_FILES = 5

[time]
DEFAULT_UI_LOCATION = 

[log]
MODE = console
LEVEL = info
ROUTER_LOG_LEVEL = Info
ROOT_PATH = /var/lib/gitea/log

[log.console]
LEVEL = 

[git]
PATH = 
DISABLE_DIFF_HIGHLIGHT = false
MAX_GIT_DIFF_LINES = 1000
MAX_GIT_DIFF_LINE_CHARACTERS = 5000
MAX_GIT_DIFF_FILES = 100
GC_ARGS = 

[git.timeout]
DEFAULT = 360
MIGRATE = 600
MIRROR = 300
CLONE = 300
PULL = 300
GC = 60

[mirror]
DEFAULT_INTERVAL = 8h
MIN_INTERVAL = 10m

[api]
ENABLE_SWAGGER = true
MAX_RESPONSE_ITEMS = 50
DEFAULT_PAGING_NUM = 30
DEFAULT_GIT_TREES_PER_PAGE = 1000
DEFAULT_MAX_BLOB_SIZE = 10485760

[oauth2]
JWT_SECRET = your-oauth2-jwt-secret

[i18n]
LANGS = en-US,zh-CN,zh-HK,zh-TW,de-DE,fr-FR,nl-NL,lv-LV,ru-RU,uk-UA,ja-JP,es-ES,pt-BR,pl-PL,bg-BG,it-IT,fi-FI,tr-TR,cs-CZ,sr-SP,sv-SE,ko-KR
NAMES = English,简体中文,繁體中文（香港）,繁體中文（台灣）,Deutsch,français,Nederlands,latviešu,русский,Українська,日本語,español,português do Brasil,polski,български,italiano,suomi,Türkçe,čeština,српски,svenska,한국어

[markup.asciidoc]
ENABLED = false
FILE_EXTENSIONS = .adoc,.asciidoc
RENDER_COMMAND = asciidoc --out-file=- -
IS_INPUT_FILE = false

[markup.restructuredtext]
ENABLED = false
FILE_EXTENSIONS = .rst
RENDER_COMMAND = rst2html.py
IS_INPUT_FILE = true

[markup.sanitizer.1]
ELEMENT = span
ALLOW_ATTR = class
REGEXP = ^(info|warning|error)$

[highlight.mapping]

[other]
SHOW_FOOTER_BRANDING = false
SHOW_FOOTER_VERSION = true
SHOW_FOOTER_TEMPLATE_LOAD_TIME = true
```

Restart Gitea after configuration changes:

```bash
sudo systemctl restart gitea
```

## User Management and Organizations

### Creating Organizations

1. Log in as administrator
2. Click the "+" icon in the top menu
3. Select "New Organization"
4. Fill in organization details
5. Configure permissions and visibility

### Managing Users

#### Create Users via CLI

```bash
sudo -u git /usr/local/bin/gitea admin user create \
    --name newuser \
    --password password123 \
    --email newuser@example.com \
    --admin
```

#### Bulk User Management

Create a script for bulk user creation:

```bash
#!/bin/bash
# bulk_users.sh

users=(
    "user1:password1:user1@example.com"
    "user2:password2:user2@example.com"
    "user3:password3:user3@example.com"
)

for user_data in "${users[@]}"; do
    IFS=':' read -r username password email <<< "$user_data"
    sudo -u git /usr/local/bin/gitea admin user create \
        --name "$username" \
        --password "$password" \
        --email "$email"
done
```

## Repository Management

### Import Existing Repositories

#### From Command Line

```bash
# Mirror a repository
sudo -u git /usr/local/bin/gitea admin repo migrate \
    --git_service=github \
    --repo_url=https://github.com/user/repo.git \
    --repo_name=repo \
    --owner=gitea_user

# Import local repository
sudo -u git /usr/local/bin/gitea admin repo adopt \
    --owner=gitea_user \
    --name=repo_name \
    /path/to/existing/repo
```

#### Repository Templates

Create repository templates for consistent project structure:

1. Create a new repository
2. Add template files (README, .gitignore, etc.)
3. Go to Settings → Template
4. Enable "Template Repository"

### Webhooks Configuration

Configure webhooks for CI/CD integration:

```json
{
  "content_type": "json",
  "secret": "webhook_secret",
  "url": "https://your-ci-server.com/webhook"
}
```

## Backup and Restore

### Automated Backup Script

Create `/usr/local/bin/gitea-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backup/gitea"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="gitea-backup-$DATE.zip"

# Create backup directory
mkdir -p $BACKUP_DIR

# Stop Gitea service
systemctl stop gitea

# Create backup
sudo -u git /usr/local/bin/gitea dump \
    --config /etc/gitea/app.ini \
    --file $BACKUP_DIR/$BACKUP_FILE \
    --type zip

# Start Gitea service
systemctl start gitea

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "gitea-backup-*.zip" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE"
```

Make it executable and add to cron:

```bash
chmod +x /usr/local/bin/gitea-backup.sh

# Add to root's crontab (daily backup at 2 AM)
echo "0 2 * * * /usr/local/bin/gitea-backup.sh" | sudo crontab -
```

### Restore from Backup

```bash
# Stop Gitea
sudo systemctl stop gitea

# Extract backup
cd /tmp
unzip /backup/gitea/gitea-backup-YYYYMMDD_HHMMSS.zip

# Restore files
sudo rm -rf /var/lib/gitea/data/gitea-repositories
sudo rm -rf /var/lib/gitea/data/gitea.db
sudo mv gitea-repo/* /var/lib/gitea/data/gitea-repositories/
sudo mv gitea.db /var/lib/gitea/data/

# Fix permissions
sudo chown -R git:git /var/lib/gitea/

# Start Gitea
sudo systemctl start gitea
```

## Monitoring and Maintenance

### Health Checks

Create a health check script:

```bash
#!/bin/bash
# gitea-healthcheck.sh

GITEA_URL="https://git.yourdomain.com"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" $GITEA_URL)

if [ $STATUS_CODE -eq 200 ]; then
    echo "Gitea is healthy"
    exit 0
else
    echo "Gitea health check failed with status: $STATUS_CODE"
    # Send alert email or notification
    exit 1
fi
```

### Log Rotation

Configure logrotate for Gitea logs:

```bash
sudo tee /etc/logrotate.d/gitea <<EOF
/var/lib/gitea/log/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 git git
    postrotate
        systemctl reload gitea
    endscript
}
EOF
```

### Performance Monitoring

Monitor Gitea performance with these commands:

```bash
# Check service status
systemctl status gitea

# Monitor resource usage
top -p $(pgrep gitea)

# Check database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='gitea';"

# Monitor disk usage
du -sh /var/lib/gitea/
```

## Security Hardening

### Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Deny direct access to Gitea port
sudo ufw deny 3000

# Enable firewall
sudo ufw enable
```

### SSH Key Management

Configure SSH for Git operations:

```bash
# Generate SSH key for git user
sudo -u git ssh-keygen -t ed25519 -C "git@yourdomain.com"

# Configure SSH daemon
sudo tee -a /etc/ssh/sshd_config <<EOF
Match User git
    AllowTcpForwarding no
    AllowAgentForwarding no
    PermitTunnel no
    X11Forwarding no
    PermitTTY no
    ForceCommand /usr/local/bin/gitea serv key-1 --config=/etc/gitea/app.ini
EOF

sudo systemctl restart sshd
```

### Regular Security Updates

Create an update script:

```bash
#!/bin/bash
# gitea-update.sh

CURRENT_VERSION=$(gitea --version | cut -d' ' -f3)
LATEST_VERSION=$(curl -s https://api.github.com/repos/go-gitea/gitea/releases/latest | grep '"tag_name"' | cut -d'"' -f4 | sed 's/v//')

if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ]; then
    echo "Updating Gitea from $CURRENT_VERSION to $LATEST_VERSION"
    
    # Download new version
    wget -O /tmp/gitea https://dl.gitea.io/gitea/$LATEST_VERSION/gitea-$LATEST_VERSION-linux-amd64
    
    # Stop service
    systemctl stop gitea
    
    # Backup current binary
    cp /usr/local/bin/gitea /usr/local/bin/gitea.backup
    
    # Install new version
    chmod +x /tmp/gitea
    mv /tmp/gitea /usr/local/bin/gitea
    
    # Start service
    systemctl start gitea
    
    echo "Update completed"
else
    echo "Gitea is up to date ($CURRENT_VERSION)"
fi
```

## Conclusion

Gitea provides a powerful, self-hosted Git solution that's perfect for teams and organizations wanting control over their code repositories. This setup gives you a production-ready Git server with advanced features, security, and monitoring.

Key benefits of this setup:
- Complete control over your Git repositories
- Professional features comparable to GitHub
- Automated backups and monitoring
- SSL encryption and security hardening
- Easy maintenance and upgrades

Regular maintenance tasks:
- Monitor system resources and performance
- Update Gitea regularly for security patches
- Review and rotate backup files
- Monitor logs for security issues
- Keep SSL certificates updated

With proper configuration and maintenance, Gitea can serve as a reliable foundation for your development workflow and code management needs.
