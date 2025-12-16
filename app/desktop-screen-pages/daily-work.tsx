import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, Modal, Image, TextInput, Alert, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { getApiUrl } from '../../utils/api';

import DesktopHeader from '../../components/DesktopHeader';

// Import the JSON data
// Removed as API now handles volunteers

const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const { width } = Dimensions.get('window');

interface Task {
    _id: string; // Unified ID type
    id?: string; // Fallback
    title: string;
    description: string;
    type: string;
    points: number;
    deadline?: string;
    status: string;
    linkToShare?: string;
    completed?: boolean;
}

interface LeaderboardUser {
    _id: string;
    name: string;
    profileImage?: string;
    district?: string;
    points: number;
    rank?: number;
    isUser?: boolean;
}

export default function DesktopDailyWork() {
    const router = useRouter();

    // View State
    const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard'>('tasks');

    // Tasks State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed

    // Leaderboard State
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    // Task Submission Modal State
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [submissionText, setSubmissionText] = useState('');
    const [submissionImage, setSubmissionImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if (activeTab === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [activeTab]);

    // --- API Calls ---

    const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = getApiUrl();
            const res = await fetch(`${url}/tasks`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setTasks(data.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Keeping partial demo data for fallback/dev
            setTasks([
                { _id: '1', title: 'समाजवादी पोस्ट शेयर करें', description: 'आज का पार्टी अपडेट सोशल मीडिया पर शेयर करें', points: 10, status: 'pending', deadline: '2024-12-03', type: 'Social Media' },
                { _id: '2', title: 'सर्वे फॉर्म भरें', description: 'अपने क्षेत्र का जन सर्वे फॉर्म कम्प्लीट करें', points: 25, status: 'pending', deadline: '2024-12-04', type: 'Field Work' },
                { _id: '3', title: 'व्हाट्सएप ग्रुप मैसेज फॉरवर्ड', description: 'पार्टी का आधिकारिक मैसेज 5 ग्रुप में फॉरवर्ड करें', points: 5, status: 'Completed', deadline: '2024-12-02', type: 'Social Media' },
            ]);
        } finally {
            setLoadingTasks(false);
        }
    };

    const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = getApiUrl();

            // Fetch Current User Profile to identify "You"
            const profileRes = await fetch(`${url}/auth/profile`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const profileData = await profileRes.json();
            const currentUserId = profileData?._id;

            // Fetch Leaderboard
            const leaderboardRes = await fetch(`${url}/auth/leaderboard`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await leaderboardRes.json();
            // let apiUsers: LeaderboardUser[] = []; // Removed

            if (Array.isArray(data)) {
                const allUsers = data.map((user: any) => ({
                    _id: user._id,
                    name: user.name,
                    profileImage: user.profileImage,
                    district: user.district || 'Unknown District',
                    points: user.points || 0,
                    isUser: user._id === currentUserId
                }));

                // Assign Ranks
                const finalData = allUsers.map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));

                setLeaderboardData(finalData);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleSubmitTask = async () => {
        if (!selectedTask) return;
        if (!submissionImage) {
            Alert.alert('Error', 'Please upload proof of your work.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = getApiUrl();
            const taskId = selectedTask._id || selectedTask.id;

            const response = await fetch(`${url}/tasks/${taskId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    comment: submissionText,
                    proofImage: submissionImage
                })
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', `Task submitted! You earned ${data.pointsEarned} points.`);
                setModalVisible(false);
                setSubmissionImage(null);
                setSubmissionText('');
                fetchTasks(); // Refresh tasks
            } else {
                Alert.alert('Error', data.message || 'Failed to submit task');
            }
        } catch (error) {
            console.error('Error submitting task:', error);
            Alert.alert('Error', 'Failed to submit task');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Helpers ---

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setSubmissionImage(result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : result.assets[0].uri);
        }
    };

    const openTaskModal = (task: Task) => {
        setSelectedTask(task);
        setSubmissionText('');
        setSubmissionImage(null);
        setModalVisible(true);
    };

    // --- Filter Logic ---

    const getStatus = (t: Task) => {
        // Normalize status checking
        const s = t.status?.toLowerCase();
        return (s === 'completed' || t.completed) ? 'completed' : 'pending';
    };

    const filteredTasks = tasks.filter(task => {
        const normalizedStatus = getStatus(task);
        if (filter === 'all') return true;
        return normalizedStatus === filter;
    });

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => getStatus(t) === 'completed').length,
        pending: tasks.filter(t => getStatus(t) === 'pending').length,
        points: tasks.filter(t => getStatus(t) === 'completed').reduce((sum, t) => sum + (t.points || 0), 0),
    };

    // --- Leaderboard Components ---

    const firstPlace = leaderboardData[0];
    const secondPlace = leaderboardData[1];
    const thirdPlace = leaderboardData[2];
    const restOfList = leaderboardData.slice(3);

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.badge}><MaterialCommunityIcons name="calendar-check" size={18} color={SP_RED} /><Text style={styles.badgeText}>Daily Activities</Text></View>
                    <Text style={styles.heroTitle}>दैनिक कार्य और लीडरबोर्ड</Text>
                    <Text style={styles.heroSubtitle}>सक्रिय रहें, कार्य पूरे करें और लीडरबोर्ड पर अपना स्थान बनाएँ</Text>

                    {/* Main Tabs */}
                    <View style={styles.mainTabs}>
                        <Pressable
                            style={[styles.mainTab, activeTab === 'tasks' && styles.mainTabActive]}
                            onPress={() => setActiveTab('tasks')}
                        >
                            <MaterialCommunityIcons name="format-list-checks" size={20} color={activeTab === 'tasks' ? '#fff' : '#64748b'} />
                            <Text style={[styles.mainTabText, activeTab === 'tasks' && { color: '#fff' }]}>Daily Tasks</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.mainTab, activeTab === 'leaderboard' && styles.mainTabActive]}
                            onPress={() => setActiveTab('leaderboard')}
                        >
                            <MaterialCommunityIcons name="trophy" size={20} color={activeTab === 'leaderboard' ? '#fff' : '#64748b'} />
                            <Text style={[styles.mainTabText, activeTab === 'leaderboard' && { color: '#fff' }]}>Leaderboard</Text>
                        </Pressable>
                    </View>
                </View>

                {/* --- CONTENT AREA --- */}

                {activeTab === 'tasks' ? (
                    <View>
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
                        {loadingTasks ? (
                            <ActivityIndicator size="large" color={SP_RED} style={{ marginTop: 50 }} />
                        ) : (
                            <View style={styles.tasksSection}>
                                {filteredTasks.map((task, index) => {
                                    const status = getStatus(task);
                                    return (
                                        <View key={task._id || index} style={styles.taskCard}>
                                            <View style={styles.taskHeader}>
                                                <View style={[styles.statusBadge, status === 'completed' ? styles.statusCompleted : styles.statusPending]}>
                                                    <MaterialCommunityIcons
                                                        name={status === 'completed' ? 'check-circle' : 'clock-outline'}
                                                        size={16}
                                                        color={status === 'completed' ? SP_GREEN : '#F59E0B'}
                                                    />
                                                    <Text style={[styles.statusText, status === 'completed' ? styles.statusTextCompleted : styles.statusTextPending]}>
                                                        {status === 'completed' ? 'पूर्ण' : 'बाकी'}
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
                                                    <Text style={styles.deadlineText}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline'}</Text>
                                                </View>
                                                {status === 'pending' && (
                                                    <Pressable style={styles.completeBtn} onPress={() => openTaskModal(task)}>
                                                        <Text style={styles.completeBtnText}>पूर्ण करें</Text>
                                                    </Pressable>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}

                                {filteredTasks.length === 0 && (
                                    <View style={styles.emptyState}>
                                        <MaterialCommunityIcons name="clipboard-check-outline" size={64} color="#cbd5e1" />
                                        <Text style={styles.emptyTitle}>कोई कार्य नहीं</Text>
                                        <Text style={styles.emptyText}>फ़िल्टर बदलकर देखें</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                ) : (
                    // --- LEADERBOARD TAB ---
                    <View style={styles.leaderboardContainer}>
                        {loadingLeaderboard ? (
                            <ActivityIndicator size="large" color={SP_RED} style={{ marginTop: 50 }} />
                        ) : (
                            <>
                                <LinearGradient colors={[SP_RED, '#b91c1c']} style={styles.podiumSection}>
                                    <View style={styles.podiumContainer}>
                                        {/* Second Place */}
                                        <View style={[styles.podiumItem, styles.podiumSecond]}>
                                            {secondPlace ? (
                                                <>
                                                    <View style={styles.avatarContainer}>
                                                        <Image source={{ uri: secondPlace.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }} style={styles.podiumAvatar} />
                                                        <View style={[styles.rankBadge, { backgroundColor: '#C0C0C0' }]}><Text style={styles.rankBadgeText}>2</Text></View>
                                                    </View>
                                                    <Text style={styles.podiumName} numberOfLines={1}>{secondPlace.name}</Text>
                                                    <Text style={styles.podiumPoints}>{secondPlace.points} pts</Text>
                                                    <View style={[styles.podiumBar, { height: 100, backgroundColor: 'rgba(255,255,255,0.15)' }]} />
                                                </>
                                            ) : <View style={{ height: 140 }} />}
                                        </View>

                                        {/* First Place */}
                                        <View style={[styles.podiumItem, styles.podiumFirst]}>
                                            {firstPlace ? (
                                                <>
                                                    <MaterialCommunityIcons name="crown" size={32} color="#FFD700" style={styles.crown} />
                                                    <View style={styles.avatarContainer}>
                                                        <Image source={{ uri: firstPlace.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }} style={[styles.podiumAvatar, styles.avatarFirst]} />
                                                        <View style={[styles.rankBadge, { backgroundColor: '#FFD700', bottom: -5 }]}><Text style={styles.rankBadgeText}>1</Text></View>
                                                    </View>
                                                    <Text style={[styles.podiumName, styles.nameFirst]} numberOfLines={1}>{firstPlace.name}</Text>
                                                    <Text style={[styles.podiumPoints, styles.pointsFirst]}>{firstPlace.points} pts</Text>
                                                    <View style={[styles.podiumBar, { height: 130, backgroundColor: 'rgba(255,255,255,0.25)' }]} />
                                                </>
                                            ) : <View style={{ height: 160 }} />}
                                        </View>

                                        {/* Third Place */}
                                        <View style={[styles.podiumItem, styles.podiumThird]}>
                                            {thirdPlace ? (
                                                <>
                                                    <View style={styles.avatarContainer}>
                                                        <Image source={{ uri: thirdPlace.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }} style={styles.podiumAvatar} />
                                                        <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}><Text style={styles.rankBadgeText}>3</Text></View>
                                                    </View>
                                                    <Text style={styles.podiumName} numberOfLines={1}>{thirdPlace.name}</Text>
                                                    <Text style={styles.podiumPoints}>{thirdPlace.points} pts</Text>
                                                    <View style={[styles.podiumBar, { height: 80, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                                                </>
                                            ) : <View style={{ height: 120 }} />}
                                        </View>
                                    </View>
                                </LinearGradient>

                                <View style={styles.leaderboardList}>
                                    {restOfList.map((user) => (
                                        <View key={user._id} style={[styles.rankRow, user.isUser && styles.userRow]}>
                                            <View style={styles.rankNumberContainer}>
                                                <Text style={[styles.rankNumber, user.rank && user.rank <= 10 ? styles.topRank : null]}>#{user.rank}</Text>
                                            </View>
                                            <Image source={{ uri: user.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }} style={styles.listAvatar} />
                                            <View style={styles.userInfo}>
                                                <Text style={[styles.userName, user.isUser && styles.userText]} numberOfLines={1}>{user.name} {user.isUser && '(You)'}</Text>
                                                <Text style={styles.userDistrict} numberOfLines={1}>{user.district}</Text>
                                            </View>
                                            <View style={styles.pointsContainer}>
                                                <Text style={styles.userPoints}>{user.points}</Text>
                                                <Text style={styles.ptsLabel}>pts</Text>
                                            </View>
                                        </View>
                                    ))}
                                    {leaderboardData.length === 0 && (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyText}>No participants yet</Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* TASK SUBMISSION MODAL */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Submit Task</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalBody}>
                            <View style={styles.modalTaskInfo}>
                                <Text style={styles.modalTaskTitle}>{selectedTask?.title}</Text>
                                <View style={styles.modalPointsTag}>
                                    <MaterialCommunityIcons name="star" size={14} color="#B45309" />
                                    <Text style={styles.modalPointsText}>{selectedTask?.points} Points</Text>
                                </View>
                            </View>
                            <Text style={styles.modalTaskDesc}>{selectedTask?.description}</Text>

                            <Text style={styles.sectionTitle}>Proof of Work</Text>

                            {/* Image Upload */}
                            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                                {submissionImage ? (
                                    <View style={styles.filePreview}>
                                        <Image source={{ uri: submissionImage }} style={{ width: 200, height: 200, borderRadius: 10, marginBottom: 10 }} resizeMode="cover" />
                                        <Text style={styles.changeText}>Tap to change</Text>
                                    </View>
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="cloud-upload" size={32} color="#94a3b8" />
                                        <Text style={styles.uploadText}>Upload Screenshot / Photo</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Description Input */}
                            <Text style={styles.label}>Add a Note</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Describe what you did..."
                                multiline
                                numberOfLines={3}
                                value={submissionText}
                                onChangeText={setSubmissionText}
                                textAlignVertical="top"
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                                onPress={handleSubmitTask}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitText}>Submit Task</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },

    // Hero & Tabs
    hero: { backgroundColor: '#fef2f2', paddingHorizontal: 60, paddingVertical: 60 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
    badgeText: { fontSize: 14, color: SP_RED, fontWeight: '600' },
    heroTitle: { fontSize: 42, fontWeight: '900', color: '#1e293b', marginBottom: 12 },
    heroSubtitle: { fontSize: 18, color: '#64748b', marginBottom: 32 },
    mainTabs: { flexDirection: 'row', gap: 12 },
    mainTab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    mainTabActive: { backgroundColor: SP_RED, borderColor: SP_RED },
    mainTabText: { fontSize: 16, fontWeight: '700', color: '#64748b' },

    // Tasks 
    statsSection: { paddingHorizontal: 60, paddingVertical: 40, backgroundColor: '#fff' },
    statsRow: { flexDirection: 'row', gap: 24 },
    statCard: { flex: 1, backgroundColor: '#f8f9fa', padding: 24, borderRadius: 16, alignItems: 'center' },
    statNumber: { fontSize: 32, fontWeight: '900', color: '#1e293b', marginTop: 8, marginBottom: 4 },
    statLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },

    filterSection: { paddingHorizontal: 60, paddingVertical: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    filterTabs: { flexDirection: 'row', gap: 16 },
    filterTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9' },
    filterTabActive: { backgroundColor: SP_RED },
    filterTabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    filterTabTextActive: { color: '#fff' },

    tasksSection: { padding: 60, gap: 20 },
    taskCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusCompleted: { backgroundColor: `${SP_GREEN}15` },
    statusPending: { backgroundColor: '#FEF3C7' },
    statusText: { fontSize: 13, fontWeight: '600' },
    statusTextCompleted: { color: SP_GREEN },
    statusTextPending: { color: '#F59E0B' },
    pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pointsText: { fontSize: 13, fontWeight: '700', color: '#92400E' },
    taskTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    taskDescription: { fontSize: 15, color: '#64748b', lineHeight: 22, marginBottom: 20 },
    taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    deadlineBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    deadlineText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    completeBtn: { backgroundColor: SP_RED, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
    completeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

    // Leaderboard
    leaderboardContainer: { flex: 1 },
    podiumSection: { paddingVertical: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    podiumContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 20, height: 260 },
    podiumItem: { alignItems: 'center', width: 100 },
    podiumFirst: { marginBottom: 0, zIndex: 10 },
    podiumSecond: { marginBottom: 0 },
    podiumThird: { marginBottom: 0 },
    crown: { marginBottom: -10, zIndex: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 8, position: 'relative' },
    podiumAvatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#fff' },
    avatarFirst: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#FFD700' },
    rankBadge: { position: 'absolute', bottom: -8, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    rankBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    podiumName: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginBottom: 2, textAlign: 'center' },
    nameFirst: { fontSize: 15, fontWeight: '700', color: '#fff' },
    podiumPoints: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginBottom: 8 },
    pointsFirst: { fontSize: 14, color: '#FFD700' },
    podiumBar: { width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12 },

    leaderboardList: { padding: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
    rankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    userRow: { borderWidth: 2, borderColor: SP_RED, backgroundColor: '#fff1f2' },
    rankNumberContainer: { width: 40, alignItems: 'center' },
    rankNumber: { fontSize: 16, fontWeight: '700', color: '#94a3b8' },
    topRank: { color: '#1e293b', fontWeight: '900' },
    listAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16, backgroundColor: '#f1f5f9' },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    userText: { color: SP_RED },
    userDistrict: { fontSize: 13, color: '#64748b' },
    pointsContainer: { alignItems: 'flex-end', minWidth: 60 },
    userPoints: { fontSize: 18, fontWeight: '800', color: SP_RED },
    ptsLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: 500, maxHeight: '90%', backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    modalBody: { padding: 24 },
    modalTaskInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    modalTaskTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', flex: 1, marginRight: 16 },
    modalPointsTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fffbeb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#fcd34d' },
    modalPointsText: { fontSize: 12, fontWeight: '700', color: '#b45309' },
    modalTaskDesc: { fontSize: 15, color: '#64748b', lineHeight: 24, marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
    uploadArea: { borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', borderRadius: 16, padding: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: '#f8fafc' },
    uploadText: { fontSize: 15, fontWeight: '600', color: '#64748b', marginTop: 8 },
    filePreview: { alignItems: 'center' },
    changeText: { color: SP_RED, fontSize: 13, fontWeight: '600' },
    label: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 15, minHeight: 80, marginBottom: 8 },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 24, paddingTop: 0 },
    cancelButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    cancelButtonText: { color: '#64748b', fontWeight: '600', fontSize: 15 },
    submitButton: { backgroundColor: SP_RED, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    submitText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    disabledButton: { opacity: 0.7 },

    emptyState: { alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 16 },
    emptyText: { fontSize: 15, color: '#64748b' },
});
