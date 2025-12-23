# 🚀 Deployment Guide - Background Removal Service

This guide explains how to deploy the FREE background removal service in production.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Deployment Options](#deployment-options)
3. [Option 1: Docker Deployment (Recommended)](#option-1-docker-deployment-recommended)
4. [Option 2: VPS/Server Deployment](#option-2-vpsserver-deployment)
5. [Option 3: Cloud Platform Deployment](#option-3-cloud-platform-deployment)
6. [Environment Configuration](#environment-configuration)
7. [GitHub Setup](#github-setup)

---

## Overview

The background removal service is a Python Flask application that runs separately from your main React Native/Expo app. It needs to be deployed on a server with:
- Python 3.9+
- At least 2GB RAM
- 2GB free disk space (for AI model)

---

## Deployment Options

### Option 1: Docker Deployment (Recommended) ⭐

**Best for:** Easy deployment, scalability, and maintenance

#### Prerequisites:
- Docker installed on your server
- Docker Compose installed

#### Steps:

1. **Clone your repository on the server:**
```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

2. **Build and run with Docker Compose:**
```bash
docker-compose up -d
```

3. **Check if it's running:**
```bash
curl http://localhost:5002/health
# Should return: {"status":"ok","service":"Background Removal Service"}
```

4. **View logs:**
```bash
docker-compose logs -f bg-removal
```

5. **Stop the service:**
```bash
docker-compose down
```

#### Production Tips:
- Use a reverse proxy (Nginx) to handle SSL/HTTPS
- Set up automatic restarts with `restart: always` in docker-compose.yml
- Monitor resource usage: `docker stats`

---

### Option 2: VPS/Server Deployment

**Best for:** Direct server control (DigitalOcean, AWS EC2, Linode, etc.)

#### On Your Server:

1. **Install Python 3.9+:**
```bash
sudo apt update
sudo apt install python3.9 python3.9-venv python3-pip -y
```

2. **Clone repository:**
```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

3. **Create virtual environment:**
```bash
python3.9 -m venv bg_removal_env
source bg_removal_env/bin/activate
```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

5. **Run with Gunicorn (production server):**
```bash
gunicorn --bind 0.0.0.0:5002 --workers 2 --timeout 120 bg_removal_service:app
```

#### Make it run automatically (systemd service):

Create `/etc/systemd/system/bg-removal.service`:

```ini
[Unit]
Description=Background Removal Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your-repo
Environment="PATH=/path/to/your-repo/bg_removal_env/bin"
ExecStart=/path/to/your-repo/bg_removal_env/bin/gunicorn --bind 0.0.0.0:5002 --workers 2 --timeout 120 bg_removal_service:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable bg-removal
sudo systemctl start bg-removal
sudo systemctl status bg-removal
```

---

### Option 3: Cloud Platform Deployment

#### A. **Render.com** (Easiest, Free Tier Available)

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create **New Web Service**
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 bg_removal_service:app`
   - **Environment:** Python 3
5. Deploy!

The service will be available at: `https://your-service.onrender.com`

#### B. **Railway.app**

1. Go to [railway.app](https://railway.app)
2. Import your GitHub repository
3. Railway will auto-detect Python and deploy
4. Set environment variable: `PORT=5002`

#### C. **Heroku**

Create `Procfile`:
```
web: gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 bg_removal_service:app
```

Deploy:
```bash
heroku create your-app-name
git push heroku main
```

#### D. **Google Cloud Run** (Serverless)

```bash
gcloud run deploy bg-removal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Environment Configuration

### Update Your App's API URL

After deployment, update your React Native app to point to the deployed service:

**In your `.env` file:**
```env
# For local development
EXPO_PUBLIC_BG_REMOVAL_URL=http://localhost:5002

# For production (update after deployment)
EXPO_PUBLIC_BG_REMOVAL_URL=https://your-service-url.com
```

**Update `poster-editor.tsx`:**
```typescript
const BG_REMOVAL_URL = process.env.EXPO_PUBLIC_BG_REMOVAL_URL || 'http://localhost:5002';

const handleRemoveFooterPhotoBg = async () => {
    // ... existing code ...
    const response = await fetch(`${BG_REMOVAL_URL}/remove-bg`, {
        method: 'POST',
        body: formData,
    });
    // ... existing code ...
};
```

---

## GitHub Setup

### Files to Commit:

✅ **Include these:**
- `bg_removal_service.py`
- `requirements.txt`
- `Dockerfile.bg-service`
- `docker-compose.yml`
- `install_bg_service.sh`
- `start_bg_service.sh`
- `BG_REMOVAL_README.md`

❌ **Exclude these (add to .gitignore):**
- `bg_removal_env/` (virtual environment)
- `__pycache__/`
- `*.pyc`
- `.env` (contains secrets)

### Update .gitignore:

```gitignore
# Python
bg_removal_env/
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Environment
.env
.env.local
```

### Push to GitHub:

```bash
git add .
git commit -m "Add background removal service"
git push origin main
```

---

## 🔧 Troubleshooting

### Service not starting?
```bash
# Check logs
docker-compose logs bg-removal

# Or for direct deployment
journalctl -u bg-removal -f
```

### Out of memory?
- Increase server RAM (min 2GB recommended)
- Reduce workers: change `--workers 2` to `--workers 1`

### Slow processing?
- First run downloads the AI model (~176MB) - be patient
- Subsequent runs are much faster
- Add more workers for parallel processing

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid (if needed) |
|----------|-----------|------------------|
| **Render.com** | ✅ Yes (512MB RAM) | $7/month |
| **Railway.app** | ✅ $5 credit | $5-20/month |
| **DigitalOcean** | ❌ No | $6/month (1GB RAM) |
| **Heroku** | ❌ No (discontinued) | $7/month |
| **Google Cloud Run** | ✅ Free tier | Pay per use |
| **AWS EC2** | ✅ 12 months free | $8-15/month |

**Recommendation:** Start with **Render.com** free tier for testing, then upgrade or move to DigitalOcean for production.

---

## 🎯 Quick Start Checklist

- [ ] Push code to GitHub
- [ ] Choose deployment platform
- [ ] Deploy background removal service
- [ ] Test service: `curl https://your-service-url/health`
- [ ] Update `EXPO_PUBLIC_BG_REMOVAL_URL` in your app
- [ ] Test background removal in your app
- [ ] Set up monitoring/alerts (optional)
- [ ] Configure SSL/HTTPS (production)

---

## 📞 Support

If you need help:
1. Check the logs
2. Ensure Python 3.9+ is installed
3. Verify all dependencies are installed
4. Check firewall/security group settings
5. Ensure port 5002 is accessible

---

Made with ❤️ using open-source tools
