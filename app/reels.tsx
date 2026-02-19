import React, { useState, useRef, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
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
    Image,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    Animated,
    Alert
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { WebView } from 'react-native-webview';
import { TranslatedText } from '../components/TranslatedText';
import { getApiUrl, getBaseUrl } from '../utils/api';
import CachedVideo from '../components/CachedVideo';
import { useQuery } from '@tanstack/react-query';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

const ReelVideoCard = ({ item, index, activeIndex, onLike, onComment, onShare, onDownload, containerStyle }: any) => {
    const videoRef = useRef<Video>(null);
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

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsLoading(false);
        }
    };

    const isYoutube = item.videoUrl?.includes('youtu');
    const isDrive = item.videoUrl?.includes('drive.google.com');

    // Interaction Button Component
    const InteractionButton = ({ icon, label, count, onPress, active }: any) => (
        <TouchableOpacity style={styles.interactionButton} onPress={onPress} activeOpacity={0.7}>
            <MaterialCommunityIcons
                name={icon}
                size={32}
                color={active ? SP_RED : '#fff'}
            />
            {count > 0 && (
                <Text style={styles.interactionCount}>{count}</Text>
            )}
        </TouchableOpacity>
    );

    // Render YouTube or Google Drive videos
    if (isYoutube || isDrive) {
        let uri = item.videoUrl;
        if (isYoutube) {
            const id = uri.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/)?.[1];
            if (id) {
                uri = `https://www.youtube.com/embed/${id}?autoplay=${shouldPlay ? 1 : 0}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}&mute=0&disablekb=1&fs=0&iv_load_policy=3`;
            }
        } else if (isDrive) {
            uri = uri.replace('/view', '/preview');
        }

        return (
            <View style={[styles.reelContainer, containerStyle]}>
                <View style={styles.videoContainer}>
                    {shouldPlay ? (
                        Platform.OS === 'web' ? (
                            <iframe
                                src={uri}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                        ) : (
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
                        )
                    ) : (
                        <View style={styles.placeholder}>
                            <MaterialCommunityIcons name="play-circle-outline" size={80} color="rgba(255,255,255,0.7)" />
                        </View>
                    )}
                </View>

                {/* Right Interaction Sidebar */}
                <View style={styles.interactionSidebar}>
                    <InteractionButton
                        icon={item.isLiked ? "heart" : "heart-outline"}
                        count={item.likesCount || 0}
                        onPress={() => onLike(item)}
                        active={item.isLiked}
                    />
                    <InteractionButton
                        icon="comment-outline"
                        count={item.commentsCount || 0}
                        onPress={() => onComment(item)}
                    />
                    <InteractionButton
                        icon="share-outline"
                        count={item.sharesCount || 0}
                        onPress={() => onShare(item)}
                    />
                    <InteractionButton
                        icon="download-outline"
                        count={item.downloadsCount || 0}
                        onPress={() => onDownload(item)}
                    />
                </View>

                {/* Bottom Info Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
                    style={styles.bottomOverlay}
                    locations={[0, 0.5, 1]}
                >
                    <View style={styles.bottomInfo}>
                        {/* Profile Section */}
                        <View style={styles.profileSection}>
                            <View style={styles.profilePicContainer}>
                                <Image
                                    source={require('../assets/images/icon.png')}
                                    style={styles.profilePic}
                                />
                            </View>
                            <View style={styles.profileText}>
                                <Text style={styles.username}>Samajwadi Tech Force</Text>
                                <Text style={styles.subtitle}>Official</Text>
                            </View>
                        </View>

                        {/* Video Title */}
                        <Text style={styles.videoTitle} numberOfLines={2}>
                            {item.description || item.title}
                        </Text>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    // Render regular video files
    return (
        <View style={[styles.reelContainer, containerStyle]}>
            <View style={styles.videoContainer}>
                <CachedVideo
                    ref={videoRef}
                    source={item.videoUrl}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={shouldPlay}
                    isLooping
                    isMuted={false}
                    useNativeControls={false}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    volume={1.0}
                />

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={SP_RED} />
                    </View>
                )}
            </View>

            {/* Right Interaction Sidebar */}
            <View style={styles.interactionSidebar}>
                <InteractionButton
                    icon={item.isLiked ? "heart" : "heart-outline"}
                    count={item.likesCount || 0}
                    onPress={() => onLike(item)}
                    active={item.isLiked}
                />
                <InteractionButton
                    icon="comment-outline"
                    count={item.commentsCount || 0}
                    onPress={() => onComment(item)}
                />
                <InteractionButton
                    icon="share-outline"
                    count={item.sharesCount || 0}
                    onPress={() => onShare(item)}
                />
                <InteractionButton
                    icon="download-outline"
                    count={item.downloadsCount || 0}
                    onPress={() => onDownload(item)}
                />
            </View>

            {/* Bottom Info Overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                style={styles.bottomOverlay}
                locations={[0, 0.4, 1]}
            >
                <View style={styles.bottomInfo}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.profilePicContainer}>
                            <Image
                                source={require('../assets/images/icon.png')}
                                style={styles.profilePic}
                            />
                        </View>
                        <View style={styles.profileText}>
                            <Text style={styles.username}>Samajwadi Tech Force</Text>
                            <Text style={styles.subtitle}>Official</Text>
                        </View>
                    </View>

                    {/* Video Title */}
                    <Text style={styles.videoTitle} numberOfLines={2}>
                        {item.description || item.title}
                    </Text>
                </View>
            </LinearGradient>

            {/* Play/Pause Indicator */}
            {!isPlaying && !isLoading && (
                <View style={styles.playIndicator}>
                    <MaterialCommunityIcons name="play-circle-outline" size={70} color="rgba(255,255,255,0.7)" />
                </View>
            )}
        </View>
    );
};

