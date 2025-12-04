import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

export default function DesktopReels() {
    const router = useRouter();

    const reels = [
        { id: 1, thumbnail: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400', title: 'Rally Highlights - Lucknow', views: '125K', likes: '12K' },
        { id: 2, thumbnail: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400', title: 'Akhilesh Yadav Speech', views: '250K', likes: '28K' },
        { id: 3, thumbnail: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400', title: 'Development Projects Tour', views: '89K', likes: '9.5K' },
        { id: 4, thumbnail: 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=400', title: 'Women Empowerment Event', views: '156K', likes: '18K' },
        { id: 5, thumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400', title: 'Community Service Drive', views: '72K', likes: '8.2K' },
        { id: 6, thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', title: 'Youth Leaders Meet', views: '198K', likes: '22K' },
    ];

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
                            <Pressable key={reel.id} style={styles.reelCard}>
                                <Image source={{ uri: reel.thumbnail }} style={styles.reelThumbnail} resizeMode="cover" />
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
                                            <Text style={styles.reelStatText}>{reel.views}</Text>
                                        </View>
                                        <View style={styles.reelStat}>
                                            <MaterialCommunityIcons name="heart" size={14} color="#fff" />
                                            <Text style={styles.reelStatText}>{reel.likes}</Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>
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
});
