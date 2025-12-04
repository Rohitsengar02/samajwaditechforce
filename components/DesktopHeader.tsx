import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopHeader() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [showMegaMenu, setShowMegaMenu] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            checkLoginStatus();
        }, [])
    );

    const checkLoginStatus = async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userInfo');
            await AsyncStorage.removeItem('userToken');
            setUser(null);
            router.push('/signin' as any);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <View style={styles.header}>
            <Pressable onPress={() => router.push('/desktop-screen-pages/home' as any)}>
                <Text style={styles.headerLogo}>समाजवादी टेक फ़ोर्स</Text>
            </Pressable>

            <View style={styles.navMenu}>
                <Pressable onPress={() => router.push('/desktop-screen-pages/home' as any)}><Text style={styles.navItem}>Home</Text></Pressable>
                <Pressable onPress={() => router.push('/desktop-screen-pages/news' as any)}><Text style={styles.navItem}>News</Text></Pressable>
                <Pressable onPress={() => router.push('/desktop-screen-pages/events' as any)}><Text style={styles.navItem}>Events</Text></Pressable>
                <Pressable onPress={() => router.push('/desktop-screen-pages/reels' as any)}><Text style={styles.navItem}>Reels</Text></Pressable>
                <Pressable onPress={() => router.push('/desktop-screen-pages/about' as any)}><Text style={styles.navItem}>About</Text></Pressable>
                <Pressable onPress={() => router.push('/desktop-screen-pages/volunteers' as any)}><Text style={styles.navItem}>Volunteers</Text></Pressable>
                <Pressable onPress={() => router.push('/desktop-screen-pages/daily-work' as any)}><Text style={styles.navItem}>Daily Work</Text></Pressable>

                {/* Quick Access Dropdown */}
                <View style={styles.dropdownWrapper}>
                    <Pressable
                        style={styles.dropdownTrigger}
                        onPress={() => setShowMegaMenu(!showMegaMenu)}
                    >
                        <Text style={styles.navItem}>Quick Access</Text>
                        <MaterialCommunityIcons
                            name={showMegaMenu ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#1e293b"
                        />
                    </Pressable>

                    {showMegaMenu && (
                        <View style={styles.megaMenu}>
                            <View style={styles.megaMenuGrid}>
                                <Pressable
                                    style={styles.megaMenuItem}
                                    onPress={() => { router.push('/desktop-screen-pages/posters' as any); setShowMegaMenu(false); }}
                                >
                                    <View style={[styles.megaMenuIcon, { backgroundColor: `${SP_GREEN}15` }]}>
                                        <MaterialCommunityIcons name="image-multiple" size={24} color={SP_GREEN} />
                                    </View>
                                    <View style={styles.megaMenuText}>
                                        <Text style={styles.megaMenuTitle}>Posters</Text>
                                        <Text style={styles.megaMenuSubtitle}>Download & customize</Text>
                                    </View>
                                </Pressable>

                                <Pressable
                                    style={styles.megaMenuItem}
                                    onPress={() => { router.push('/desktop-screen-pages/resources' as any); setShowMegaMenu(false); }}
                                >
                                    <View style={[styles.megaMenuIcon, { backgroundColor: `${SP_RED}15` }]}>
                                        <MaterialCommunityIcons name="folder-download" size={24} color={SP_RED} />
                                    </View>
                                    <View style={styles.megaMenuText}>
                                        <Text style={styles.megaMenuTitle}>Resources</Text>
                                        <Text style={styles.megaMenuSubtitle}>Documents & Assets</Text>
                                    </View>
                                </Pressable>

                                <Pressable
                                    style={styles.megaMenuItem}
                                    onPress={() => { router.push('/desktop-screen-pages/training' as any); setShowMegaMenu(false); }}
                                >
                                    <View style={[styles.megaMenuIcon, { backgroundColor: '#3B82F615' }]}>
                                        <MaterialCommunityIcons name="school" size={24} color="#3B82F6" />
                                    </View>
                                    <View style={styles.megaMenuText}>
                                        <Text style={styles.megaMenuTitle}>Training</Text>
                                        <Text style={styles.megaMenuSubtitle}>Learn & Grow</Text>
                                    </View>
                                </Pressable>

                                <Pressable
                                    style={styles.megaMenuItem}
                                    onPress={() => { router.push('/desktop-screen-pages/survey' as any); setShowMegaMenu(false); }}
                                >
                                    <View style={[styles.megaMenuIcon, { backgroundColor: '#3B82F615' }]}>
                                        <MaterialCommunityIcons name="clipboard-text" size={24} color="#3B82F6" />
                                    </View>
                                    <View style={styles.megaMenuText}>
                                        <Text style={styles.megaMenuTitle}>Survey</Text>
                                        <Text style={styles.megaMenuSubtitle}>Share Your Opinion</Text>
                                    </View>
                                </Pressable>

                                <Pressable
                                    style={styles.megaMenuItem}
                                    onPress={() => { router.push('/desktop-screen-pages/feedback' as any); setShowMegaMenu(false); }}
                                >
                                    <View style={[styles.megaMenuIcon, { backgroundColor: '#F59E0B15' }]}>
                                        <MaterialCommunityIcons name="message-text" size={24} color="#F59E0B" />
                                    </View>
                                    <View style={styles.megaMenuText}>
                                        <Text style={styles.megaMenuTitle}>Feedback</Text>
                                        <Text style={styles.megaMenuSubtitle}>Tell Us Your Thoughts</Text>
                                    </View>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.headerActions}>
                <Text style={styles.langSwitch}>EN</Text>
                {user ? (
                    <Pressable style={styles.profileBtn} onPress={() => router.push('/(tabs)/profile' as any)}>
                        <Image
                            source={{ uri: user.photo || 'https://avatar.iran.liara.run/public' }}
                            style={styles.avatar}
                        />
                        <Text style={styles.profileName}>{user.name?.split(' ')[0] || 'User'}</Text>
                    </Pressable>
                ) : (
                    <>
                        <Pressable onPress={() => router.push('/signin' as any)}><Text style={styles.loginBtn}>Login</Text></Pressable>
                        <Pressable style={styles.signupBtn} onPress={() => router.push('/joinus' as any)}><Text style={styles.signupBtnText}>Join Us</Text></Pressable>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 60, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', zIndex: 1000, position: 'relative' },
    headerLogo: { fontSize: 24, fontWeight: '900', color: SP_RED },
    navMenu: { flexDirection: 'row', alignItems: 'center', gap: 32 },
    navItem: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    langSwitch: { fontSize: 14, fontWeight: '600', color: '#64748b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
    loginBtn: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    signupBtn: { backgroundColor: SP_RED, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    profileBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4, paddingRight: 12, borderRadius: 30, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    avatar: { width: 32, height: 32, borderRadius: 16 },
    profileName: { fontSize: 14, fontWeight: '600', color: '#334155' },
    dropdownWrapper: { position: 'relative', zIndex: 2000 },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    megaMenu: { position: 'absolute', top: '100%', left: -100, width: 600, backgroundColor: '#fff', borderRadius: 16, padding: 24, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    megaMenuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    megaMenuItem: { width: '48%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 16 },
    megaMenuIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    megaMenuText: { flex: 1 },
    megaMenuTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
    megaMenuSubtitle: { fontSize: 13, color: '#64748b' },
});
