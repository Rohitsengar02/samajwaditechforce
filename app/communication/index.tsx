import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';

export default function CommunicationHubScreen() {
    const router = useRouter();

    const features = [
        {
            id: 'discussion',
            title: 'Discussion Room',
            subtitle: 'Connect with fellow party members',
            icon: 'forum',
            color: '#3B82F6', // Blue
            route: '/communication/discussion'
        },
        {
            id: 'ask-leader',
            title: 'Ask the Leader',
            subtitle: 'Direct questions to Akhilesh Yadav',
            icon: 'account-question',
            color: SP_RED, // Red
            route: '/communication/ask-leader'
        },
        {
            id: 'suggestions',
            title: 'Suggestions Box',
            subtitle: 'Share your ideas for the party',
            icon: 'lightbulb-on',
            color: '#F59E0B', // Amber
            route: '/communication/suggestions'
        }
    ];

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
                    <Text style={styles.headerTitle}>Communication Hub</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSubtitle}>
                    Your voice matters. Connect, ask, and suggest.
                </Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.grid}>
                    {features.map((feature) => (
                        <TouchableOpacity
                            key={feature.id}
                            style={styles.card}
                            onPress={() => router.push(feature.route as any)}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[feature.color, feature.color + 'DD']}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons name={feature.icon as any} size={32} color={feature.color} />
                                </View>
                                <View style={styles.cardText}>
                                    <Text style={styles.cardTitle}>{feature.title}</Text>
                                    <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" style={styles.arrow} />
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Activity Preview (Optional - Mock) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Highlights</Text>
                    <Surface style={styles.highlightCard} elevation={2}>
                        <View style={styles.highlightHeader}>
                            <MaterialCommunityIcons name="star" size={20} color="#F59E0B" />
                            <Text style={styles.highlightLabel}>Top Suggestion</Text>
                        </View>
                        <Text style={styles.highlightText}>
                            "Mobile App for Booth Management" received 156 votes this week!
                        </Text>
                    </Surface>
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
        paddingTop: 50,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
    },
    content: {
        padding: 20,
    },
    grid: {
        gap: 16,
        marginBottom: 32,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        height: 100,
    },
    cardGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    arrow: {
        opacity: 0.8,
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    highlightCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },
    highlightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    highlightLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F59E0B',
        textTransform: 'uppercase',
    },
    highlightText: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 24,
        fontWeight: '500',
    },
});
