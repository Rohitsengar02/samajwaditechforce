import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    Share,
    TextInput,
    Modal,
    Image,
    KeyboardAvoidingView,
    Platform,
    Linking,
    TouchableWithoutFeedback,
} from 'react-native';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import { newsAPI, News, Comment } from '@/services/newsAPI';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CommentItem = ({ author, comment, time, likes }: any) => {
    const [liked, setLiked] = useState(false);

    return (
        <View style={styles.commentItem}>
            <View style={styles.commentHeader}>
                <View style={styles.commentAuthorContainer}>
                    <View style={styles.commentAvatar}>
                        <MaterialCommunityIcons name="account" size={20} color={SP_RED} />
                    </View>
                    <View>
                        <Text style={styles.commentAuthor}>{author}</Text>
                        <Text style={styles.commentTime}>{time}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setLiked(!liked)}>
                    <MaterialCommunityIcons
                        name={liked ? 'heart' : 'heart-outline'}
                        size={18}
                        color={liked ? SP_RED : '#94a3b8'}
                    />
                </TouchableOpacity>
            </View>
            <Text style={styles.commentText}>{comment}</Text>
        </View>
    );
};

const renderContent = (content: any[]) => {
    if (!content) return null;
    return content.map((item, index) => {
        switch (item.type) {
            case 'heading':
                return <Text key={index} style={styles.contentHeading}>{item.content}</Text>;
            case 'paragraph':
                return <Text key={index} style={styles.contentText}>{item.content}</Text>;
            case 'image':
                return (
                    <Image
                        key={index}
                        source={{ uri: item.content }}
                        style={styles.contentImage}
                        resizeMode="cover"
                    />
                );
            default:
                return null;
        }
    });
};

