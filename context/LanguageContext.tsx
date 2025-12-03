import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';

type LanguageContextType = {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
    t: (text: string) => string; // Placeholder for translation function
    availableLanguages: { code: string; name: string; nativeName: string }[];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState('en');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            // 1. Check local storage
            const storedLang = await AsyncStorage.getItem('appLanguage');
            if (storedLang) {
                setLanguageState(storedLang);
                return;
            }

            // 2. Check user profile if logged in
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                if (userInfo.language) {
                    setLanguageState(userInfo.language);
                    await AsyncStorage.setItem('appLanguage', userInfo.language);
                }
            }
        } catch (error) {
            console.error('Error loading language:', error);
        }
    };

    const setLanguage = async (lang: string) => {
        try {
            console.log('Setting language to:', lang);
            setLanguageState(lang);
            await AsyncStorage.setItem('appLanguage', lang);

            // Update user profile in backend if logged in
            const token = await AsyncStorage.getItem('userToken');
            console.log('User token exists:', !!token);

            if (token) {
                const url = getApiUrl();
                console.log('Updating language on backend:', `${url}/auth/update-language`);

                const response = await fetch(`${url}/auth/update-language`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ language: lang })
                });

                const data = await response.json();
                console.log('Backend update response:', data);

                // Update local user info
                const userInfoStr = await AsyncStorage.getItem('userInfo');
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr);
                    userInfo.language = lang;
                    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
                }
            }
        } catch (error) {
            console.error('Error setting language:', error);
        }
    };

    // Simple placeholder translation function
    // In a real app, this would look up strings in a dictionary or call the translation API
    const t = (text: string) => {
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
