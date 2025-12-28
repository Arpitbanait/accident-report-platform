#!/bin/bash

# Incident Bridge - Quick Deployment Script
# This script prepares your project for deployment

set -e

echo "🚀 Incident Bridge - Deployment Preparation"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial Incident Bridge commit"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Verify backend files
echo ""
echo "🔍 Checking backend files..."
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ backend/requirements.txt not found!"
    exit 1
fi
if [ ! -f "backend/app/main.py" ]; then
    echo "❌ backend/app/main.py not found!"
    exit 1
fi
echo "✅ Backend files verified"

# Verify frontend files
echo ""
echo "🔍 Checking frontend files..."
if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json not found!"
    exit 1
fi
if [ ! -f "frontend/vite.config.ts" ]; then
    echo "❌ frontend/vite.config.ts not found!"
    exit 1
fi
echo "✅ Frontend files verified"

# Check deployment configurations
echo ""
echo "🔍 Checking deployment configurations..."
if [ ! -f "backend/render.yaml" ]; then
    echo "⚠️  backend/render.yaml not found (needed for Render deployment)"
fi
if [ ! -f "backend/.env.production" ]; then
    echo "⚠️  backend/.env.production template exists"
fi
if [ ! -f "frontend/.env.production" ]; then
    echo "⚠️  frontend/.env.production template exists"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Push code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/incident-bridge.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Choose deployment platform and follow DEPLOYMENT_GUIDE.md"
echo ""
echo "   Option A: Render (easiest)"
echo "   - Go to https://render.com"
echo "   - Create PostgreSQL database"
echo "   - Deploy backend service"
echo "   - Deploy frontend service"
echo ""
echo "   Option B: Railway"
echo "   - Go to https://railway.app"
echo "   - Create new project from GitHub"
echo "   - Add PostgreSQL plugin"
echo "   - Deploy backend"
echo ""
echo "   Option C: Traditional Docker"
echo "   - Use Dockerfiles provided"
echo "   - Deploy to your own Docker registry"
echo ""
echo "3. Update environment variables in production"
echo ""
echo "4. Test the deployment at your public URLs"
echo ""
