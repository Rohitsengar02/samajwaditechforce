import { Platform } from 'react-native';

/**
 * Removes background from an image using @imgly/background-removal (Web/WASM).
 * For Native, this function throws an error as you should use the API endpoint.
 * 
 * @param imageSource - URL or Blob of the image
 * @returns Promise<Blob> - The background-removed image as a Blob
 */
export const removeBackground = async (imageSource: string | Blob): Promise<Blob> => {
    if (Platform.OS === 'web') {
        try {
            // Dynamic import to prevent native bundler issues
            const imgly = await import('@imgly/background-removal');

            // Remove background
            const blob = await imgly.removeBackground(imageSource);
            return blob;
        } catch (error) {
            console.error('Error removing background on Web:', error);
            throw error;
        }
    } else {
        throw new Error('Background removal on Native works via API and should not call this utility directly.');
    }
};
