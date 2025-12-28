# Deployment Guide - Incident Bridge

This guide covers deploying the complete Incident Bridge platform (backend + frontend) to production.

## Prerequisites

- GitHub account (for version control)
- Render, Railway, or Heroku account (for backend)
- Vercel or Netlify account (for frontend)
- Your project pushed to GitHub

## Option 1: Deploy Backend to Render

### Step 1: Push code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/incident-bridge.git
git branch -M main
git push -u origin main
```

### Step 2: Create PostgreSQL Database on Render

1. Go to https://render.com
2. Sign up or log in
3. Click "New +" and select "PostgreSQL"
4. Fill in:
   - **Name:** incidents-db
   - **Database:** incidents
   - **User:** incidents_user
   - **Region:** Choose closest to you
   - **PostgreSQL Version:** 15
5. Click "Create Database"
6. Copy the `External Database URL` from the dashboard
   - Format: `postgresql://user:password@host:port/incidents`
   - Convert to async format: `postgresql+psycopg_async://user:password@host:port/incidents`

### Step 3: Deploy Backend Service on Render

1. Click "New +" and select "Web Service"
2. Connect your GitHub repository
3. Fill in:
   - **Name:** incident-bridge-backend
   - **Runtime:** Python 3.11
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Click "Advanced" and add Environment Variables:
   - `DATABASE_URL`: (paste the async PostgreSQL URL from Step 2)
   - `CORS_ORIGINS`: `https://incident-bridge.vercel.app`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: (generate a strong password)
   - `RESPONDER_USERNAME`: `responder`
   - `RESPONDER_PASSWORD`: (generate a strong password)
   - `JWT_SECRET`: (generate a random string, e.g., `openssl rand -hex 32`)
   - `JWT_EXP_MINUTES`: `1440`
   - `MEDIA_UPLOAD_DIR`: `/var/tmp/uploads`
   - `MEDIA_BASE_URL`: (will be your Render backend URL, e.g., `https://incident-bridge-backend.onrender.com`)

5. Click "Create Web Service"
6. Wait for deployment to complete
7. Note your backend URL (e.g., `https://incident-bridge-backend.onrender.com`)
8. Update CORS_ORIGINS if deploying frontend to different URL

### Step 4: Initialize Database

Once backend is deployed:

```bash
# Access the deployed backend
curl https://incident-bridge-backend.onrender.com/docs

# Tables will be created automatically on first startup
```

---

## Option 2: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Sign up or log in
3. Click "New Project"
4. Select "GitHub Repo" and connect your repository
5. Select your repository

### Step 2: Add PostgreSQL Plugin

1. Click "Add" in the Railway dashboard
2. Select "PostgreSQL"
3. This creates a database automatically

### Step 3: Deploy Backend Service

1. In Railway, click "New Service"
2. Select "GitHub Repo"
3. Choose your repository with the Incident Bridge code
4. Configure:
   - **Root Directory:** `backend`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables in Railway UI:
   - Copy PostgreSQL connection string from Railway
   - Convert to async: `postgresql+psycopg_async://...`
   - Add other env vars as listed above
6. Deploy

---

## Option 3: Deploy Frontend to Vercel

### Step 1: Connect GitHub Repository

1. Go to https://vercel.com
2. Sign up or log in
3. Click "Add New" → "Project"
4. Select your GitHub repository
5. Click "Import"

### Step 2: Configure Build Settings

1. **Framework:** Vite
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Step 3: Add Environment Variables

1. In the Environment Variables section, add:
   - **Key:** `VITE_API_BASE`
   - **Value:** `https://incident-bridge-backend.onrender.com` (your backend URL)
   - **Environments:** Production

2. Click "Deploy"

### Step 4: Update Backend CORS

Once you have the Vercel URL (e.g., `https://incident-bridge.vercel.app`):

1. Go back to your backend (Render/Railway)
2. Update `CORS_ORIGINS` environment variable to include the Vercel URL:
   ```
   https://incident-bridge.vercel.app
   ```

---

## Option 4: Deploy Frontend to Netlify

### Step 1: Connect GitHub Repository

1. Go to https://netlify.com
2. Sign up or log in
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub
5. Select your repository

### Step 2: Configure Build Settings

1. **Base directory:** `frontend`
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`

### Step 3: Add Environment Variables

1. Click "Site settings" → "Build & deploy" → "Environment"
2. Add environment variable:
   - **Key:** `VITE_API_BASE`
   - **Value:** `https://incident-bridge-backend.onrender.com`

3. Trigger a new deploy in the Deploys tab

---

## Post-Deployment Checklist

- [ ] Backend service is running and healthy
- [ ] Frontend loads without errors
- [ ] Can view Swagger docs at `YOUR_BACKEND_URL/docs`
- [ ] Can report an incident (test with citizen portal)
- [ ] Live incidents appear in feed
- [ ] Can authenticate as responder
- [ ] Can manage incidents (responder portal)
- [ ] File uploads work
- [ ] WebSocket connection works (check browser console)

## Database Migrations (if needed)

The backend automatically creates tables on startup. If you need to reset:

1. Delete and recreate the PostgreSQL database
2. Restart the backend service
3. Tables will be recreated automatically

## Monitoring

### Render
- Check logs: Service dashboard → Logs tab
- Monitor performance: Service dashboard → Metrics tab

### Railway
- Check logs: Service view → Logs
- View deployments: Deployments tab

### Vercel
- Check deployments: Deployments tab
- View analytics: Analytics tab
- Monitor errors: Functions tab

## Troubleshooting

### Backend won't start
- Check `DATABASE_URL` format is correct with `psycopg_async` driver
- Verify all required environment variables are set
- Check logs for specific error messages

### Frontend can't connect to backend
- Verify `VITE_API_BASE` is set correctly
- Check `CORS_ORIGINS` on backend includes frontend URL
- Ensure backend service is running
- Check browser console for CORS errors

### Database connection errors
- Verify PostgreSQL database is running
- Check credentials in `DATABASE_URL`
- Ensure database name matches (`incidents`)

### Media uploads fail
- Check `/tmp/uploads` directory exists and is writable
- Verify `MEDIA_BASE_URL` is set correctly
- Check file permissions on backend

## Production Security Notes

1. **Change default credentials** - Update admin and responder passwords
2. **Generate random JWT_SECRET** - Use `openssl rand -hex 32`
3. **Enable HTTPS** - Both Render and Vercel do this automatically
4. **Monitor logs** - Regularly check for errors and security issues
5. **Database backups** - Enable automatic backups on your database service
6. **Rate limiting** - Consider adding rate limiting to API endpoints
7. **Secrets management** - Never commit `.env` files to GitHub

## Scaling Considerations

- **Database:** Monitor query performance, consider connection pooling
- **Backend:** Render/Railway auto-scale with load
- **Frontend:** Vercel/Netlify serve from global CDN
- **Media storage:** Consider S3 or cloud storage for production

## Support

For issues with specific platforms:
- **Render Support:** https://render.com/docs
- **Railway Support:** https://docs.railway.app
- **Vercel Support:** https://vercel.com/docs
- **Netlify Support:** https://docs.netlify.com
