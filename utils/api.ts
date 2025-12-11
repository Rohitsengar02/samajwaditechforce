import { Platform } from 'react-native';

export const getApiUrl = () => {
    // 1. If explicitly set in env (e.g. for specific builds), use it
    if (process.env.EXPO_PUBLIC_API_URL) {
        let url = process.env.EXPO_PUBLIC_API_URL;
        // Fix: Ensure we don't duplicate /api if already present
        if (!url.endsWith('/api') && !url.endsWith('/api/')) url += '/api';
        return url;
    }

    // 2. In Production (EAS Build / Release), default to Render URL
    if (!__DEV__) {
        return 'https://api-samajwaditechforce.onrender.com/api';
    }

    // 3. Development Fallback (Localhost)
    let url = 'http://localhost:5001/api';

    if (Platform.OS === 'android') {
        // Use 10.0.2.2 for Android Emulator, or your local IP for physical device
        // Ideally, this should also be configurable via env
        url = 'http://10.0.2.2:5001/api';
    }

    console.log('🔧 Using API URL:', url);
    return url;
};
