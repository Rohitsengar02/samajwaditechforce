import React from 'react';
import { Image, ImageProps, View, ActivityIndicator, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import { useCachedMedia } from '../hooks/useCachedMedia';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
    source: string | { uri: string };
    style?: StyleProp<ImageStyle>;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const CachedImage: React.FC<CachedImageProps> = ({ source, style, ...props }) => {
    // Extract URI from source if it's an object, or use it directly if string
    const uri = typeof source === 'string' ? source : source?.uri;

    // Custom hook handles optimization and caching
    const { cachedUri, loading } = useCachedMedia(uri, 'image');

    // If it's a local require (number), just render standard Image
    if (typeof source === 'number') {
        return <Image source={source} style={style} {...props} />;
    }

    return (
        <View style={[style, styles.container]}>
            {loading && (
                <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
                    <ActivityIndicator size="small" color="#E30512" />
                </View>
            )}

            {cachedUri ? (
                <Image
                    {...props}
                    source={{ uri: cachedUri }}
                    style={style}
                />
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden', // Ensures loading indicator respects border radius of parent
        backgroundColor: '#f0f0f0', // Placeholder color
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    }
});

export default CachedImage;
