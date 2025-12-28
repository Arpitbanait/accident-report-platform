@echo off
REM Incident Bridge - Quick Deployment Script (Windows)

echo.
echo 🚀 Incident Bridge - Deployment Preparation
echo ============================================== 
echo.

REM Check if git is initialized
if not exist .git (
    echo 📦 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial Incident Bridge commit"
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already initialized
)

REM Verify backend files
echo.
echo 🔍 Checking backend files...
if not exist backend\requirements.txt (
    echo ❌ backend\requirements.txt not found!
    exit /b 1
)
if not exist backend\app\main.py (
    echo ❌ backend\app\main.py not found!
    exit /b 1
)
echo ✅ Backend files verified

REM Verify frontend files
echo.
echo 🔍 Checking frontend files...
if not exist frontend\package.json (
    echo ❌ frontend\package.json not found!
    exit /b 1
)
if not exist frontend\vite.config.ts (
    echo ❌ frontend\vite.config.ts not found!
    exit /b 1
)
echo ✅ Frontend files verified

REM Check deployment configurations
echo.
echo 🔍 Checking deployment configurations...
if not exist backend\render.yaml (
    echo ⚠️  backend\render.yaml not found (needed for Render deployment)
)
if not exist backend\.env.production (
    echo ⚠️  backend\.env.production template exists
)
if not exist frontend\.env.production (
    echo ⚠️  frontend\.env.production template exists
)

echo.
echo ✅ All checks passed!
echo.
echo 📋 Next Steps:
echo ==============
echo.
echo 1. Push code to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/incident-bridge.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 2. Choose deployment platform and follow DEPLOYMENT_GUIDE.md
echo.
echo    Option A: Render (easiest)
echo    - Go to https://render.com
echo    - Create PostgreSQL database
echo    - Deploy backend service
echo    - Deploy frontend service
echo.
echo    Option B: Railway
echo    - Go to https://railway.app
echo    - Create new project from GitHub
echo    - Add PostgreSQL plugin
echo    - Deploy backend
echo.
echo    Option C: Traditional Docker
echo    - Use Dockerfiles provided
echo    - Deploy to your own Docker registry
echo.
echo 3. Update environment variables in production
echo.
echo 4. Test the deployment at your public URLs
echo.
pause
