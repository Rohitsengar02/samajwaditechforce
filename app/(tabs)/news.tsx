import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    Easing,
    Share,
    Modal,
    Image,
    FlatList,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    useWindowDimensions,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { newsAPI } from '@/services/newsAPI';
import { TranslatedText } from '../../components/TranslatedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DesktopNews from '../desktop-screen-pages/news';

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// News Card Component
const NewsCard = ({ id, title, description, category, time, image, likes: initialLikes, isLiked: initialIsLiked, comments: commentsCount, commentsData, featured = false, views = 0, isVerified, onVerify }: any) => {
    const router = useRouter();
    const [liked, setLiked] = useState(initialIsLiked || false);
    const [likes, setLikes] = useState(initialLikes || 0);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState(commentsData || []);
    const [submittingComment, setSubmittingComment] = useState(false);

    const likeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const slideAnim = useRef(new Animated.Value(600)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (showComments) {
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 600,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [showComments]);

    const handleLike = async () => {
        if (!isVerified) { onVerify(); return; }
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (!userInfoStr) return;
            const userInfo = JSON.parse(userInfoStr);
            const userId = userInfo._id || userInfo.id;

            const newLiked = !liked;
            setLiked(newLiked);

            Animated.sequence([
                Animated.timing(likeAnim, {
                    toValue: 1.3,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(likeAnim, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }),
            ]).start();

            const username = userInfo.username || userInfo.phone || userInfo.email;
            const response = await newsAPI.toggleLike(id, userId, username);

            // Update likes count from backend response
            setLikes(response.data.length);

            // Show points notification if earned
            if (response.firstLike && response.points) {
                alert(`🎉 +${response.points} points earned for liking!`);
            }
        } catch (error) {
            console.error(error);
            // Revert on error
            setLiked(!liked);
        }
    };

    const handleAddComment = async () => {
        if (!isVerified) { onVerify(); return; }
        if (!commentText.trim()) return;

        try {
            setSubmittingComment(true);
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (!userInfoStr) return;
            const userInfo = JSON.parse(userInfoStr);
            const userId = userInfo._id || userInfo.id;
            const userName = userInfo.name || 'User';

            const username = userInfo.username || userInfo.phone || userInfo.email;
            const response = await newsAPI.addComment(id, commentText, userId, userName, username);

            // Show points notification if earned
            if (response.firstComment && response.points) {
                alert(`💬 +${response.points} points earned for commenting!`);
            }

            if (response.success) {
                setLocalComments(response.data);
                setCommentText('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const [showShareModal, setShowShareModal] = useState(false);
    const [sharing, setSharing] = useState(false);

    const handleShare = () => {
        if (!isVerified) { onVerify(); return; }
        setShowShareModal(true);
    };

    const getShareContent = () => {
        const shareUrl = `https://samajwaditechforce.com/news-detail?id=${id}`;
        const message = `${title}\n\nRead more at: ${shareUrl}`;
        return { message, shareUrl };
    };

    const shareToWhatsApp = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                const userId = userInfo._id || userInfo.id;
                const username = userInfo.username || userInfo.phone || userInfo.email;

                const response = await newsAPI.shareNews(id, userId, username);

                // Show points notification if earned
                if (response.firstShare && response.points) {
                    alert(`📤 +${response.points} points earned for sharing!`);
                }
            }

            const { message } = getShareContent();
            // Include image link in WhatsApp message
            const whatsAppMessage = image
                ? `${message}\n\n📸 ${image}`
                : message;
            const url = `whatsapp://send?text=${encodeURIComponent(whatsAppMessage)}`;

            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                alert('WhatsApp is not installed');
            }
            setShowShareModal(false);
        } catch (err) {
            console.error(err);
            alert('Failed to share. Please try again.');
        }
    };

    const shareViaSystem = async () => {
        setSharing(true);
        try {
            const { message, shareUrl } = getShareContent();

            // Track share and award points
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                const userId = userInfo._id || userInfo.id;
                const username = userInfo.username || userInfo.phone || userInfo.email;

                const response = await newsAPI.shareNews(id, userId, username);

                // Show points notification if earned
                if (response.firstShare && response.points) {
                    alert(`📤 +${response.points} points earned for sharing!`);
                }
            }

            // Share with message and URL
            await Share.share({
                message: `${message}\n\nImage: ${image || 'No image'}`,
                url: image || shareUrl,
                title: title
            });

            setShowShareModal(false);
        } catch (error: any) {
            console.error('Sharing error:', error);
            if (error.message !== 'User did not share') {
                alert('Failed to share. Please try again.');
            }
        } finally {
            setSharing(false);
        }
    };

    const handleCardPress = () => {
        router.push(`/news-detail?id=${id}` as any);
    };

    const handleCommentsPress = (e: any) => {
        if (!isVerified) { onVerify(); return; }
        e.stopPropagation();
        setShowComments(true);
    };

    const getGradientColors = (): [string, string] => {
        if (featured) return [SP_RED, '#b91c1c'];
        switch (category) {
            case 'Tech Force': return ['#3B82F6', '#2563eb'];
            case 'Campaign': return [SP_GREEN, '#15803d'];
            case 'Policy': return ['#F59E0B', '#d97706'];
            default: return ['#8B5CF6', '#7c3aed'];
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[styles.newsCard, featured && styles.featuredCard]}
                activeOpacity={0.95}
                onPress={handleCardPress}
            >
                {/* Featured Badge */}
                {featured && (
                    <View style={styles.featuredBadge}>
                        <MaterialCommunityIcons name="star" size={14} color="#fff" />
                        <Text style={styles.featuredText}>
                            <TranslatedText>FEATURED</TranslatedText>
                        </Text>
                    </View>
                )}

                {/* Enhanced Image Banner with Gradient Overlay */}
                <View style={styles.imageContainer}>
                    {image ? (
                        <Image
                            source={{ uri: image }}
                            style={styles.newsBanner}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={getGradientColors() as any}
                            style={styles.newsBanner}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons
                                name="newspaper"
                                size={100}
                                color="#fff"
                                style={{ opacity: 0.4 }}
                            />
                        </LinearGradient>
                    )}

                    {/* Gradient Overlay for better text readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageOverlay}
                    >
                        <View style={styles.categoryBadgeOnImage}>
                            <View style={[styles.categoryDot, { backgroundColor: '#fff' }]} />
                            <Text style={styles.categoryTextOnImage}>
                                <TranslatedText>{category}</TranslatedText>
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                        <TranslatedText>{title}</TranslatedText>
                    </Text>
                    <Text style={styles.newsDescription} numberOfLines={3}>
                        <TranslatedText>{description}</TranslatedText>
                    </Text>

                    {/* Interaction Bar */}
                    <View style={styles.interactionBar}>
                        <TouchableOpacity
                            style={styles.interactionButton}
                            onPress={handleLike}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                                <MaterialCommunityIcons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={20}
                                    color={liked ? SP_RED : '#64748b'}
                                />
                            </Animated.View>
                            <Text style={[styles.interactionText, liked && { color: SP_RED, fontWeight: '700' }]}>
                                {likes}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.interactionButton}
                            activeOpacity={0.7}
                            onPress={handleCommentsPress}
                        >
                            <MaterialCommunityIcons
                                name="comment-outline"
                                size={20}
                                color="#64748b"
                            />
                            <Text style={styles.interactionText}>{localComments.length}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.interactionButton}
                            onPress={handleShare}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="share-variant"
                                size={20}
                                color="#64748b"
                            />
                        </TouchableOpacity>

                        <View style={styles.interactionButton}>
                            <MaterialCommunityIcons
                                name="eye-outline"
                                size={20}
                                color="#64748b"
                            />
                            <Text style={styles.interactionText}>{views}</Text>
                        </View>

                        <View style={styles.timeContainer}>
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={14}
                                color="#94a3b8"
                            />
                            <Text style={styles.timeText}>
                                <TranslatedText>{time}</TranslatedText>
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Comments Modal */}
            <Modal
                visible={showComments}
                transparent
                animationType="none"
                onRequestClose={() => setShowComments(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowComments(false)}
                >
                    <Animated.View
                        style={[
                            styles.commentsModal,
                            { transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={styles.modalHandle} />

                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Comments ({localComments.length})</Text>
                                    <TouchableOpacity onPress={() => setShowComments(false)}>
                                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.commentsScroll}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={true}
                                    nestedScrollEnabled={true}
                                    bounces={true}
                                >
                                    {localComments.length === 0 ? (
                                        <View style={{ padding: 20, alignItems: 'center' }}>
                                            <Text style={{ color: '#94a3b8' }}>No comments yet. Be the first!</Text>
                                        </View>
                                    ) : (
                                        localComments.map((comment: any, idx: number) => (
                                            <View key={idx} style={styles.commentItem}>
                                                <View style={styles.commentAvatar}>
                                                    <MaterialCommunityIcons name="account-circle" size={40} color={SP_RED} />
                                                </View>
                                                <View style={styles.commentContent}>
                                                    <Text style={styles.commentAuthor}>{comment.name}</Text>
                                                    <Text style={styles.commentText}>{comment.text}</Text>
                                                    <Text style={styles.commentTime}>{new Date(comment.date).toLocaleDateString()}</Text>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </ScrollView>

                                <View style={styles.commentInputContainer}>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder="Write a comment..."
                                        placeholderTextColor="#94a3b8"
                                        value={commentText}
                                        onChangeText={setCommentText}
                                        multiline
                                        maxLength={500}
                                    />
                                    <TouchableOpacity
                                        style={[styles.sendButton, !commentText.trim() && { opacity: 0.5 }]}
                                        onPress={handleAddComment}
                                        disabled={!commentText.trim() || submittingComment}
                                    >
                                        {submittingComment ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <MaterialCommunityIcons name="send" size={20} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </TouchableOpacity>
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
                    <View style={[styles.commentsModal, { maxHeight: undefined, padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
                        <View style={styles.modalHandle} />
                        <Text style={[styles.modalTitle, { marginBottom: 20 }]}>Share News</Text>

                        <View style={{ gap: 16 }}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, backgroundColor: '#f0fdf4', borderRadius: 16, borderWidth: 1, borderColor: '#dcfce7' }}
                                onPress={shareToWhatsApp}
                            >
                                <MaterialCommunityIcons name="whatsapp" size={32} color="#25D366" />
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#14532d' }}>WhatsApp</Text>
                                    <Text style={{ fontSize: 13, color: '#166534' }}>Share with link preview</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#166534" style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' }}
                                onPress={shareViaSystem}
                            >
                                {sharing ? <ActivityIndicator color="#3b82f6" /> : <MaterialCommunityIcons name="share-variant" size={32} color="#3b82f6" />}
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>More Options</Text>
                                    <Text style={{ fontSize: 13, color: '#64748b' }}>Share image & link</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </Animated.View >
    );
};

// Trending Carousel Component
const TrendingCarousel = ({ trendingNews }: any) => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentIndex < trendingNews.length - 1) {
                setCurrentIndex(currentIndex + 1);
                flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            } else {
                setCurrentIndex(0);
                flatListRef.current?.scrollToIndex({ index: 0, animated: true });
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [currentIndex, trendingNews.length]);

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / (width - 48));
        setCurrentIndex(index);
    };

    const renderTrendingItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.trendingCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/news-detail?id=${item.id}` as any)}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.trendingImage}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.trendingOverlay}
            >
                <View style={styles.trendingBadge}>
                    <Text style={styles.trendingBadgeText}>
                        <TranslatedText>{item.category}</TranslatedText>
                    </Text>
                </View>
                <View style={styles.trendingContent}>
                    <Text style={styles.trendingSource}>
                        <TranslatedText>{item.source}</TranslatedText>
                    </Text>
                    <Text style={styles.trendingTitle} numberOfLines={2}>
                        <TranslatedText>{item.title}</TranslatedText>
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.trendingSection}>
            <View style={styles.trendingSectionHeader}>
                <Text style={styles.trendingSectionTitle}>
                    <TranslatedText>Breaking News</TranslatedText>
                </Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>
                        <TranslatedText>View all</TranslatedText>
                    </Text>
                </TouchableOpacity>
            </View>
            <FlatList
                ref={flatListRef}
                data={trendingNews}
                renderItem={renderTrendingItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id.toString()}
                snapToInterval={width - 48}
                decelerationRate="fast"
            />
            <View style={styles.paginationDots}>
                {trendingNews.map((_: any, index: number) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentIndex && styles.activeDot
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

// Desktop Header Component
const DesktopHeader = () => {
    const scrollAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scrollAnim, {
                    toValue: 1,
                    duration: 20000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(scrollAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateX = scrollAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [width, -width * 2],
    });

    return (
        <LinearGradient
            colors={[SP_RED, '#b91c1c', SP_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.desktopHeader}
        >
            <View style={styles.headerContent}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <MaterialCommunityIcons name="bicycle" size={32} color="#fff" />
                    </View>
                    <View style={styles.logoText}>
                        <Text style={styles.partyNameHindi}>
                            <TranslatedText>समाजवादी पार्टी</TranslatedText>
                        </Text>
                        <Text style={styles.partyNameEnglish}>
                            <TranslatedText>Samajwadi Party</TranslatedText>
                        </Text>
                    </View>
                </View>

                {/* Scrolling News Ticker */}
                <View style={styles.tickerContainer}>
                    <View style={styles.tickerLabel}>
                        <MaterialCommunityIcons name="bullhorn" size={16} color={SP_RED} />
                        <Text style={styles.tickerLabelText}>
                            <TranslatedText>LATEST</TranslatedText>
                        </Text>
                    </View>
                    <View style={styles.tickerScroll}>
                        <Animated.View style={[styles.tickerContent, { transform: [{ translateX }] }]}>
                            <Text style={styles.tickerText}>
                                <TranslatedText>देश में बदलाव की लहर • Tech Force में शामिल हों • नई योजनाओं की घोषणा • Join the Digital Revolution • समाजवाद का संदेश • साइकिल चलाओ देश बचाओ •</TranslatedText>
                            </Text>
                        </Animated.View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <MaterialCommunityIcons name="bell" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <MaterialCommunityIcons name="account" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

export default function NewsScreen() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const isDesktop = width >= 768;
    const [newsData, setNewsData] = useState<any[]>([]);
    const [trendingNews, setTrendingNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        checkUser();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
        fetchNews();
    }, []);

    const checkUser = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                setCurrentUserId(userInfo._id || userInfo.id);
                setIsVerified(userInfo.verificationStatus === 'Verified');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user ID if not set yet (race condition)
            let userId = currentUserId;
            if (!userId) {
                const userInfoStr = await AsyncStorage.getItem('userInfo');
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr);
                    userId = userInfo._id || userInfo.id;
                }
            }

            const response = await newsAPI.getAllNews();

            if (response.success && response.data) {
                // Filter only 'News' type items
                const newsItems = response.data.filter((item: any) => !item.type || item.type === 'News');

                const transformedNews = newsItems.map((item: any) => ({
                    id: item._id,
                    title: item.title,
                    description: item.excerpt,
                    category: item.type || 'News',
                    time: getTimeAgo(item.createdAt),
                    image: item.coverImage && item.coverImage !== 'no-photo.jpg'
                        ? item.coverImage
                        : 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
                    likes: item.likes ? item.likes.length : 0,
                    isLiked: userId && item.likes ? item.likes.includes(userId) : false,
                    comments: item.comments ? item.comments.length : 0,
                    commentsData: item.comments || [],
                    views: item.views || 0,
                    featured: item.status === 'Published', // Assuming 'Published' status means visible
                    source: 'Samajwadi Party'
                }));

                setNewsData(transformedNews);

                // For trending, take the first 5 items or filter by some criteria
                setTrendingNews(transformedNews.slice(0, 5));
            }
        } catch (err) {
            console.error('Error fetching news:', err);
            setError('Failed to load news. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (isDesktop) {
        return <DesktopNews />;
    }

    return (
        <View style={styles.container}>
            {/* Desktop Header - Only shown on desktop */}
            {isDesktop && <DesktopHeader />}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Mobile Header */}
                    {!isDesktop && (
                        <LinearGradient
                            colors={[SP_RED, '#b91c1c']}
                            style={styles.mobileHeader}
                        >
                            <View style={styles.mobileHeaderContent}>
                                <View>
                                    <Text style={styles.mobileTitle}>
                                        <TranslatedText>समाचार</TranslatedText>
                                    </Text>
                                    <Text style={styles.mobileSubtitle}>
                                        <TranslatedText>Latest Updates</TranslatedText>
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.notificationButton}>
                                    <MaterialCommunityIcons name="bell" size={24} color="#fff" />
                                    <View style={styles.notificationDot} />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    )}

                    {/* Content Section */}
                    <View style={[styles.contentContainer, isDesktop && styles.desktopContent]}>
                        {loading ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={SP_RED} />
                                <Text style={{ marginTop: 10, color: '#64748b' }}>Loading news...</Text>
                            </View>
                        ) : error ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={SP_RED} />
                                <Text style={{ marginTop: 10, color: '#64748b', textAlign: 'center' }}>{error}</Text>
                                <TouchableOpacity
                                    onPress={fetchNews}
                                    style={{ marginTop: 20, padding: 10, backgroundColor: SP_RED, borderRadius: 8 }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {/* Trending Carousel */}
                                {trendingNews.length > 0 && <TrendingCarousel trendingNews={trendingNews} />}

                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>
                                        <TranslatedText>आज की खबरें</TranslatedText>
                                    </Text>
                                </View>

                                {newsData.length > 0 ? (
                                    newsData.map((news, index) => (
                                        <NewsCard key={news.id || index} {...news} isVerified={isVerified} onVerify={() => setShowVerifyModal(true)} />
                                    ))
                                ) : (
                                    <View style={{ padding: 40, alignItems: 'center' }}>
                                        <Text style={{ color: '#64748b' }}>No news available</Text>
                                    </View>
                                )}
                            </>
                        )}

                        {/* Categories Section */}
                        <View style={styles.categoriesSection}>
                            <Text style={styles.sectionTitle}>
                                <TranslatedText>श्रेणियाँ</TranslatedText>
                            </Text>
                            <View style={styles.categoriesGrid}>
                                {['Tech Force', 'Campaign', 'Policy', 'Youth', 'Events', 'Media'].map((cat, idx) => (
                                    <TouchableOpacity key={idx} style={styles.categoryChip}>
                                        <Text style={styles.categoryChipText}>
                                            <TranslatedText>{cat}</TranslatedText>
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
            {/* Verification Modal */}
            <Modal
                visible={showVerifyModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowVerifyModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowVerifyModal(false)}
                >
                    <View style={[styles.commentsModal, { height: 'auto', maxHeight: undefined }]}>
                        <View style={[styles.modalHeader, { borderBottomWidth: 0, paddingBottom: 0, paddingTop: 24, justifyContent: 'center' }]}>
                            <MaterialCommunityIcons name="shield-alert" size={48} color={SP_RED} />
                        </View>
                        <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 8 }]}>Verification Required</Text>
                        <Text style={{ textAlign: 'center', color: '#64748b', marginBottom: 24, paddingHorizontal: 24 }}>
                            You must be a verified member to perform this action.
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 24 }}>
                            <TouchableOpacity
                                onPress={() => setShowVerifyModal(false)}
                                style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' }}
                            >
                                <Text style={{ color: '#64748b', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowVerifyModal(false);
                                    router.push('/(tabs)/profile');
                                }}
                                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: SP_RED, alignItems: 'center' }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go to Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    // Desktop Header Styles
    desktopHeader: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        gap: 2,
    },
    partyNameHindi: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    partyNameEnglish: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tickerContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        height: 40,
    },
    tickerLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        backgroundColor: '#fef2f2',
    },
    tickerLabelText: {
        fontSize: 11,
        fontWeight: '800',
        color: SP_RED,
        letterSpacing: 1,
    },
    tickerScroll: {
        flex: 1,
        overflow: 'hidden',
    },
    tickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tickerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Mobile Header Styles
    mobileHeader: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    mobileHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mobileTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    mobileSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    notificationButton: {
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: SP_RED,
    },
    // Content Styles
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    contentContainer: {
        padding: 24,
    },
    desktopContent: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: SP_RED,
    },
    // News Card Styles
    newsCard: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    featuredCard: {
        shadowColor: SP_RED,
        shadowOpacity: 0.3,
        elevation: 8,
    },
    featuredBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: SP_RED,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    featuredText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    newsBanner: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        position: 'relative',
        overflow: 'hidden',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        justifyContent: 'flex-end',
        padding: 16,
    },
    categoryBadgeOnImage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    categoryTextOnImage: {
        fontSize: 11,
        fontWeight: '800',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardContent: {
        padding: 20,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    categoryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    newsTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 28,
    },
    newsDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 22,
        marginBottom: 16,
    },
    interactionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    interactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    interactionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 'auto',
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    // Categories Styles
    categoriesSection: {
        marginTop: 32,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    categoryChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    commentsModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '60%',
        minHeight: 300,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#cbd5e1',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    commentsScroll: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    commentAvatar: {
        width: 40,
        height: 40,
    },
    commentContent: {
        flex: 1,
    },
    commentAuthor: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 6,
    },
    commentTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    // Comment Input Styles
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 16 : 24,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4,
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 14,
        color: '#334155',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: SP_RED,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    // Trending Carousel Styles
    trendingSection: {
        marginBottom: 24,
    },
    trendingSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    trendingSectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    trendingCard: {
        width: width - 48,
        height: 220,
        marginRight: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    trendingImage: {
        width: '100%',
        height: '100%',
    },
    trendingOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        padding: 16,
        justifyContent: 'space-between',
    },
    trendingBadge: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    trendingBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    trendingContent: {
        gap: 4,
    },
    trendingSource: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
    trendingTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        lineHeight: 24,
    },
    paginationDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#cbd5e1',
    },
    activeDot: {
        width: 24,
        backgroundColor: SP_RED,
    },
});
