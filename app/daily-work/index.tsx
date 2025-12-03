import React, { useRef, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Alert, ActivityIndicator, Linking } from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LEADERBOARD } from '@/constants/dailyWorkData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

interface Task {
    _id: string;
    title: string;
    description: string;
    type: string;
    points: number;
    deadline?: string;
    status: string;
    linkToShare?: string;
    platform?: string;
    completed?: boolean;
}

interface LeaderboardUser {
    _id: string;
    name: string;
    avatar: string;
    district: string;
    points: number;
    rank: number;
    isUser: boolean;
}

export default function DailyWorkScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [userPoints, setUserPoints] = useState(0);
    const [completedTasksCount, setCompletedTasksCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = getApiUrl();

            // Fetch User Data for Points
            const userRes = await fetch(`${url}/auth/profile`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const userData = await userRes.json();
            if (userData && userData.points !== undefined) {
                setUserPoints(userData.points);
            }

            // Fetch Tasks
            const tasksRes = await fetch(`${url}/tasks`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const tasksData = await tasksRes.json();

            // Fetch Completed Tasks
            const completedRes = await fetch(`${url}/tasks/my-completed`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const completedData = await completedRes.json();
            const completedTaskIds = completedData.data || [];

            setCompletedTasksCount(completedTaskIds.length);

            if (tasksData.data) {
                // Filter out tasks that are already completed
                const activeTasks = tasksData.data.filter((t: Task) =>
                    t.status === 'Active' && !completedTaskIds.includes(t._id)
                );
                setTasks(activeTasks);
            }

            // Fetch Leaderboard for Preview
            const leaderboardRes = await fetch(`${url}/auth/leaderboard`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const lbData = await leaderboardRes.json();
            if (Array.isArray(lbData)) {
                const formattedLb = lbData.map((user: any, index: number) => ({
                    _id: user._id,
                    name: user.name,
                    avatar: user.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png',
                    district: user.district || 'Unknown',
                    points: user.points || 0,
                    rank: index + 1,
                    isUser: user._id === userData._id
                }));
                setLeaderboardData(formattedLb);

                // Find user rank
                const currentUserRank = formattedLb.find((u: LeaderboardUser) => u.isUser);
                if (currentUserRank) {
                    setUserRank(currentUserRank.rank);
                }
            }
        } catch (error) {
            console.error('Error fetching daily work data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskPress = (task: Task) => {
        router.push(`/daily-work/task/${task._id}` as any);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Header */}
                    <LinearGradient
                        colors={[SP_RED, '#b91c1c']}
                        style={styles.header}
                    >
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Daily Digital Work</Text>
                            <TouchableOpacity onPress={() => router.push('/daily-work/leaderboard' as any)}>
                                <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
                            </TouchableOpacity>
                        </View>

                        {/* Score Card */}
                        <View style={styles.scoreCard}>
                            <View style={styles.scoreRow}>
                                <View>
                                    <Text style={styles.scoreLabel}>Your Points</Text>
                                    <Text style={styles.scoreValue}>{userPoints}</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.scoreLabel}>Completed</Text>
                                    <Text style={styles.scoreValue}>{completedTasksCount}</Text>
                                </View>
                                <View style={styles.rankContainer}>
                                    <Text style={styles.rankLabel}>Rank</Text>
                                    <Text style={styles.rankValue}>#{userRank || '-'}</Text>
                                </View>
                            </View>
                            <View style={styles.progressContainer}>
                                <Text style={styles.progressText}>Next Reward: 1000 pts</Text>
                                <ProgressBar progress={Math.min(userPoints / 1000, 1)} color="#FFD700" style={styles.progressBar} />
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Tasks Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Today's Tasks</Text>
                        {loading ? (
                            <ActivityIndicator size="large" color={SP_RED} />
                        ) : (
                            <View style={styles.tasksList}>
                                {tasks.length === 0 ? (
                                    <Text style={{ textAlign: 'center', color: '#666' }}>No active tasks for today.</Text>
                                ) : (
                                    tasks.map((task, index) => (
                                        <TouchableOpacity
                                            key={task._id}
                                            style={styles.taskCard}
                                            onPress={() => handleTaskPress(task)}
                                            activeOpacity={0.9}
                                        >
                                            <View style={styles.taskIconContainer}>
                                                <MaterialCommunityIcons
                                                    name={task.type === 'Social Media' ? 'share-variant' : 'checkbox-marked-circle-outline'}
                                                    size={28}
                                                    color={SP_RED}
                                                />
                                            </View>
                                            <View style={styles.taskContent}>
                                                <Text style={styles.taskTitle}>{task.title}</Text>
                                                <Text style={styles.taskPoints}>+{task.points} pts</Text>
                                                <View style={styles.taskMeta}>
                                                    <View style={[styles.statusBadge, styles.pendingBadge]}>
                                                        <Text style={[styles.statusText, styles.pendingText]}>
                                                            {task.status}
                                                        </Text>
                                                    </View>
                                                    {task.deadline && (
                                                        <Text style={styles.deadlineText}>
                                                            {new Date(task.deadline).toLocaleDateString()}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        )}
                    </View>

                    {/* Leaderboard Preview */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Top Performers</Text>
                            <TouchableOpacity onPress={() => router.push('/daily-work/leaderboard' as any)}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.leaderboardPreview}>
                            {leaderboardData.length > 0 ? (
                                leaderboardData.slice(0, 3).map((user, index) => (
                                    <View key={index} style={styles.leaderboardRow}>
                                        <Text style={styles.rankNumber}>{user.rank}</Text>
                                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>{user.name}</Text>
                                            <Text style={styles.userDistrict}>{user.district}</Text>
                                        </View>
                                        <Text style={styles.userPoints}>{user.points} pts</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ textAlign: 'center', color: '#666', padding: 20 }}>Loading leaderboard...</Text>
                            )}
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    scoreCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    scoreLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
    scoreValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
    },
    rankContainer: {
        alignItems: 'flex-end',
    },
    rankLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
    rankValue: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: '900',
    },
    progressContainer: {
        gap: 8,
    },
    progressText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    viewAllText: {
        color: SP_RED,
        fontWeight: '700',
        fontSize: 14,
    },
    tasksList: {
        gap: 12,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    taskIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    taskPoints: {
        fontSize: 14,
        fontWeight: '700',
        color: SP_GREEN,
        marginBottom: 8,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    completedBadge: {
        backgroundColor: '#dcfce7',
    },
    pendingBadge: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    completedText: {
        color: '#166534',
    },
    pendingText: {
        color: '#991b1b',
    },
    deadlineText: {
        fontSize: 12,
        color: '#64748b',
    },
    leaderboardPreview: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    rankNumber: {
        width: 30,
        fontSize: 16,
        fontWeight: '800',
        color: '#64748b',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    userDistrict: {
        fontSize: 12,
        color: '#64748b',
    },
    userPoints: {
        fontSize: 14,
        fontWeight: '700',
        color: SP_RED,
    },
});
