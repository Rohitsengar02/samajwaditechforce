#!/bin/bash

echo "🚀 Starting Free Background Removal Service..."

# Activate virtual environment
source bg_removal_env/bin/activate

# Start the Flask server
python3 bg_removal_service.py
