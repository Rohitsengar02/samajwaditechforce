import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopCommunication() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState('discussions');

    const discussions = [
        { id: 1, title: 'Community Development Ideas', author: 'Rajesh Kumar', replies: 24, time: '2h ago', category: 'Development' },
        { id: 2, title: 'Upcoming Rally Coordination', author: 'Priya Sharma', replies: 15, time: '5h ago', category: 'Events' },
        { id: 3, title: 'Youth Engagement Strategies', author: 'Amit Verma', replies: 32, time: '1d ago', category: 'Youth' },
    ];

    return (
        <View style={styles.container}>
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
                <View style={styles.hero}>
                    <View style={styles.badge}><MaterialCommunityIcons name="forum" size={18} color={SP_RED} /><Text style={styles.badgeText}>Communication Hub</Text></View>
                    <Text style={styles.heroTitle}>Connect & Collaborate</Text>
                    <Text style={styles.heroSubtitle}>Share ideas, discuss policies, and connect with fellow members</Text>
                </View>

                <View style={styles.tabsSection}>
                    <Pressable style={[styles.tab, selectedTab === 'discussions' && styles.tabActive]} onPress={() => setSelectedTab('discussions')}>
                        <Text style={[styles.tabText, selectedTab === 'discussions' && styles.tabTextActive]}>Discussions</Text>
                    </Pressable>
                    <Pressable style={[styles.tab, selectedTab === 'suggestions' && styles.tabActive]} onPress={() => setSelectedTab('suggestions')}>
                        <Text style={[styles.tabText, selectedTab === 'suggestions' && styles.tabTextActive]}>Suggestions</Text>
                    </Pressable>
                    <Pressable style={[styles.tab, selectedTab === 'announcements' && styles.tabActive]} onPress={() => setSelectedTab('announcements')}>
                        <Text style={[styles.tabText, selectedTab === 'announcements' && styles.tabTextActive]}>Announcements</Text>
                    </Pressable>
                </View>

                <View style={styles.content}>
                    <View style={styles.discussionsList}>
                        {discussions.map((discussion) => (
                            <Pressable key={discussion.id} style={styles.discussionCard}>
                                <View style={styles.discussionHeader}>
                                    <View style={styles.categoryBadge}><Text style={styles.categoryText}>{discussion.category}</Text></View>
                                    <Text style={styles.discussionTime}>{discussion.time}</Text>
                                </View>
                                <Text style={styles.discussionTitle}>{discussion.title}</Text>
                                <View style={styles.discussionFooter}>
                                    <Text style={styles.discussionAuthor}>by {discussion.author}</Text>
                                    <View style={styles.discussionStats}>
                                        <MaterialCommunityIcons name="comment-outline" size={16} color="#64748b" />
                                        <Text style={styles.discussionReplies}>{discussion.replies} replies</Text>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>

                    <Pressable style={styles.newDiscussionBtn}>
                        <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
                        <Text style={styles.newDiscussionText}>Start New Discussion</Text>
                    </Pressable>
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
    tabsSection: { flexDirection: 'row', paddingHorizontal: 60, paddingVertical: 24, backgroundColor: '#fff', gap: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    tab: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9' },
    tabActive: { backgroundColor: SP_RED },
    tabText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
    tabTextActive: { color: '#fff' },
    content: { padding: 60 },
    discussionsList: { gap: 16, marginBottom: 24 },
    discussionCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    discussionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    categoryBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
    categoryText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    discussionTime: { fontSize: 13, color: '#94a3b8' },
    discussionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
    discussionFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    discussionAuthor: { fontSize: 14, color: '#64748b' },
    discussionStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    discussionReplies: { fontSize: 14, color: '#64748b' },
    newDiscussionBtn: { backgroundColor: SP_RED, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16, borderRadius: 12 },
    newDiscussionText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
