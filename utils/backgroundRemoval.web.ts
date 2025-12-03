import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

export const removeBackground = async (imageSource: string): Promise<Blob> => {
    return await imglyRemoveBackground(imageSource);
};
