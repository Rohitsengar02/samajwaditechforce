import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LEADERBOARD } from '@/constants/dailyWorkData';

const SP_RED = '#E30512';

export default function LeaderboardScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[SP_RED, '#b91c1c']}
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
                    <View style={[styles.podiumItem, styles.podiumSecond]}>
                        <Image source={{ uri: LEADERBOARD[1].avatar }} style={styles.podiumAvatar} />
                        <View style={styles.podiumBar2}>
                            <Text style={styles.podiumRank}>2</Text>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>{LEADERBOARD[1].name}</Text>
                        <Text style={styles.podiumPoints}>{LEADERBOARD[1].points}</Text>
                    </View>

                    <View style={[styles.podiumItem, styles.podiumFirst]}>
                        <MaterialCommunityIcons name="crown" size={24} color="#FFD700" style={styles.crown} />
                        <Image source={{ uri: LEADERBOARD[0].avatar }} style={[styles.podiumAvatar, styles.avatarFirst]} />
                        <View style={styles.podiumBar1}>
                            <Text style={styles.podiumRank}>1</Text>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>{LEADERBOARD[0].name}</Text>
                        <Text style={styles.podiumPoints}>{LEADERBOARD[0].points}</Text>
                    </View>

                    <View style={[styles.podiumItem, styles.podiumThird]}>
                        <Image source={{ uri: LEADERBOARD[2].avatar }} style={styles.podiumAvatar} />
                        <View style={styles.podiumBar3}>
                            <Text style={styles.podiumRank}>3</Text>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>{LEADERBOARD[2].name}</Text>
                        <Text style={styles.podiumPoints}>{LEADERBOARD[2].points}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
                {LEADERBOARD.slice(3).map((user, index) => (
                    <View key={index} style={[styles.rankRow, user.isUser && styles.userRow]}>
                        <Text style={styles.rankNumber}>{user.rank}</Text>
                        <Image source={{ uri: user.avatar }} style={styles.listAvatar} />
                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, user.isUser && styles.userText]}>
                                {user.name} {user.isUser && '(You)'}
                            </Text>
                            <Text style={styles.userDistrict}>{user.district}</Text>
                        </View>
                        <Text style={styles.userPoints}>{user.points} pts</Text>
                    </View>
                ))}
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
        paddingTop: 50,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
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
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 16,
        paddingHorizontal: 20,
    },
    podiumItem: {
        alignItems: 'center',
        width: 90,
    },
    podiumFirst: {
        marginBottom: 20,
    },
    podiumSecond: {
        marginBottom: 0,
    },
    podiumThird: {
        marginBottom: 0,
    },
    crown: {
        marginBottom: -8,
        zIndex: 1,
    },
    podiumAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: -10,
        zIndex: 1,
    },
    avatarFirst: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        borderColor: '#FFD700',
    },
    podiumBar1: {
        width: '100%',
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 16,
    },
    podiumBar2: {
        width: '100%',
        height: 90,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 16,
    },
    podiumBar3: {
        width: '100%',
        height: 70,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 16,
    },
    podiumRank: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
    },
    podiumName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },
    podiumPoints: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        marginTop: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    userRow: {
        borderWidth: 2,
        borderColor: SP_RED,
        backgroundColor: '#fff1f2',
    },
    rankNumber: {
        width: 30,
        fontSize: 16,
        fontWeight: '800',
        color: '#64748b',
    },
    listAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    userText: {
        color: SP_RED,
    },
    userDistrict: {
        fontSize: 12,
        color: '#64748b',
    },
    userPoints: {
        fontSize: 15,
        fontWeight: '800',
        color: SP_RED,
    },
});
