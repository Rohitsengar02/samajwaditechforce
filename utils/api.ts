import { Platform } from 'react-native';

export const getApiUrl = () => {
    // 1. If explicitly set in env (e.g. for specific builds), use it
    if (process.env.EXPO_PUBLIC_API_URL) {
        let url = process.env.EXPO_PUBLIC_API_URL;
        if (!url.endsWith('/api')) url += '/api';
        return url;
    }

    // 2. In Production (Web or Mobile Release), use the Live Server
    if (!__DEV__) {
        return 'https://api.samajwaditechforce.com/api';
    }

    // 3. Development Fallback
    let url = 'http://localhost:5001/api';
    console.log('🔧 ENV API URL:', process.env.EXPO_PUBLIC_API_URL);
    console.log('🔧 Platform:', Platform.OS);

    if (Platform.OS === 'android') {
        // Replace localhost with machine IP for Android Emulator/Device
        url = url
            .replace('localhost', '192.168.1.34')
            .replace('127.0.0.1', '192.168.1.34')
            .replace('10.0.2.2', '192.168.1.34');
    }

    return url;
};
