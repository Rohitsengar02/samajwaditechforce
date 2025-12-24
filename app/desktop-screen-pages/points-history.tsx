import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DesktopHeader from '../../components/DesktopHeader';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function PointsHistory() {
    const router = useRouter();
    const [activities, setActivities] = useState<any[]>([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPointsHistory();
    }, []);

    // Auto-refresh when page comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadPointsHistory();
        }, [])
    );

    const loadPointsHistory = async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            const token = await AsyncStorage.getItem('userToken');

            if (userInfo) {
                const user = JSON.parse(userInfo);
                const name = user.name || 'Guest';
                setUsername(name);

                const url = getApiUrl();

                // Fetch fresh user data to get latest points
                if (token) {
                    const userResponse = await fetch(`${url}/auth/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (userResponse.ok) {
                        const freshUser = await userResponse.json();
                        setTotalPoints(freshUser.points || 0);

                        // Update AsyncStorage with latest points
                        const updatedUser = { ...user, points: freshUser.points || 0 };
                        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
                        console.log('Points history loaded:', {
                            totalPoints: freshUser.points || 0,
                            username: name
                        });
                    }
                }

                // Fetch activities
                const res = await fetch(`${url}/points/history/${name}`);
                const data = await res.json();

                if (data.success) {
                    setActivities(data.data);
                }
            }
        } catch (error) {
            console.error('Error loading points:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadPointsHistory();
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'like': return 'heart';
            case 'comment': return 'comment';
            case 'share': return 'share';
            case 'post_created': return 'file-document';
            case 'reel_upload': return 'video';
            case 'profile_complete': return 'account-check';
            case 'daily_login': return 'calendar-check';
            default: return 'star';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'like': return SP_RED;
            case 'comment': return '#2196F3';
            case 'share': return SP_GREEN;
            default: return '#FFA726';
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <DesktopHeader />
                <View style={styles.loadingContainer}>
                    <Text>Loading Points History...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <DesktopHeader />

            <ScrollView
                style={styles.content}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Points</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                        <MaterialCommunityIcons name="refresh" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Total Points Card */}
                <View style={styles.totalPointsCard}>
                    <MaterialCommunityIcons name="star" size={48} color="#FFD700" />
                    <Text style={styles.totalPointsLabel}>Total Points</Text>
                    <Text style={styles.totalPointsValue}>{totalPoints}</Text>
                    <Text style={styles.username}>@{username}</Text>
                </View>

                {/* Points Breakdown */}
                <View style={styles.breakdownCard}>
                    <Text style={styles.sectionTitle}>How to Earn Points</Text>
                    <View style={styles.breakdownItem}>
                        <MaterialCommunityIcons name="heart" size={20} color={SP_RED} />
                        <Text style={styles.breakdownText}>Like a reel: +5 points</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                        <MaterialCommunityIcons name="comment" size={20} color="#2196F3" />
                        <Text style={styles.breakdownText}>Comment on reel: +10 points</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                        <MaterialCommunityIcons name="share" size={20} color={SP_GREEN} />
                        <Text style={styles.breakdownText}>Share a reel: +10 points</Text>
                    </View>
                </View>

                {/* Activity History */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
                            <View key={index} style={styles.activityItem}>
                                <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.activityType) }]}>
                                    <MaterialCommunityIcons
                                        name={getActivityIcon(activity.activityType)}
                                        size={24}
                                        color="#fff"
                                    />
                                </View>
                                <View style={styles.activityDetails}>
                                    <Text style={styles.activityDescription}>{activity.description}</Text>
                                    <Text style={styles.activityTime}>
                                        {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.activityPoints,
                                    activity.points < 0 && styles.negativePoints
                                ]}>
                                    {activity.points > 0 ? '+' : ''}{activity.points}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noActivity}>No activity yet. Start interacting with reels to earn points!</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: SP_RED,
    },
    backButton: {
        marginRight: 16,
    },
    refreshButton: {
        marginLeft: 'auto',
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    totalPointsCard: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    totalPointsLabel: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    totalPointsValue: {
        fontSize: 48,
        fontWeight: '700',
        color: SP_RED,
        marginTop: 8,
    },
    username: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    breakdownCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    breakdownText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 12,
    },
    historySection: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityDetails: {
        flex: 1,
    },
    activityDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#999',
    },
    activityPoints: {
        fontSize: 18,
        fontWeight: '700',
        color: SP_GREEN,
    },
    negativePoints: {
        color: '#f44336', // Red for negative points
    },
    noActivity: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        paddingVertical: 32,
    },
});
