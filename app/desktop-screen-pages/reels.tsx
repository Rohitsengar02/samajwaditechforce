import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, TouchableOpacity, Platform, TextInput as RNTextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';
import { getApiUrl } from '../../utils/api';

export default function DesktopReels() {
    const router = useRouter();
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [username, setUsername] = useState('Guest');
    const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const videoRef = useRef<Video>(null);
    const containerRef = useRef<any>(null);

    useEffect(() => {
        fetchReels();
        loadUsername();
    }, []);

    useEffect(() => {
        // Auto-play when reel changes
        setIsPlaying(true);
        if (videoRef.current) {
            videoRef.current.playAsync();
        }
    }, [currentIndex]);

    const loadUsername = async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (userInfo) {
                const user = JSON.parse(userInfo);
                setUsername(user.name || 'Guest');
            }
        } catch (error) {
            console.error('Error loading username:', error);
        }
    };

    const showPointsNotification = (points: number, action: string) => {
        setNotificationMessage(`🎉 +${points} points! ${action}`);
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 3000);
    };

    const fetchReels = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/reels`);
            const data = await res.json();
            console.log('Fetched reels response:', data);
            console.log('Number of reels from API:', data.data?.length || 0);
            if (data.success && Array.isArray(data.data)) {
                // Create infinite scroll by tripling
                const tripled = [...data.data, ...data.data, ...data.data];
                console.log('Total reels after tripling:', tripled.length);
                setReels(tripled);
            }
        } catch (err) {
            console.error('Error fetching reels:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            const url = getApiUrl();
            const reelId = currentReel._id;

            const res = await fetch(`${url}/reels/${reelId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await res.json();
            if (data.success) {
                // Update local state
                const updatedReels = reels.map(r =>
                    r._id === reelId ? data.data : r
                );
                setReels(updatedReels);

                // Update liked state
                const newLiked = new Set(likedReels);
                if (data.liked) {
                    newLiked.add(reelId);
                    showPointsNotification(5, 'You liked this reel!');
                } else {
                    newLiked.delete(reelId);
                    // Show red notification for unlike
                    setNotificationMessage(`⚠️ -5 points! Reel unliked`);
                    setShowNotification(true);
                    setTimeout(() => {
                        setShowNotification(false);
                    }, 3000);
                }
                setLikedReels(newLiked);
            }
        } catch (error) {
            console.error('Error liking reel:', error);
        }
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const handleShareOption = async (type: string) => {
        const shareUrl = `https://www.samajwaditechforce.com/reels?id=${currentReel._id}`;
        const shareText = `Check out this reel: ${currentReel.title}`;
        const shareData = {
            title: currentReel.title,
            text: shareText,
            url: shareUrl
        };

        if (type === 'copy') {
            // Copy link to clipboard
            navigator.clipboard.writeText(shareUrl);
            setShowShareModal(false);

            // Track share and award points
            try {
                const url = getApiUrl();
                const reelId = currentReel._id;

                const res = await fetch(`${url}/reels/${reelId}/share`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });

                const data = await res.json();
                if (data.success) {
                    const updatedReels = reels.map(r =>
                        r._id === reelId ? data.data : r
                    );
                    setReels(updatedReels);

                    if (data.firstShare) {
                        showPointsNotification(10, 'Link copied! You shared this reel!');
                    } else {
                        setNotificationMessage(`ℹ️ Link copied! (Points already earned)`);
                        setShowNotification(true);
                        setTimeout(() => {
                            setShowNotification(false);
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('Error tracking share:', error);
                setNotificationMessage(`✅ Link copied to clipboard!`);
                setShowNotification(true);
                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);
            }
        } else if (type === 'whatsapp') {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
            window.open(whatsappUrl, '_blank');
            setShowShareModal(false);

            // Track share
            try {
                const url = getApiUrl();
                const reelId = currentReel._id;

                const res = await fetch(`${url}/reels/${reelId}/share`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });

                const data = await res.json();
                if (data.success) {
                    const updatedReels = reels.map(r =>
                        r._id === reelId ? data.data : r
                    );
                    setReels(updatedReels);

                    if (data.firstShare) {
                        showPointsNotification(10, 'You shared this reel!');
                    }
                }
            } catch (error) {
                console.error('Error tracking share:', error);
            }
        } else if (type === 'native') {
            // Use native share API
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    setShowShareModal(false);

                    // Track share
                    const url = getApiUrl();
                    const reelId = currentReel._id;

                    const res = await fetch(`${url}/reels/${reelId}/share`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username })
                    });

                    const data = await res.json();
                    if (data.success) {
                        const updatedReels = reels.map(r =>
                            r._id === reelId ? data.data : r
                        );
                        setReels(updatedReels);

                        if (data.firstShare) {
                            showPointsNotification(10, 'You shared this reel!');
                        }
                    }
                } catch (error) {
                    console.log('Share cancelled or failed');
                }
            }
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;

        try {
            const url = getApiUrl();
            const reelId = currentReel._id;

            const res = await fetch(`${url}/reels/${reelId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, text: commentText })
            });

            const data = await res.json();
            if (data.success) {
                // Update local state
                const updatedReels = reels.map(r =>
                    r._id === reelId ? data.data : r
                );
                setReels(updatedReels);
                setCommentText('');

                if (data.firstComment) {
                    showPointsNotification(10, 'Comment added!');
                } else {
                    // No points for subsequent comments
                    setNotificationMessage(`ℹ️ Comment added! (Points already earned)`);
                    setShowNotification(true);
                    setTimeout(() => {
                        setShowNotification(false);
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error commenting:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const url = getApiUrl();
            const reelId = currentReel._id;

            const res = await fetch(`${url}/reels/${reelId}/comment/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await res.json();
            if (data.success) {
                // Update local state
                const updatedReels = reels.map(r =>
                    r._id === reelId ? data.data : r
                );
                setReels(updatedReels);

                if (data.wasLastComment) {
                    // Show red notification for point deduction only if it was the last comment
                    setNotificationMessage(`⚠️ -10 points! Last comment deleted`);
                    setShowNotification(true);
                    setTimeout(() => {
                        setShowNotification(false);
                    }, 3000);
                } else {
                    // No points deducted if user still has other comments
                    setNotificationMessage(`ℹ️ Comment deleted (Points retained)`);
                    setShowNotification(true);
                    setTimeout(() => {
                        setShowNotification(false);
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleDownload = async () => {
        try {
            const url = getApiUrl();
            const reelId = currentReel._id;

            // Track download and award points
            const res = await fetch(`${url}/reels/${reelId}/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await res.json();
            if (data.success) {
                // Download the video file
                if (Platform.OS === 'web') {
                    try {
                        // Fetch the video file
                        const response = await fetch(currentReel.videoUrl);
                        const blob = await response.blob();

                        // Create a download link
                        const downloadUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = `${currentReel.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(downloadUrl);

                        if (data.firstDownload) {
                            showPointsNotification(10, 'Reel downloaded!');
                        } else {
                            setNotificationMessage(`ℹ️ Reel downloaded! (Points already earned)`);
                            setShowNotification(true);
                            setTimeout(() => {
                                setShowNotification(false);
                            }, 3000);
                        }
                    } catch (downloadError) {
                        console.error('Download error:', downloadError);
                        // Fallback: open in new tab if CORS blocks download
                        window.open(currentReel.videoUrl, '_blank');

                        if (data.firstDownload) {
                            showPointsNotification(10, 'Download started!');
                        } else {
                            setNotificationMessage(`ℹ️ Download started! (Points already earned)`);
                            setShowNotification(true);
                            setTimeout(() => {
                                setShowNotification(false);
                            }, 3000);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error downloading reel:', error);
        }
    };

    const handleNext = () => {
        if (currentIndex < reels.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(reels.length - 1);
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            videoRef.current?.pauseAsync();
        } else {
            videoRef.current?.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const currentReel = reels[currentIndex];

    if (loading) {
        return (
            <View style={styles.container}>
                <DesktopHeader />
                <View style={styles.loadingContainer}>
                    <Text>Loading Reels...</Text>
                </View>
            </View>
        );
    }

    if (!currentReel) {
        return (
            <View style={styles.container}>
                <DesktopHeader />
                <View style={styles.loadingContainer}>
                    <Text>No Reels Available</Text>
                </View>
            </View>
        );
    }

    const isYoutube = currentReel.videoUrl?.includes('youtu');
    const isDrive = currentReel.videoUrl?.includes('drive.google.com');

    return (
        <>
            {/* Points Notification Toast */}
            {showNotification && (
                <View style={[
                    styles.notificationToast,
                    {
                        backgroundColor: notificationMessage.startsWith('⚠️')
                            ? '#E30512'
                            : notificationMessage.startsWith('ℹ️')
                                ? '#2196F3'
                                : '#4CAF50'
                    }
                ]}>
                    <MaterialCommunityIcons
                        name={
                            notificationMessage.startsWith('⚠️') ? 'alert-circle' :
                                notificationMessage.startsWith('ℹ️') ? 'information' :
                                    'star'
                        }
                        size={24}
                        color="#FFD700"
                    />
                    <Text style={styles.notificationText}>{notificationMessage}</Text>
                </View>
            )}

            {/* Comment Sidebar - Above Everything */}
            {showComments && (
                <View style={styles.commentSidebarOverlay}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.commentTitle}>Comments ({currentReel.comments?.length || 0})</Text>
                        <TouchableOpacity onPress={() => setShowComments(false)}>
                            <MaterialCommunityIcons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.commentList}>
                        {currentReel.comments?.length > 0 ? (
                            currentReel.comments.map((comment: any, index: number) => (
                                <View key={index} style={styles.commentItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.commentUsername}>{comment.username}</Text>
                                        <Text style={styles.commentText}>{comment.text}</Text>
                                        <Text style={styles.commentTime}>
                                            {new Date(comment.timestamp).toLocaleString()}
                                        </Text>
                                    </View>
                                    {comment.username === username && (
                                        <TouchableOpacity
                                            onPress={() => handleDeleteComment(comment._id)}
                                            style={{ padding: 8 }}
                                        >
                                            <MaterialCommunityIcons name="delete" size={20} color="#E30512" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                        )}
                    </ScrollView>

                    <View style={styles.commentInputContainer}>
                        <RNTextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            placeholderTextColor="#999"
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.commentSendButton}
                            onPress={handleComment}
                            disabled={!commentText.trim()}
                        >
                            <MaterialCommunityIcons
                                name="send"
                                size={24}
                                color={commentText.trim() ? SP_RED : "#666"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Share Options Modal */}
            {showShareModal && (
                <View style={styles.shareModalOverlay}>
                    <TouchableOpacity
                        style={styles.shareModalBackdrop}
                        onPress={() => setShowShareModal(false)}
                        activeOpacity={1}
                    />
                    <View style={styles.shareModal}>
                        <View style={styles.shareModalHeader}>
                            <Text style={styles.shareModalTitle}>Share Reel</Text>
                            <TouchableOpacity onPress={() => setShowShareModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Share Preview */}
                        <View style={styles.sharePreview}>
                            <View style={styles.sharePreviewImage}>
                                <MaterialCommunityIcons name="video" size={40} color="#E30512" />
                            </View>
                            <View style={styles.sharePreviewText}>
                                <Text style={styles.sharePreviewTitle} numberOfLines={2}>
                                    {currentReel.title}
                                </Text>
                                <Text style={styles.sharePreviewUrl} numberOfLines={1}>
                                    https://www.samajwaditechforce.com/reels?id={currentReel._id}
                                </Text>
                            </View>
                        </View>

                        {/* Share Options */}
                        <View style={styles.shareOptions}>
                            <TouchableOpacity
                                style={styles.shareOption}
                                onPress={() => handleShareOption('copy')}
                            >
                                <View style={[styles.shareOptionIcon, { backgroundColor: '#2196F3' }]}>
                                    <MaterialCommunityIcons name="content-copy" size={24} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>Copy Link</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.shareOption}
                                onPress={() => handleShareOption('whatsapp')}
                            >
                                <View style={[styles.shareOptionIcon, { backgroundColor: '#25D366' }]}>
                                    <MaterialCommunityIcons name="whatsapp" size={24} color="#fff" />
                                </View>
                                <Text style={styles.shareOptionText}>WhatsApp</Text>
                            </TouchableOpacity>

                            {(typeof navigator !== 'undefined' && typeof navigator.share === 'function') && (
                                <TouchableOpacity
                                    style={styles.shareOption}
                                    onPress={() => handleShareOption('native')}
                                >
                                    <View style={[styles.shareOptionIcon, { backgroundColor: '#666' }]}>
                                        <MaterialCommunityIcons name="share-variant" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.shareOptionText}>More Options</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.container}>
                <DesktopHeader />

                {/* Top Controls Bar */}
                <View style={styles.topControlsBar}>
                    <View style={styles.topControlsLeft}>
                        <Text style={styles.topControlsTitle}>Reels</Text>
                    </View>
                    <View style={styles.topControlsRight}>
                        {/* Sound Toggle */}
                        <TouchableOpacity style={styles.topControlButton} onPress={toggleMute}>
                            <MaterialCommunityIcons
                                name={isMuted ? "volume-off" : "volume-high"}
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.topControlText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* Left Arrow */}
                    <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={handlePrevious}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
                    </TouchableOpacity>

                    {/* Center Video Player */}
                    <View style={styles.videoWrapper}>
                        <View style={styles.videoPlayerContainer}>
                            {isYoutube || isDrive ? (
                                // @ts-ignore
                                <iframe
                                    src={
                                        isYoutube
                                            ? `https://www.youtube.com/embed/${currentReel.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/)?.[1]}?autoplay=1&controls=0&mute=${isMuted ? 1 : 0}`
                                            : currentReel.videoUrl.replace('/view', '/preview')
                                    }
                                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />
                            ) : (
                                <Video
                                    ref={videoRef}
                                    source={{ uri: currentReel.videoUrl }}
                                    style={styles.video}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={isPlaying}
                                    isLooping
                                    isMuted={isMuted}
                                    useNativeControls={false}
                                    volume={1.0}
                                />
                            )}

                            {/* Profile Info Overlay */}
                            <View style={styles.profileOverlay}>
                                <View style={styles.profileSection}>
                                    <Image
                                        source={require('../../assets/images/icon.png')}
                                        style={styles.profilePic}
                                    />
                                    <View style={styles.profileText}>
                                        <Text style={styles.username}>Samajwadi Tech Force</Text>
                                        <Text style={styles.subscribers}>Official Channel</Text>
                                    </View>
                                </View>
                                <Text style={styles.videoTitle} numberOfLines={2}>
                                    {currentReel.title}
                                </Text>
                            </View>

                            {/* Interaction Buttons */}
                            <View style={styles.interactionButtons}>
                                {/* Like Button */}
                                <TouchableOpacity
                                    style={styles.interactionButton}
                                    onPress={handleLike}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons
                                        name={likedReels.has(currentReel._id) || currentReel.likes?.some((l: any) => l.username === username) ? "heart" : "heart-outline"}
                                        size={28}
                                        color={likedReels.has(currentReel._id) || currentReel.likes?.some((l: any) => l.username === username) ? SP_RED : "#fff"}
                                    />
                                    <Text style={styles.interactionCount}>{currentReel.likes?.length || 0}</Text>
                                </TouchableOpacity>

                                {/* Comment Button */}
                                <TouchableOpacity
                                    style={styles.interactionButton}
                                    onPress={() => setShowComments(!showComments)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons
                                        name="comment-outline"
                                        size={28}
                                        color="#fff"
                                    />
                                    <Text style={styles.interactionCount}>{currentReel.comments?.length || 0}</Text>
                                </TouchableOpacity>

                                {/* Share Button */}
                                <TouchableOpacity
                                    style={styles.interactionButton}
                                    onPress={handleShare}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons
                                        name="share-outline"
                                        size={28}
                                        color="#fff"
                                    />
                                    <Text style={styles.interactionCount}>{currentReel.shares?.length || 0}</Text>
                                </TouchableOpacity>

                                {/* Download Button */}
                                <TouchableOpacity
                                    style={styles.interactionButton}
                                    onPress={handleDownload}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons
                                        name="download"
                                        size={28}
                                        color="#4CAF50"
                                    />
                                    <Text style={[styles.interactionCount, { color: '#4CAF50' }]}>+10</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Right Arrow */}
                    <TouchableOpacity
                        style={styles.arrowButton}
                        onPress={handleNext}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="chevron-right" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Bottom Down Arrow */}
                <TouchableOpacity
                    style={styles.downArrow}
                    onPress={handleNext}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="chevron-down" size={32} color="#fff" />
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    // Desktop Styles
    notificationToast: {
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: [{ translateX: -150 }] as any,
        width: 300,
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        zIndex: 2000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    } as any,
    notificationText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginLeft: 12,
    } as any,
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 20,
    },
    arrowButton: {
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 50,
    } as any,
    videoWrapper: {
        flex: 1,
        maxWidth: 350,
        height: 600,
        marginHorizontal: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlayerContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    } as any,
    video: {
        width: '100%',
        height: '100%',
    },
    profileOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'transparent',
    } as any,
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    } as any,
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    profileText: {
        flex: 1,
    } as any,
    username: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    } as any,
    subscribers: {
        fontSize: 13,
        color: '#e0e0e0',
        marginTop: 2,
    } as any,
    videoTitle: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        lineHeight: 18,
    } as any,
    controls: {
        position: 'absolute',
        bottom: 80,
        right: 16,
        flexDirection: 'column',
        gap: 12,
    } as any,
    controlButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    } as any,
    downArrow: {
        position: 'absolute',
        bottom: 40,
        right: '50%',
        transform: [{ translateX: 16 }] as any,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 50,
    } as any,
    interactionButtons: {
        position: 'absolute',
        bottom: 20,
        right: 16,
        flexDirection: 'column',
        gap: 16,
    } as any,
    interactionButton: {
        alignItems: 'center',
        justifyContent: 'center',
    } as any,
    interactionCount: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    } as any,
    commentSidebarOverlay: {
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: 400,
        backgroundColor: '#1a1a1a',
        borderLeftWidth: 1,
        borderLeftColor: '#333',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    } as any,
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    } as any,
    commentTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    } as any,
    commentList: {
        flex: 1,
        padding: 16,
    } as any,
    commentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    } as any,
    commentUsername: {
        fontSize: 14,
        fontWeight: '700',
        color: SP_RED,
        marginBottom: 6,
    } as any,
    commentText: {
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
        marginBottom: 6,
    } as any,
    commentTime: {
        fontSize: 11,
        color: '#999',
    } as any,
    noComments: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 40,
    } as any,
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#222',
    } as any,
    commentInput: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 14,
        maxHeight: 100,
    } as any,
    commentSendButton: {
        marginLeft: 12,
        padding: 8,
    } as any,
    topControlsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 12,
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    } as any,
    topControlsLeft: {
        flex: 1,
    } as any,
    topControlsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    } as any,
    topControlsRight: {
        flexDirection: 'row',
        gap: 16,
    } as any,
    topControlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    } as any,
    topControlText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    } as any,
    shareModalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1500,
        justifyContent: 'center',
        alignItems: 'center',
    } as any,
    shareModalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
    } as any,
    shareModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: 500,
        maxWidth: '90%',
        maxHeight: '80%',
        zIndex: 1501,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    } as any,
    shareModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    } as any,
    shareModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    } as any,
    sharePreview: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#f5f5f5',
        margin: 20,
        borderRadius: 12,
    } as any,
    sharePreviewImage: {
        width: 60,
        height: 60,
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    } as any,
    sharePreviewText: {
        flex: 1,
        justifyContent: 'center',
    } as any,
    sharePreviewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    } as any,
    sharePreviewUrl: {
        fontSize: 12,
        color: '#666',
    } as any,
    shareOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        paddingTop: 0,
    } as any,
    shareOption: {
        alignItems: 'center',
        gap: 8,
    } as any,
    shareOptionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    } as any,
    shareOptionText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    } as any,
});
