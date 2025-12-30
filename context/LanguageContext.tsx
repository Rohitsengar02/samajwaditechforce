import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';
import { translateText } from '../services/translationService';

type LanguageContextType = {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
    translate: (text: string) => Promise<string>;
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
    const [translationCache, setTranslationCache] = useState<Record<string, Record<string, string>>>({});

    useEffect(() => {
        loadLanguage();
        loadCache();
    }, []);

    const loadCache = async () => {
        try {
            const cached = await AsyncStorage.getItem('translationCache');
            if (cached) {
                setTranslationCache(JSON.parse(cached));
            }
        } catch (e) {
            console.error('Failed to load translation cache', e);
        }
    };

    const saveCache = async (newCache: Record<string, Record<string, string>>) => {
        try {
            await AsyncStorage.setItem('translationCache', JSON.stringify(newCache));
        } catch (e) {
            console.error('Failed to save translation cache', e);
        }
    };

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
            setLanguageState(lang);
            await AsyncStorage.setItem('appLanguage', lang);

            // Update user profile in backend if logged in
            const token = await AsyncStorage.getItem('userToken');

            if (token) {
                const url = getApiUrl();
                // Fire and forget backend update to avoid UI delay
                fetch(`${url}/auth/update-language`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ language: lang })
                }).catch(err => console.error('Backend language update partial fail', err));

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

    const translate = useCallback(async (text: string): Promise<string> => {
        if (!text || language === 'en') return text;
        if (translationCache[language]?.[text]) {
            return translationCache[language][text];
        }

        try {
            const translated = await translateText(text, language);

            setTranslationCache(prev => {
                const next = {
                    ...prev,
                    [language]: {
                        ...(prev[language] || {}),
                        [text]: translated
                    }
                };
                saveCache(next); // Persist update
                return next;
            });

            return translated;
        } catch (error) {
            console.error('Translate error:', error);
            return text;
        }
    }, [language, translationCache]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, translate, availableLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        // Return default values instead of throwing to prevent crashes
        console.warn('useLanguage used outside LanguageProvider, returning defaults');
        return {
            language: 'en',
            setLanguage: async () => { },
            translate: async (text: string) => text,
            availableLanguages: [{ code: 'en', name: 'English', nativeName: 'English' }]
        };
    }
    return context;
};

// Helper hook for functional components
export const useTranslation = (text: string) => {
    const { translate, language } = useLanguage();
    const [translated, setTranslated] = useState(text);

    useEffect(() => {
        let active = true;
        if (language === 'en') {
            setTranslated(text);
        } else {
            translate(text).then(res => {
                if (active) setTranslated(res);
            });
        }
        return () => { active = false; };
    }, [text, language, translate]);

    return translated;
};
