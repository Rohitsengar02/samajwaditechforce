import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, Pressable, ActivityIndicator, Modal, TextInput, Animated, TouchableOpacity } from 'react-native';
import { Text, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

export default function DesktopNews() {
    const router = useRouter();
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Interaction State
    const [likedArticles, setLikedArticles] = useState<{ [key: string]: boolean }>({});
    const [points, setPoints] = useState(0); // User points from backend
    const [showPointPopup, setShowPointPopup] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [articleCounts, setArticleCounts] = useState<{ [key: string]: { likes: number; comments: number; shares: number } }>({});

    // Track which articles user has been awarded points for
    const [awardedPoints, setAwardedPoints] = useState<{
        [articleId: string]: {
            liked?: boolean,
            commented?: boolean,
            shared?: boolean
        }
    }>({});

    // Comment Modal State
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [currentComments, setCurrentComments] = useState<any[]>([]);

    // Share Modal State
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [activeShareArticle, setActiveShareArticle] = useState<any>(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        loadUserInfo();
    }, []);

    useEffect(() => {
        if (userInfo) {
            fetchNews();
        }
    }, [userInfo]);

    // Update liked states and awarded points when news data changes
    useEffect(() => {
        if (news.length > 0 && userInfo?._id) {
            updateUserInteractionStates();
        }
    }, [news, userInfo]);

    const loadUserInfo = async () => {
        try {
            const stored = await AsyncStorage.getItem('userInfo');
            if (stored) {
                const parsed = JSON.parse(stored);
                setUserInfo(parsed);
                setPoints(parsed.points || 0);
                // Refresh points from backend
                fetchUserPoints(parsed._id);
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    };

    const fetchUserPoints = async (userId: string) => {
        try {
            const User = await fetch(`${getApiUrl()}/users/${userId}`);
            const userData = await User.json();
            if (userData) {
                setPoints(userData.points || 0);
            }
        } catch (error) {
            console.error('Error fetching user points:', error);
        }
    };

    const fetchNews = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/news`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                // Filter only 'News' type items
                const newsItems = data.data.filter((item: any) => !item.type || item.type === 'News');
                setNews(newsItems);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserInteractionStates = () => {
        if (!userInfo?._id || news.length === 0) return;

        const counts: any = {};
        const awarded: any = {};
        const liked: any = {};

        news.forEach((item: any) => {
            counts[item._id] = {
                likes: item.likes?.length || 0,
                comments: item.comments?.length || 0,
                shares: item.sharedBy?.length || 0
            };

            // Check if current user has interacted
            const userId = userInfo._id;
            const userIdStr = userId.toString();

            // Check if user has liked this article
            const hasLiked = item.likes?.some((likeId: any) =>
                likeId.toString() === userIdStr
            );

            if (hasLiked) {
                liked[item._id] = true;
            }

            awarded[item._id] = {
                liked: hasLiked,
                commented: item.commentedBy?.some((c: any) =>
                    c.user?.toString() === userIdStr
                ),
                shared: item.sharedBy?.some((s: any) =>
                    s.user?.toString() === userIdStr
                )
            };
        });

        setArticleCounts(counts);
        setAwardedPoints(awarded);
        setLikedArticles(liked);
    };



    const showPointsAnimation = (amount: number) => {
        setEarnedPoints(amount);
        setShowPointPopup(true);

        // Reset animations
        fadeAnim.setValue(0);
        slideAnim.setValue(50);

        // Run enter animation
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 5, useNativeDriver: true })
        ]).start();

        // Auto hide
        setTimeout(() => {
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
                .start(() => setShowPointPopup(false));
        }, 2500);
    };

    const handleLike = async (id: string, e: any) => {
        e.stopPropagation();

        if (!userInfo?._id) {
            alert('Please log in to like articles');
            return;
        }

        const isLiked = likedArticles[id];

        try {
            const response = await fetch(`${getApiUrl()}/news/${id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userInfo._id,
                    username: userInfo.name
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update UI
                setLikedArticles(prev => ({ ...prev, [id]: !isLiked }));

                // Update counts
                setArticleCounts(prev => ({
                    ...prev,
                    [id]: {
                        ...prev[id],
                        likes: data.data.length
                    }
                }));

                // If points were awarded, show animation
                if (data.points) {
                    showPointsAnimation(data.points);
                    setPoints(prev => prev + data.points);

                    // Update awarded tracking
                    setAwardedPoints(prev => ({
                        ...prev,
                        [id]: { ...prev[id], liked: !data.removed }
                    }));
                } else if (data.removed) {
                    // Points deducted on unlike
                    showPointsAnimation(-5);
                    setPoints(prev => prev - 5);
                }
            }
        } catch (error) {
            console.error('Error liking news:', error);
        }
    };

    const handleCommentPress = (id: string, e: any) => {
        e.stopPropagation();
        setActiveArticleId(id);

        // Find the article and load its comments
        const article = news.find(item => item._id === id);
        if (article && article.comments) {
            setCurrentComments(article.comments);
        } else {
            setCurrentComments([]);
        }

        setCommentModalVisible(true);
    };

    const submitComment = async () => {
        if (!commentText.trim()) return;

        if (!userInfo?._id) {
            alert('Please log in to comment');
            return;
        }

        const articleId = activeArticleId || '';

        try {
            const response = await fetch(`${getApiUrl()}/news/${articleId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: commentText,
                    userId: userInfo._id,
                    name: userInfo.name,
                    username: userInfo.name
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update counts
                setArticleCounts(prev => ({
                    ...prev,
                    [articleId]: {
                        ...prev[articleId],
                        comments: data.data.length
                    }
                }));

                // Update current comments display
                setCurrentComments(data.data);

                setCommentText('');

                // If points were awarded
                if (data.points) {
                    showPointsAnimation(data.points);
                    setPoints(prev => prev + data.points);
                    setAwardedPoints(prev => ({
                        ...prev,
                        [articleId]: { ...prev[articleId], commented: true }
                    }));
                } else {
                    alert('You can only earn points once per article for commenting!');
                }

                // Don't close modal - let user see their comment
                // setCommentModalVisible(false);
                // setActiveArticleId(null);
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleSharePress = (article: any, e: any) => {
        e.stopPropagation();
        setActiveShareArticle(article);
        setShareModalVisible(true);
    };

    const performShare = async (platform: string) => {
        if (!activeShareArticle) return;

        if (!userInfo?._id) {
            alert('Please log in to share articles');
            return;
        }

        const articleId = activeShareArticle._id;
        // Use the production backend route for rich previews with OG tags (Avoid localhost)
        const PRODUCTION_API_URL = 'https://api-samajwaditechforce.onrender.com';
        const articleUrl = `${PRODUCTION_API_URL}/share/news/${articleId}`;
        const title = activeShareArticle.title;
        const text = `${title} - Samajwadi Tech Force`;

        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + articleUrl)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(text)}`;
                break;
            case 'copy':
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(articleUrl);
                    alert(`Link copied!\n\n${articleUrl}\n\nThis link will show a rich preview with image when shared on social media.`);
                }
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }

        // Call share API
        try {
            const response = await fetch(`${getApiUrl()}/news/${articleId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userInfo._id,
                    username: userInfo.name
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update counts
                setArticleCounts(prev => ({
                    ...prev,
                    [articleId]: {
                        ...prev[articleId],
                        shares: (prev[articleId]?.shares || 0) + 1
                    }
                }));

                // If points were awarded
                if (data.points) {
                    showPointsAnimation(data.points);
                    setPoints(prev => prev + data.points);
                    setAwardedPoints(prev => ({
                        ...prev,
                        [articleId]: { ...prev[articleId], shared: true }
                    }));
                } else {
                    alert('You can only earn points once per article for sharing!');
                }
            }
        } catch (error) {
            console.error('Error sharing news:', error);
        }

        setShareModalVisible(false);
    };

    const categories = ['all', 'politics', 'development', 'announcements', 'government'];

    const filteredNews = selectedCategory === 'all'
        ? news
        : news.filter(item => item.category?.toLowerCase() === selectedCategory);

    // Reusable Action Bar Component
    const ActionBar = ({ itemId, item }: { itemId: string, item: any }) => {
        const counts = articleCounts[itemId] || { likes: 0, comments: 0, shares: 0 };

        return (
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={(e) => handleLike(itemId, e)}>
                    <MaterialCommunityIcons
                        name={likedArticles[itemId] ? "heart" : "heart-outline"}
                        size={20}
                        color={likedArticles[itemId] ? SP_RED : "#64748b"}
                    />
                    <Text style={[styles.actionText, likedArticles[itemId] && { color: SP_RED }]}>
                        {counts.likes > 0 ? counts.likes : ''} {likedArticles[itemId] ? 'Liked' : 'Like'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={(e) => handleCommentPress(itemId, e)}>
                    <MaterialCommunityIcons name="comment-outline" size={20} color="#64748b" />
                    <Text style={styles.actionText}>
                        {counts.comments > 0 ? counts.comments : ''} Comment
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={(e) => handleSharePress(item, e)}>
                    <MaterialCommunityIcons name="share-variant-outline" size={20} color="#64748b" />
                    <Text style={styles.actionText}>
                        {counts.shares > 0 ? counts.shares : ''} Share
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <DesktopHeader />

            {/* Points Badge Fixed on Screen */}
            <View style={styles.fixedPointsBadge}>
                <View style={styles.pointsIconBg}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFB800" />
                </View>
                <Text style={styles.pointsValue}>{points} Pts</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Top 3 Featured News in a Row */}
                {!loading && news.length > 0 && (
                    <View style={styles.topFeaturedSection}>
                        <View style={styles.topFeaturedRow}>
                            {news.slice(0, 3).map((item, index) => (
                                <Pressable
                                    key={item._id || index}
                                    style={styles.topFeaturedCard}
                                    onPress={() => router.push(`/news/${item._id}` as any)}
                                >
                                    <Image
                                        source={{ uri: item.coverImage || 'https://via.placeholder.com/400x300' }}
                                        style={styles.topFeaturedImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.topFeaturedContent}>
                                        <View style={styles.topFeaturedMeta}>
                                            <View style={styles.categoryBadge}>
                                                <Text style={styles.categoryText}>{item.category || 'NEWS'}</Text>
                                            </View>
                                            <View style={styles.dateBadge}>
                                                <MaterialCommunityIcons name="clock-outline" size={12} color="#64748b" />
                                                <Text style={styles.dateTextSmall}>
                                                    {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.topFeaturedTitle} numberOfLines={2}>{item.title}</Text>
                                        <Text style={styles.topFeaturedDescription} numberOfLines={2}>
                                            {item.description || 'Read more about this important update...'}
                                        </Text>

                                        {/* Action Bar */}
                                        <View style={styles.cardDivider} />
                                        <ActionBar itemId={item._id || index.toString()} item={item} />

                                        <View style={styles.topFeaturedFooter}>
                                            <View style={styles.authorInfoSmall}>
                                                <View style={styles.avatarSmall}>
                                                    <MaterialCommunityIcons name="account" size={14} color={SP_RED} />
                                                </View>
                                                <Text style={styles.authorNameSmall}>Akhilesh Y.</Text>
                                            </View>
                                            <View style={styles.readTime}>
                                                <MaterialCommunityIcons name="book-open-outline" size={12} color="#64748b" />
                                                <Text style={styles.readTimeText}>3 min</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Category Filter */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Recently Added</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        {categories.map((cat) => (
                            <Pressable
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === cat && styles.categoryChipActive
                                ]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    selectedCategory === cat && styles.categoryChipTextActive
                                ]}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* News Grid */}
                {loading ? (
                    <ActivityIndicator size="large" color={SP_RED} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.newsGrid}>
                        {filteredNews.slice(3).map((item, index) => (
                            <Pressable
                                key={item._id || index}
                                style={styles.newsCard}
                                onPress={() => router.push(`/news/${item._id}` as any)}
                            >
                                <Image
                                    source={{ uri: item.coverImage || 'https://via.placeholder.com/350x230' }}
                                    style={styles.newsImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.newsContent}>
                                    <View style={styles.newsMeta}>
                                        <View style={styles.categoryBadgeSmall}>
                                            <Text style={styles.categoryTextSmall}>
                                                {item.category || 'BUSINESS'}
                                            </Text>
                                        </View>
                                        <Text style={styles.newsDate}>
                                            {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </Text>
                                    </View>
                                    <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                                    <Text style={styles.newsExcerpt} numberOfLines={3}>
                                        {item.description || 'Click to read the full article and stay updated with latest developments...'}
                                    </Text>

                                    {/* Action Bar */}
                                    <View style={styles.cardDivider} />
                                    <ActionBar itemId={item._id || index.toString()} item={item} />

                                    <View style={styles.newsFooter}>
                                        <View style={styles.authorInfoSmall}>
                                            <View style={styles.avatarSmall}>
                                                <MaterialCommunityIcons name="account" size={16} color={SP_RED} />
                                            </View>
                                            <Text style={styles.authorNameSmall}>Akhilesh Y.</Text>
                                        </View>
                                        <View style={styles.readTime}>
                                            <MaterialCommunityIcons name="book-open-outline" size={14} color="#64748b" />
                                            <Text style={styles.readTimeText}>3 min</Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Load More Button */}
                {!loading && filteredNews.length > 9 && (
                    <View style={styles.loadMoreContainer}>
                        <Pressable style={styles.loadMoreBtn}>
                            <Text style={styles.loadMoreText}>Load More Articles</Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color={SP_RED} />
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            {/* Comment Modal */}
            <Modal
                transparent={true}
                visible={commentModalVisible}
                animationType="fade"
                onRequestClose={() => setCommentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.commentModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Comments ({currentComments.length})</Text>
                            <TouchableOpacity onPress={() => {
                                setCommentModalVisible(false);
                                setActiveArticleId(null);
                                setCommentText('');
                            }}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Comments List - Scrollable */}
                        <ScrollView
                            style={styles.commentsList}
                            showsVerticalScrollIndicator={true}
                        >
                            {currentComments.length > 0 ? (
                                currentComments.map((comment, index) => (
                                    <View key={index} style={styles.commentItem}>
                                        <View style={styles.commentHeader}>
                                            <View style={styles.commentAvatar}>
                                                <MaterialCommunityIcons name="account-circle" size={32} color="#94a3b8" />
                                            </View>
                                            <View style={styles.commentMeta}>
                                                <Text style={styles.commentAuthor}>{comment.name}</Text>
                                                <Text style={styles.commentDate}>
                                                    {new Date(comment.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.commentContent}>{comment.text}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.noComments}>
                                    <MaterialCommunityIcons name="comment-off-outline" size={48} color="#cbd5e1" />
                                    <Text style={styles.noCommentsText}>No comments yet</Text>
                                    <Text style={styles.noCommentsSubtext}>Be the first to share your thoughts!</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Comment Input */}
                        <View style={styles.commentInputSection}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Write your comment..."
                                placeholderTextColor="#94a3b8"
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                numberOfLines={3}
                            />
                            <View style={styles.modalActions}>
                                <Text style={styles.pointsHint}>✨ Earn +10 Points</Text>
                                <Pressable style={styles.postBtn} onPress={submitComment}>
                                    <Text style={styles.postBtnText}>Post Comment</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Share Modal */}
            <Modal
                transparent={true}
                visible={shareModalVisible}
                animationType="fade"
                onRequestClose={() => setShareModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.shareModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Share Article</Text>
                            <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.shareSubtitle}>Choose a platform to share</Text>

                        <View style={styles.shareOptions}>
                            <TouchableOpacity style={styles.shareOption} onPress={() => performShare('whatsapp')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#25D366' }]}>
                                    <MaterialCommunityIcons name="whatsapp" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={() => performShare('facebook')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#1877F2' }]}>
                                    <MaterialCommunityIcons name="facebook" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Facebook</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={() => performShare('twitter')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#1DA1F2' }]}>
                                    <MaterialCommunityIcons name="twitter" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Twitter</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={() => alert('Instagram does not support direct web sharing. Please copy the link and share on Instagram app.')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#E1306C' }]}>
                                    <MaterialCommunityIcons name="instagram" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Instagram</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={() => performShare('copy')}>
                                <View style={[styles.shareIconBg, { backgroundColor: '#64748b' }]}>
                                    <MaterialCommunityIcons name="content-copy" size={28} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Copy Link</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
                            <Text style={styles.popupText}>You earned <Text style={styles.popupPoints}>+{earnedPoints} Points</Text></Text>
                        </View>
                    </View>
                </Animated.View>
            )}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    fixedPointsBadge: {
        position: 'absolute',
        top: 20,
        right: 60,
        zIndex: 200,
        backgroundColor: '#1e293b',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    pointsIconBg: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pointsValue: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 12,
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 4,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsHint: {
        color: SP_GREEN,
        fontWeight: '600',
        fontSize: 14,
    },
    postBtn: {
        backgroundColor: SP_RED,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    postBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    // Popup Styles
    pointPopup: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 1000,
    },
    popupContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    popupIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: SP_GREEN,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    popupText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    popupPoints: {
        color: SP_GREEN,
        fontWeight: '700',
    },
    // Share Modal Styles
    commentModalContent: {
        width: '90%',
        maxWidth: 700,
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    commentsList: {
        maxHeight: 400,
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    commentItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAvatar: {
        marginRight: 12,
    },
    commentMeta: {
        flex: 1,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    commentDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    commentContent: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginLeft: 44,
    },
    noComments: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    noCommentsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 12,
    },
    noCommentsSubtext: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    commentInputSection: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#f8fafc',
    },
    commentInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        minHeight: 80,
        maxHeight: 120,
        textAlignVertical: 'top',
        marginTop: 16,
    },
    shareModalContent: {
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
    shareOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    shareOption: {
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
    topFeaturedSection: {
        paddingHorizontal: 60,
        paddingTop: 40,
        paddingBottom: 20,
    },
    topFeaturedRow: {
        flexDirection: 'row',
        gap: 24,
    },
    topFeaturedCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    topFeaturedImage: {
        width: '100%',
        height: 250,
    },
    topFeaturedContent: {
        padding: 20,
    },
    topFeaturedMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dateTextSmall: {
        fontSize: 11,
        color: '#64748b',
    },
    topFeaturedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 10,
        lineHeight: 24,
    },
    topFeaturedDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    topFeaturedFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
    },
    heroSection: {
        padding: 60,
        gap: 24,
    },
    heroCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    heroImage: {
        width: '100%',
        height: 450,
    },
    heroContent: {
        padding: 32,
    },
    heroMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: SP_RED,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    categoryText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#64748b',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
        lineHeight: 44,
    },
    heroDescription: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
        marginBottom: 20,
    },
    heroFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    readMore: {
        fontSize: 14,
        fontWeight: '600',
        color: SP_RED,
    },
    secondaryFeatured: {
        flexDirection: 'row',
        gap: 24,
    },
    secondaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    secondaryImage: {
        width: '100%',
        height: 220,
    },
    secondaryContent: {
        padding: 20,
    },
    secondaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 12,
        marginBottom: 8,
        lineHeight: 24,
    },
    secondaryMeta: {
        fontSize: 13,
        color: '#64748b',
    },
    filterSection: {
        paddingHorizontal: 60,
        paddingVertical: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
    },
    categoriesScroll: {
        flexGrow: 0,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 8,
        backgroundColor: '#f1f5f9',
    },
    categoryChipActive: {
        backgroundColor: SP_RED,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    newsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 60,
        gap: 24,
    },
    newsCard: {
        width: '31%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    newsImage: {
        width: '100%',
        height: 200,
    },
    newsContent: {
        padding: 20,
    },
    newsMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryBadgeSmall: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    categoryTextSmall: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    newsDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 10,
        lineHeight: 24,
    },
    newsExcerpt: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    newsFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
    },
    authorInfoSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorNameSmall: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    readTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readTimeText: {
        fontSize: 12,
        color: '#64748b',
    },
    loadMoreContainer: {
        padding: 60,
        paddingTop: 20,
        alignItems: 'center',
    },
    loadMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: SP_RED,
    },
    loadMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: SP_RED,
    },
    // Header Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 60,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        zIndex: 100,
        position: 'relative',
    },
    headerLogo: {
        fontSize: 24,
        fontWeight: '900',
        color: SP_RED,
    },
    navMenu: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    navItem: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    langSwitch: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#f1f5f9',
    },
    loginBtn: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    signupBtn: {
        backgroundColor: SP_RED,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    signupBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Mega Menu Styles
    dropdownWrapper: {
        position: 'relative',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    megaMenu: {
        position: 'absolute',
        top: 40,
        left: -200,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        padding: 24,
        zIndex: 10000,
        minWidth: 600,
    },
    megaMenuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    megaMenuItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
    },
    megaMenuIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    megaMenuText: {
        flex: 1,
    },
    megaMenuTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    megaMenuSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
});
