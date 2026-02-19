import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from './api';

export const uploadImageToAPI = async (
    imageSource: string,
    folder: string = 'users'
): Promise<string> => {
    try {
        const apiUrl = getApiUrl();
        const token = await AsyncStorage.getItem('userToken');

        console.log(`[Upload] Uploading to ${apiUrl}/upload/image...`);

        // Use FormData for better reliability and lower memory usage
        const formData = new FormData();

        if (Platform.OS === 'web') {
            // Web handling
            const response = await fetch(imageSource);
            const blob = await response.blob();
            formData.append('image', blob, 'image.jpg');
        } else {
            // Mobile handling: extract filename and type
            const filename = imageSource.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            // @ts-ignore - React Native FormData requires this structure
            formData.append('image', {
                uri: imageSource,
                name: filename,
                type: type,
            });
        }

        formData.append('folder', folder);

        const response = await fetch(`${apiUrl}/upload/image`, {
            method: 'POST',
            headers: {
                // Fetch will automatically set content-type for FormData with boundary
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });

        const data = await response.json();

        if (data.success && data.data && data.data.url) {
            return data.data.url;
        } else {
            console.error('[Upload] Failed:', data);
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error: any) {
        console.error('[Upload] Error:', error);
        throw error;
    }
};

/**
 * Upload a shared poster to the backend API (Public)
 * Used for social sharing previews
 * @param imageSource URI or Base64 string
 */
export const uploadSharedPosterToAPI = async (
    imageSource: string
): Promise<string> => {
    try {
        const apiUrl = getApiUrl();
        console.log(`[Upload] Uploading shared poster to ${apiUrl}/upload/poster-share...`);

        const formData = new FormData();

        if (Platform.OS === 'web') {
            const response = await fetch(imageSource);
            const blob = await response.blob();
            formData.append('image', blob, 'poster.jpg');
        } else {
            const filename = imageSource.split('/').pop() || 'poster.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            // @ts-ignore
            formData.append('image', {
                uri: imageSource,
                name: filename,
                type: type,
            });
        }

        const response = await fetch(`${apiUrl}/upload/poster-share`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success && data.data && data.data.url) {
            return data.data.url;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error: any) {
        console.error('[Upload] Shared poster error:', error);
        throw error;
    }
};
