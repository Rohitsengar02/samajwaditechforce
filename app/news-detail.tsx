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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Comment Component
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

export default function NewsDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(1245);
    const [saved, setSaved] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const likeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(1000)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

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

    // Mock news data (in real app, fetch based on params.id)
    const newsData = {
        title: 'समाजवादी टेक फोर्स का विस्तार पूरे देश में',
        description: 'डिजिटल युग में नई पहल के साथ युवाओं को जोड़ने की तैयारी।',
        fullContent: `समाजवादी पार्टी ने आज देशभर में टेक्नोलॉजी के माध्यम से जनता से जुड़ने का फैसला किया है। इस नई पहल के तहत युवाओं को प्राथमिकता दी जाएगी।\n\nपार्टी के राष्ट्रीय प्रवक्ता ने कहा कि डिजिटल इंडिया के इस युग में हमें भी तकनीक का सही उपयोग करना चाहिए। टेक फोर्स के माध्यम से हम युवाओं को सीधे पार्टी की नीतियों और कार्यक्रमों से जोड़ेंगे।\n\nइस कार्यक्रम में शामिल होने के लिए युवा ऑनलाइन रजिस्ट्रेशन कर सकते हैं। पार्टी ने इसके लिए एक विशेष पोर्टल भी लॉन्च किया है।\n\nटेक फोर्स के सदस्यों को विशेष प्रशिक्षण दिया जाएगा और उन्हें सोशल मीडिया पर पार्टी की आवाज़ को मजबूत करने में मदद करने का अवसर मिलेगा।`,
        category: 'Tech Force',
        time: '2 hours ago',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        author: 'SP News Desk',
        authorRole: 'Official Reporter',
    };

    const comments = [
        { id: 1, author: 'राज कुमार', comment: 'बहुत अच्छी पहल है। युवाओं को जोड़ना जरूरी है।', time: '1 hour ago', likes: 15 },
        { id: 2, author: 'Priya Sharma', comment: 'Great initiative for digital India!', time: '45 min ago', likes: 8 },
        { id: 3, author: 'अमित वर्मा', comment: 'कब से registration शुरू होगा?', time: '30 min ago', likes: 12 },
    ];

    const handleLike = () => {
        setLiked(!liked);
        setLikes(liked ? likes - 1 : likes + 1);

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
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${newsData.title}\n\n${newsData.description}`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handlePostComment = () => {
        if (commentText.trim()) {
            // Add comment logic here
            setCommentText('');
        }
    };

    const handleCommentsPress = () => {
        setShowCommentsModal(true);
    };

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
                {newsData.image ? (
                    <Image
                        source={{ uri: newsData.image }}
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
                            <Text style={styles.categoryText}>{newsData.category}</Text>
                        </View>
                        <View style={styles.timeContainer}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
                            <Text style={styles.timeText}>{newsData.time}</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{newsData.title}</Text>

                    {/* Author */}
                    <View style={styles.authorInfo}>
                        <View style={styles.authorAvatar}>
                            <MaterialCommunityIcons name="account-circle" size={40} color={SP_RED} />
                        </View>
                        <View>
                            <Text style={styles.authorName}>{newsData.author}</Text>
                            <Text style={styles.authorRole}>{newsData.authorRole}</Text>
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
                            <Text style={[styles.actionText, liked && { color: SP_RED }]}>{likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleCommentsPress}
                        >
                            <MaterialCommunityIcons name="comment-outline" size={24} color="#64748b" />
                            <Text style={styles.actionText}>{comments.length}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <MaterialCommunityIcons name="share-variant" size={24} color="#64748b" />
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="eye-outline" size={24} color="#64748b" />
                            <Text style={styles.actionText}>5.2K</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Full Content */}
                    <View style={styles.contentSection}>
                        <Text style={styles.contentText}>{newsData.fullContent}</Text>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                        <View style={styles.commentsSectionHeader}>
                            <Text style={styles.commentsSectionTitle}>Comments ({comments.length})</Text>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="sort" size={20} color="#64748b" />
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

                        {/* Comments List */}
                        <View style={styles.commentsList}>
                            {comments.map((comment) => (
                                <CommentItem key={comment.id} {...comment} />
                            ))}
                        </View>
                    </View>

                    {/* Related News */}
                    <View style={styles.relatedSection}>
                        <Text style={styles.relatedTitle}>Related News</Text>
                        <TouchableOpacity style={styles.relatedItem}>
                            <View style={styles.relatedImage}>
                                <MaterialCommunityIcons name="newspaper" size={40} color={SP_RED} style={{ opacity: 0.5 }} />
                            </View>
                            <View style={styles.relatedInfo}>
                                <Text style={styles.relatedItemTitle}>नई सदस्यता अभियान की शुरुआत</Text>
                                <Text style={styles.relatedTime}>5 hours ago</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

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
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.modalHandle} />

                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>All Comments ({comments.length})</Text>
                                <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.commentsScroll}>
                                {comments.map((comment, idx) => (
                                    <View key={comment.id}>
                                        <CommentItem {...comment} />
                                        {idx < comments.length - 1 && (
                                            <View style={styles.commentDivider} />
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        </TouchableOpacity>
                    </Animated.View>
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
        maxHeight: '80%',
        paddingBottom: 40,
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
});
