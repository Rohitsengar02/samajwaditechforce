import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopDailyWork() {
    const router = useRouter();
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/tasks`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setTasks(data.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Demo data
            setTasks([
                { id: 1, title: 'समाजवादी पोस्ट शेयर करें', description: 'आज का पार्टी अपडेट सोशल मीडिया पर शेयर करें', points: 10, status: 'pending', deadline: '2024-12-03' },
                { id: 2, title: 'सर्वे फॉर्म भरें', description: 'अपने क्षेत्र का जन सर्वे फॉर्म कम्प्लीट करें', points: 25, status: 'pending', deadline: '2024-12-04' },
                { id: 3, title: 'व्हाट्सएप ग्रुप मैसेज फॉरवर्ड', description: 'पार्टी का आधिकारिक मैसेज 5 ग्रुप में फॉरवर्ड करें', points: 5, status: 'completed', deadline: '2024-12-02' },
                { id: 4, title: 'इवेंट फोटो अपलोड', description: 'कल की रैली की 3 फोटो अपलोड करें', points: 15, status: 'completed', deadline: '2024-12-01' },
                { id: 5, title: 'वोटर लिस्ट वेरिफाई', description: 'अपनी बूथ की वोटर लिस्ट चेक करें', points: 20, status: 'pending', deadline: '2024-12-05' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        points: tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.points || 0), 0),
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
                    <View style={styles.badge}><MaterialCommunityIcons name="calendar-check" size={18} color={SP_RED} /><Text style={styles.badgeText}>Daily Tasks</Text></View>
                    <Text style={styles.heroTitle}>आज के कार्य</Text>
                    <Text style={styles.heroSubtitle}>अपने दैनिक कार्य पूरे करें और अंक अर्जित करें</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsSection}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="format-list-checks" size={32} color={SP_RED} />
                            <Text style={styles.statNumber}>{stats.total}</Text>
                            <Text style={styles.statLabel}>कुल कार्य</Text>
                        </View>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="check-circle" size={32} color={SP_GREEN} />
                            <Text style={styles.statNumber}>{stats.completed}</Text>
                            <Text style={styles.statLabel}>पूर्ण</Text>
                        </View>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="clock-outline" size={32} color="#F59E0B" />
                            <Text style={styles.statNumber}>{stats.pending}</Text>
                            <Text style={styles.statLabel}>बाकी</Text>
                        </View>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="star" size={32} color="#FFD700" />
                            <Text style={styles.statNumber}>{stats.points}</Text>
                            <Text style={styles.statLabel}>अंक</Text>
                        </View>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterSection}>
                    <View style={styles.filterTabs}>
                        <Pressable style={[styles.filterTab, filter === 'all' && styles.filterTabActive]} onPress={() => setFilter('all')}>
                            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>सभी कार्य</Text>
                        </Pressable>
                        <Pressable style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]} onPress={() => setFilter('pending')}>
                            <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>बाकी कार्य</Text>
                        </Pressable>
                        <Pressable style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]} onPress={() => setFilter('completed')}>
                            <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>पूर्ण कार्य</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Tasks List */}
                {loading ? (
                    <ActivityIndicator size="large" color={SP_RED} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.tasksSection}>
                        {filteredTasks.map((task) => (
                            <Pressable key={task.id} style={styles.taskCard}>
                                <View style={styles.taskHeader}>
                                    <View style={[styles.statusBadge, task.status === 'completed' ? styles.statusCompleted : styles.statusPending]}>
                                        <MaterialCommunityIcons
                                            name={task.status === 'completed' ? 'check-circle' : 'clock-outline'}
                                            size={16}
                                            color={task.status === 'completed' ? SP_GREEN : '#F59E0B'}
                                        />
                                        <Text style={[styles.statusText, task.status === 'completed' ? styles.statusTextCompleted : styles.statusTextPending]}>
                                            {task.status === 'completed' ? 'पूर्ण' : 'बाकी'}
                                        </Text>
                                    </View>
                                    <View style={styles.pointsBadge}>
                                        <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                                        <Text style={styles.pointsText}>{task.points} अंक</Text>
                                    </View>
                                </View>
                                <Text style={styles.taskTitle}>{task.title}</Text>
                                <Text style={styles.taskDescription}>{task.description}</Text>
                                <View style={styles.taskFooter}>
                                    <View style={styles.deadlineBox}>
                                        <MaterialCommunityIcons name="calendar" size={16} color="#64748b" />
                                        <Text style={styles.deadlineText}>{task.deadline}</Text>
                                    </View>
                                    {task.status === 'pending' && (
                                        <Pressable style={styles.completeBtn}>
                                            <Text style={styles.completeBtnText}>पूर्ण करें</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </Pressable>
                        ))}

                        {filteredTasks.length === 0 && (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="clipboard-check-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyTitle}>कोई कार्य नहीं</Text>
                                <Text style={styles.emptyText}>फ़िल्टर बदलकर देखें</Text>
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
    statsSection: { paddingHorizontal: 60, paddingVertical: 40, backgroundColor: '#fff' },
    statsRow: { flexDirection: 'row', gap: 24 },
    statCard: { flex: 1, backgroundColor: '#f8f9fa', padding: 32, borderRadius: 16, alignItems: 'center' },
    statNumber: { fontSize: 32, fontWeight: '900', color: '#1e293b', marginTop: 12, marginBottom: 4 },
    statLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    filterSection: { paddingHorizontal: 60, paddingVertical: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    filterTabs: { flexDirection: 'row', gap: 16 },
    filterTab: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9' },
    filterTabActive: { backgroundColor: SP_RED },
    filterTabText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
    filterTabTextActive: { color: '#fff' },
    tasksSection: { padding: 60, gap: 20 },
    taskCard: { backgroundColor: '#fff', padding: 28, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    statusCompleted: { backgroundColor: `${SP_GREEN}15` },
    statusPending: { backgroundColor: '#FEF3C7' },
    statusText: { fontSize: 13, fontWeight: '600' },
    statusTextCompleted: { color: SP_GREEN },
    statusTextPending: { color: '#F59E0B' },
    pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    pointsText: { fontSize: 13, fontWeight: '700', color: '#92400E' },
    taskTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    taskDescription: { fontSize: 15, color: '#64748b', lineHeight: 22, marginBottom: 20 },
    taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    deadlineBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    deadlineText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    completeBtn: { backgroundColor: SP_RED, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
    completeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    emptyState: { alignItems: 'center', padding: 60 },
    emptyTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 16, color: '#64748b' },
});
