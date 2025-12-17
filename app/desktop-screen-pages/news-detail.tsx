import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Modal, TextInput, Platform, Linking, Animated, Share as RNShare, Alert } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';
import { newsAPI } from '../../services/newsAPI'; // Ensure this path is correct
import DesktopHeader from '../../components/DesktopHeader';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopNewsDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Data State
    const [news, setNews] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserName, setCurrentUserName] = useState<string>('Guest User');

    // Action State
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentText, setCommentText] = useState('');

    // Modals
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Animations
    const likeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        checkUser();
        if (id) {
            fetchNewsDetail();
        }
    }, [id]);

    // Check Like Status
    useEffect(() => {
        if (news && currentUserId && news.likes && news.likes.includes(currentUserId)) {
            setLiked(true);
        }
    }, [news, currentUserId]);

    // Theme Logic
    const isProgram = news && (news.type === 'Program' || news.type === 'program' || news.type === 'Programs' || news.type === 'programs');
    const themeColor = isProgram ? SP_GREEN : SP_RED;
    const themeBgLight = isProgram ? '#f0fdf4' : '#fef2f2'; // Green tint vs Red tint

    const checkUser = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                setCurrentUserId(userInfo._id || userInfo.id);
                setCurrentUserName(userInfo.name || 'User');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchNewsDetail = async () => {
        try {
            // Use newsAPI service ideally, or match existing fetch
            const response = await newsAPI.getNewsById(id as string);
            if (response.success && response.data) {
                // Ensure we only show 'News' type items
                const item = response.data;
                if (!item.type || item.type === 'News' || ['Program', 'program', 'Programs', 'programs'].includes(item.type)) {
                    setNews(item);
                    setLikesCount(item.likes ? item.likes.length : 0);
                } else {
                    // It is a Program or other type, treat as not found for this page
                    console.log('Item found but is not News:', item.type);
                    setNews(null);
                }
            } else {
                // Fallback if API fail
                console.error('Failed to fetch news via service');
            }
        } catch (error) {
            console.error('Error fetching news detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!news || !currentUserId) return;

        const isLiked = !liked;
        setLiked(isLiked);
        setLikesCount(prev => isLiked ? prev + 1 : prev - 1);

        Animated.sequence([
            Animated.timing(likeAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
            Animated.spring(likeAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
        ]).start();

        try {
            await newsAPI.toggleLike(news._id, currentUserId);
        } catch (err) {
            setLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
            console.error('Error liking news:', err);
        }
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const performShare = async (platform: string) => {
        if (!news) return;
        const shareUrl = `https://samajwaditechforce.com/news/${news._id}`; // Example URL
        const startMessage = `Check out this news: ${news.title}\n\n`;

        try {
            if (platform === 'whatsapp') {
                const url = `https://wa.me/?text=${encodeURIComponent(startMessage + shareUrl)}`;
                await Linking.openURL(url);
            } else if (platform === 'copy') {
                if (Platform.OS === 'web') {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('Link copied to clipboard!');
                } else {
                    RNShare.share({ message: startMessage + shareUrl });
                }
            }
            setShowShareModal(false);
        } catch (error) {
            console.error('Share Error:', error);
        }
    };

    const handlePostComment = async () => {
        if (!commentText.trim() || !news || !currentUserId) return;

        try {
            const response = await newsAPI.addComment(news._id, commentText, currentUserId, currentUserName);
            if (response.success) {
                setNews((prev: any) => prev ? { ...prev, comments: response.data } : null);
                setCommentText('');
            }
        } catch (err) {
            console.error('Error posting comment:', err);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={SP_RED} />
            </View>
        );
    }

    if (!news) {
        return (
            <View style={styles.errorContainer}>
                <Text>News not found</Text>
                <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView contentContainerStyle={styles.content}>
                <Button
                    mode="text"
                    icon="arrow-left"
                    textColor={themeColor}
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    Back to {isProgram ? 'Programs' : 'News'}
                </Button>

                <View style={styles.articleContainer}>
                    <Text style={styles.title}>{news.title}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="calendar" size={16} color="#64748b" />
                            <Text style={styles.metaText}>
                                {new Date(news.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="eye" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{news.views || 0} Views</Text>
                        </View>
                    </View>

                    <Image
                        source={{ uri: news.coverImage || 'https://via.placeholder.com/800x400' }}
                        style={styles.coverImage}
                    />

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                            <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                                <MaterialCommunityIcons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={liked ? themeColor : '#64748b'}
                                />
                            </Animated.View>
                            <Text style={[styles.actionText, liked && { color: themeColor }]}>{likesCount} Likes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => setShowCommentsModal(true)}>
                            <MaterialCommunityIcons name="comment-outline" size={24} color="#64748b" />
                            <Text style={styles.actionText}>{news.comments ? news.comments.length : 0} Comments</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <MaterialCommunityIcons name="share-variant" size={24} color="#64748b" />
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.articleContent}>
                        {news.content && news.content.map((block: any, index: number) => {
                            if (block.type === 'paragraph') {
                                return (
                                    <Text key={index} style={styles.paragraph}>
                                        {block.content}
                                    </Text>
                                );
                            }
                            return null;
                        })}
                        {(!news.content || news.content.length === 0) && (
                            <Text style={styles.paragraph}>{news.excerpt || news.description}</Text>
                        )}
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
                    <View style={styles.shareModalContent}>
                        <Text style={styles.modalTitle}>Share via</Text>
                        <View style={styles.shareOptions}>
                            <TouchableOpacity style={styles.shareOption} onPress={() => performShare('whatsapp')}>
                                <View style={[styles.shareIcon, { backgroundColor: '#25D366' }]}>
                                    <MaterialCommunityIcons name="whatsapp" size={32} color="#fff" />
                                </View>
                                <Text style={styles.shareText}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={() => performShare('copy')}>
                                <View style={[styles.shareIcon, { backgroundColor: '#3b82f6' }]}>
                                    <MaterialCommunityIcons name="link-variant" size={32} color="#fff" />
                                </View>
                                <Text style={styles.shareText}>Copy Link</Text>
                            </TouchableOpacity>
                        </View>
                        <Button mode="text" onPress={() => setShowShareModal(false)} style={{ marginTop: 20 }}>Close</Button>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Comments Modal (Desktop Style: Centered Popup) */}
            <Modal
                visible={showCommentsModal}
                transparent
                animationType="fade" // Use fade for desktop feeling
                onRequestClose={() => setShowCommentsModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCommentsModal(false)}
                >
                    <View style={styles.commentsModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Comments ({news?.comments?.length || 0})</Text>
                            <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.commentsList}>
                            {news?.comments && news.comments.map((comment: any, idx: number) => (
                                <View key={comment._id || idx} style={styles.commentItem}>
                                    <View style={[styles.commentAvatar, { backgroundColor: themeBgLight }]}>
                                        <Text style={{ color: themeColor, fontWeight: 'bold' }}>{comment.name?.charAt(0) || 'U'}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.commentMeta}>
                                            <Text style={styles.commentAuthor}>{comment.name}</Text>
                                            <Text style={styles.commentDate}>{new Date(comment.date).toLocaleDateString()}</Text>
                                        </View>
                                        <Text style={styles.commentText}>{comment.text}</Text>
                                    </View>
                                </View>
                            ))}
                            {!news?.comments?.length && <Text style={{ textAlign: 'center', padding: 20, color: '#888' }}>No comments yet.</Text>}
                        </ScrollView>

                        <View style={styles.commentInputBox}>
                            <TextInput
                                style={styles.inputfield}
                                placeholder="Write a comment..."
                                value={commentText}
                                onChangeText={setCommentText}
                            />
                            <TouchableOpacity onPress={handlePostComment} disabled={!commentText.trim()}>
                                <MaterialCommunityIcons name="send" size={24} color={commentText.trim() ? themeColor : '#ccc'} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    content: {
        maxWidth: 900,
        width: '100%',
        alignSelf: 'center',
        padding: 40,
        paddingBottom: 100,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    articleContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 16,
        lineHeight: 48,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 32,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    coverImage: {
        width: '100%',
        height: 400,
        borderRadius: 16,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    actionBar: {
        flexDirection: 'row',
        gap: 32,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 32,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    articleContent: {
        gap: 24,
    },
    paragraph: {
        fontSize: 18,
        color: '#334155',
        lineHeight: 32,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareModalContent: {
        backgroundColor: '#fff',
        width: 300,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#1e293b',
    },
    shareOptions: {
        flexDirection: 'row',
        gap: 32,
    },
    shareOption: {
        alignItems: 'center',
        gap: 8,
    },
    shareIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    commentsModalContent: {
        backgroundColor: '#fff',
        width: 500,
        maxHeight: '80%',
        borderRadius: 16,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10
    },
    commentsList: {
        marginBottom: 20,
    },
    commentItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
        paddingBottom: 16,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        fontWeight: '700',
        color: '#1e293b',
    },
    commentDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    commentText: {
        color: '#475569',
        fontSize: 14,
        lineHeight: 20,
    },
    commentInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 16,
    },
    inputfield: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
    }
});
