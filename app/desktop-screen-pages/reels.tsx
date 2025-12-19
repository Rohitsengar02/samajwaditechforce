import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

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
    const videoRef = useRef<Video>(null);
    const containerRef = useRef<any>(null);

    useEffect(() => {
        fetchReels();
    }, []);

    useEffect(() => {
        // Auto-play when reel changes
        setIsPlaying(true);
        if (videoRef.current) {
            videoRef.current.playAsync();
        }
    }, [currentIndex]);

    const fetchReels = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/reels`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                // Create infinite scroll by tripling
                const tripled = [...data.data, ...data.data, ...data.data];
                setReels(tripled);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
        <View style={styles.container}>
            <DesktopHeader />

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

                        {/* Video Controls */}
                        <View style={styles.controls}>
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={togglePlayPause}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name={isPlaying ? "pause" : "play"}
                                    size={24}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={toggleMute}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name={isMuted ? "volume-off" : "volume-high"}
                                    size={24}
                                    color="#fff"
                                />
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
    );
}

const styles = StyleSheet.create({
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
        maxWidth: 400,
        height: 700,
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
});
