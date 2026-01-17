import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions,
    TextInput,
    FlatList,
    Platform,
    Animated,
    StatusBar
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';

const { width } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_DARK_RED = '#8B0000';
const SP_GOLD = '#FFD700';
const SP_SILVER = '#E2E8F0';
const SP_BRONZE = '#CD7F32';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchData();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const fetchData = async () => {
        if (leaderboardData.length === 0) setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = getApiUrl();

            const profileRes = await fetch(`${url}/auth/profile`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const profileData = await profileRes.json();
            if (profileData && profileData._id) {
                setCurrentUserId(profileData._id);
            }

            const leaderboardRes = await fetch(`${url}/auth/leaderboard`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await leaderboardRes.json();

            if (Array.isArray(data)) {
                const formattedData: LeaderboardUser[] = data.map((user: any) => ({
                    _id: user._id,
                    name: user.name,
                    profileImage: user.profileImage,
                    district: user.district || 'Unknown',
                    points: user.points || 0,
                    isUser: user._id === profileData._id
                }));

                formattedData.sort((a, b) => b.points - a.points);
                formattedData.forEach((user, index) => {
                    user.rank = index + 1;
                });

                setLeaderboardData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = leaderboardData.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const firstPlace = filteredData.find(u => u.rank === 1);
    const secondPlace = filteredData.find(u => u.rank === 2);
    const thirdPlace = filteredData.find(u => u.rank === 3);
    const restOfList = filteredData.filter(u => (u.rank || 0) > 3);

    const renderPodiumItem = (user: LeaderboardUser | undefined, position: 'first' | 'second' | 'third') => {
        if (!user) return <View style={styles.podiumItem} />;

        const isFirst = position === 'first';
        const pillarHeight = isFirst ? 160 : (position === 'second' ? 120 : 90);
        const borderColor = isFirst ? SP_GOLD : (position === 'second' ? '#CBD5E1' : SP_BRONZE);

        return (
            <View style={[styles.podiumItem, isFirst && styles.podiumFirst]}>
                {isFirst && (
                    <Animated.View style={{
                        transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 50], outputRange: [0, -10], extrapolate: 'clamp' }) }]
                    }}>
                        <MaterialCommunityIcons name="crown" size={42} color={SP_GOLD} style={styles.crown} />
                    </Animated.View>
                )}

                <View style={[styles.avatarContainer, isFirst && styles.firstAvatarContainer]}>
                    <Surface style={[
                        styles.podiumAvatarSurface,
                        { borderColor: borderColor, width: isFirst ? 100 : 76, height: isFirst ? 100 : 76, borderRadius: isFirst ? 50 : 38 }
                    ]} elevation={4}>
                        <Image
                            source={{ uri: user.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }}
                            style={[
                                styles.podiumAvatar,
                                { width: isFirst ? 92 : 68, height: isFirst ? 92 : 68, borderRadius: isFirst ? 46 : 34 }
                            ]}
                        />
                    </Surface>
                    <LinearGradient
                        colors={[borderColor, isFirst ? '#9A7B0C' : '#475569']}
                        style={[styles.rankBadge, { backgroundColor: borderColor }]}
                    >
                        <Text style={styles.rankBadgeText}>{user.rank}</Text>
                    </LinearGradient>
                </View>

                <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>{user.name}</Text>

                <View style={styles.podiumPointsRow}>
                    <MaterialCommunityIcons name="fire" size={14} color={SP_GOLD} />
                    <Text style={[styles.podiumPoints, isFirst && styles.firstPoints]}>{user.points}</Text>
                    <Text style={[styles.ptsLabelPodium, isFirst && { fontSize: 10 }]}> pts</Text>
                </View>

                <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)']}
                    style={[styles.podiumPillar, { height: pillarHeight }]}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[SP_RED, SP_DARK_RED]}
                style={styles.headerBackground}
            >
                <View style={[styles.navBar, { paddingTop: Platform.OS === 'ios' ? 60 : 30 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.glassButton}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
                    </TouchableOpacity>

                    {!showSearch ? (
                        <Text style={styles.headerTitle}>Leaderboard</Text>
                    ) : (
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search leaders..."
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    )}

                    <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.glassButton}>
                        <MaterialCommunityIcons name={showSearch ? "close" : "magnify"} size={24} color="#fff" />
                    </TouchableOpacity>
                </View>



                <View style={styles.podiumContainer}>
                    {renderPodiumItem(secondPlace, 'second')}
                    {renderPodiumItem(firstPlace, 'first')}
                    {renderPodiumItem(thirdPlace, 'third')}
                </View>
            </LinearGradient>

            <Animated.View style={[styles.listWrapper, { opacity: fadeAnim }]}>
                <FlatList
                    data={restOfList}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity activeOpacity={0.9}>
                            <Surface style={[styles.rankRow, item.isUser && styles.userRowSurface]} elevation={item.isUser ? 4 : 1}>
                                <View style={styles.rankNumberCircle}>
                                    <Text style={styles.rankNumberText}>{item.rank}</Text>
                                </View>

                                <View style={styles.avatarWrapper}>
                                    <Image
                                        source={{ uri: item.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }}
                                        style={styles.listAvatar}
                                    />
                                    {item.rank && item.rank <= 10 && (
                                        <View style={styles.topTenBadge}>
                                            <MaterialCommunityIcons name="star" size={10} color={SP_GOLD} />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.userInfo}>
                                    <Text style={styles.userName} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.userDistrict}>{item.district}</Text>
                                </View>

                                <View style={styles.pointsAction}>
                                    <Text style={styles.listScore}>{item.points}</Text>
                                    <Text style={styles.ptsLabelList}>pts</Text>
                                </View>
                            </Surface>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="trophy-outline" size={80} color="#E2E8F0" />
                                <Text style={styles.emptyText}>Keep participating to climb the ranks!</Text>
                            </View>
                        ) : (
                            <ActivityIndicator color={SP_RED} style={{ marginTop: 40 }} />
                        )
                    }
                />
            </Animated.View>

            {/* Sticky bottom for current user if not in view (Rank 30+) - Improved UI */}
            {currentUserId && !filteredData.slice(0, 10).some(u => u._id === currentUserId) && (
                <Surface style={styles.currentUserSticky} elevation={5}>
                    <LinearGradient
                        colors={[SP_RED, SP_DARK_RED]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.stickyGradient}
                    >
                        <Text style={styles.rankNumberSticky}>
                            #{leaderboardData.find(u => u._id === currentUserId)?.rank || 'N/A'}
                        </Text>
                        <Image
                            source={{ uri: leaderboardData.find(u => u._id === currentUserId)?.profileImage || 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png' }}
                            style={styles.stickyAvatar}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.stickyName}>Your Standing</Text>
                            <Text style={styles.stickyPoints}>
                                {leaderboardData.find(u => u._id === currentUserId)?.points || 0} Points
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-up" size={24} color="#fff" />
                    </LinearGradient>
                </Surface>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerBackground: {
        paddingBottom: 20,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        zIndex: 10,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    glassButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    searchInput: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 22,
        paddingHorizontal: 20,
        marginHorizontal: 15,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 240,
        paddingHorizontal: 15,
        gap: 10,
        marginTop: 70,
    },
    podiumItem: {
        alignItems: 'center',
        width: width / 3.6,
        justifyContent: 'flex-end',
    },
    podiumFirst: {
        paddingBottom: 0,
        zIndex: 10,
    },
    podiumPillar: {
        width: '90%',
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    crown: {
        marginBottom: -15,
        zIndex: 20,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 }
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
        alignItems: 'center',
    },
    firstAvatarContainer: {
        marginBottom: 12,
    },
    podiumAvatarSurface: {
        borderWidth: 3,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    podiumAvatar: {
        backgroundColor: '#F1F5F9',
    },
    rankBadge: {
        position: 'absolute',
        bottom: -8,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    rankBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    podiumName: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    podiumNameFirst: {
        fontSize: 15,
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    podiumPointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    podiumPoints: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '900',
        marginLeft: 4,
    },
    firstPoints: {
        fontSize: 16,
        color: SP_GOLD,
    },
    ptsLabelPodium: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    listWrapper: {
        flex: 1,
        marginTop: -30,
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingTop: 20,
        // Ensure the list takes available space and allows scrolling
        minHeight: Dimensions.get('window').height - 300,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
    },
    userRowSurface: {
        borderWidth: 1.5,
        borderColor: SP_RED,
        backgroundColor: '#FFF5F5',
    },
    rankNumberCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    rankNumberText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#64748B',
    },
    avatarWrapper: {
        position: 'relative',
    },
    listAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 15,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    topTenBadge: {
        position: 'absolute',
        top: -3,
        right: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    userDistrict: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    pointsAction: {
        alignItems: 'flex-end',
    },
    listScore: {
        fontSize: 18,
        fontWeight: '900',
        color: SP_RED,
    },
    ptsLabelList: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        textAlign: 'center',
    },
    currentUserSticky: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        borderRadius: 25,
        overflow: 'hidden',
    },
    stickyGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingHorizontal: 20,
    },
    rankNumberSticky: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        width: 45,
    },
    stickyAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    stickyName: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '700',
    },
    stickyPoints: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
});
