import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TextInput,
    Platform,
    Linking,
    Animated,
    Share as RNShare,
    Alert,
    TouchableWithoutFeedback,
    useWindowDimensions,
    KeyboardAvoidingView
} from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';
import { newsAPI } from '../../services/newsAPI';
import DesktopHeader from '../../components/DesktopHeader';
import { Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopNewsDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { width, height: windowHeight } = useWindowDimensions();
    const isMobile = width < 1024;

    // Data State
    const [news, setNews] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserName, setCurrentUserName] = useState<string>('Guest User');
    const [userInfo, setUserInfo] = useState<any>(null);

    // Action State
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);
    const [sharesCount, setSharesCount] = useState(0);
    const [commentText, setCommentText] = useState('');

    // Point System State
    const [points, setPoints] = useState(0);
    const [showPointPopup, setShowPointPopup] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [awardedPoints, setAwardedPoints] = useState({
        liked: false,
        commented: false,
        shared: false
    });

    // Modals
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // Animations
    const likeAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

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
    const themeBgLight = isProgram ? '#f0fdf4' : '#fef2f2';

    const checkUser = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                setUserInfo(userInfo);
                setCurrentUserId(userInfo._id || userInfo.id);
                setCurrentUserName(userInfo.name || 'User');
                setIsVerified(userInfo.verificationStatus === 'Verified');
                setPoints(userInfo.points || 0);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchNewsDetail = async () => {
        try {
            const response = await newsAPI.getNewsById(id as string);
            if (response.success && response.data) {
                const item = response.data;
                if (!item.type || item.type === 'News' || ['Program', 'program', 'Programs', 'programs'].includes(item.type)) {
                    setNews(item);
                    setLikesCount(item.likes ? item.likes.length : 0);
                    setCommentsCount(item.comments ? item.comments.length : 0);
                    setSharesCount((item as any).sharedBy ? (item as any).sharedBy.length : 0);

                    if (currentUserId) {
                        const userIdStr = currentUserId.toString();
                        setAwardedPoints({
                            liked: item.likes?.some((likeId: any) => likeId.toString() === userIdStr) || false,
                            commented: (item as any).commentedBy?.some((c: any) => c.user?.toString() === userIdStr) || false,
                            shared: (item as any).sharedBy?.some((s: any) => s.user?.toString() === userIdStr) || false
                        });
                    }
                } else {
                    setNews(null);
                }
            }
        } catch (error) {
            console.error('Error fetching news detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const showPointsAnimation = (amount: number) => {
        setEarnedPoints(amount);
        setShowPointPopup(true);
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 5, useNativeDriver: true })
        ]).start();
        setTimeout(() => {
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
                .start(() => setShowPointPopup(false));
        }, 2500);
    };

    const handleLike = async () => {
        if (!isVerified) { setShowVerifyModal(true); return; }
        if (!news || !currentUserId || !userInfo) return;
        const isLiked = liked;
        setLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        Animated.sequence([
            Animated.timing(likeAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
            Animated.spring(likeAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
        ]).start();
        try {
            const response = await fetch(`${getApiUrl()}/news/${news._id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, username: userInfo.name })
            });
            const data = await response.json();
            if (data.success) {
                setLikesCount(data.data.length);
                if (data.points) {
                    showPointsAnimation(data.points);
                    setPoints(prev => prev + data.points);
                    setAwardedPoints(prev => ({ ...prev, liked: !data.removed }));
                }
            }
        } catch (err) {
            setLiked(isLiked);
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleShare = () => {
        if (!isVerified) { setShowVerifyModal(true); return; }
        setShowShareModal(true);
    };

    const performShare = async (platform: string) => {
        if (!news || !currentUserId || !userInfo) return;
        const shareUrl = `${getApiUrl().replace('/api', '')}/share/news/${news._id}`;
        const title = news.title;
        const text = `${title} - Samajwadi Tech Force`;
        let shareUrlPlatform = '';
        switch (platform) {
            case 'whatsapp':
                shareUrlPlatform = `https://wa.me/?text=${encodeURIComponent(text + '\n' + shareUrl)}`;
                break;
            case 'facebook':
                shareUrlPlatform = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                shareUrlPlatform = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
                break;
            case 'copy':
                if (Platform.OS === 'web' && navigator.clipboard) {
                    await navigator.clipboard.writeText(shareUrl);
                    alert(`Link copied!\n\n${shareUrl}`);
                } else {
                    RNShare.share({ message: text + '\n' + shareUrl });
                }
                break;
        }
        if (shareUrlPlatform) {
            if (Platform.OS === 'web') { window.open(shareUrlPlatform, '_blank'); }
            else { await Linking.openURL(shareUrlPlatform); }
        }
        try {
            const response = await fetch(`${getApiUrl()}/news/${news._id}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, username: userInfo.name })
            });
            const data = await response.json();
            if (data.success && data.points) {
                showPointsAnimation(data.points);
                setPoints(prev => prev + data.points);
                setAwardedPoints(prev => ({ ...prev, shared: true }));
            }
        } catch (error) { console.error(error); }
        setShowShareModal(false);
    };

    const handlePostComment = async () => {
        if (!isVerified) { setShowVerifyModal(true); return; }
        if (!commentText.trim() || !news || !currentUserId || !userInfo) return;
        try {
            const response = await fetch(`${getApiUrl()}/news/${news._id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: commentText,
                    userId: currentUserId,
                    name: currentUserName,
                    username: userInfo.name
                })
            });
            const data = await response.json();
            if (data.success) {
                setNews((prev: any) => prev ? { ...prev, comments: data.data } : null);
                setCommentsCount(data.data.length);
                setCommentText('');
                if (data.points) {
                    showPointsAnimation(data.points);
                    setPoints(prev => prev + data.points);
                    setAwardedPoints(prev => ({ ...prev, commented: true }));
                }
            }
        } catch (err) { console.error(err); }
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
            {!isMobile && <DesktopHeader />}

            <ScrollView
                contentContainerStyle={isMobile ? styles.mobileScrollContent : styles.content}
                showsVerticalScrollIndicator={false}
            >
                {isMobile && (
                    <View style={styles.mobileTopHeader}>
                        <TouchableOpacity style={styles.mobileBackCircle} onPress={() => router.back()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                        </TouchableOpacity>
                        <View style={styles.mobilePointsCapsule}>
                            <MaterialCommunityIcons name="star" size={16} color="#fbbf24" style={styles.mobileStarIcon} />
                            <Text style={styles.mobilePointsText}>{points} Pts</Text>
                        </View>
                    </View>
                )}

                {isMobile ? (
                    <View style={styles.mobileHeroContainer}>
                        {news.coverImage && news.coverImage !== 'no-photo.jpg' ? (
                            <Image source={{ uri: news.coverImage }} style={styles.mobileHeroImage} />
                        ) : (
                            <LinearGradient colors={[themeColor, '#991b1b']} style={styles.mobileHeroImage}>
                                <MaterialCommunityIcons name="newspaper" size={80} color="rgba(255,255,255,0.3)" />
                            </LinearGradient>
                        )}
                    </View>
                ) : (
                    <Button
                        mode="text"
                        icon="arrow-left"
                        textColor={themeColor}
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        Back to {isProgram ? 'Programs' : 'News'}
                    </Button>
                )}

                <View style={[
                    styles.articleContainer,
                    isMobile && styles.mobileArticleContainer
                ]}>
                    <Text style={[styles.title, isMobile && styles.mobileTitle]}>{news.title}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="calendar" size={16} color="#64748b" />
                            <Text style={styles.metaText}>
                                {new Date(news.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="eye" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{news.views || 0} Views</Text>
                        </View>
                    </View>

                    {!isMobile && (
                        <Image
                            source={{ uri: news.coverImage || 'https://via.placeholder.com/800x400' }}
                            style={styles.coverImage}
                        />
                    )}

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                            <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                                <MaterialCommunityIcons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={isMobile ? 22 : 24}
                                    color={liked ? themeColor : '#64748b'}
                                />
                            </Animated.View>
                            <Text style={[styles.actionText, liked && { color: themeColor }]}>{likesCount} Likes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => {
                            if (!isVerified) { setShowVerifyModal(true); return; }
                            setShowCommentsModal(true);
                        }}>
                            <MaterialCommunityIcons name="comment-outline" size={isMobile ? 22 : 24} color="#64748b" />
                            <Text style={styles.actionText}>{commentsCount} Comments</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <MaterialCommunityIcons name="share-variant" size={isMobile ? 22 : 24} color="#64748b" />
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.articleContent}>
                        {news.content && news.content.map((block: any, index: number) => {
                            if (block.type === 'paragraph') {
                                return (
                                    <Text key={index} style={[styles.paragraph, isMobile && styles.mobileParagraph]}>
                                        {block.content}
                                    </Text>
                                );
                            } else if (block.type === 'image') {
                                return (
                                    <Image key={index} source={{ uri: block.content }} style={styles.blockImage} resizeMode="cover" />
                                );
                            } else if (block.type === 'heading') {
                                return (
                                    <Text key={index} style={styles.blockHeading}>
                                        {block.content}
                                    </Text>
                                );
                            }
                            return null;
                        })}
                        {(!news.content || news.content.length === 0) && (
                            <Text style={[styles.paragraph, isMobile && styles.mobileParagraph]}>
                                {news.excerpt || news.description}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {!isMobile && points > 0 && (
                <View style={styles.fixedPointsBadge}>
                    <MaterialCommunityIcons name="star" size={20} color="#fff" />
                    <Text style={styles.pointsBadgeText}>{points}</Text>
                </View>
            )}

            {isMobile && (
                <TouchableOpacity style={styles.mobileFloatingWhatsApp} onPress={() => performShare('whatsapp')}>
                    <MaterialCommunityIcons name="whatsapp" size={32} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Share Modal */}
            <Modal
                visible={showShareModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowShareModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.shareModalContentNew}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Share Article</Text>
                            <TouchableOpacity onPress={() => setShowShareModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.shareSubtitle}>Choose a platform to share</Text>

                        <View style={styles.shareOptionsNew}>
                            <TouchableOpacity style={styles.shareOptionNew} onPress={() => performShare('whatsapp')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#25D366' }]}>
                                    <MaterialCommunityIcons name="whatsapp" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOptionNew} onPress={() => performShare('facebook')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#1877F2' }]}>
                                    <MaterialCommunityIcons name="facebook" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Facebook</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOptionNew} onPress={() => performShare('twitter')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#1DA1F2' }]}>
                                    <MaterialCommunityIcons name="twitter" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Twitter</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOptionNew} onPress={() => alert('Instagram does not support direct web sharing. Please copy the link and share on Instagram app.')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#E1306C' }]}>
                                    <MaterialCommunityIcons name="instagram" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Instagram</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOptionNew} onPress={() => performShare('copy')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#64748b' }]}>
                                    <MaterialCommunityIcons name="content-copy" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Copy Link</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Comments Modal (Mobile: Bottom Sheet | Desktop: Centered Popup) */}
            <Modal
                visible={showCommentsModal}
                transparent
                animationType={isMobile ? "slide" : "fade"}
                onRequestClose={() => setShowCommentsModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCommentsModal(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={isMobile ? styles.mobileModalContainer : styles.modalOverlay}
                        pointerEvents="box-none"
                    >
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={[
                                styles.commentsModalContent,
                                isMobile && styles.mobileCommentsModalContent
                            ]}>
                                {isMobile && <View style={styles.modalGrabber} />}

                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text style={styles.modalTitle}>Comments</Text>
                                        <Text style={styles.modalSubtitle}>{commentsCount} total thoughts</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setShowCommentsModal(false)} style={styles.closeBtnCircle}>
                                        <MaterialCommunityIcons name="close" size={20} color="#64748b" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.commentsList}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {news?.comments && news.comments.map((comment: any, idx: number) => (
                                        <View key={comment._id || idx} style={styles.commentItem}>
                                            <View style={[styles.commentAvatar, { backgroundColor: themeBgLight }]}>
                                                <Text style={{ color: themeColor, fontWeight: 'bold' }}>{comment.name?.charAt(0) || 'U'}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.commentMeta}>
                                                    <Text style={styles.commentAuthor}>{comment.name}</Text>
                                                    <Text style={styles.commentDate}>
                                                        {new Date(comment.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Text>
                                                </View>
                                                <Text style={styles.commentText}>{comment.text}</Text>
                                            </View>
                                        </View>
                                    ))}
                                    {!news?.comments?.length && (
                                        <View style={{ alignItems: 'center', padding: 40 }}>
                                            <MaterialCommunityIcons name="comment-off-outline" size={48} color="#cbd5e1" />
                                            <Text style={{ textAlign: 'center', padding: 20, color: '#64748b', fontWeight: '600', fontSize: 16, marginTop: 12 }}>No comments yet</Text>
                                            <Text style={{ color: '#94a3b8', fontSize: 14 }}>Be the first to share your thoughts!</Text>
                                        </View>
                                    )}
                                </ScrollView>

                                <View style={[styles.commentInputBox, isMobile && styles.mobileCommentInputBox]}>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.inputfield}
                                            placeholder="Write a comment... (+10 Points)"
                                            placeholderTextColor="#94a3b8"
                                            value={commentText}
                                            onChangeText={setCommentText}
                                            multiline
                                        />
                                        <TouchableOpacity
                                            style={[styles.sendBtnMobile, !commentText.trim() && { opacity: 0.5 }]}
                                            onPress={handlePostComment}
                                            disabled={!commentText.trim()}
                                        >
                                            <MaterialCommunityIcons name="send" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>

            {/* Points Earned Popup Animation */}
            {showPointPopup && (
                <Animated.View style={[
                    styles.pointPopup,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    <View style={styles.popupContent}>
                        <View style={styles.popupIconBg}>
                            <MaterialCommunityIcons name="star-face" size={32} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.popupTitle}>Awesome!</Text>
                            <Text style={styles.popupText}>You earned <Text style={styles.popupPoints}>{earnedPoints > 0 ? '+' : ''}{earnedPoints} Points</Text></Text>
                        </View>
                    </View>
                </Animated.View>
            )}


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
                    <View style={styles.shareModalContent}>
                        <MaterialCommunityIcons name="shield-alert" size={48} color={SP_RED} style={{ marginBottom: 16 }} />
                        <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 8 }]}>Verification Required</Text>
                        <Text style={{ textAlign: 'center', color: '#64748b', marginBottom: 24 }}>
                            You must be a verified member to perform this action.
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Button mode="outlined" onPress={() => setShowVerifyModal(false)}>Cancel</Button>
                            <Button mode="contained" buttonColor={SP_RED} onPress={() => {
                                setShowVerifyModal(false);
                                router.push('/(tabs)/profile');
                            }}>
                                Go to Profile
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal >
        </View >
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
    mobileCommentsModalContent: {
        width: '100%',
        flex: 1,
        maxHeight: screenHeight * 0.85,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 10,
        paddingHorizontal: 0,
        backgroundColor: '#fff',
    },
    mobileModalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
    },
    modalGrabber: {
        width: 40,
        height: 5,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 24,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
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
    commentsList: {
        flex: 1,
        paddingHorizontal: 24,
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
        borderTopColor: '#f1f5f9',
        padding: 16,
        backgroundColor: '#fff',
    },
    mobileCommentInputBox: {
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sendBtnMobile: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: SP_RED,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    inputfield: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 15,
        color: '#1e293b',
        maxHeight: 100,
    },
    // Point Badge Styles
    fixedPointsBadge: {
        position: 'absolute',
        top: 100,
        right: 40,
        backgroundColor: SP_GREEN,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
    pointsBadgeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    // Share Modal New Styles
    shareModalContentNew: {
        width: '90%',
        maxWidth: 600,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    shareSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    shareOptionsNew: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    shareOptionNew: {
        alignItems: 'center',
        width: 100,
    },
    shareIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    shareOptionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1e293b',
        textAlign: 'center',
    },
    // Point Popup Styles
    pointPopup: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },
    popupContent: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 50,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    popupIconBg: {
        backgroundColor: SP_GREEN,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    popupText: {
        fontSize: 14,
        color: '#64748b',
    },
    popupPoints: {
        color: SP_GREEN,
        fontWeight: '700',
    },
    mobileScrollContent: {
        paddingTop: 50,
        paddingBottom: 60,
    },
    mobileHeroContainer: {
        width: '100%',
        height: 350,
        backgroundColor: '#f1f5f9',
    },
    mobileHeroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    mobileTopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f8fafc', // Matching container bg
    },
    mobileBackCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mobilePointsCapsule: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#1e293b', // Dark background like in image
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    mobileStarIcon: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 4,
        borderRadius: 12,
    },
    mobilePointsText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
    mobileArticleContainer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -30,
        padding: 24,
        paddingTop: 32,
        minHeight: 500,
    },
    mobileTitle: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '900',
        marginBottom: 16,
    },
    mobileParagraph: {
        fontSize: 16,
        lineHeight: 28,
        color: '#475569',
    },
    blockImage: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        marginVertical: 12,
    },
    blockHeading: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 20,
        marginBottom: 10,
    },
    mobileFloatingWhatsApp: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#25D366',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#25D366',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 999,
    },
});