export default function NewsDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const newsId = params.id as string;

    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [saved, setSaved] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const likeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(1000)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserName, setCurrentUserName] = useState<string>('Guest User');

    useEffect(() => {
        checkUser();
        fetchNewsDetail(); // Fetch news once on mount to increment view count
    }, [newsId]); // Only re-fetch if newsId changes

    // Update liked status when both news and currentUserId are available
    useEffect(() => {
        if (news && currentUserId && news.likes && news.likes.includes(currentUserId)) {
            setLiked(true);
        }
    }, [news, currentUserId]);

    const checkUser = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                setCurrentUserId(userInfo._id || userInfo.id);
                setCurrentUserName(userInfo.name || 'User');
                setIsVerified(userInfo.verificationStatus === 'Verified');
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (showCommentsModal) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 9,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 1000,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showCommentsModal]);

    const checkVerification = () => {
        if (!isVerified) {
            setShowVerifyModal(true);
            return false;
        }
        return true;
    };

    const fetchNewsDetail = async () => {
        try {
            setLoading(true);
            const response = await newsAPI.getNewsById(newsId);
            if (response.success) {
                setNews(response.data);
                setLikesCount(response.data.likes ? response.data.likes.length : 0);
                // Like status will be set by the separate useEffect above
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load news details');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!checkVerification()) return;
        if (!news || !currentUserId) return;

        const isLiked = !liked;
        setLiked(isLiked);

        Animated.sequence([
            Animated.timing(likeAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
            Animated.spring(likeAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
        ]).start();

        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                const username = userInfo.username || userInfo.phone || userInfo.email;
                const response = await newsAPI.toggleLike(news._id, currentUserId, username);

                // Update likes count from backend
                setLikesCount(response.data.length);

                // Show points notification
                if (response.firstLike && response.points) {
                    alert(`🎉 +${response.points} points earned for liking!`);
                }
            }
        } catch (err) {
            setLiked(!isLiked);
            console.error('Error liking news:', err);
        }
    };

    const [showShareModal, setShowShareModal] = useState(false);
    const [sharing, setSharing] = useState(false);

    const handleShare = () => {
        if (!checkVerification()) return;
        setShowShareModal(true);
    };

    const getShareContent = () => {
        // Use news-detail?id= format to match Expo Router path for correct deep linking
        const shareUrl = `https://samajwaditechforce.com/news-detail?id=${news?._id}`;
        const message = `${news?.title}\n\nRead more at: ${shareUrl}`;
        return { message, shareUrl };
    };

    const shareToWhatsApp = async () => {
        if (!news) return;
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                const userId = userInfo._id || userInfo.id;
                const username = userInfo.username || userInfo.phone || userInfo.email;

                const response = await newsAPI.shareNews(news._id, userId, username);

                // Show points notification
                if (response.firstShare && response.points) {
                    alert(`📤 +${response.points} points earned for sharing!`);
                }
            }

            const { message } = getShareContent();
            // Include image link
            const whatsAppMessage = news.coverImage
                ? `${message}\n\n📸 ${news.coverImage}`
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
        if (!news) return;
        setSharing(true);
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                const userId = userInfo._id || userInfo.id;
                const username = userInfo.username || userInfo.phone || userInfo.email;

                const response = await newsAPI.shareNews(news._id, userId, username);

                // Show points notification
                if (response.firstShare && response.points) {
                    alert(`📤 +${response.points} points earned for sharing!`);
                }
            }

            const { message, shareUrl } = getShareContent();

            // Share with message and URL
            await Share.share({
                message: `${message}\n\n${news.coverImage ? '📸 ' + news.coverImage : ''}`,
                url: news.coverImage || shareUrl,
                title: news.title
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

    const handlePostComment = async () => {
        if (!checkVerification()) return;
        if (!commentText.trim() || !news || !currentUserId) return;

        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                const username = userInfo.username || userInfo.phone || userInfo.email;
                const response = await newsAPI.addComment(news._id, commentText, currentUserId, currentUserName, username);

                if (response.success) {
                    setNews(prev => prev ? { ...prev, comments: response.data } : null);
                    setCommentText('');

                    // Show points notification
                    if (response.firstComment && response.points) {
                        alert(`💬 +${response.points} points earned for commenting!`);
                    }
                }
            }
        } catch (err) {
            console.error('Error posting comment:', err);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={SP_RED} />
            </View>
        );
    }

    if (!news) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>News not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[SP_RED, '#b91c1c']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>News Detail</Text>
                    <TouchableOpacity onPress={() => setSaved(!saved)} style={styles.saveButton}>
                        <MaterialCommunityIcons
                            name={saved ? 'bookmark' : 'bookmark-outline'}
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Banner */}
                {news.coverImage && news.coverImage !== 'no-photo.jpg' ? (
                    <Image
                        source={{ uri: news.coverImage }}
                        style={styles.imageBanner}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={['#e2e8f0', '#cbd5e1']}
                        style={styles.imageBanner}
                    >
                        <MaterialCommunityIcons
                            name="newspaper"
                            size={100}
                            color={SP_RED}
                            style={{ opacity: 0.6 }}
                        />
                    </LinearGradient>
                )}

                <View style={styles.content}>
                    {/* Category & Time */}
                    <View style={styles.metaInfo}>
                        <View style={styles.categoryBadge}>
                            <View style={[styles.categoryDot, { backgroundColor: SP_GREEN }]} />
                            <Text style={styles.categoryText}>News</Text>
                        </View>
                        <View style={styles.timeContainer}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
                            <Text style={styles.timeText}>{new Date(news.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{news.title}</Text>

                    {/* Author */}
                    <View style={styles.authorInfo}>
                        <View style={styles.authorAvatar}>
                            <MaterialCommunityIcons name="account-circle" size={40} color={SP_RED} />
                        </View>
                        <View>
                            <Text style={styles.authorName}>Samajwadi Party</Text>
                            <Text style={styles.authorRole}>Official</Text>
                        </View>
                    </View>

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleLike}
                        >
                            <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                                <MaterialCommunityIcons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={liked ? SP_RED : '#64748b'}
                                />
                            </Animated.View>
                            <Text style={[styles.actionText, liked && { color: SP_RED }]}>{likesCount}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setShowCommentsModal(true)}
                        >
                            <MaterialCommunityIcons name="comment-outline" size={24} color="#64748b" />
                            <Text style={styles.actionText}>{news.comments ? news.comments.length : 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <MaterialCommunityIcons name="share-variant" size={24} color="#64748b" />
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="eye-outline" size={24} color="#64748b" />
                            <Text style={styles.actionText}>{news.views}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Full Content */}
                    <View style={styles.contentSection}>
                        {renderContent(news.content)}
                    </View>

                    {/* Comments Preview */}
                    <View style={styles.commentsSection}>
                        <View style={styles.commentsSectionHeader}>
                            <Text style={styles.commentsSectionTitle}>Comments ({news.comments ? news.comments.length : 0})</Text>
                            <TouchableOpacity onPress={() => setShowCommentsModal(true)}>
                                <Text style={{ color: SP_RED, fontWeight: '600' }}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Comment Input */}
                        <View style={styles.commentInputContainer}>
                            <View style={styles.commentInputAvatar}>
                                <MaterialCommunityIcons name="account-circle" size={36} color="#94a3b8" />
                            </View>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                placeholderTextColor="#94a3b8"
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.commentSendButton, !commentText.trim() && styles.commentSendButtonDisabled]}
                                onPress={handlePostComment}
                                disabled={!commentText.trim()}
                            >
                                <MaterialCommunityIcons
                                    name="send"
                                    size={20}
                                    color={commentText.trim() ? SP_RED : '#cbd5e1'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

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

            {/* Comments Modal */}
            <Modal
                visible={showCommentsModal}
                transparent
                animationType="none"
                onRequestClose={() => setShowCommentsModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCommentsModal(false)}
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
                            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
                                <View style={styles.modalHandle} />

                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>All Comments ({news.comments ? news.comments.length : 0})</Text>
                                    <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.commentsScroll}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {news.comments && news.comments.length > 0 ? (
                                        news.comments.map((comment, idx) => (
                                            <View key={comment._id || idx}>
                                                <CommentItem
                                                    author={comment.name}
                                                    comment={comment.text}
                                                    time={new Date(comment.date).toLocaleDateString()}
                                                    likes={0}
                                                />
                                                {idx < news.comments.length - 1 && (
                                                    <View style={styles.commentDivider} />
                                                )}
                                            </View>
                                        ))
                                    ) : (
                                        <View style={{ padding: 20, alignItems: 'center' }}>
                                            <Text style={{ color: '#94a3b8' }}>No comments yet. Be the first!</Text>
                                        </View>
                                    )}
                                </ScrollView>

                                <View style={styles.commentInputContainerModal}>
                                    <TextInput
                                        style={styles.commentInputModal}
                                        placeholder="Write a comment..."
                                        placeholderTextColor="#94a3b8"
                                        value={commentText}
                                        onChangeText={setCommentText}
                                        multiline
                                        maxLength={500}
                                    />
                                    <TouchableOpacity
                                        style={[styles.sendButtonModal, !commentText.trim() && { opacity: 0.5 }]}
                                        onPress={handlePostComment}
                                        disabled={!commentText.trim()}
                                    >
                                        <MaterialCommunityIcons name="send" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>

            {/* Verification Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showVerifyModal}
                onRequestClose={() => setShowVerifyModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowVerifyModal(false)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                        <TouchableWithoutFeedback>
                            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 }}>
                                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                    <MaterialCommunityIcons name="shield-alert" size={48} color={SP_RED} />
                                </View>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>
                                    Verification Required
                                </Text>
                                <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center', lineHeight: 20 }}>
                                    You must be a verified member to perform this action.
                                </Text>

                                <View style={{ gap: 12 }}>
                                    <Button
                                        mode="contained"
                                        buttonColor={SP_RED}
                                        onPress={() => {
                                            setShowVerifyModal(false);
                                            router.push('/(tabs)/profile');
                                        }}
                                        style={{ borderRadius: 8 }}
                                    >
                                        Go to Profile
                                    </Button>
                                    <Button
                                        mode="outlined"
                                        textColor="#64748b"
                                        onPress={() => setShowVerifyModal(false)}
                                        style={{ borderRadius: 8, borderColor: '#cbd5e1' }}
                                    >
                                        Cancel
                                    </Button>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    saveButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    imageBanner: {
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 20,
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1e293b',
        lineHeight: 36,
        marginBottom: 20,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    authorAvatar: {
        width: 40,
        height: 40,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    authorRole: {
        fontSize: 13,
        color: '#64748b',
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    contentSection: {
        marginBottom: 32,
    },
    contentText: {
        fontSize: 16,
        lineHeight: 28,
        color: '#475569',
    },
    commentsSection: {
        marginBottom: 32,
    },
    commentsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    commentsSectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    commentInputAvatar: {
        width: 36,
        height: 36,
    },
    commentInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        maxHeight: 100,
    },
    commentSendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentSendButtonDisabled: {
        opacity: 0.5,
    },
    commentsList: {
        gap: 16,
    },
    commentItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAuthorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    commentTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    commentText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
    },
    relatedSection: {
        marginTop: 20,
    },
    relatedTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    relatedItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    relatedImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    relatedInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    relatedItemTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    relatedTime: {
        fontSize: 12,
        color: '#94a3b8',
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
        maxHeight: '85%',
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
        maxHeight: 500,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    commentDivider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 16,
    },
    contentHeading: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 24,
        marginBottom: 12,
    },
    contentImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginVertical: 16,
    },
    // Comment Input Modal Styles
    commentInputContainerModal: {
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
    commentInputModal: {
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
    sendButtonModal: {
        backgroundColor: '#E30512',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E30512',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
});
