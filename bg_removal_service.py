"""
Free Background Removal Service
Uses rembg library (completely free, unlimited)
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    try:
        # Check if image file is present
        if 'image' not in request.files and 'image_file' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        # Get the image file
        image_file = request.files.get('image') or request.files.get('image_file')
        
        # Read the image
        input_image = Image.open(image_file.stream)
        
        # Remove background
        output_image = remove(input_image)
        
        # Save to bytes
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'Background Removal Service'})

if __name__ == '__main__':
    print("🚀 Starting Free Background Removal Service...")
    print("📍 Server running at: http://localhost:5002")
    print("🎯 Endpoint: POST http://localhost:5002/remove-bg")
    app.run(host='0.0.0.0', port=5002, debug=True)
