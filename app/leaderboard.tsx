import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../components/TranslatedText';

const { width } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Mock leaderboard data
const leaderboardData = [
    { id: 1, name: 'राहुल वर्मा', district: 'Lucknow', points: 2850, tasks: 145, rank: 1, badge: 'diamond' },
    { id: 2, name: 'प्रिया शर्मा', district: 'Kanpur', points: 2720, tasks: 138, rank: 2, badge: 'gold' },
    { id: 3, name: 'अमित कुमार', district: 'Agra', points: 2650, tasks: 132, rank: 3, badge: 'gold' },
    { id: 4, name: 'नेहा सिंह', district: 'Varanasi', points: 2480, tasks: 124, rank: 4, badge: 'silver' },
    { id: 5, name: 'विकास यादव', district: 'Prayagraj', points: 2350, tasks: 118, rank: 5, badge: 'silver' },
    { id: 6, name: 'सोनिया गुप्ता', district: 'Meerut', points: 2220, tasks: 111, rank: 6, badge: 'bronze' },
    { id: 7, name: 'अजय त्रिपाठी', district: 'Ghaziabad', points: 2180, tasks: 109, rank: 7, badge: 'bronze' },
    { id: 8, name: 'कविता पांडे', district: 'Noida', points: 2050, tasks: 103, rank: 8, badge: 'bronze' },
    { id: 9, name: 'संजय मिश्रा', district: 'Bareilly', points: 1950, tasks: 98, rank: 9, badge: null },
    { id: 10, name: 'अंजलि वर्मा', district: 'Moradabad', points: 1880, tasks: 94, rank: 10, badge: null },
];

const TopThreeCard = ({ member, delay }: any) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getCardColor = () => {
        if (member.rank === 1) return ['#FFD700', '#FFA500'] as const;
        if (member.rank === 2) return ['#C0C0C0', '#A8A8A8'] as const;
        return ['#CD7F32', '#B87333'] as const;
    };

    const getCrownIcon = () => {
        if (member.rank === 1) return 'crown';
        if (member.rank === 2) return 'medal';
        return 'trophy-award';
    };

    return (
        <Animated.View
            style={[
                styles.topThreeCard,
                {
                    transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                    marginTop: member.rank === 1 ? 0 : 20,
                }
            ]}
        >
            <LinearGradient colors={getCardColor()} style={styles.topThreeGradient}>
                <View style={styles.rankBadge}>
                    <MaterialCommunityIcons name={getCrownIcon()} size={24} color="#fff" />
                    <Text style={styles.rankNumber}>{member.rank}</Text>
                </View>

                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                    </View>
                </View>

                <Text style={styles.topThreeName} numberOfLines={1}>
                    <TranslatedText>{member.name}</TranslatedText>
                </Text>
                <Text style={styles.topThreeDistrict}>
                    <TranslatedText>{member.district}</TranslatedText>
                </Text>

                <View style={styles.topThreeStats}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="star" size={18} color="#fff" />
                        <Text style={styles.statValue}>{member.points}</Text>
                        <Text style={styles.statLabel}>
                            <TranslatedText>Points</TranslatedText>
                        </Text>
                    </View>
                    <View style={[styles.statItem, styles.statDivider]}>
                        <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                        <Text style={styles.statValue}>{member.tasks}</Text>
                        <Text style={styles.statLabel}>
                            <TranslatedText>Tasks</TranslatedText>
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const LeaderboardRow = ({ member, delay }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getBadgeColor = () => {
        switch (member.badge) {
            case 'diamond': return '#60A5FA';
            case 'gold': return '#FCD34D';
            case 'silver': return '#D1D5DB';
            case 'bronze': return '#F59E0B';
            default: return '#E5E7EB';
        }
    };

    return (
        <Animated.View
            style={[
                styles.leaderboardRow,
                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
            ]}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.rankCircle, member.rank <= 3 && styles.rankCircleTop]}>
                    <Text style={[styles.rankText, member.rank <= 3 && styles.rankTextTop]}>
                        {member.rank}
                    </Text>
                </View>

                <View style={styles.memberInfo}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.memberName} numberOfLines={1}>
                            <TranslatedText>{member.name}</TranslatedText>
                        </Text>
                        {member.badge && (
                            <View style={[styles.badgeIcon, { backgroundColor: getBadgeColor() + '20' }]}>
                                <MaterialCommunityIcons
                                    name={member.badge === 'diamond' ? 'diamond-stone' : 'medal'}
                                    size={14}
                                    color={getBadgeColor()}
                                />
                            </View>
                        )}
                    </View>
                    <Text style={styles.memberDistrict}>
                        <TranslatedText>{member.district}</TranslatedText>
                    </Text>
                </View>
            </View>

            <View style={styles.rowRight}>
                <View style={styles.pointsContainer}>
                    <MaterialCommunityIcons name="star" size={16} color={SP_GREEN} />
                    <Text style={styles.pointsText}>{member.points}</Text>
                </View>
                <Text style={styles.tasksText}>
                    <TranslatedText>{`${member.tasks} tasks`}</TranslatedText>
                </Text>
            </View>
        </Animated.View>
    );
};

