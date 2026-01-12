import { Platform } from 'react-native';

export const removeBackground = async (imageUri: string): Promise<string | null> => {
    try {
        console.log('🏗️ Removing background via Backend Proxy...');

        // 1. SMART RESIZING (Web) to avoid 413 "Request Entity Too Large"
        let processedUri = imageUri;
        if (Platform.OS === 'web') {
            try {
                processedUri = await resizeImageWeb(imageUri, 1024, 1024);
            } catch (e) {
                console.warn('Resize failed, using original:', e);
            }
        }

        // 2. Prepare Base64 Data
        const response = await fetch(processedUri);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        const base64Data = base64.split(',')[1];

        // 3. Call OUR BACKEND Proxy
        // This solves CORS and allows the backend to handle fallbacks
        let API_URL = 'https://api-samajwaditechforce.onrender.com/api';

        // Use local API if in development
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            API_URL = 'http://localhost:5001/api';
        }

        const backendResponse = await fetch(`${API_URL}/background-removal/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl: imageUri,
                imageBase64: base64Data
            }),
        });

        const data = await backendResponse.json();

        if (data.success && data.imageUrl) {
            console.log('✅ Background removed successfully via Proxy');
            return data.imageUrl;
        } else {
            throw new Error(data.message || 'Failed to remove background');
        }
    } catch (error) {
        console.error("Background Removal Error:", (error as any).message || error);
        return null;
    }
};

/**
 * Helper to resize image on Web using Canvas
 */
async function resizeImageWeb(uri: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new (window as any).Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            let { width, height } = img;
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = uri;
    });
}
