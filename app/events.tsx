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
    Image,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../components/TranslatedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';

const { width } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

interface Event {
    _id?: string;
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
    image?: string;
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

const EventCard = ({ event, delay, onRegister }: { event: Event; delay: number; onRegister?: (event: Event) => void }) => {
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
                {/* Event Header */}
                <View style={styles.eventHeader}>
                    {event.image ? (
                        <Image
                            source={{ uri: event.image }}
                            style={styles.eventImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.typeIcon, { backgroundColor: SP_GREEN + '20' }]}>
                            <MaterialCommunityIcons name={getTypeIcon()} size={28} color={SP_GREEN} />
                        </View>
                    )}
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
                            <TranslatedText>{event.date}</TranslatedText>
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

                {/* Register Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (onRegister) {
                            onRegister(event);
                        }
                    }}
                >
                    <Text style={styles.actionButtonText}>
                        <TranslatedText>Register Now</TranslatedText>
                    </Text>
                    <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>
        </Animated.View>
    );
};

export default function EventsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'closed'>('all');
    const [eventsData, setEventsData] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    // Registration Modal States
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [userData, setUserData] = useState<any>(null);

    // API URL - use the shared utility for consistent cross-platform behavior
    const API_URL = getApiUrl();

    // Platform-aware alert function
    const showAlert = (title: string, message: string, onOk?: () => void) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
            if (onOk) onOk();
        } else {
            Alert.alert(title, message, [
                {
                    text: 'OK',
                    onPress: onOk,
                }
            ]);
        }
    };

    // Helper to format address from various formats (string, array, object)
    const formatAddress = (addr: any) => {
        if (!addr) return '';
        if (typeof addr === 'string') return addr;
        if (Array.isArray(addr)) return addr.join(', ');
        if (typeof addr === 'object') {
            const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
            return parts.length > 0 ? parts.join(', ') : '';
        }
        return '';
    };

    // Fetch events and profile from API
    useEffect(() => {
        fetchEvents();
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            console.log('Fetching user profile with token...');
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('User profile data:', data);

            if (response.ok) {
                setUserData(data);
                // Pre-fill form data if available
                const formattedAddress = formatAddress(data.address);

                setFormData(prev => ({
                    ...prev,
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: formattedAddress
                }));
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            console.log('Fetching events from:', `${API_URL}/events`);

            const response = await fetch(`${API_URL}/events`);
            console.log('Events response status:', response.status);

            const data = await response.json();
            console.log('Events data:', data);

            if (data.success && data.data) {
                setEventsData(data.data);
            } else if (data.data) {
                // Handle case where success might be undefined but data exists
                setEventsData(data.data);
            } else if (Array.isArray(data)) {
                // Handle case where API returns array directly
                setEventsData(data);
            }
        } catch (error: any) {
            console.error('Error fetching events:', error);
            console.error('Error details:', error.message);
            // Don't show error alert - just log it, show empty state instead
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = (event: Event) => {
        setSelectedEvent(event);
        // Refresh user data if available before showing modal
        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name || prev.name,
                email: userData.email || prev.email,
                phone: userData.phone || prev.phone,
                address: formatAddress(userData.address) || prev.address
            }));
        }
        setShowRegistrationModal(true);
    };

    const submitRegistration = async () => {
        // Validation: All fields required including Address
        if (!formData.name || !formData.email || !formData.phone || !formData.address) {
            showAlert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                showAlert('Error', 'You must be logged in to register');
                return;
            }

            const eventId = selectedEvent?._id || selectedEvent?.id;

            // Submit Registration (updates address via backend if needed)
            const response = await fetch(`${API_URL}/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local user data since backend updates address
                if (userData) {
                    setUserData((prev: any) => ({ ...prev, address: formData.address }));
                }

                // Success Message
                showAlert(
                    'Registration Successful! 🎉',
                    `You have registered for "${selectedEvent?.title}".\n\nYour address has been saved for future events.`,
                    () => {
                        setShowRegistrationModal(false);
                        setSelectedEvent(null);
                        fetchEvents(); // Refresh counts
                    }
                );
            } else {
                throw new Error(data.message || 'Registration failed');
            }

        } catch (error: any) {
            console.error('Registration failed', error);
            showAlert('Error', error.message || 'Something went wrong. Please try again.');
        }
    };

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

                        <View style={styles.statDivider} />

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
                                <EventCard
                                    key={event._id || event.id}
                                    event={event}
                                    delay={idx * 100}
                                    onRegister={handleRegister}
                                />
                            ))
                        )}
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
                            {/* Selected Event Bar */}
                            {selectedEvent && (
                                <LinearGradient
                                    colors={[SP_GREEN, '#15803d']}
                                    style={styles.modalProgramBar}
                                >
                                    <View style={styles.modalProgramIcon}>
                                        <MaterialCommunityIcons
                                            name="calendar-star"
                                            size={32}
                                            color="#fff"
                                        />
                                    </View>
                                    <View style={styles.modalProgramInfo}>
                                        <Text style={styles.modalProgramTitle}>{selectedEvent.title}</Text>
                                        <Text style={styles.modalProgramMeta}>
                                            {selectedEvent.location} • {selectedEvent.time}
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

                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={submitRegistration}
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
    eventImage: {
        width: 56,
        height: 56,
        borderRadius: 16,
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
        backgroundColor: SP_GREEN,
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
