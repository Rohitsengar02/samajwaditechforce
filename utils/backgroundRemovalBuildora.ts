import { Platform } from 'react-native';

export const removeBackground = async (imageUri: string): Promise<string | null> => {
    try {
        const API_URL = process.env.EXPO_PUBLIC_BG_REMOVAL_URL || "http://192.168.1.41:5002/api/remove-bg";
        const API_KEY = process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY || "sk_pjgibx25e5na4prkedombh";

        console.log(`🏗️ Removing background via Local Buildora (${API_URL})...`);

        const formData = new FormData();

        if (Platform.OS === 'web') {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            formData.append('image', blob, 'image.png');
        } else {
            formData.append('image', {
                uri: imageUri,
                name: 'image.png',
                type: 'image/png',
            } as any);
        }

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
            headers: {
                "x-api-key": API_KEY,
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server Error (${response.status}): ${errText}`);
        }

        const contentType = response.headers.get("content-type");

        // Handle JSON Response (e.g., {"success": true, "image": "data:..."})
        if (contentType && contentType.includes("application/json")) {
            console.log('📥 Received JSON response from BG Service');
            const data = await response.json();

            if (data.image) return data.image;
            if (data.imageUrl) return data.imageUrl;
            if (data.url) return data.url;
            if (data.base64) return `data:image/png;base64,${data.base64}`;

            throw new Error("JSON response did not contain a recognized image field");
        }

        // Handle Binary/Blob Response (Raw Image)
        console.log('📥 Received Binary response from BG Service');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Ensure we return a clean data URI
                resolve(result);
            };
            reader.onerror = () => {
                reject(new Error('Failed to read blob data'));
            };
            reader.readAsDataURL(blob);
        });

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
