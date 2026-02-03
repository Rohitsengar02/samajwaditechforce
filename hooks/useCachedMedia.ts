import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../utils/cloudinaryHelper';
import { Platform } from 'react-native';

// Use document directory for persistent files
// We want REELS and POSTERS to be persistent (download once, available forever)
// Using legacy import for broader compatibility
import * as LegacyFileSystem from 'expo-file-system/legacy';
const CACHE_DIR = (LegacyFileSystem.documentDirectory || '') + 'media_cache/';

// Ensure cache directory exists
const ensureDirExists = async () => {
    const dirInfo = await LegacyFileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
        await LegacyFileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
};

type MediaType = 'image' | 'video';

export const useCachedMedia = (remoteUrl: string | undefined, type: MediaType = 'image') => {
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (!remoteUrl) {
            setCachedUri(null);
            return;
        }

        // WEB: Use IndexedDB via localforage for persistent caching
        if (Platform.OS === 'web') {
            const cacheMediaWeb = async () => {
                setLoading(true);
                try {
                    // Dynamic import to avoid issues on native
                    const localforage = (await import('localforage')).default;

                    // Configure localforage for media caching
                    const mediaCache = localforage.createInstance({
                        name: 'mediaCache',
                        storeName: 'cached_media',
                    });

                    // Create cache key from URL using a simple hash function
                    const optimizedUrl = type === 'image'
                        ? getOptimizedImageUrl(remoteUrl)
                        : getOptimizedVideoUrl(remoteUrl);

                    // Simple hash function for unique cache keys
                    const hashCode = (str: string): string => {
                        let hash = 0;
                        for (let i = 0; i < str.length; i++) {
                            const char = str.charCodeAt(i);
                            hash = ((hash << 5) - hash) + char;
                            hash = hash & hash; // Convert to 32bit integer
                        }
                        return Math.abs(hash).toString(36);
                    };

                    const cacheKey = `media_${hashCode(optimizedUrl)}_${optimizedUrl.split('/').pop()?.split('?')[0] || 'file'}`;

                    // Check if already cached in IndexedDB
                    const cachedData = await mediaCache.getItem<string>(cacheKey);

                    if (cachedData) {
                        // Found in cache! Use the base64 data URL
                        if (isMounted) {
                            setCachedUri(cachedData);
                            setLoading(false);
                        }
                        return;
                    }

                    // Not in cache, fetch and store
                    const response = await fetch(optimizedUrl);
                    const blob = await response.blob();

                    // Convert blob to base64 data URL
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64Data = reader.result as string;

                        // Store in IndexedDB
                        await mediaCache.setItem(cacheKey, base64Data);

                        if (isMounted) {
                            setCachedUri(base64Data);
                        }
                    };
                    reader.readAsDataURL(blob);

                } catch (err) {
                    console.error('Web cache error:', err);
                    // Fallback to optimized URL without caching
                    if (isMounted) {
                        const fallback = type === 'image'
                            ? getOptimizedImageUrl(remoteUrl)
                            : getOptimizedVideoUrl(remoteUrl);
                        setCachedUri(fallback);
                    }
                } finally {
                    if (isMounted) setLoading(false);
                }
            };

            cacheMediaWeb();
            return () => { isMounted = false; };
        }

        const cacheMedia = async () => {
            setLoading(true);
            try {
                await ensureDirExists();

                // Create a unique filename based on the URL
                // We optimize the URL FIRST so we cache the optimized version
                const optimizedUrl = type === 'image'
                    ? getOptimizedImageUrl(remoteUrl)
                    : getOptimizedVideoUrl(remoteUrl);

                // Hash the URL to get a safe filename
                // Simple hash replacement to avoid special chars
                const filename = optimizedUrl.split('/').pop()?.split('?')[0] || `file_${Date.now()}`;
                const fileUri = `${CACHE_DIR}${filename}`;

                // Check if file exists in cache
                const fileInfo = await LegacyFileSystem.getInfoAsync(fileUri);

                if (fileInfo.exists) {
                    if (isMounted) {
                        setCachedUri(fileUri);
                        setLoading(false);
                    }
                    return;
                }

                // If not in cache, download it
                const downloadRes = await LegacyFileSystem.downloadAsync(optimizedUrl, fileUri);

                if (isMounted) {
                    if (downloadRes.status === 200) {
                        setCachedUri(fileUri);
                    } else {
                        // Fallback to remote if download fails
                        setCachedUri(optimizedUrl);
                    }
                }
            } catch (err) {
                console.error('Cache error:', err);
                // Fallback to optimization only (no cache) on error
                if (isMounted) {
                    const fallback = type === 'image'
                        ? getOptimizedImageUrl(remoteUrl)
                        : getOptimizedVideoUrl(remoteUrl);
                    setCachedUri(fallback);
                    setError('Failed to cache media');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        cacheMedia();

        return () => {
            isMounted = false;
        };
    }, [remoteUrl, type]);

    return { cachedUri, loading, error };
};
