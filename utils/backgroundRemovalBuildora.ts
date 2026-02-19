import { Platform } from 'react-native';
import { getApiUrl } from './api';

export const removeBackground = async (imageUri: string): Promise<string | null> => {
    try {
        // Use the backend proxy to avoid CORS issues
        const API_URL = `${getApiUrl()}/background-removal/remove`;

        console.log(`🏗️ Removing background via Backend Proxy (${API_URL})...`);

        if (Platform.OS === 'web') {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const imageBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const response2 = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageBase64 })
            });
            return handleBackendResponse(response2);
        } else {
            // Mobile handling using FormData (low memory usage)
            const formData = new FormData();

            if (imageUri.startsWith('http')) {
                // If remote URL, just send the URL and let backend fetch it
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageUrl: imageUri })
                });
                return handleBackendResponse(response);
            }

            // Local file handling
            const filename = imageUri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            // @ts-ignore
            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            const response = await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            return handleBackendResponse(response);
        }

    } catch (error) {
        console.error("Background Removal Error:", (error as any).message || error);
        return null;
    }
};

async function handleBackendResponse(response: Response) {
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.success && data.imageUrl) {
        return data.imageUrl;
    }
    throw new Error(data.message || 'Background removal failed');
}

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
