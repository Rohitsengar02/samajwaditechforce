import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { Video, ResizeMode, VideoProps } from 'expo-av';
import { useCachedMedia } from '../hooks/useCachedMedia';

interface CachedVideoProps extends Omit<VideoProps, 'source'> {
    source: string; // We enforce URI string for caching logic
    style?: StyleProp<ViewStyle>;
    videoStyle?: StyleProp<ViewStyle>;
}

const CachedVideo = React.forwardRef<Video, CachedVideoProps>(({ source, style, videoStyle, ...props }, ref) => {
    const { cachedUri, loading } = useCachedMedia(source, 'video');
    const localRef = useRef<Video>(null);

    // Forward the ref
    useEffect(() => {
        if (!ref) return;
        if (typeof ref === 'function') {
            ref(localRef.current);
        } else {
            (ref as any).current = localRef.current;
        }
    }, [ref]);

    return (
        <View style={[styles.container, style]}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#E30512" />
                </View>
            )}

            {cachedUri && (
                <Video
                    ref={localRef}
                    source={{ uri: cachedUri }}
                    style={videoStyle || StyleSheet.absoluteFill}
                    // Default props that can be overridden
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    shouldPlay={false} // Default to false, let parent control playback
                    posterSource={props.posterSource} // Allow poster/thumbnail
                    useNativeControls={false}
                    {...props}
                />
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
    }
});

export default CachedVideo;
