import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopResources() {
    const router = useRouter();
    const [showMegaMenu, setShowMegaMenu] = useState(false);

    const resources = [
        { icon: 'file-document', title: 'Party Manifesto', description: 'Download our complete manifesto', color: '#E30512', files: 5 },
        { icon: 'book-open-variant', title: 'Training Materials', description: 'Educational resources for members', color: '#3B82F6', files: 12 },
        { icon: 'script-text', title: 'Policy Documents', description: 'Our policies and guidelines', color: '#9333EA', files: 8 },
        { icon: 'file-pdf-box', title: 'Reports & Data', description: 'Performance reports and statistics', color: '#F59E0B', files: 15 },
        { icon: 'video-box', title: 'Video Library', description: 'Speeches and event recordings', color: '#E1306C', files: 24 },
        { icon: 'presentation', title: 'Presentations', description: 'Ready-to-use presentation templates', color: '#0891b2', files: 10 },
    ];

    return (
        <View style={styles.container}>
            {/* Same Header */}
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
                    <View style={styles.badge}><MaterialCommunityIcons name="library" size={18} color={SP_RED} /><Text style={styles.badgeText}>Resource Center</Text></View>
                    <Text style={styles.heroTitle}>Knowledge Repository</Text>
                    <Text style={styles.heroSubtitle}>Access documents, training materials, and party resources</Text>
                </View>

                <View style={styles.resourcesGrid}>
                    {resources.map((resource, index) => (
                        <Pressable key={index} style={styles.resourceCard}>
                            <View style={[styles.resourceIcon, { backgroundColor: `${resource.color}15` }]}>
                                <MaterialCommunityIcons name={resource.icon as any} size={40} color={resource.color} />
                            </View>
                            <Text style={styles.resourceTitle}>{resource.title}</Text>
                            <Text style={styles.resourceDescription}>{resource.description}</Text>
                            <View style={styles.resourceFooter}>
                                <Text style={styles.resourceFiles}>{resource.files} files</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color={resource.color} />
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
    resourcesGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 60, gap: 24 },
    resourceCard: { width: '31%', backgroundColor: '#fff', padding: 32, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    resourceIcon: { width: 80, height: 80, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    resourceTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    resourceDescription: { fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 20 },
    resourceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    resourceFiles: { fontSize: 13, color: '#64748b', fontWeight: '600' },
});
