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

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    status: 'upcoming' | 'ongoing' | 'closed';
    attendees: number;
    type: 'rally' | 'meeting' | 'training' | 'campaign';
    updates?: string[];
}

const eventsData: Event[] = [
    {
        id: '1',
        title: 'जनसभा - लखनऊ',
        description: 'महापौर चुनाव के अवसर पर विशाल जनसभा का आयोजन',
        date: '2025-12-05',
        time: '4:00 PM',
        location: 'लोहिया पार्क, लखनऊ',
        status: 'upcoming',
        attendees: 5000,
        type: 'rally',
        updates: ['Registration open', 'Volunteer sign-up available'],
    },
    {
        id: '2',
        title: 'Digital Training Workshop',
        description: 'Social media strategy and digital campaigning workshop',
        date: '2025-11-28',
        time: '10:00 AM',
        location: 'SP Office, Kanpur',
        status: 'ongoing',
        attendees: 150,
        type: 'training',
        updates: ['Session 1 completed', 'Live streaming available'],
    },
    {
        id: '3',
        title: 'युवा सम्मेलन',
        description: 'युवा कार्यकर्ताओं के लिए विशेष सम्मेलन',
        date: '2025-12-10',
        time: '11:00 AM',
        location: 'Lucknow Convention Center',
        status: 'upcoming',
        attendees: 2000,
        type: 'meeting',
        updates: ['Agenda released', 'Chief guest confirmed'],
    },
    {
        id: '4',
        title: 'जिला स्तरीय बैठक',
        description: 'सभी जिला अध्यक्षों की महत्वपूर्ण बैठक',
        date: '2025-11-25',
        time: '2:00 PM',
        location: 'SP Headquarters, Lucknow',
        status: 'closed',
        attendees: 75,
        type: 'meeting',
        updates: ['Meeting concluded successfully', 'Action points shared'],
    },
    {
        id: '5',
        title: 'साइकिल यात्रा - Phase 2',
        description: 'ग्रामीण क्षेत्रों में जनसंपर्क अभियान',
        date: '2025-12-15',
        time: '8:00 AM',
        location: 'Multiple Districts',
        status: 'upcoming',
        attendees: 1000,
        type: 'campaign',
        updates: ['Route map available', 'Registration starts Dec 1'],
    },
    {
        id: '6',
        title: 'Tech Force Orientation',
        description: 'New members orientation and training session',
        date: '2025-11-27',
        time: '3:00 PM',
        location: 'Online via Zoom',
        status: 'ongoing',
        attendees: 300,
        type: 'training',
        updates: ['Zoom link sent', 'Materials shared'],
    },
    {
        id: '7',
        title: 'किसान महासभा',
        description: 'कृषि नीतियों पर चर्चा और किसान संवाद',
        date: '2025-11-20',
        time: '10:00 AM',
        location: 'Meerut',
        status: 'closed',
        attendees: 3500,
        type: 'rally',
        updates: ['Event completed', 'Resolutions passed'],
    },
];

