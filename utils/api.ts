import { Platform } from 'react-native';

export const getApiUrl = () => {
    // 1. If explicitly set in env (e.g. for specific builds OR dev override), use it
    // This allows using the Render API in development if EXPO_PUBLIC_API_URL is set in .env
    if (process.env.EXPO_PUBLIC_API_URL) {
        let url = process.env.EXPO_PUBLIC_API_URL;
        // Fix: Ensure we don't duplicate /api if already present
        if (!url.endsWith('/api') && !url.endsWith('/api/')) url += '/api';

        // AUTO-FIX: 192.168.1.38 is confirmed dead. Switch to localhost to unblock user.
        if (url.includes('192.168.1.38')) {
            console.warn('⚠️ Detected unreachable IP 192.168.1.38 in variables. Auto-switching to localhost.');
            url = url.replace('192.168.1.38', 'localhost');
        }

        console.log('🔧 Using Configured API URL:', url);
        return url;
    }

    // 2. Force Local Dev if __DEV__ is true AND no env var is set
    if (__DEV__) {
        console.log('🔧 DEV Mode: Using localhost for API');
        return 'http://localhost:5001/api';
    }

    // 3. In Production (EAS Build / Release), default to Render URL
    return 'https://api-samajwaditechforce.onrender.com/api';
};

export const getBaseUrl = () => {
    const apiUrl = getApiUrl();
    if (apiUrl.includes('localhost')) {
        // Use production URL for sharing links even in local dev
        // so that WhatsApp/social media can reach the preview page
        return 'https://api-samajwaditechforce.onrender.com';
    }
    return apiUrl.replace(/\/api\/?$/, '');
};
