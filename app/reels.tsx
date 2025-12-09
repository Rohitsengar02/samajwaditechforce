import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { WebView } from 'react-native-webview';
import { TranslatedText } from '../components/TranslatedText';
import { getApiUrl } from '../utils/api';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';

const ReelVideoCard = ({ item, index, activeIndex, onLike }: any) => {
    const videoRef = useRef<Video>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const shouldPlay = index === activeIndex;

    useEffect(() => {
        if (shouldPlay && videoRef.current) {
            videoRef.current.playAsync();
            setIsPlaying(true);
        } else if (videoRef.current) {
            videoRef.current.pauseAsync();
            setIsPlaying(false);
        }
    }, [shouldPlay]);

    const handleLike = () => {
        setIsLiked(!isLiked);
        onLike?.(item.id, !isLiked);
    };

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsLoading(false);
        }
    };

    const isYoutube = item.videoUrl?.includes('youtu');
    const isDrive = item.videoUrl?.includes('drive.google.com');

    // Render YouTube or Google Drive videos
    if (isYoutube || isDrive) {
        let uri = item.videoUrl;
        if (isYoutube) {
            const id = uri.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/)?.[1];
            if (id) {
                // Remove controls, hide YouTube logo, disable related videos
                uri = `https://www.youtube.com/embed/${id}?autoplay=${shouldPlay ? 1 : 0}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}&mute=0&disablekb=1&fs=0&iv_load_policy=3`;
            }
        } else if (isDrive) {
            uri = uri.replace('/view', '/preview');
        }

        return (
            <View style={styles.reelContainer}>
                <View style={styles.videoContainer}>
                    {shouldPlay ? (
                        <WebView
                            source={{ uri }}
                            style={styles.webView}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            allowsInlineMediaPlayback={true}
                            mediaPlaybackRequiresUserAction={false}
                            scrollEnabled={false}
                            bounces={false}
                            scalesPageToFit={true}
                            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
                        />
                    ) : (
                        <View style={styles.placeholder}>
                            <MaterialCommunityIcons name="play-circle-outline" size={80} color="rgba(255,255,255,0.7)" />
                        </View>
                    )}
                </View>

                {/* Video Overlay Info */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.videoInfo}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                            {item.description || item.title}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Like Button */}
                <TouchableOpacity
                    style={styles.likeButton}
                    onPress={handleLike}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={32}
                        color={isLiked ? SP_RED : "#fff"}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    // Render regular video files
    return (
        <View style={styles.reelContainer}>
            <View style={styles.videoContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: item.videoUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={shouldPlay}
                    isLooping
                    isMuted={false}
                    useNativeControls={false}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={SP_RED} />
                    </View>
                )}
            </View>

            {/* Video Overlay Info */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={styles.gradientOverlay}
            >
                <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                        {item.description || item.title}
                    </Text>
                </View>
            </LinearGradient>

            {/* Like Button */}
            <TouchableOpacity
                style={styles.likeButton}
                onPress={handleLike}
                activeOpacity={0.7}
            >
                <MaterialCommunityIcons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={32}
                    color={isLiked ? SP_RED : "#fff"}
                />
            </TouchableOpacity>

            {/* Play/Pause Indicator */}
            {!isPlaying && !isLoading && (
                <View style={styles.playIndicator}>
                    <MaterialCommunityIcons name="play-circle-outline" size={80} color="rgba(255,255,255,0.7)" />
                </View>
            )}
        </View>
    );
};

export default function ReelsPage() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            setLoading(true);
            const url = getApiUrl();
            const res = await fetch(`${url}/reels`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setReels(data.data.map((item: any) => ({
                    id: item._id,
                    videoUrl: item.videoUrl,
                    title: item.title,
                    description: item.description,
                    thumbnailUrl: item.thumbnailUrl,
                })));
            }
        } catch (err) {
            console.error('Failed to fetch reels:', err);
        } finally {
            setLoading(false);
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    const handleLike = (reelId: string, liked: boolean) => {
        console.log(`Reel ${reelId} ${liked ? 'liked' : 'unliked'}`);
        // Add API call to save like status
    };

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color={SP_RED} />
                <Text style={styles.loadingText}>
                    <TranslatedText>Loading Reels...</TranslatedText>
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="black" />

            {/* Header Overlay */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    <TranslatedText>Reels</TranslatedText>
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={reels}
                renderItem={({ item, index }) => (
                    <ReelVideoCard
                        item={item}
                        index={index}
                        activeIndex={activeIndex}
                        onLike={handleLike}
                    />
                )}
                keyExtractor={item => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={height}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(data, index) => ({
                    length: height,
                    offset: height * index,
                    index,
                })}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="video-off-outline" size={80} color="#666" />
                        <Text style={styles.emptyText}>
                            <TranslatedText>No reels available</TranslatedText>
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backButton: {
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    reelContainer: {
        width: width,
        height: height,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    webView: {
        flex: 1,
        backgroundColor: '#000',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    playIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -40 }, { translateY: -40 }],
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '30%',
        justifyContent: 'flex-end',
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    videoInfo: {
        marginBottom: 10,
    },
    videoTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    likeButton: {
        position: 'absolute',
        right: 16,
        bottom: 100,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 12,
        borderRadius: 30,
    },
    loadingScreen: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 16,
    },
    emptyContainer: {
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    emptyText: {
        color: '#666',
        fontSize: 18,
        marginTop: 16,
    },
});
