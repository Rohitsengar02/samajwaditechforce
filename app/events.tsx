import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    Modal,
    TextInput,
    Alert,
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

interface Program {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    duration: string;
}

// Data will be fetched from API
const eventsData: Event[] = [];
const programsData: Program[] = [];

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

    // Registration Modal States
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        motivation: '',
    });

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

                    {/* Programs Section */}
                    <View style={styles.programsSection}>
                        <Text style={styles.programsSectionTitle}>
                            <TranslatedText>Available Programs</TranslatedText>
                        </Text>
                        <Text style={styles.programsSectionSubtitle}>
                            <TranslatedText>Join our initiatives and make a difference</TranslatedText>
                        </Text>

                        <View style={styles.programsGrid}>
                            {programsData.map((program, idx) => (
                                <View key={program.id} style={styles.programCard}>
                                    <LinearGradient
                                        colors={idx % 2 === 0 ? [SP_RED, '#b91c1c'] : [SP_GREEN, '#15803d']}
                                        style={styles.programCardHeader}
                                    >
                                        <MaterialCommunityIcons name={program.icon as any} size={48} color="#fff" />
                                    </LinearGradient>

                                    <View style={styles.programCardBody}>
                                        <View style={styles.programCardBadge}>
                                            <Text style={styles.programCardCategory}>{program.category}</Text>
                                            <View style={styles.programCardDot} />
                                            <Text style={styles.programCardDuration}>{program.duration}</Text>
                                        </View>

                                        <Text style={styles.programCardTitle}>{program.title}</Text>
                                        <Text style={styles.programCardDesc}>{program.description}</Text>

                                        <TouchableOpacity
                                            style={styles.registerButton}
                                            onPress={() => {
                                                setSelectedProgram(program);
                                                setShowRegistrationModal(true);
                                            }}
                                        >
                                            <Text style={styles.registerButtonText}>
                                                <TranslatedText>Register Now</TranslatedText>
                                            </Text>
                                            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Registration Modal */}
                <Modal
                    visible={showRegistrationModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowRegistrationModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            {/* Selected Program Bar */}
                            {selectedProgram && (
                                <LinearGradient
                                    colors={[SP_GREEN, '#15803d']}
                                    style={styles.modalProgramBar}
                                >
                                    <View style={styles.modalProgramIcon}>
                                        <MaterialCommunityIcons
                                            name={selectedProgram.icon as any}
                                            size={32}
                                            color="#fff"
                                        />
                                    </View>
                                    <View style={styles.modalProgramInfo}>
                                        <Text style={styles.modalProgramTitle}>{selectedProgram.title}</Text>
                                        <Text style={styles.modalProgramMeta}>
                                            {selectedProgram.category} • {selectedProgram.duration}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.modalCloseButton}
                                        onPress={() => setShowRegistrationModal(false)}
                                    >
                                        <MaterialCommunityIcons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </LinearGradient>
                            )}

                            {/* Registration Form */}
                            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                                <Text style={styles.formTitle}>Registration Form</Text>
                                <Text style={styles.formSubtitle}>Fill in your details to register</Text>

                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Full Name *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Email Address *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Phone Number *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="+91 1234567890"
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Address</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="Your city, district"
                                        value={formData.address}
                                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Why do you want to join? *</Text>
                                    <TextInput
                                        style={[styles.formInput, styles.formTextArea]}
                                        placeholder="Tell us about your motivation..."
                                        value={formData.motivation}
                                        onChangeText={(text) => setFormData({ ...formData, motivation: text })}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={() => {
                                        if (!formData.name || !formData.email || !formData.phone || !formData.motivation) {
                                            Alert.alert('Error', 'Please fill all required fields');
                                            return;
                                        }
                                        Alert.alert(
                                            'Success',
                                            `Thank you for registering for ${selectedProgram?.title}! We will contact you soon.`,
                                            [
                                                {
                                                    text: 'OK',
                                                    onPress: () => {
                                                        setShowRegistrationModal(false);
                                                        setFormData({ name: '', email: '', phone: '', address: '', motivation: '' });
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Text style={styles.submitButtonText}>Submit Registration</Text>
                                    <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowRegistrationModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
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
    // Programs Section Styles
    programsSection: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    programsSectionTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    programsSectionSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
    },
    programsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    programCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 16,
    },
    programCardHeader: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    programCardBody: {
        padding: 16,
    },
    programCardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    programCardCategory: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    programCardDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
        marginHorizontal: 8,
    },
    programCardDuration: {
        fontSize: 12,
        color: '#94a3b8',
    },
    programCardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    programCardDesc: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SP_GREEN,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    registerButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    modalProgramBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    modalProgramIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalProgramInfo: {
        flex: 1,
    },
    modalProgramTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    modalProgramMeta: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalForm: {
        padding: 24,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    formInput: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1e293b',
        backgroundColor: '#f9fafb',
    },
    formTextArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SP_GREEN,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 12,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
});