export default function LeaderboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');

    const topThree = leaderboardData.slice(0, 3);
    const restOfLeaderboard = leaderboardData.slice(3);

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient colors={[SP_RED, '#b91c1c', SP_DARK]} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <MaterialCommunityIcons name="trophy" size={48} color="#FFD700" />
                        <Text style={styles.headerTitle}>
                            <TranslatedText>Leaderboard</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>Top Digital Warriors</TranslatedText>
                        </Text>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Filter Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                            onPress={() => setActiveTab('all')}
                        >
                            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                                <TranslatedText>All Time</TranslatedText>
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'month' && styles.tabActive]}
                            onPress={() => setActiveTab('month')}
                        >
                            <Text style={[styles.tabText, activeTab === 'month' && styles.tabTextActive]}>
                                <TranslatedText>This Month</TranslatedText>
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'week' && styles.tabActive]}
                            onPress={() => setActiveTab('week')}
                        >
                            <Text style={[styles.tabText, activeTab === 'week' && styles.tabTextActive]}>
                                <TranslatedText>This Week</TranslatedText>
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Top 3 Podium */}
                    <View style={styles.podiumContainer}>
                        <Text style={styles.sectionTitle}>
                            <TranslatedText>🏆 Top Performers</TranslatedText>
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled={false}
                            snapToInterval={width >= 768 ? (width - 80) / 3 + 12 : width - 120}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            contentContainerStyle={styles.carouselContent}
                        >
                            {topThree.map((member, idx) => (
                                <TopThreeCard key={member.id} member={member} delay={idx * 100} />
                            ))}
                        </ScrollView>
                    </View>

                    {/* Rest of Leaderboard */}
                    <View style={styles.leaderboardContainer}>
                        <Text style={styles.sectionTitle}>
                            <TranslatedText>📊 Rankings</TranslatedText>
                        </Text>
                        {restOfLeaderboard.map((member, idx) => (
                            <LeaderboardRow key={member.id} member={member} delay={idx * 50 + 300} />
                        ))}
                    </View>

                    {/* Your Rank Card */}
                    <View style={styles.yourRankCard}>
                        <LinearGradient colors={[SP_GREEN, '#15803d']} style={styles.yourRankGradient}>
                            <View style={styles.yourRankContent}>
                                <View>
                                    <Text style={styles.yourRankLabel}>
                                        <TranslatedText>Your Current Rank</TranslatedText>
                                    </Text>
                                    <Text style={styles.yourRankNumber}>#47</Text>
                                </View>
                                <View style={styles.yourRankStats}>
                                    <View style={styles.yourStatItem}>
                                        <Text style={styles.yourStatValue}>1,250</Text>
                                        <Text style={styles.yourStatLabel}>
                                            <TranslatedText>Points</TranslatedText>
                                        </Text>
                                    </View>
                                    <View style={styles.yourStatDivider} />
                                    <View style={styles.yourStatItem}>
                                        <Text style={styles.yourStatValue}>62</Text>
                                        <Text style={styles.yourStatLabel}>
                                            <TranslatedText>Tasks</TranslatedText>
                                        </Text>
                                    </View>
                                </View>
                            </View>

                        </LinearGradient>
                    </View>

                    {/* Achievements Section */}
                    <View style={styles.achievementsSection}>
                        <Text style={styles.sectionTitle}>
                            <TranslatedText>🎖️ Achievements</TranslatedText>
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                            <View style={styles.achievementCard}>
                                <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.achievementGradient}>
                                    <MaterialCommunityIcons name="crown" size={32} color="#fff" />
                                    <Text style={styles.achievementTitle}>
                                        <TranslatedText>Top Contributor</TranslatedText>
                                    </Text>
                                    <Text style={styles.achievementDesc}>
                                        <TranslatedText>100+ tasks completed</TranslatedText>
                                    </Text>
                                </LinearGradient>
                            </View>

                            <View style={styles.achievementCard}>
                                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.achievementGradient}>
                                    <MaterialCommunityIcons name="fire" size={32} color="#fff" />
                                    <Text style={styles.achievementTitle}>
                                        <TranslatedText>7 Day Streak</TranslatedText>
                                    </Text>
                                    <Text style={styles.achievementDesc}>
                                        <TranslatedText>Daily active user</TranslatedText>
                                    </Text>
                                </LinearGradient>
                            </View>

                            <View style={styles.achievementCard}>
                                <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.achievementGradient}>
                                    <MaterialCommunityIcons name="share-variant" size={32} color="#fff" />
                                    <Text style={styles.achievementTitle}>
                                        <TranslatedText>Social Star</TranslatedText>
                                    </Text>
                                    <Text style={styles.achievementDesc}>
                                        <TranslatedText>50+ shares</TranslatedText>
                                    </Text>
                                </LinearGradient>
                            </View>

                            <View style={styles.achievementCard}>
                                <LinearGradient colors={['#10B981', '#059669']} style={styles.achievementGradient}>
                                    <MaterialCommunityIcons name="account-group" size={32} color="#fff" />
                                    <Text style={styles.achievementTitle}>
                                        <TranslatedText>Team Player</TranslatedText>
                                    </Text>
                                    <Text style={styles.achievementDesc}>
                                        <TranslatedText>10+ referrals</TranslatedText>
                                    </Text>
                                </LinearGradient>
                            </View>
                        </ScrollView>
                    </View>
                </View>
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
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginTop: 12,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabActive: {
        backgroundColor: SP_RED,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    tabTextActive: {
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    podiumContainer: {
        marginBottom: 32,
    },
    carouselContent: {
        paddingRight: 20,
        gap: 12,
    },
    topThreeGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    topThreeCard: {
        width: width >= 768 ? (width - 100) / 3 : width - 100,
        borderRadius: 20,
        overflow: 'hidden',



    },
    topThreeGradient: {
        padding: 16,
        alignItems: 'center',
    },
    rankBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rankNumber: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
        marginLeft: 4,
    },
    avatarContainer: {
        marginTop: 20,
        marginBottom: 12,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    topThreeName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',

    },
    topThreeDistrict: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
    },
    topThreeStats: {
        flexDirection: 'row',
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.3)',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    leaderboardContainer: {
        marginBottom: 24,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rankCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rankCircleTop: {
        backgroundColor: SP_RED + '20',
    },
    rankText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#64748b',
    },
    rankTextTop: {
        color: SP_RED,
    },
    memberInfo: {
        flex: 1,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    badgeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberDistrict: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    rowRight: {
        alignItems: 'flex-end',
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pointsText: {
        fontSize: 16,
        fontWeight: '800',
        color: SP_GREEN,
    },
    tasksText: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    yourRankCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: SP_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    yourRankGradient: {
        padding: 20,
    },
    yourRankContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    yourRankLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    yourRankNumber: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
    },
    yourRankStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    yourStatItem: {
        alignItems: 'center',
    },
    yourStatValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    yourStatLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    yourStatDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 16,
    },
    viewProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 12,
        borderRadius: 12,
    },
    viewProfileText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
        marginRight: 4,
    },
    achievementsSection: {
        marginBottom: 24,
    },
    achievementsScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    achievementCard: {
        width: 140,
        marginRight: 12,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    achievementGradient: {
        padding: 16,
        alignItems: 'center',
        minHeight: 140,
    },
    achievementTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#fff',
        marginTop: 12,
        textAlign: 'center',
    },
    achievementDesc: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        textAlign: 'center',
    },
});
