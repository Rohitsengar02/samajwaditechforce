import { Platform } from 'react-native';

/**
 * Translates text using the free Google Translate GTX endpoint.
 * Note: This is an unofficial endpoint and may have rate limits.
 * 
 * @param text The text to translate
 * @param targetLang The target language code (e.g., 'hi' for Hindi, 'en' for English)
 * @param sourceLang The source language code (default 'auto')
 * @returns The translated text
 */
export const translateText = async (
    text: string,
    targetLang: string = 'hi',
    sourceLang: string = 'auto'
): Promise<string> => {
    try {
        if (!text || !text.trim()) return text;

        // Use the GTX endpoint which is free and doesn't require an API key
        const encodedText = encodeURIComponent(text);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Translation request failed');
        }

        const data = await response.json();

        // The structure of the response is a bit nested: [[["Translated Text", "Original Text", ...], ...], ...]
        // We need to join the parts if the text was split
        if (data && data[0]) {
            return data[0].map((item: any) => item[0]).join('');
        }

        return text;
    } catch (error) {
        console.error('Translation Error:', error);
        return text; // Return original text on failure
    }
};

/**
 * Batch translates an array of strings.
 * Note: Use with caution to avoid hitting rate limits.
 */
export const translateBatch = async (
    texts: string[],
    targetLang: string = 'hi'
): Promise<string[]> => {
    try {
        // Process in parallel but limit concurrency if needed
        const promises = texts.map(text => translateText(text, targetLang));
        return await Promise.all(promises);
    } catch (error) {
        console.error('Batch Translation Error:', error);
        return texts;
    }
};
