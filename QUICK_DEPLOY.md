# 📦 Quick Deployment Guide

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with background removal service"

# Add your GitHub repository
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy Background Removal Service

### Option A: Render.com (Easiest - Free Tier) ⭐

1. Go to **https://render.com** and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `bg-removal-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 bg_removal_service:app`
   - **Environment:** `Python 3`
   - **Instance Type:** `Free`
5. Click **Create Web Service**
6. Wait for deployment (5-10 minutes first time)
7. Copy your service URL (e.g., `https://bg-removal-service.onrender.com`)

### Option B: Railway.app (Also Free)

1. Go to **https://railway.app**
2. Sign in with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Railway will auto-detect Python and deploy
6. Copy your service URL

### Option C: Docker (Your Own Server)

```bash
# On your server
git clone https://github.com/yourusername/your-repo.git
cd your-repo
docker-compose up -d
```

## Step 3: Update Your App Configuration

Add to your `.env` file:

```env
# Use your deployed service URL
EXPO_PUBLIC_BG_REMOVAL_URL=https://bg-removal-service.onrender.com
```

## Step 4: Test It!

1. Restart your Expo dev server
2. Open your app
3. Upload a photo
4. Click "Remove Background"
5. ✨ It works!

## 🎯 That's it!

Your background removal service is now deployed and working globally!

---

## 📚 Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment options and troubleshooting.
