#!/bin/bash

# Blog Backup Script
# Creates a backup of your blog content and configuration

set -e

# Configuration
BACKUP_DIR="/backup/blog"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="blog-backup-$DATE"

echo "📦 Creating backup: $BACKUP_NAME"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    posts/ \
    src/ \
    public/ \
    package.json \
    next.config.ts \
    docker-compose.yml \
    Dockerfile \
    nginx.conf

echo "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Keep only last 7 backups
cd "$BACKUP_DIR"
ls -t blog-backup-*.tar.gz | tail -n +8 | xargs -r rm

echo "🧹 Old backups cleaned up"
echo "📊 Current backups:"
ls -la blog-backup-*.tar.gz
