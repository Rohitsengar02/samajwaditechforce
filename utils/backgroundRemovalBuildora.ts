import { Platform } from 'react-native';

export const removeBackground = async (imageUri: string): Promise<string | null> => {
    const formData = new FormData();

    // 1. SMART UPLOAD HANDLING (Web vs Mobile)
    if (Platform.OS === 'web') {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Create a File object from the Blob to ensure filename is present (standard browser API)
            const file = new File([blob], "upload.png", { type: blob.type || "image/png" });
            formData.append("image", file);
        } catch (e) {
            console.error("Blob conversion failed:", e);
            throw new Error("Failed to process image for upload.");
        }
    } else {
        // @ts-ignore
        formData.append("image", {
            uri: imageUri,
            name: "upload.png",
            type: "image/jpeg",
        });
    }

    // 2. YOUR PRIVATE HOST (Use your real domain)
    // This is the simplified API we built specifically for mobile integration
    const API_URL = "https://api.buildora.cloud/api/remove-bg";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
            // Note: Do NOT set Content-Type header manually, let fetch handle boundary!
        });

        const data = await response.json();

        if (data.success) {
            // Returns the base64 string ready to use in <Image />
            return data.image;
        } else {
            throw new Error(data.error || "Failed to remove background");
        }
    } catch (error) {
        console.error("Buildora API Error:", (error as any).message || error);
        return null;
    }
};
