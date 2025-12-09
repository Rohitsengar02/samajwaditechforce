import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Import the JSON data
import volunteersData from './(tabs)/समाजवादी टेक फोर्स से जुड़ें — बने समाजवाद की डिजिटल आवाज़! (Responses) (5).json';
import { TranslatedText } from '../components/TranslatedText';

const { width } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

interface Volunteer {
    'Timestamp': string;
    'आपका पूरा नाम क्या है? ': string;
    'आपका मोबाइल नंबर ': number | string;
    'जिला ': string;
    'आपकी विधानसभा (Vidhan Sabha) कौन सी है? ': string;
    'आपकी उम्र क्या है? ': number;
    'अगर हाँ, तो पार्टी से आपका संबंध क्या है? ': string;
    'E Mail ID ': string;
    'क्वालिफिकेशन ': string;
    'वेरिफिकेशन स्टेटस ': string;
    'बातचीत के दौरान उसका माइंडसेट कैसा है ': string;
}

const VolunteerCard = ({ volunteer, delay }: { volunteer: any; delay: number }) => {
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

    const getRoleColor = () => {
        const role = volunteer['Column9'] || volunteer['अगर हाँ, तो पार्टी से आपका संबंध क्या है? '];
        if (role?.includes('पदाधिकारी')) return SP_RED;
        if (role?.includes('कार्यकर्ता')) return SP_GREEN;
        return '#3B82F6';
    };

    const getMindsetIcon = () => {
        const mindset = volunteer['बातचीत के दौरान उसका माइंडसेट कैसा है '];
        if (mindset === 'A') return 'star';
        if (mindset === 'B') return 'star-half-full';
        return 'star-outline';
    };

    const name = volunteer['Column2'] || volunteer['आपका पूरा नाम क्या है? '] || 'N/A';
    const role = volunteer['Column9'] || volunteer['अगर हाँ, तो पार्टी से आपका संबंध क्या है? '] || 'समर्थक';
    const district = volunteer['Column4'] || volunteer['जिला '] || 'N/A';
    const vidhanSabha = volunteer['Column5'] || volunteer['आपकी विधानसभा (Vidhan Sabha) कौन सी है? '] || 'N/A';
    const mobile = volunteer['Column3'] || volunteer['आपका मोबाइल नंबर '] || 'N/A';
    const email = volunteer['Column13'] || volunteer['E Mail ID '];
    const qualification = volunteer['Column14'] || volunteer['क्वालिफिकेशन '] || 'N/A';
    const age = volunteer['Column6'] || volunteer['आपकी उम्र क्या है? '] || 'N/A';
    const timestamp = volunteer['Column1'] || volunteer['Timestamp'];

    return (
        <Animated.View
            style={[
                styles.volunteerCard,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
        >
            <LinearGradient colors={['#fff', '#f8fafc']} style={styles.cardGradient}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: getRoleColor() + '20' }]}>
                        <Text style={[styles.avatarText, { color: getRoleColor() }]}>
                            {name?.charAt(0) || '?'}
                        </Text>
                    </View>

                    <View style={styles.headerInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.volunteerName} numberOfLines={1}>
                                <TranslatedText>{name}</TranslatedText>
                            </Text>
                            <View style={[styles.verifiedBadge, { backgroundColor: SP_GREEN }]}>
                                <MaterialCommunityIcons name="check-decagram" size={16} color="#fff" />
                            </View>
                        </View>
                        <Text style={styles.volunteerRole}>
                            <TranslatedText>{role}</TranslatedText>
                        </Text>
                    </View>

                    <View style={styles.mindsetBadge}>
                        <MaterialCommunityIcons
                            name={getMindsetIcon()}
                            size={20}
                            color="#F59E0B"
                        />
                    </View>
                </View>

                {/* Details */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
                        <Text style={styles.detailText}>
                            <TranslatedText>{`${district} - ${vidhanSabha}`}</TranslatedText>
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="phone" size={16} color="#64748b" />
                        <Text style={styles.detailText}>{mobile}</Text>
                    </View>

                    {email && (
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="email" size={16} color="#64748b" />
                            <Text style={styles.detailText} numberOfLines={1}>
                                {email}
                            </Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="school" size={16} color="#64748b" />
                        <Text style={styles.detailText}>
                            <TranslatedText>{`${qualification} • Age: ${age}`}</TranslatedText>
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <Text style={styles.timestamp}>
                        <TranslatedText>{`Joined: ${timestamp ? new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}`}</TranslatedText>
                    </Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

export default function VolunteersPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'पदाधिकारी' | 'कार्यकर्ता' | 'समर्थक'>('all');

    // Handle potential default export from JSON import
    const data = (volunteersData as any).default || volunteersData;
    const safeData = Array.isArray(data) ? data : [];

    // Filter only verified volunteers
    const verifiedVolunteers = safeData.filter((vol: any) =>
        vol && vol['वेरिफिकेशन स्टेटस ']?.trim() === 'Verified'
    );

    // Apply search and role filter
    // Apply search and role filter
    const filteredVolunteers = verifiedVolunteers.filter((vol: any) => {
        const name = vol['Column2'] || vol['आपका पूरा नाम क्या है? '];
        const district = vol['Column4'] || vol['जिला '];
        const vidhanSabha = vol['Column5'] || vol['आपकी विधानसभा (Vidhan Sabha) कौन सी है? '];
        const role = vol['Column9'] || vol['अगर हाँ, तो पार्टी से आपका संबंध क्या है? '];

        const matchesSearch = !searchQuery ||
            name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vidhanSabha?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === 'all' ||
            role?.includes(filterRole);

        return matchesSearch && matchesRole;
    });

    // Stats
    const totalVerified = verifiedVolunteers.length;
    const officers = verifiedVolunteers.filter((v: Volunteer) =>
        v['अगर हाँ, तो पार्टी से आपका संबंध क्या है? ']?.includes('पदाधिकारी')
    ).length;
    const workers = verifiedVolunteers.filter((v: Volunteer) =>
        v['अगर हाँ, तो पार्टी से आपका संबंध क्या है? ']?.includes('कार्यकर्ता')
    ).length;
    const supporters = verifiedVolunteers.filter((v: Volunteer) =>
        v['अगर हाँ, तो पार्टी से आपका संबंध क्या है? ']?.includes('समर्थक')
    ).length;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient colors={['#3B82F6', '#2563EB', '#1E40AF']} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <MaterialCommunityIcons name="account-group" size={64} color="#fff" />
                        <Text style={styles.headerTitle}>
                            <TranslatedText>Verified Volunteers</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>समाजवादी टेक फोर्स सदस्य</TranslatedText>
                        </Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{totalVerified}</Text>
                            <Text style={styles.statLabel}>
                                <TranslatedText>Total</TranslatedText>
                            </Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{officers}</Text>
                            <Text style={styles.statLabel}>
                                <TranslatedText>Officers</TranslatedText>
                            </Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{workers}</Text>
                            <Text style={styles.statLabel}>
                                <TranslatedText>Workers</TranslatedText>
                            </Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{supporters}</Text>
                            <Text style={styles.statLabel}>
                                <TranslatedText>Supporters</TranslatedText>
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name, district, or vidhan sabha..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Pills */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContainer}
                    >
                        <TouchableOpacity
                            style={[styles.filterPill, filterRole === 'all' && styles.filterPillActive]}
                            onPress={() => setFilterRole('all')}
                        >
                            <Text style={[styles.filterText, filterRole === 'all' && styles.filterTextActive]}>
                                <TranslatedText>{`All (${totalVerified})`}</TranslatedText>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterPill, filterRole === 'पदाधिकारी' && styles.filterPillActive]}
                            onPress={() => setFilterRole('पदाधिकारी')}
                        >
                            <Text style={[styles.filterText, filterRole === 'पदाधिकारी' && styles.filterTextActive]}>
                                <TranslatedText>{`पदाधिकारी (${officers})`}</TranslatedText>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterPill, filterRole === 'कार्यकर्ता' && styles.filterPillActive]}
                            onPress={() => setFilterRole('कार्यकर्ता')}
                        >
                            <Text style={[styles.filterText, filterRole === 'कार्यकर्ता' && styles.filterTextActive]}>
                                <TranslatedText>{`कार्यकर्ता (${workers})`}</TranslatedText>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterPill, filterRole === 'समर्थक' && styles.filterPillActive]}
                            onPress={() => setFilterRole('समर्थक')}
                        >
                            <Text style={[styles.filterText, filterRole === 'समर्थक' && styles.filterTextActive]}>
                                <TranslatedText>{`समर्थक (${supporters})`}</TranslatedText>
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Results Count */}
                    <Text style={styles.resultsText}>
                        <TranslatedText>{`Showing ${filteredVolunteers.length} verified volunteer${filteredVolunteers.length !== 1 ? 's' : ''}`}</TranslatedText>
                    </Text>

                    {/* Volunteers List */}
                    <View style={styles.volunteersContainer}>
                        {filteredVolunteers.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="account-search" size={64} color="#CBD5E1" />
                                <Text style={styles.emptyText}>
                                    <TranslatedText>No volunteers found</TranslatedText>
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    <TranslatedText>Try a different search or filter</TranslatedText>
                                </Text>
                            </View>
                        ) : (
                            filteredVolunteers.slice(2).map((volunteer: Volunteer, idx) => (
                                <VolunteerCard
                                    key={String(volunteer['आपका मोबाइल नंबर ']) + idx}
                                    volunteer={volunteer}
                                    delay={Math.min(idx * 50, 1000)}
                                />
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
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        marginLeft: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterPillActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#fff',
    },
    resultsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 16,
    },
    volunteersContainer: {
        gap: 16,
    },
    volunteerCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardGradient: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '900',
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    volunteerName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1e293b',
        flex: 1,
    },
    verifiedBadge: {
        borderRadius: 12,
        padding: 2,
    },
    volunteerRole: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    mindsetBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsSection: {
        gap: 10,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
    },
    timestamp: {
        fontSize: 12,
        color: '#94A3B8',
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
