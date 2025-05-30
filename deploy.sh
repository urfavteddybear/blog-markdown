#!/bin/bash

# Simple Blog Deployment Script

set -e

echo "🚀 Deploying your blog..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start
echo "📦 Building and starting containers..."
docker-compose up -d --build

# Wait a moment for startup
echo "⏳ Waiting for startup..."
sleep 10

# Check if it's running
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Blog is running!"
    echo "🌐 Available at:"
    echo "   - Direct: http://localhost:3000"
    echo "   - With nginx: http://localhost (if nginx is enabled)"
else
    echo "❌ Something went wrong. Check logs with: docker-compose logs"
    exit 1
fi