const EventCard = ({ event, delay }: { event: Event; delay: number }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getStatusColor = () => {
        switch (event.status) {
            case 'upcoming':
                return '#3B82F6';
            case 'ongoing':
                return SP_GREEN;
            case 'closed':
                return '#6B7280';
            default:
                return '#6B7280';
        }
    };

    const getTypeIcon = () => {
        switch (event.type) {
            case 'rally':
                return 'bullhorn';
            case 'meeting':
                return 'account-group';
            case 'training':
                return 'school';
            case 'campaign':
                return 'flag';
            default:
                return 'calendar';
        }
    };

    const getStatusLabel = () => {
        switch (event.status) {
            case 'upcoming':
                return 'Upcoming';
            case 'ongoing':
                return 'Live Now';
            case 'closed':
                return 'Completed';
            default:
                return '';
        }
    };

    return (
        <Animated.View
            style={[
                styles.eventCard,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
        >
            <LinearGradient
                colors={['#fff', '#f8fafc']}
                style={styles.eventCardGradient}
            >
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                    {event.status === 'ongoing' && (
                        <View style={styles.liveDot} />
                    )}
                    <Text style={styles.statusText}>
                        <TranslatedText>{getStatusLabel()}</TranslatedText>
                    </Text>
                </View>

                {/* Event Header */}
                <View style={styles.eventHeader}>
                    <View style={[styles.typeIcon, { backgroundColor: getStatusColor() + '20' }]}>
                        <MaterialCommunityIcons name={getTypeIcon()} size={28} color={getStatusColor()} />
                    </View>
                    <View style={styles.eventHeaderText}>
                        <Text style={styles.eventTitle} numberOfLines={2}>
                            <TranslatedText>{event.title}</TranslatedText>
                        </Text>
                        <Text style={styles.eventDescription} numberOfLines={2}>
                            <TranslatedText>{event.description}</TranslatedText>
                        </Text>
                    </View>
                </View>

                {/* Event Details */}
                <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#64748b" />
                        <Text style={styles.detailText}>
                            <TranslatedText>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</TranslatedText>
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#64748b" />
                        <Text style={styles.detailText}>
                            <TranslatedText>{event.time}</TranslatedText>
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
                        <Text style={styles.detailText} numberOfLines={1}>
                            <TranslatedText>{event.location}</TranslatedText>
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="account-multiple" size={16} color="#64748b" />
                        <Text style={styles.detailText}>
                            <TranslatedText>{`${event.attendees.toLocaleString()} attendees`}</TranslatedText>
                        </Text>
                    </View>
                </View>

                {/* Updates Section */}
                {event.updates && event.updates.length > 0 && (
                    <View style={styles.updatesSection}>
                        <Text style={styles.updatesTitle}>
                            <TranslatedText>📢 Updates:</TranslatedText>
                        </Text>
                        {event.updates.map((update, idx) => (
                            <View key={idx} style={styles.updateRow}>
                                <View style={styles.updateDot} />
                                <Text style={styles.updateText}>
                                    <TranslatedText>{update}</TranslatedText>
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: getStatusColor() }]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionButtonText}>
                        <TranslatedText>{event.status === 'upcoming' ? 'Register Now' : event.status === 'ongoing' ? 'Join Live' : 'View Details'}</TranslatedText>
                    </Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>
        </Animated.View>
    );
};

export default function EventsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'closed'>('all');

    const filteredEvents = activeTab === 'all'
        ? eventsData
        : eventsData.filter(event => event.status === activeTab);

    const upcomingCount = eventsData.filter(e => e.status === 'upcoming').length;
    const ongoingCount = eventsData.filter(e => e.status === 'ongoing').length;
    const closedCount = eventsData.filter(e => e.status === 'closed').length;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient colors={[SP_GREEN, '#15803d', '#166534']} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <MaterialCommunityIcons name="calendar-star" size={64} color="#fff" />
                        <Text style={styles.headerTitle}>
                            <TranslatedText>Events & Programs</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>Stay updated with all party events</TranslatedText>
                        </Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{upcomingCount}</Text>
                            <Text style={styles.statLabel}>
                                <TranslatedText>Upcoming</TranslatedText>
                            </Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{ongoingCount}</Text>
                            <Text style={styles.statLabel}>
                                <TranslatedText>Live Now</TranslatedText>
                            </Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{closedCount}</Text>
                            <Text style={styles.statLabel}>
                                <TranslatedText>Completed</TranslatedText>
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Filter Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContainer}
                    >
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                            onPress={() => setActiveTab('all')}
                        >
                            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                                <TranslatedText>{`All Events (${eventsData.length})`}</TranslatedText>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
                            onPress={() => setActiveTab('upcoming')}
                        >
                            <MaterialCommunityIcons
                                name="calendar-clock"
                                size={16}
                                color={activeTab === 'upcoming' ? '#fff' : '#64748b'}
                            />
                            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
                                <TranslatedText>{`Upcoming (${upcomingCount})`}</TranslatedText>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]}
                            onPress={() => setActiveTab('ongoing')}
                        >
                            <MaterialCommunityIcons
                                name="play-circle"
                                size={16}
                                color={activeTab === 'ongoing' ? '#fff' : '#64748b'}
                            />
                            <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>
                                <TranslatedText>{`Live (${ongoingCount})`}</TranslatedText>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'closed' && styles.tabActive]}
                            onPress={() => setActiveTab('closed')}
                        >
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={16}
                                color={activeTab === 'closed' ? '#fff' : '#64748b'}
                            />
                            <Text style={[styles.tabText, activeTab === 'closed' && styles.tabTextActive]}>
                                <TranslatedText>{`Past (${closedCount})`}</TranslatedText>
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Events List */}
                    <View style={styles.eventsContainer}>
                        {filteredEvents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="calendar-blank" size={64} color="#CBD5E1" />
                                <Text style={styles.emptyText}>
                                    <TranslatedText>No events found</TranslatedText>
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    <TranslatedText>Check back later for updates</TranslatedText>
                                </Text>
                            </View>
                        ) : (
                            filteredEvents.map((event, idx) => (
                                <EventCard key={event.id} event={event} delay={idx * 100} />
                            ))
                        )}
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
        paddingBottom: 32,
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
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginTop: 16,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        padding: 16,
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    tabsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabActive: {
        backgroundColor: SP_GREEN,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    tabTextActive: {
        color: '#fff',
    },
    eventsContainer: {
        gap: 16,
    },
    eventCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    eventCardGradient: {
        padding: 20,
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    eventHeader: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
        paddingRight: 80,
    },
    typeIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventHeaderText: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    eventDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    eventDetails: {
        gap: 10,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    updatesSection: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    updatesTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    updateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    updateDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: SP_GREEN,
    },
    updateText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#94A3B8',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#CBD5E1',
        marginTop: 4,
    },
});
