import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, Modal, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

import { getApiUrl } from '../../utils/api';
import { Linking } from 'react-native';

export default function DesktopReels() {
    const router = useRouter();
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReel, setSelectedReel] = useState<any>(null);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/reels`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setReels(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayReel = (reel: any) => {
        if (reel?.videoUrl) {
            setSelectedReel(reel);
        }
    };

    const renderVideoContent = (url: string) => {
        if (!url) return null;

        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([^&]+)/);
        if (ytMatch && ytMatch[1]) {
            // @ts-ignore
            return <iframe
                src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
            />;
        }

        // Google Drive
        if (url.includes('drive.google.com')) {
            // @ts-ignore
            return <iframe
                src={url.replace('/view', '/preview')}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay"
                allowFullScreen
            />;
        }

        // Generic Video
        // @ts-ignore
        return <video
            src={url}
            controls
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />;
    };

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView>
                <View style={styles.hero}>
                    <View style={styles.badge}><MaterialCommunityIcons name="play-box-multiple" size={18} color={SP_RED} /><Text style={styles.badgeText}>Video Reels</Text></View>
                    <Text style={styles.heroTitle}>Watch & Share</Text>
                    <Text style={styles.heroSubtitle}>Short clips from our rallies, events, and community work</Text>
                </View>

                <View style={styles.reelsSection}>
                    <View style={styles.reelsGrid}>
                        {reels.map((reel) => (
                            <Pressable
                                key={reel._id}
                                style={styles.reelCard}
                                onPress={() => handlePlayReel(reel)}
                            >
                                <Image
                                    source={{ uri: reel.thumbnailUrl || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400' }}
                                    style={styles.reelThumbnail}
                                    resizeMode="cover"
                                />
                                <View style={styles.playOverlay}>
                                    <View style={styles.playButton}>
                                        <MaterialCommunityIcons name="play" size={32} color="#fff" />
                                    </View>
                                </View>
                                <View style={styles.reelInfo}>
                                    <Text style={styles.reelTitle} numberOfLines={2}>{reel.title}</Text>
                                    <View style={styles.reelStats}>
                                        <View style={styles.reelStat}>
                                            <MaterialCommunityIcons name="eye" size={14} color="#fff" />
                                            <Text style={styles.reelStatText}>2k+</Text>
                                        </View>
                                        <View style={styles.reelStat}>
                                            <MaterialCommunityIcons name="open-in-new" size={14} color="#fff" />
                                            <Text style={styles.reelStatText}>{reel.platform || 'Link'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                        {reels.length === 0 && !loading && (
                            <Text style={{ fontSize: 18, color: '#64748b' }}>No reels available at the moment.</Text>
                        )}
                    </View>
                </View>
                {selectedReel && (
                    <Modal
                        visible={true}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setSelectedReel(null)}
                    >
                        <View style={styles.modalOverlay}>
                            <TouchableOpacity
                                style={styles.modalBackdrop}
                                activeOpacity={1}
                                onPress={() => setSelectedReel(null)}
                            />
                            <View style={styles.modalContent}>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setSelectedReel(null)}
                                >
                                    <MaterialCommunityIcons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                                <View style={styles.videoContainer}>
                                    {renderVideoContent(selectedReel.videoUrl)}
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 60, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', zIndex: 100 },
    headerLogo: { fontSize: 24, fontWeight: '900', color: SP_RED },
    navMenu: { flexDirection: 'row', alignItems: 'center', gap: 32 },
    navItem: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    langSwitch: { fontSize: 14, fontWeight: '600', color: '#64748b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
    loginBtn: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    signupBtn: { backgroundColor: SP_RED, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    hero: { backgroundColor: '#fef2f2', paddingHorizontal: 60, paddingVertical: 80 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
    badgeText: { fontSize: 14, color: SP_RED, fontWeight: '600' },
    heroTitle: { fontSize: 48, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
    heroSubtitle: { fontSize: 18, color: '#64748b' },
    reelsSection: { padding: 60 },
    reelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
    reelCard: { width: '31%', height: 400, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
    reelThumbnail: { width: '100%', height: '100%' },
    playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    playButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(227,5,18,0.9)', justifyContent: 'center', alignItems: 'center' },
    reelInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
    reelTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
    reelStats: { flexDirection: 'row', gap: 16 },
    reelStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    reelStatText: { fontSize: 12, color: '#fff', fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    modalContent: { width: '85%', height: '85%', backgroundColor: '#000', borderRadius: 16, overflow: 'hidden', maxWidth: 1200, elevation: 5 },
    closeButton: { position: 'absolute', top: 20, right: 20, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
    videoContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
});
