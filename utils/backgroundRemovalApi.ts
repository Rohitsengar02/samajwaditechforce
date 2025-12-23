/**
 * Background Removal Utility
 * Uses Remove.bg API for transparent background removal
 */

export const removeBackgroundFromImage = async (imageUri: string, apiKey: string): Promise<string> => {
    try {
        // Fetch the image
        const imageResponse = await fetch(imageUri);
        const imageBlob = await imageResponse.blob();

        // Create FormData
        const formData = new FormData();
        formData.append('image_file', imageBlob);
        formData.append('size', 'auto');

        // Call Remove.bg API
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.title || 'Failed to remove background');
        }

        // Get the result as blob
        const resultBlob = await response.blob();

        // Create object URL for web
        const url = URL.createObjectURL(resultBlob);
        return url;
    } catch (error) {
        console.error('Background removal error:', error);
        throw error;
    }
};
