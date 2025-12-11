import { Platform } from 'react-native';

export const getApiUrl = () => {
    // 1. If explicitly set in env (e.g. for specific builds OR dev override), use it
    // This allows using the Render API in development if EXPO_PUBLIC_API_URL is set in .env
    if (process.env.EXPO_PUBLIC_API_URL) {
        let url = process.env.EXPO_PUBLIC_API_URL;
        // Fix: Ensure we don't duplicate /api if already present
        if (!url.endsWith('/api') && !url.endsWith('/api/')) url += '/api';
        console.log('🔧 Using Configured API URL:', url);
        return url;
    }

    // 2. Force Local Dev if __DEV__ is true AND no env var is set
    // This ensures we connect to the running local backend if user hasn't specified otherwise.
    if (__DEV__) {
        console.log('🔧 DEV Mode: Forcing Local API URL (192.168.1.38)');
        return 'http://192.168.1.38:5001/api';
    }

    // 3. In Production (EAS Build / Release), default to Render URL
    // This acts as a fallback if no env var is provided in production
    return 'https://api-samajwaditechforce.onrender.com/api';
};
