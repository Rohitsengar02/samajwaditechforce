import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopLeaderboard() {
    const router = useRouter();
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, daily, weekly, monthly

    useEffect(() => {
        fetchLeaderboard();
    }, [filter]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/leaderboard?period=${filter}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setLeaderboard(data.data);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return '#e5e7eb';
    };

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
                </View>
                <View style={styles.headerActions}>
                    <Text style={styles.langSwitch}>EN</Text>
                    <Pressable onPress={() => router.push('/register' as any)}><Text style={styles.loginBtn}>Login</Text></Pressable>
                    <Pressable style={styles.signupBtn} onPress={() => router.push('/joinus' as any)}><Text style={styles.signupBtnText}>Join Us</Text></Pressable>
                </View>
            </View>

            <ScrollView>
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.badge}><MaterialCommunityIcons name="trophy" size={18} color={SP_RED} /><Text style={styles.badgeText}>Leaderboard</Text></View>
                    <Text style={styles.heroTitle}>Top Contributors</Text>
                    <Text style={styles.heroSubtitle}>Recognizing our most active and dedicated volunteers</Text>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterSection}>
                    <View style={styles.filterTabs}>
                        <Pressable style={[styles.filterTab, filter === 'all' && styles.filterTabActive]} onPress={() => setFilter('all')}>
                            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>All Time</Text>
                        </Pressable>
                        <Pressable style={[styles.filterTab, filter === 'monthly' && styles.filterTabActive]} onPress={() => setFilter('monthly')}>
                            <Text style={[styles.filterTabText, filter === 'monthly' && styles.filterTabTextActive]}>This Month</Text>
                        </Pressable>
                        <Pressable style={[styles.filterTab, filter === 'weekly' && styles.filterTabActive]} onPress={() => setFilter('weekly')}>
                            <Text style={[styles.filterTabText, filter === 'weekly' && styles.filterTabTextActive]}>This Week</Text>
                        </Pressable>
                        <Pressable style={[styles.filterTab, filter === 'daily' && styles.filterTabActive]} onPress={() => setFilter('daily')}>
                            <Text style={[styles.filterTabText, filter === 'daily' && styles.filterTabTextActive]}>Today</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Leaderboard */}
                {loading ? (
                    <ActivityIndicator size="large" color={SP_RED} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.leaderboardSection}>
                        {/* Top 3 Podium */}
                        {leaderboard.length >= 3 && (
                            <View style={styles.podium}>
                                {/* 2nd Place */}
                                <View style={styles.podiumItem}>
                                    <View style={[styles.podiumRank, { backgroundColor: '#C0C0C0' }]}><Text style={styles.podiumRankText}>2</Text></View>
                                    <View style={styles.podiumAvatar}><MaterialCommunityIcons name="account" size={40} color={SP_RED} /></View>
                                    <Text style={styles.podiumName} numberOfLines={1}>{leaderboard[1].name || 'User'}</Text>
                                    <Text style={styles.podiumPoints}>{leaderboard[1].points || 0} pts</Text>
                                </View>

                                {/* 1st Place */}
                                <View style={[styles.podiumItem, styles.firstPlace]}>
                                    <MaterialCommunityIcons name="crown" size={32} color="#FFD700" style={styles.crown} />
                                    <View style={[styles.podiumRank, { backgroundColor: '#FFD700' }]}><Text style={styles.podiumRankText}>1</Text></View>
                                    <View style={[styles.podiumAvatar, styles.firstPlaceAvatar]}><MaterialCommunityIcons name="account" size={48} color={SP_RED} /></View>
                                    <Text style={[styles.podiumName, styles.firstPlaceName]} numberOfLines={1}>{leaderboard[0].name || 'User'}</Text>
                                    <Text style={[styles.podiumPoints, styles.firstPlacePoints]}>{leaderboard[0].points || 0} pts</Text>
                                </View>

                                {/* 3rd Place */}
                                <View style={styles.podiumItem}>
                                    <View style={[styles.podiumRank, { backgroundColor: '#CD7F32' }]}><Text style={styles.podiumRankText}>3</Text></View>
                                    <View style={styles.podiumAvatar}><MaterialCommunityIcons name="account" size={40} color={SP_RED} /></View>
                                    <Text style={styles.podiumName} numberOfLines={1}>{leaderboard[2].name || 'User'}</Text>
                                    <Text style={styles.podiumPoints}>{leaderboard[2].points || 0} pts</Text>
                                </View>
                            </View>
                        )}

                        {/* Rest of Rankings */}
                        <View style={styles.rankingList}>
                            {leaderboard.slice(3).map((user, index) => (
                                <View key={index} style={styles.rankingCard}>
                                    <View style={[styles.rankBadge, { backgroundColor: getRankColor(index + 4) }]}>
                                        <Text style={styles.rankNumber}>{index + 4}</Text>
                                    </View>
                                    <View style={styles.userAvatar}>
                                        <MaterialCommunityIcons name="account" size={32} color={SP_RED} />
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{user.name || 'User'}</Text>
                                        <Text style={styles.userLocation}>{user.location || user.district || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.pointsContainer}>
                                        <Text style={styles.points}>{user.points || 0}</Text>
                                        <Text style={styles.pointsLabel}>points</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                                </View>
                            ))}
                        </View>

                        {leaderboard.length === 0 && (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="trophy-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyTitle}>No Data Available</Text>
                                <Text style={styles.emptyText}>Leaderboard data will appear here</Text>
                            </View>
                        )}
                    </View>
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
    filterSection: { paddingHorizontal: 60, paddingVertical: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    filterTabs: { flexDirection: 'row', gap: 16 },
    filterTab: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9' },
    filterTabActive: { backgroundColor: SP_RED },
    filterTabText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
    filterTabTextActive: { color: '#fff' },
    leaderboardSection: { padding: 60 },
    podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 32, marginBottom: 60 },
    podiumItem: { alignItems: 'center', width: 180 },
    firstPlace: { transform: [{ translateY: -20 }] },
    crown: { position: 'absolute', top: -40, zIndex: 1 },
    podiumRank: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    podiumRankText: { fontSize: 20, fontWeight: '900', color: '#fff' },
    podiumAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: '#fff' },
    firstPlaceAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFD700' },
    podiumName: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4, textAlign: 'center', width: '100%' },
    firstPlaceName: { fontSize: 18 },
    podiumPoints: { fontSize: 20, fontWeight: '900', color: SP_RED },
    firstPlacePoints: { fontSize: 24 },
    rankingList: { gap: 16 },
    rankingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    rankBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    rankNumber: { fontSize: 16, fontWeight: '900', color: '#64748b' },
    userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
    userLocation: { fontSize: 14, color: '#64748b' },
    pointsContainer: { alignItems: 'flex-end', marginRight: 16 },
    points: { fontSize: 24, fontWeight: '900', color: SP_RED },
    pointsLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    emptyState: { alignItems: 'center', padding: 60 },
    emptyTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 16, color: '#64748b' },
});
