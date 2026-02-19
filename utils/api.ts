import { Platform } from 'react-native';

export const getApiUrl = () => {
    // 1. If explicitly set in env (e.g. for specific builds OR dev override), use it
    if (process.env.EXPO_PUBLIC_API_URL) {
        let url = process.env.EXPO_PUBLIC_API_URL;

        // Ensure we don't duplicate /api
        if (!url.endsWith('/api') && !url.endsWith('/api/')) {
            url = url.replace(/\/$/, '') + '/api';
        }

        // For web development, localhost is more reliable than the local IP 
        // which can be blocked by browser security or local firewalls
        if (Platform.OS === 'web' && __DEV__ && (url.includes('192.168.') || url.includes('172.') || url.includes('10.'))) {
            url = url.replace(/(\d{1,3}\.){3}\d{1,3}/, 'localhost');
        }

        // Handle Android Emulator case for localhost
        if (Platform.OS === 'android' && url.includes('localhost')) {
            url = url.replace('localhost', '10.0.2.2');
        }

        return url;
    }

    // 2. Local Dev Fallback
    if (__DEV__) {
        // For physical devices, we should ideally use the computer's IP
        // For now, using a smart fallback: 10.0.2.2 for emulator, localhost for web/iOS
        const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
        return `http://${host}:5001/api`;
    }

    // 3. Absolute Production Default
    return 'https://api.samajwaditechforce.com/api';
};

export const getBaseUrl = () => {
    const apiUrl = getApiUrl();
    if (apiUrl.includes('localhost')) {
        // Use production URL for sharing links even in local dev
        // so that WhatsApp/social media can reach the preview page
        return 'https://api.samajwaditechforce.com';
    }
    return apiUrl.replace(/\/api\/?$/, '');
};
