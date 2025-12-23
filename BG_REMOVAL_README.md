# 🎨 Free Background Removal Service

A completely **FREE** and **UNLIMITED** background removal service using Python's `rembg` library.

## ✨ Features

- ✅ **100% Free** - No API keys, no limits
- ✅ **Unlimited Usage** - Use as many times as you want
- ✅ **High Quality** - AI-powered background removal
- ✅ **Transparent PNG** - Perfect for posters
- ✅ **Local Processing** - No data leaves your machine
- ✅ **Fast** - Runs on your own hardware

## 📋 Requirements

- Python 3.8 or higher
- macOS, Linux, or Windows

## 🚀 Quick Start

### 1. Install Dependencies (One-time setup)

```bash
chmod +x install_bg_service.sh
./install_bg_service.sh
```

This will:
- Create a Python virtual environment
- Install Flask, rembg, and other dependencies
- Download the AI model (first time only, ~176MB)

### 2. Start the Service

```bash
./start_bg_service.sh
```

The service will start at: `http://localhost:5002`

### 3. Use in Your App

The background removal service is now ready! Click the "Remove Background" button in your poster editor.

## 🛠️ Manual Installation

If the automated script doesn't work:

```bash
# Create virtual environment
python3 -m venv bg_removal_env

# Activate it
source bg_removal_env/bin/activate  # Mac/Linux
# OR
bg_removal_env\\Scripts\\activate  # Windows

# Install dependencies
pip install flask flask-cors rembg pillow

# Run the service
python3 bg_removal_service.py
```

## 📝 API Usage

### Endpoint: `POST /remove-bg`

```bash
curl -X POST -F "image=@photo.jpg" http://localhost:5002/remove-bg --output result.png
```

## 🔧 Troubleshooting

### Service not starting?
- Make sure Python 3 is installed: `python3 --version`
- Check if port 5002 is available
- Try reinstalling: `./install_bg_service.sh`

### Background removal not working in app?
1. Make sure the service is running (green terminal output)
2. Check `http://localhost:5002/health` in your browser
3. Should see: `{"status":"ok","service":"Background Removal Service"}`

### First run is slow?
- First time downloads the AI model (~176MB)
- Subsequent runs are much faster

## 💡 How It Works

1. **Flask Server**: Lightweight web server on port 5002
2. **rembg Library**: AI-powered background removal using U²-Net
3. **Zero Cost**: Everything runs locally on your machine

## 🎯 Advantages Over Paid Services

| Feature | This Solution | Remove.bg | Gemini API |
|---------|--------------|-----------|------------|
| Cost | FREE | $0.20/image | Not for images |
| API Limit | Unlimited | 50/month free | N/A |
| Privacy | 100% Local | Cloud | Cloud |
| Speed | Fast | Internet dependent | N/A |
| Quality | Excellent | Excellent | N/A |

## 📊 Performance

- **Processing Time**: 1-3 seconds per image
- **Model Size**: ~176MB (downloaded once)
- **RAM Usage**: ~500MB while processing

## 🔒 Privacy

All processing happens locally on your machine. No images are sent to any external servers.

---

Made with ❤️ using open-source tools
