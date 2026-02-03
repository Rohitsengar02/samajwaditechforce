import { PixelRatio, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PIXEL_RATIO = PixelRatio.get();

/**
 * Generates an optimized Cloudinary URL with:
 * - f_auto: Serves AVIF/WebP depending on browser support
 * - q_auto:best: Highest visual quality with optimized compression
 * - w_auto: Resizes based on device width (optional)
 * - c_limit: Ensures image is never upscaled
 * 
 * @param url Original Cloudinary URL
 * @param width Optional target width (defaults to screen width * pixel density)
 * @returns Optimized URL
 */
export const getOptimizedImageUrl = (url: string, width?: number): string => {
    if (!url || typeof url !== 'string') return '';
    if (!url.includes('cloudinary.com')) return url;

    // Remove existing transformations if any to start fresh
    // Regex matches /upload/ followed by potential transformation params
    const baseUrl = url.replace(/\/upload\/.*?\//, '/upload/');

    // Calculate target width (Retina ready)
    // If no width provided, assume full screen width requirement
    const targetWidth = width ? Math.round(width * PIXEL_RATIO) : Math.round(SCREEN_WIDTH * PIXEL_RATIO);

    // We cap max width to 1920 to prevent accidental huge loads on massive tablets
    const explicitWidth = Math.min(targetWidth, 1920);

    // Construct transformation string
    // f_auto: Auto format (WebP/AVIF)
    // q_auto:best: Best quality (lossless-like)
    // c_limit: Resize but don't crop or upscale
    // w_<width>: Target width
    const transformation = `f_auto,q_auto:best,c_limit,w_${explicitWidth}`;

    return baseUrl.replace('/upload/', `/upload/${transformation}/`);
};

/**
 * Optimization for Videos (Reels)
 * Uses similar logic but prioritizes streaming formats
 */
export const getOptimizedVideoUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return '';
    if (!url.includes('cloudinary.com')) return url;

    const baseUrl = url.replace(/\/upload\/.*?\//, '/upload/');

    // q_auto:best ensures high bitrate
    // f_auto ensures H.265 (HEVC) on iOS for better compression at same quality
    // vc_auto: smart codec selection
    const transformation = `f_auto,q_auto:best,vc_auto`;

    return baseUrl.replace('/upload/', `/upload/${transformation}/`);
};