// Toast Notification Component
const Toast = ({ visible, message, onHide }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => onHide());
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.toastGradient}
            >
                <MaterialCommunityIcons name="star-circle" size={24} color="#fff" />
                <Text style={styles.toastText}>{message}</Text>
            </LinearGradient>
        </Animated.View>
    );
};

export default function ReelsPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const initialReelId = params.id as string;

    const [activeIndex, setActiveIndex] = useState(0);
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Comment Modal State
    // ... (rest of the state remains same)
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedReel, setSelectedReel] = useState<any>(null);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Toast State
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    // Calculate Web-friendly dimensions
    const isWeb = Platform.OS === 'web';
    const cardWidth = isWeb && windowWidth > 500 ? 480 : windowWidth;
    const containerStyle = { width: cardWidth, height: windowHeight };

    const showToast = (message: string) => {
        setToastMessage(message);
        setToastVisible(true);
    };

    const fetchReels = async (pageNum: number = 1) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const url = getApiUrl();
            const res = await fetch(`${url}/reels?page=${pageNum}&limit=5`);
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                await processReelsData(data, pageNum > 1);

                if (data.pagination) {
                    setHasMore(data.pagination.current < data.pagination.total);
                } else {
                    setHasMore(data.data.length > 0);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Fetch reels error:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchReels(1);
    }, []);

    const processReelsData = async (data: any, append: boolean = false) => {
        try {
            // Get user info
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
            const userId = userInfo?._id || userInfo?.id;

            if (data.success && Array.isArray(data.data)) {
                let mappedReels = data.data.map((item: any) => ({
                    id: item._id,
                    videoUrl: item.videoUrl,
                    title: item.title,
                    description: item.description,
                    thumbnailUrl: item.thumbnailUrl,
                    likesCount: item.likes?.length || 0,
                    commentsCount: item.comments?.length || 0,
                    sharesCount: item.shares?.length || 0,
                    downloadsCount: item.downloads?.length || 0,
                    isLiked: userId ? item.likes?.some((l: any) => l.user?.toString() === userId) : false,
                    uniqueKey: `${item._id}-${Math.random()}`
                }));

                if (append) {
                    setReels(prev => [...prev, ...mappedReels]);
                } else {
                    // Handle Shared Reel ID
                    if (initialReelId) {
                        const sharedReelIndex = mappedReels.findIndex((r: any) => r.id === initialReelId);
                        if (sharedReelIndex !== -1) {
                            // Move shared reel to the top
                            const sharedReel = mappedReels[sharedReelIndex];
                            mappedReels.splice(sharedReelIndex, 1);
                            mappedReels.unshift(sharedReel);
                        }
                    }
                    setReels(mappedReels);
                }
            }
        } catch (err) {
            console.error('Failed to process reels:', err);
        }
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchReels(nextPage);
        }
    };

    const handleLike = async (reel: any) => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (!userInfoStr) {
                showToast('❌ Please login to like reels');
                return;
            }
            const userInfo = JSON.parse(userInfoStr);
            const userId = userInfo._id || userInfo.id;
            const username = userInfo.username || userInfo.phone || userInfo.email;

            const wasLiked = reel.isLiked;

            // Update UI optimistically
            setReels(prev => prev.map(r => r.id === reel.id ? {
                ...r,
                isLiked: !r.isLiked,
                likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1
            } : r));

            const url = getApiUrl();
            const res = await fetch(`${url}/reels/${reel.id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, userId })
            });
            const data = await res.json();

            if (data.success && data.likesCount !== undefined) {
                setReels(prev => prev.map(r => r.id === reel.id ? {
                    ...r,
                    likesCount: data.likesCount
                } : r));

                // Show points toast only when liking (not unliking)
                if (!wasLiked) {
                    showToast('🎉 +5 points for liking!');
                }
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleComment = async (reel: any) => {
        setSelectedReel(reel);
        setShowCommentModal(true);
        setComments([]);
        setLoadingComments(true);

        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/reels/${reel.id}`);
            const data = await res.json();

            if (data.success && data.data) {
                const sortedComments = (data.data.comments || []).sort((a: any, b: any) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setComments(sortedComments);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            showToast('❌ Failed to load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    const handleShare = async (reel: any) => {
        setSelectedReel(reel);
        if (Platform.OS === 'web') {
            setShowShareModal(true);
            return;
        }

        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (!userInfoStr) {
                showToast('❌ Please login to share');
                return;
            }
            const userInfo = JSON.parse(userInfoStr);
            const userId = userInfo._id || userInfo.id;
            const username = userInfo.username || userInfo.phone || userInfo.email;

            // Track share backend
            const trackUrl = getApiUrl();
            const trackRes = await fetch(`${trackUrl}/reels/${reel.id}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, userId })
            });
            const trackData = await trackRes.json();

            if (trackData.firstShare && trackData.points) {
                showToast(`📤 +${trackData.points} points for sharing!`);
            }

            // Construct the Shareable Backend Link for Preview
            // Hardcoding to backend URL to ensure social media crawlers find the OG tags
            const backendShareBase = 'https://api.samajwaditechforce.com';
            const shareUrl = `${backendShareBase}/share/reels/${reel.id}`;
            const shareText = `Check out this reel: ${reel.title}`;

            // Share using native share
            const Share = require('react-native').Share;
            await Share.share({
                message: `${shareText}\n\n${shareUrl}`,
                title: reel.title
            });
        } catch (error: any) {
            if (error.message !== 'User did not share') {
                console.error('Share error:', error);
            }
        }
    };

    const handleWebShare = async (type: string) => {
        if (!selectedReel) return;

        // Force the backend URL for previews so WhatsApp etc. can find the metadata
        const backendShareBase = 'https://api.samajwaditechforce.com';
        const shareUrl = `${backendShareBase}/share/reels/${selectedReel.id}`;

        const shareText = `Check out this reel: ${selectedReel.title}`;
        const shareData = {
            title: selectedReel.title,
            text: shareText,
            url: shareUrl
        };

        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
        const userId = userInfo?._id || userInfo?.id;
        const username = userInfo?.username || userInfo?.phone || userInfo?.email;


        const trackShare = async () => {
            if (!userId) return;
            try {
                const url = getApiUrl();
                const res = await fetch(`${url}/reels/${selectedReel.id}/share`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, userId })
                });
                const data = await res.json();
                if (data.firstShare && data.points) {
                    showToast(`📤 +${data.points} points for sharing!`);
                }
            } catch (e) { console.error(e); }
        };


        if (type === 'copy') {
            navigator.clipboard.writeText(shareUrl);
            setShowShareModal(false);
            showToast('✅ Link copied to clipboard!');
            trackShare();
        } else if (type === 'whatsapp') {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
            window.open(whatsappUrl, '_blank');
            setShowShareModal(false);
            trackShare();
        } else if (type === 'native') {
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    setShowShareModal(false);
                    trackShare();
                } catch (e) { console.log('Share cancelled'); }
            } else {
                showToast('❌ Native sharing not supported');
            }
        }
    };

    const handleDownload = async (reel: any) => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (!userInfoStr) {
                showToast('❌ Please login to download');
                return;
            }
            const userInfo = JSON.parse(userInfoStr);
            const userId = userInfo._id || userInfo.id;
            const username = userInfo.username || userInfo.phone || userInfo.email;

            const url = getApiUrl();
            const res = await fetch(`${url}/reels/${reel.id}/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, userId })
            });
            const data = await res.json();

            if (data.firstDownload && data.points) {
                showToast(`⬇️ +${data.points} points for downloading!`);
            } else {
                showToast('⬇️ Download starting...');
            }

            // --- ACTUAL DOWNLOAD LOGIC ---
            if (Platform.OS === 'web') {
                try {
                    // Fetch the video file
                    const response = await fetch(reel.videoUrl);
                    const blob = await response.blob();

                    // Create a download link
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = (reel.title || 'video').replace(/[^a-zA-Z0-9]/g, '_') + '.mp4';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(downloadUrl);
                    showToast('✅ Download started');
                } catch (downloadError) {
                    console.error('Download error:', downloadError);
                    // Fallback: open in new tab if CORS blocks download
                    window.open(reel.videoUrl, '_blank');
                    showToast('⚠️ Opened in new tab');
                }
                return;
            }

            const filename = reel.title.replace(/[^a-zA-Z0-9]/g, '_') + '.mp4';
            const fileUri = FileSystem.documentDirectory + filename;

            const downloadRes = await FileSystem.downloadAsync(reel.videoUrl, fileUri);

            if (downloadRes.status === 200) {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                    await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
                    showToast('✅ Video saved to Gallery');
                } else {
                    // Fallback to Sharing if permission denied or Android 10+ sometimes prefers share
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(downloadRes.uri);
                    } else {
                        Alert.alert('Permission needed', 'Please allow storage permission to save video.');
                    }
                }
            } else {
                showToast('❌ Download failed');
            }

        } catch (error) {
            console.error('Download error:', error);
            showToast('❌ Download error');
        }
    };

    const submitComment = async () => {
        if (!commentText.trim() || !selectedReel) return;

        try {
            setSubmittingComment(true);
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (!userInfoStr) {
                showToast('❌ Please login to comment');
                return;
            }
            const userInfo = JSON.parse(userInfoStr);
            const userId = userInfo._id || userInfo.id;
            const username = userInfo.username || userInfo.phone || userInfo.email;

            const url = getApiUrl();
            const res = await fetch(`${url}/reels/${selectedReel.id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, userId, text: commentText })
            });
            const data = await res.json();

            if (data.success) {
                // Update comments count for all duplicates of this reel
                setReels(prev => prev.map(r => r.id === selectedReel.id ? {
                    ...r,
                    commentsCount: data.comments.length
                } : r));

                if (data.firstComment && data.points) {
                    showToast(`💬 +${data.points} points for commenting!`);
                }

                // Add to local comments list
                const newComment = {
                    _id: 'temp-' + Date.now(),
                    text: commentText,
                    username: username || 'User',
                    timestamp: new Date().toISOString(),
                    user: userId
                };
                setComments(prev => [newComment, ...prev]);

                setCommentText('');
                // Keep modal open to show the new comment
            }
        } catch (error) {
            console.error('Comment error:', error);
            showToast('❌ Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            setActiveIndex(newIndex);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

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
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" hidden={!isWeb} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reels</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                style={{ flex: 1, backgroundColor: '#000' }}
                ref={flatListRef}
                data={reels}
                contentContainerStyle={{ alignItems: 'center' }}
                renderItem={({ item, index }) => (
                    <ReelVideoCard
                        item={item}
                        index={index}
                        activeIndex={activeIndex}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                        onDownload={handleDownload}
                        containerStyle={containerStyle}
                    />
                )}
                keyExtractor={item => item.uniqueKey || item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={windowHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => (
                    loadingMore ? (
                        <View style={[styles.loadingMore, { height: 100, justifyContent: 'center' }]}>
                            <ActivityIndicator size="small" color={SP_RED} />
                        </View>
                    ) : null
                )}
                ListEmptyComponent={
                    <View style={[styles.emptyContainer, { height: windowHeight }]}>
                        <MaterialCommunityIcons name="video-off-outline" size={80} color="#666" />
                        <Text style={styles.emptyText}>
                            <TranslatedText>No reels available</TranslatedText>
                        </Text>
                    </View>
                }
            />


            {/* Comment Modal */}
            <Modal
                visible={showCommentModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCommentModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.commentModalContainer}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowCommentModal(false)}
                    />
                    <View style={[styles.commentModal, { height: windowHeight * 0.75 }]}>
                        <View style={styles.modalGrabber} />
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.commentModalTitle}>Comments</Text>
                                <Text style={styles.modalSubtitle}>{comments.length} total thoughts</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowCommentModal(false)} style={styles.closeBtnCircle}>
                                <MaterialCommunityIcons name="close" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {loadingComments ? (
                            <View style={styles.commentsLoading}>
                                <ActivityIndicator size="small" color={SP_RED} />
                            </View>
                        ) : (
                            <FlatList
                                data={comments}
                                keyExtractor={(item) => item._id || Math.random().toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.commentItem}>
                                        <View style={styles.commentAvatar}>
                                            <Text style={styles.commentAvatarText}>
                                                {item.username ? item.username.charAt(0).toUpperCase() : 'U'}
                                            </Text>
                                        </View>
                                        <View style={styles.commentContent}>
                                            <View style={styles.commentHeader}>
                                                <Text style={styles.commentUsername}>{item.username || 'User'}</Text>
                                                <Text style={styles.commentTime}>
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <Text style={styles.commentText}>{item.text}</Text>
                                        </View>
                                    </View>
                                )}
                                contentContainerStyle={styles.commentsList}
                                ListEmptyComponent={
                                    <View style={styles.noCommentsContainer}>
                                        <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
                                    </View>
                                }
                            />
                        )}

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.commentInput}
                                value={commentText}
                                onChangeText={setCommentText}
                                placeholder="Write your thoughts..."
                                placeholderTextColor="#666"
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                                onPress={submitComment}
                                disabled={!commentText.trim() || submittingComment}
                            >
                                {submittingComment ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <MaterialCommunityIcons name="send" size={24} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Share Modal */}
            <Modal
                visible={showShareModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowShareModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowShareModal(false)}
                >
                    <View style={styles.shareModalContent}>
                        <Text style={styles.shareTitle}>Share Reel</Text>
                        <View style={styles.shareOptions}>
                            <TouchableOpacity style={styles.shareOption} onPress={() => handleWebShare('copy')}>
                                <View style={[styles.shareIconContainer, { backgroundColor: '#f3f4f6' }]}>
                                    <MaterialCommunityIcons name="content-copy" size={24} color="#374151" />
                                </View>
                                <Text style={styles.shareOptionText}>Copy Link</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={() => handleWebShare('whatsapp')}>
                                <View style={[styles.shareIconContainer, { backgroundColor: '#dcfce7' }]}>
                                    <MaterialCommunityIcons name="whatsapp" size={24} color="#16a34a" />
                                </View>
                                <Text style={styles.shareOptionText}>WhatsApp</Text>
                            </TouchableOpacity>

                            {Platform.OS === 'web' && typeof navigator !== 'undefined' && 'share' in navigator && (
                                <TouchableOpacity style={styles.shareOption} onPress={() => handleWebShare('native')}>
                                    <View style={[styles.shareIconContainer, { backgroundColor: '#e0f2fe' }]}>
                                        <MaterialCommunityIcons name="share-variant" size={24} color="#0284c7" />
                                    </View>
                                    <Text style={styles.shareOptionText}>More...</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity style={styles.closeShareButton} onPress={() => setShowShareModal(false)}>
                            <Text style={styles.closeShareText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Toast Notification */}
            <Toast
                visible={toastVisible}
                message={toastMessage}
                onHide={() => setToastVisible(false)}
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
        top: Platform.OS === 'ios' ? 60 : 40,
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
        backgroundColor: '#000',
        width: Platform.OS === 'web' ? '100%' : width,
        height: Platform.OS === 'web' ? '100%' : height,
    },
    videoContainer: {
        position: 'absolute',
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
    bottomOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',
        justifyContent: 'flex-end',
        paddingBottom: Platform.OS === 'ios' ? 100 : 90,
        paddingHorizontal: 16,
    },
    bottomInfo: {
        marginBottom: 10,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    profilePicContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'hidden',
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    profileText: {
        marginLeft: 12,
        flex: 1,
    },
    username: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        color: '#e0e0e0',
        fontSize: 13,
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    videoTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        marginTop: 4,
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
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
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
    // Interaction Sidebar Styles
    interactionSidebar: {
        position: 'absolute',
        right: 12,
        bottom: Platform.OS === 'ios' ? 220 : 200,
        gap: 24,
        zIndex: 10,
    },
    interactionButton: {
        alignItems: 'center',
        gap: 4,
    },
    interactionCount: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    // Toast Styles
    toastContainer: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    toastGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    toastText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    // Comment Modal Styles
    commentModalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        zIndex: 100,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    commentModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        minHeight: 200,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    commentModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    closeBtnCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalGrabber: {
        width: 40,
        height: 5,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        padding: 8,
        paddingHorizontal: 16,
    },
    commentInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        fontSize: 16,
        color: '#000',
        paddingTop: 8,
        paddingBottom: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: SP_RED,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    commentsLoading: {
        padding: 20,
        alignItems: 'center',
    },
    commentsList: {
        paddingBottom: 20,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    commentAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
    commentContent: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 10,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentUsername: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
    },
    commentTime: {
        fontSize: 12,
        color: '#888',
    },
    commentText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    noCommentsContainer: {
        padding: 40,
        alignItems: 'center',
    },
    noCommentsText: {
        color: '#888',
        fontStyle: 'italic',
    },
    // Share Modal Styles
    shareModalContent: {
        backgroundColor: '#fff',
        width: '80%',
        maxWidth: 300,
        borderRadius: 20,
        padding: 20,
        alignSelf: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    shareTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1f2937',
    },
    shareOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    shareOption: {
        alignItems: 'center',
        gap: 8,
    },
    shareIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareOptionText: {
        fontSize: 12,
        color: '#4b5563',
        fontWeight: '500',
    },
    closeShareButton: {
        width: '100%',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        alignItems: 'center',
    },
    closeShareText: {
        color: SP_RED,
        fontWeight: '600',
        fontSize: 16,
    },
});
