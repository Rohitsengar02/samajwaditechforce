import React, { useState, useEffect } from 'react';
import { Text, TextProps, ActivityIndicator } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../services/translationService';

interface TranslatedTextProps extends TextProps {
    children: string;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ children, style, ...props }) => {
    const { language } = useLanguage();
    const [translatedContent, setTranslatedContent] = useState(children);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const performTranslation = async () => {
            // If language is English or content is empty, show original
            if (language === 'en' || !children || !children.trim()) {
                if (isMounted) setTranslatedContent(children);
                return;
            }

            // Check if we already have this translation in a local cache (optional optimization)
            // For now, we'll just call the service

            setLoading(true);
            try {
                const result = await translateText(children, language);
                if (isMounted) setTranslatedContent(result);
            } catch (error) {
                console.error('Translation error in component:', error);
                if (isMounted) setTranslatedContent(children);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        performTranslation();

        return () => {
            isMounted = false;
        };
    }, [language, children]);

    // If loading, we could show a spinner or just the original text
    // Showing original text prevents layout shift, but might be jarring if it changes suddenly
    // Let's show original text while loading for smoother UX

    return (
        <Text style={style} {...props}>
            {translatedContent}
        </Text>
    );
};
