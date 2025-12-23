#!/bin/bash

echo "🎨 Installing Free Background Removal Service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 found"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv bg_removal_env

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source bg_removal_env/bin/activate

# Install required packages
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install flask flask-cors rembg pillow onnxruntime

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation complete!"
echo ""
echo "🚀 To start the service, run:"
echo "   ./start_bg_service.sh"
echo ""
echo "📍 Service will be available at:"
echo "   http://localhost:5002/remove-bg"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
