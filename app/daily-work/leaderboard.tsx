import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const { width } = Dimensions.get('window');

interface LeaderboardUser {
    _id: string;
    name: string;
    profileImage?: string;
    district?: string;
    points: number;
    rank?: number;
    isUser?: boolean;
}

export default function LeaderboardScreen() {
    const router = useRouter();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = getApiUrl();

            // Fetch Current User Profile to identify "You"
            const profileRes = await fetch(`${url}/auth/profile`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const profileData = await profileRes.json();
            if (profileData && profileData._id) {
                setCurrentUserId(profileData._id);
            }

            // Fetch Leaderboard
            const leaderboardRes = await fetch(`${url}/auth/leaderboard`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await leaderboardRes.json();

            if (Array.isArray(data)) {
                const formattedData = data.map((user: any, index: number) => ({
                    _id: user._id,
                    name: user.name,
                    profileImage: user.profileImage,
                    district: user.district || 'Unknown District',
                    points: user.points || 0,
                    rank: index + 1,
                    isUser: user._id === profileData._id
                }));
                setLeaderboardData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            Alert.alert('Error', 'Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={SP_RED} />
            </View>
        );
    }

    const firstPlace = leaderboardData[0];
    const secondPlace = leaderboardData[1];
    const thirdPlace = leaderboardData[2];
    const restOfList = leaderboardData.slice(3);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[SP_RED, '#b91c1c', '#991b1b']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Leaderboard</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.podiumContainer}>
                    {/* Second Place */}
                    <View style={[styles.podiumItem, styles.podiumSecond]}>
                        {secondPlace ? (
                            <>
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={{ uri: secondPlace.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }}
                                        style={styles.podiumAvatar}
                                    />
                                    <View style={[styles.rankBadge, { backgroundColor: '#C0C0C0' }]}>
                                        <Text style={styles.rankBadgeText}>2</Text>
                                    </View>
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
                                <View style={[styles.avatarContainer, styles.avatarFirstContainer]}>
                                    <Image
                                        source={{ uri: firstPlace.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }}
                                        style={[styles.podiumAvatar, styles.avatarFirst]}
                                    />
                                    <View style={[styles.rankBadge, { backgroundColor: '#FFD700', bottom: -5 }]}>
                                        <Text style={styles.rankBadgeText}>1</Text>
                                    </View>
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
                                    <Image
                                        source={{ uri: thirdPlace.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }}
                                        style={styles.podiumAvatar}
                                    />
                                    <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}>
                                        <Text style={styles.rankBadgeText}>3</Text>
                                    </View>
                                </View>
                                <Text style={styles.podiumName} numberOfLines={1}>{thirdPlace.name}</Text>
                                <Text style={styles.podiumPoints}>{thirdPlace.points} pts</Text>
                                <View style={[styles.podiumBar, { height: 80, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                            </>
                        ) : <View style={{ height: 120 }} />}
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {restOfList.map((user) => (
                    <View key={user._id} style={[styles.rankRow, user.isUser && styles.userRow]}>
                        <View style={styles.rankNumberContainer}>
                            <Text style={[styles.rankNumber, user.rank && user.rank <= 10 ? styles.topRank : null]}>
                                #{user.rank}
                            </Text>
                        </View>

                        <Image
                            source={{ uri: user.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }}
                            style={styles.listAvatar}
                        />

                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, user.isUser && styles.userText]} numberOfLines={1}>
                                {user.name} {user.isUser && '(You)'}
                            </Text>
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
                        <MaterialCommunityIcons name="trophy-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No participants yet</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 12,
        paddingHorizontal: 10,
        height: 240,
    },
    podiumItem: {
        alignItems: 'center',
        width: width / 3.5,
        justifyContent: 'flex-end',
    },
    podiumFirst: {
        marginBottom: 0,
        zIndex: 10,
    },
    podiumSecond: {
        marginBottom: 0,
    },
    podiumThird: {
        marginBottom: 0,
    },
    crown: {
        marginBottom: -12,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
        alignItems: 'center',
    },
    avatarFirstContainer: {
        marginBottom: 12,
    },
    podiumAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: '#e2e8f0',
    },
    avatarFirst: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#FFD700',
    },
    rankBadge: {
        position: 'absolute',
        bottom: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    rankBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    podiumName: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
        textAlign: 'center',
    },
    nameFirst: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    podiumPoints: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
    },
    pointsFirst: {
        fontSize: 14,
        color: '#FFD700',
    },
    podiumBar: {
        width: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    listContainer: {
        flex: 1,
        marginTop: -20,
        paddingTop: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    userRow: {
        borderWidth: 2,
        borderColor: SP_RED,
        backgroundColor: '#fff1f2',
    },
    rankNumberContainer: {
        width: 40,
        alignItems: 'center',
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#94a3b8',
    },
    topRank: {
        color: '#1e293b',
        fontWeight: '900',
    },
    listAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#f1f5f9',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    userText: {
        color: SP_RED,
    },
    userDistrict: {
        fontSize: 12,
        color: '#64748b',
    },
    pointsContainer: {
        alignItems: 'flex-end',
        minWidth: 60,
    },
    userPoints: {
        fontSize: 16,
        fontWeight: '800',
        color: SP_RED,
    },
    ptsLabel: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        marginTop: 12,
    },
});
