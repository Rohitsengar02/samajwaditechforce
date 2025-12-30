import { Platform } from 'react-native';

/**
 * Background Removal Utility
 * Uses Hugging Face Xenova/modnet model via Backend Proxy (Web) or Direct (Mobile)
 */

export interface BackgroundRemovalResult {
    url: string;
    success: boolean;
    message: string;
}

/**
 * Remove background using backend proxy (for web) or direct API (for mobile)
 */
const removeBackgroundWithHuggingFace = async (imageUri: string, apiToken: string): Promise<BackgroundRemovalResult> => {
    try {
        console.log('🤗 Removing background with Hugging Face Xenova/modnet...');

        // On web, use backend proxy to avoid CORS issues
        if (Platform.OS === 'web') {
            console.log('🌐 Using backend proxy for web platform');

            // Determine API URL: Use local backend for development, prod for production
            // You can override this with the EXPO_PUBLIC_API_URL env var
            // Determine API URL with smart local detection
            const isLocal = typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

            let API_URL = process.env.EXPO_PUBLIC_API_URL;

            // FORCE valid local backend if running locally, preventing accidental prod hits
            if (isLocal) {
                // Check if the configured URL is actually a production URL
                if (!API_URL || API_URL.includes('onrender.com')) {
                    API_URL = 'http://localhost:5001/api';
                    console.log('🔧 Forcing Local Backend URL:', API_URL);
                }
            } else if (!API_URL) {
                API_URL = 'https://api-samajwaditechforce.onrender.com/api'; // Default prod backend
            }

            console.log(`🔗 Connecting to backend: ${API_URL}`);

            // Convert to Base64 to support local/blob URLs on backend
            // (Backend cannot fetch 'blob:...' URLs, so we must send data)
            const imgResponse = await fetch(imageUri);
            const blob = await imgResponse.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            const base64Data = base64.split(',')[1];

            const response = await fetch(`${API_URL}/background-removal/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: imageUri, imageBase64: base64Data }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Background removal failed');
            }

            console.log('✅ Background removed via backend proxy');
            return {
                url: data.imageUrl,
                success: true,
                message: data.message || 'Background removed successfully!'
            };
        }

        // On mobile (iOS/Android), call Hugging Face API directly
        console.log('📱 Using direct Hugging Face API for mobile');

        // Fetch image and convert to blob
        const imageResponse = await fetch(imageUri);
        const imageBlob = await imageResponse.blob();

        // Call Hugging Face API (RMBG-1.4)
        const response = await fetch(
            'https://router.huggingface.co/hf-inference/models/briaai/RMBG-1.4',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
                body: imageBlob,
            }
        );

        // Check for errors
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', response.status, errorText);

            if (response.status === 503) {
                throw new Error('Model is loading. Please try again in 5 seconds.');
            }

            throw new Error(`API error: ${response.status}`);
        }

        // Get the result as blob
        const resultBlob = await response.blob();

        if (resultBlob.size === 0) {
            throw new Error('Received empty image from API');
        }

        const url = URL.createObjectURL(resultBlob);

        console.log('✅ Background removed successfully!');
        return {
            url,
            success: true,
            message: 'Background removed successfully!'
        };
    } catch (error: any) {
        console.error('❌ Hugging Face API failed:', error);
        throw error;
    }
};

/**
 * Main function: Remove background
 * Uses backend proxy for all platforms (web + mobile) for reliability
 */
export const removeBackground = async (imageUri: string): Promise<BackgroundRemovalResult> => {
    try {
        console.log('🤗 Removing background...');

        // Determine API URL
        const isLocal = Platform.OS === 'web' && typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        let API_URL = process.env.EXPO_PUBLIC_API_URL;

        if (isLocal) {
            if (!API_URL || API_URL.includes('onrender.com')) {
                API_URL = 'http://localhost:5001/api';
            }
        } else if (!API_URL) {
            API_URL = 'https://api-samajwaditechforce.onrender.com/api';
        }

        console.log(`🔗 Using API: ${API_URL}`);

        // For mobile, we need to handle the image differently
        if (Platform.OS !== 'web') {
            console.log('📱 Mobile platform - using backend proxy');

            // On mobile, send the image URI directly - backend will fetch it
            // If it's a local file URI, we need to convert to base64
            let base64Data: string | undefined;

            if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
                // For local files on mobile, read as base64
                const response = await fetch(imageUri);
                const blob = await response.blob();

                base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        resolve(result.split(',')[1] || result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }

            const response = await fetch(`${API_URL}/background-removal/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl: imageUri,
                    imageBase64: base64Data
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Background removal failed');
            }

            console.log('✅ Background removed via backend');
            return {
                url: data.imageUrl,
                success: true,
                message: data.message || 'Background removed successfully!'
            };
        }

        // For web, use the existing logic
        console.log('🌐 Web platform - using backend proxy');
        const imgResponse = await fetch(imageUri);
        const blob = await imgResponse.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        const base64Data = base64.split(',')[1];

        const response = await fetch(`${API_URL}/background-removal/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: imageUri, imageBase64: base64Data }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Background removal failed');
        }

        console.log('✅ Background removed via backend');
        return {
            url: data.imageUrl,
            success: true,
            message: data.message || 'Background removed successfully!'
        };
    } catch (error: any) {
        console.error('❌ Background removal failed:', error);

        // Fallback to original image
        return {
            url: imageUri,
            success: false,
            message: 'Background removal failed. Using original image.'
        };
    }
};
