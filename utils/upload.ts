import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from './api';

/**
 * Helper to convert URI to Base64 (Web & Native compatible)
 */
const uriToBase64 = async (uri: string): Promise<string> => {
    if (uri.startsWith('data:image')) {
        return uri;
    }

    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } else {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });
        return `data:image/jpeg;base64,${base64}`;
    }
};

/**
 * Upload an image to the backend API (Authenticated)
 * @param imageSource URI or Base64 string
 * @param folder Target folder in R2 (default: 'users')
 */
export const uploadImageToAPI = async (
    imageSource: string,
    folder: string = 'users'
): Promise<string> => {
    try {
        const apiUrl = getApiUrl();
        const token = await AsyncStorage.getItem('userToken');

        // Convert to base64
        const base64Data = await uriToBase64(imageSource);

        console.log(`[Upload] Uploading to ${apiUrl}/upload/image (folder: ${folder})...`);

        const response = await fetch(`${apiUrl}/upload/image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                image: base64Data,
                folder
            })
        });

        const data = await response.json();

        if (data.success && data.data && data.data.url) {
            console.log('[Upload] Success:', data.data.url);
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

        // Convert to base64
        const base64Data = await uriToBase64(imageSource);

        console.log(`[Upload] Uploading shared poster to ${apiUrl}/upload/poster-share...`);

        const response = await fetch(`${apiUrl}/upload/poster-share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Data
            })
        });

        const data = await response.json();

        if (data.success && data.data && data.data.url) {
            console.log('[Upload] Shared poster success:', data.data.url);
            return data.data.url;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error: any) {
        console.error('[Upload] Shared poster error:', error);
        throw error;
    }
};
