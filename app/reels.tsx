import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    Image,
    TouchableOpacity,
    Share,
    StatusBar,
    Platform,
    SafeAreaView,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../components/TranslatedText';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';

// Dummy Data
const REELS_DATA = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1662479696175-6ca3b10830a6?q=80&w=637&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        user: 'samajwadiparty_official',
        userAvatar: null, // Use icon if null
        description: 'Huge support for Samajwadi Party in the latest rally! 🚩🚴‍♂️ #SamajwadiParty #AkhileshYadav #UttarPradesh',
        likes: '45.2k',
        comments: '1.2k',
        shares: '5.5k',
        music: 'Samajwadi Anthem - Original Audio',
        isLiked: false
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1662479696175-6ca3b10830a6?q=80&w=637&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        user: 'akhilesh_yadav_fans',
        userAvatar: null,
        description: 'Cycle Yatra continuing across the state. Join the movement! 🚴‍♂️',
        likes: '28.9k',
        comments: '856',
        shares: '3.1k',
        music: 'Cycle Chalao - Campaign Song',
        isLiked: true
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1662479696175-6ca3b10830a6?q=80&w=637&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        user: 'sp_youth_wing',
        userAvatar: null,
        description: 'Youth power is with SP! ✊ #YouthForAkhilesh',
        likes: '15.6k',
        comments: '420',
        shares: '1.8k',
        music: 'Yuva Josh - Trending Audio',
        isLiked: false
    },
];

const DUMMY_COMMENTS = [
    { id: '1', user: 'rahul_yadav', text: 'Jai Samajwad! 🚩', time: '2m', likes: 12 },
    { id: '2', user: 'priya_singh', text: 'Great initiative by Akhilesh ji', time: '5m', likes: 8 },
    { id: '3', user: 'vikas_sp', text: 'Full support from Lucknow', time: '12m', likes: 25 },
    { id: '4', user: 'amit_k', text: 'Cycle chalti jayegi 🚴‍♂️', time: '30m', likes: 15 },
    { id: '5', user: 'neha_g', text: '2027 me badlav hoga', time: '1h', likes: 42 },
];

const ReelItem = ({ item, index, activeIndex, onOpenComments }: any) => {
    const [isLiked, setIsLiked] = useState(item.isLiked);
    const [likeCount, setLikeCount] = useState(item.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        // Simple string manipulation for demo purposes
        if (!isLiked) {
            // Increment logic would go here
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this reel from ${item.user}: ${item.description}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.reelContainer}>
            {/* Background Image/Video */}
            <Image
                source={{ uri: item.image }}
                style={styles.reelImage}
                resizeMode="cover"
            />

            {/* Overlay Gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                style={styles.gradientOverlay}
            />

            {/* Right Side Actions */}
            <View style={styles.rightActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <MaterialCommunityIcons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={32}
                        color={isLiked ? SP_RED : "#fff"}
                    />
                    <Text style={styles.actionText}>{likeCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => onOpenComments(item.id)}>
                    <MaterialCommunityIcons name="comment-outline" size={30} color="#fff" />
                    <Text style={styles.actionText}>{item.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Ionicons name="paper-plane-outline" size={30} color="#fff" />
                    <Text style={styles.actionText}>{item.shares}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <MaterialCommunityIcons name="dots-horizontal" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Bottom Content */}
            <View style={styles.bottomContent}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        {item.userAvatar ? (
                            <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.defaultAvatar]}>
                                <Text style={styles.avatarText}>{item.user.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.username}>{item.user}</Text>
                    <TouchableOpacity style={styles.followButton}>
                        <Text style={styles.followText}>
                            <TranslatedText>Follow</TranslatedText>
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.musicContainer}>
                    <MaterialCommunityIcons name="music-note" size={16} color="#fff" />
                    <Text style={styles.musicText}>{item.music}</Text>
                </View>
            </View>
        </View>
    );
};

export default function ReelsPage() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [commentText, setCommentText] = useState('');

    const handleOpenComments = (reelId: string) => {
        setCommentsVisible(true);
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

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
                <TouchableOpacity style={styles.cameraButton}>
                    <MaterialCommunityIcons name="camera-outline" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={REELS_DATA}
                renderItem={({ item, index }) => (
                    <ReelItem
                        item={item}
                        index={index}
                        activeIndex={activeIndex}
                        onOpenComments={handleOpenComments}
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
            />

            {/* Comments Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={commentsVisible}
                onRequestClose={() => setCommentsVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setCommentsVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContent}
                >
                    <View style={styles.modalHeader}>
                        <View style={styles.modalIndicator} />
                        <Text style={styles.modalTitle}>Comments</Text>
                    </View>

                    <FlatList
                        data={DUMMY_COMMENTS}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.commentItem}>
                                <View style={[styles.avatar, styles.commentAvatar]}>
                                    <Text style={styles.avatarTextSmall}>{item.user.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={styles.commentTextContainer}>
                                    <View style={styles.commentRow}>
                                        <Text style={styles.commentUser}>{item.user}</Text>
                                        <Text style={styles.commentTime}>{item.time}</Text>
                                    </View>
                                    <Text style={styles.commentContent}>{item.text}</Text>
                                    <TouchableOpacity>
                                        <Text style={styles.replyText}>Reply</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.commentLike}>
                                    <MaterialCommunityIcons name="heart-outline" size={16} color="#94a3b8" />
                                    <Text style={styles.commentLikeCount}>{item.likes}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={styles.commentsList}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.commentInputContainer}>
                        <View style={[styles.avatar, styles.inputAvatar]}>
                            <Text style={styles.avatarTextSmall}>U</Text>
                        </View>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            placeholderTextColor="#94a3b8"
                            value={commentText}
                            onChangeText={setCommentText}
                        />
                        <TouchableOpacity style={styles.postButton}>
                            <Text style={styles.postButtonText}>Post</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    cameraButton: {
        padding: 5,
    },
    reelContainer: {
        width: width,
        height: height,
        position: 'relative',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
    },
    reelImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,

        height: '35%',
    },
    rightActions: {
        position: 'absolute',
        right: 10,
        bottom: 100,
        alignItems: 'center',
        gap: 20,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 5,
    },
    bottomContent: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        right: 80, // Leave space for right actions
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarContainer: {
        marginRight: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#fff',
    },
    defaultAvatar: {
        backgroundColor: SP_RED,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    username: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        marginRight: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    followButton: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    followText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    musicContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
    },
    musicText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '60%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        marginBottom: 10,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    commentsList: {
        padding: 16,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: SP_RED,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
        marginRight: 12,
    },
    avatarTextSmall: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    commentTextContainer: {
        flex: 1,
    },
    commentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUser: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        marginRight: 8,
    },
    commentTime: {
        color: '#94a3b8',
        fontSize: 12,
    },
    commentContent: {
        color: '#e2e8f0',
        fontSize: 14,
        marginBottom: 4,
    },
    replyText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },
    commentLike: {
        alignItems: 'center',
        paddingLeft: 10,
    },
    commentLikeCount: {
        color: '#94a3b8',
        fontSize: 10,
        marginTop: 2,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#1a1a1a',
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    },
    inputAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
        marginRight: 12,
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        color: '#fff',
        fontSize: 14,
        marginRight: 12,
    },
    postButton: {
        paddingHorizontal: 4,
    },
    postButtonText: {
        color: SP_RED,
        fontWeight: '700',
        fontSize: 14,
    },
});
