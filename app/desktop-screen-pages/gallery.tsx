import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopGallery() {
    const router = useRouter();
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);

    const categories = ['all', 'rallies', 'events', 'achievements', 'social work'];

    const galleryItems = [
        { id: 1, image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600', category: 'rallies', title: 'Lucknow Jan Sabha 2024' },
        { id: 2, image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600', category: 'events', title: 'Samajwadi Yuva Sammelan' },
        { id: 3, image: 'https://images.unsplash.com/photo-1486589778287-63b4f7a7fe53?w=600', category: 'social work', title: 'Community Kitchen Service' },
        { id: 4, image: 'https://images.unsplash.com/photo-1596386461350-326256f8e221?w=600', category: 'achievements', title: 'Expressway Inauguration' },
        { id: 5, image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600', category: 'rallies', title: 'Kisan Mahapanchayat' },
        { id: 6, image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600', category: 'events', title: 'Mahila Sashaktikaran Rally' },
        { id: 7, image: 'https://images.unsplash.com/photo-1623944890595-109956d24189?w=600', category: 'social work', title: 'Flood Relief Distribution' },
        { id: 8, image: 'https://images.unsplash.com/photo-1607209908037-c6472a8c5113?w=600', category: 'achievements', title: 'Laptop Distribution Ceremony' },
        { id: 9, image: 'https://images.unsplash.com/photo-1531564701487-f238224b7ce3?w=600', category: 'events', title: 'Party Workers Meeting' },
    ];

    const filteredGallery = filter === 'all' ? galleryItems : galleryItems.filter(item => item.category === filter);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerLogo}>समाजवादी पार्टी</Text>
                <View style={styles.navMenu}>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/home' as any)}><Text style={styles.navItem}>Home</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/news' as any)}><Text style={styles.navItem}>News</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/events' as any)}><Text style={styles.navItem}>Events</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/gallery' as any)}><Text style={styles.navItem}>Gallery</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/about' as any)}><Text style={styles.navItem}>About</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/volunteers' as any)}><Text style={styles.navItem}>Volunteers</Text></Pressable>
                    <Pressable onPress={() => router.push('/desktop-screen-pages/daily-work' as any)}><Text style={styles.navItem}>Daily Work</Text></Pressable>
                    <View style={styles.dropdownWrapper}>
                        <Pressable style={styles.dropdownTrigger} onPress={() => setShowMegaMenu(!showMegaMenu)}>
                            <Text style={styles.navItem}>Quick Access</Text>
                            <MaterialCommunityIcons name={showMegaMenu ? "chevron-up" : "chevron-down"} size={20} color="#1e293b" />
                        </Pressable>
                        {showMegaMenu && (
                            <View style={styles.megaMenu}>
                                <View style={styles.megaMenuGrid}>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/posters' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: `${SP_GREEN}15` }]}><MaterialCommunityIcons name="image-multiple" size={24} color={SP_GREEN} /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Posters</Text><Text style={styles.megaMenuSubtitle}>Download & customize</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/daily-work/leaderboard' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: `${SP_GREEN}15` }]}><MaterialCommunityIcons name="chart-bar" size={24} color={SP_GREEN} /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Leaderboard</Text><Text style={styles.megaMenuSubtitle}>Check your rank</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/daily-work' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: '#F59E0B15' }]}><MaterialCommunityIcons name="calendar-check" size={24} color="#F59E0B" /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Daily Work</Text><Text style={styles.megaMenuSubtitle}>Tasks & Rewards</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/desktop-screen-pages/resources' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: '#9333EA15' }]}><MaterialCommunityIcons name="library" size={24} color="#9333EA" /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Resources</Text><Text style={styles.megaMenuSubtitle}>Library & Tools</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/desktop-screen-pages/communication' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: '#2563EB15' }]}><MaterialCommunityIcons name="forum" size={24} color="#2563EB" /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Communication</Text><Text style={styles.megaMenuSubtitle}>Discuss & Suggest</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/desktop-screen-pages/news' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: `${SP_RED}15` }]}><MaterialCommunityIcons name="newspaper" size={24} color={SP_RED} /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Samajwadi Updates</Text><Text style={styles.megaMenuSubtitle}>Stay updated</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/nearby-volunteers' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: '#0891b215' }]}><MaterialCommunityIcons name="account-group" size={24} color="#0891b2" /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Nearby Volunteers</Text><Text style={styles.megaMenuSubtitle}>Find help nearby</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/desktop-screen-pages/training' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: '#3B82F615' }]}><MaterialCommunityIcons name="school" size={24} color="#3B82F6" /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Training</Text><Text style={styles.megaMenuSubtitle}>Learn & grow</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/idcard' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: '#EF444415' }]}><MaterialCommunityIcons name="card-account-details" size={24} color="#EF4444" /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>ID Card</Text><Text style={styles.megaMenuSubtitle}>Digital identity</Text></View></Pressable>
                                    <Pressable style={styles.megaMenuItem} onPress={() => { router.push('/reels' as any); setShowMegaMenu(false); }}><View style={[styles.megaMenuIcon, { backgroundColor: '#E1306C15' }]}><MaterialCommunityIcons name="play-box-multiple" size={24} color="#E1306C" /></View><View style={styles.megaMenuText}><Text style={styles.megaMenuTitle}>Reels</Text><Text style={styles.megaMenuSubtitle}>Watch & Share</Text></View></Pressable>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <Text style={styles.langSwitch}>EN</Text>
                    <Pressable onPress={() => router.push('/register' as any)}><Text style={styles.loginBtn}>Login</Text></Pressable>
                    <Pressable style={styles.signupBtn} onPress={() => router.push('/joinus' as any)}><Text style={styles.signupBtnText}>Join Us</Text></Pressable>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.badge}><MaterialCommunityIcons name="image-multiple" size={18} color={SP_RED} /><Text style={styles.badgeText}>Media Gallery</Text></View>
                    <Text style={styles.heroTitle}>Moments of Change</Text>
                    <Text style={styles.heroSubtitle}>Capturing our journey towards a better tomorrow</Text>
                </View>

                {/* Filter */}
                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        {categories.map((cat) => (
                            <Pressable key={cat} style={[styles.categoryChip, filter === cat && styles.categoryChipActive]} onPress={() => setFilter(cat)}>
                                <Text style={[styles.categoryChipText, filter === cat && styles.categoryChipTextActive]}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Gallery Grid */}
                <View style={styles.galleryGrid}>
                    {filteredGallery.map((item) => (
                        <Pressable key={item.id} style={styles.galleryCard}>
                            <Image source={{ uri: item.image }} style={styles.galleryImage} resizeMode="cover" />
                            <View style={styles.galleryOverlay}>
                                <Text style={styles.galleryTitle}>{item.title}</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 60, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', zIndex: 100, position: 'relative' },
    headerLogo: { fontSize: 24, fontWeight: '900', color: SP_RED },
    navMenu: { flexDirection: 'row', alignItems: 'center', gap: 32 },
    navItem: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    langSwitch: { fontSize: 14, fontWeight: '600', color: '#64748b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
    loginBtn: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    signupBtn: { backgroundColor: SP_RED, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    dropdownWrapper: { position: 'relative' },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    megaMenu: { position: 'absolute', top: 40, left: -200, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, padding: 24, zIndex: 10000, minWidth: 600 },
    megaMenuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    megaMenuItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, backgroundColor: '#f8f9fa' },
    megaMenuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    megaMenuText: { flex: 1 },
    megaMenuTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
    megaMenuSubtitle: { fontSize: 12, color: '#64748b' },
    hero: { backgroundColor: '#fef2f2', paddingHorizontal: 60, paddingVertical: 80 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
    badgeText: { fontSize: 14, color: SP_RED, fontWeight: '600' },
    heroTitle: { fontSize: 48, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
    heroSubtitle: { fontSize: 18, color: '#64748b' },
    filterSection: { paddingHorizontal: 60, paddingVertical: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    categoriesScroll: { flexGrow: 0 },
    categoryChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 12, backgroundColor: '#f1f5f9' },
    categoryChipActive: { backgroundColor: SP_RED },
    categoryChipText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    categoryChipTextActive: { color: '#fff' },
    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 60, gap: 24 },
    galleryCard: { width: '31%', height: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
    galleryImage: { width: '100%', height: '100%' },
    galleryOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.6)' },
    galleryTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
