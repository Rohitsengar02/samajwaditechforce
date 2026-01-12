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
    ActivityIndicator,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../components/TranslatedText';
import { getApiUrl } from '../utils/api';

const { width } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

interface VerifiedMember {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: any;
    profileImage?: string;
    verificationStatus: string;
    role?: string;
    createdAt: string;
    district?: string;
    vidhanSabha?: string;
    isVolunteer?: boolean;
}

const VolunteerCard = ({ volunteer, delay }: { volunteer: VerifiedMember; delay: number }) => {
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
        if (volunteer.isVolunteer) return '#3B82F6';
        const role = volunteer.role || 'member';
        if (role === 'admin') return SP_RED;
        if (role === 'moderator') return '#3B82F6';
        return SP_GREEN;
    };

    const formatAddress = (addr: any) => {
        if (!addr) return 'N/A';
        if (typeof addr === 'string') return addr;
        if (typeof addr === 'object') {
            const parts = [addr.city, addr.state, addr.district].filter(Boolean);
            return parts.length > 0 ? parts.join(', ') : 'N/A';
        }
        return 'N/A';
    };

    const getLocation = () => {
        if (volunteer.district) return volunteer.district;
        if (volunteer.address) return formatAddress(volunteer.address);
        return 'N/A';
    };

    // Check if image URL is valid (not blob URL which React Native doesn't support)
    const isValidImageUrl = (url: string | undefined) => {
        if (!url) return false;
        if (url.startsWith('blob:')) return false;
        if (url.startsWith('data:')) return true;
        if (url.startsWith('http://') || url.startsWith('https://')) return true;
        return false;
    };

    const hasValidImage = isValidImageUrl(volunteer.profileImage);

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
                    {hasValidImage ? (
                        <Image
                            source={{ uri: volunteer.profileImage }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <View style={[styles.avatarContainer, { backgroundColor: getRoleColor() + '15' }]}>
                            <Image
                                source={require('../assets/images/icon.png')}
                                style={styles.avatarIcon}
                            />
                        </View>
                    )}

                    <View style={styles.headerInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.volunteerName} numberOfLines={1}>
                                <TranslatedText>{volunteer.name || 'N/A'}</TranslatedText>
                            </Text>
                            <View style={[styles.verifiedBadge, { backgroundColor: volunteer.isVolunteer ? '#3B82F6' : SP_GREEN }]}>
                                <MaterialCommunityIcons name={volunteer.isVolunteer ? "account" : "check-decagram"} size={16} color="#fff" />
                            </View>
                        </View>
                        <Text style={styles.volunteerRole}>
                            <TranslatedText>{volunteer.isVolunteer ? (volunteer.role || 'Volunteer') : 'Verified Member'}</TranslatedText>
                        </Text>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
                        <Text style={styles.detailText}>
                            <TranslatedText>{getLocation()}</TranslatedText>
                        </Text>
                    </View>

                    {volunteer.vidhanSabha && (
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="office-building" size={16} color="#64748b" />
                            <Text style={styles.detailText} numberOfLines={1}>
                                <TranslatedText>{volunteer.vidhanSabha}</TranslatedText>
                            </Text>
                        </View>
                    )}

                    {volunteer.phone && (
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="phone" size={16} color="#64748b" />
                            <Text style={styles.detailText}>{volunteer.phone}</Text>
                        </View>
                    )}

                    {volunteer.email && (
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="email" size={16} color="#64748b" />
                            <Text style={styles.detailText} numberOfLines={1}>
                                {volunteer.email}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <Text style={styles.timestamp}>
                        <TranslatedText>{`Joined: ${volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}`}</TranslatedText>
                    </Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

export default function VolunteersPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [verifiedMembers, setVerifiedMembers] = useState<VerifiedMember[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

    const API_URL = getApiUrl();

    // Extract unique districts from verified members
    const uniqueDistricts = React.useMemo(() => {
        const districtSet = new Set<string>();
        verifiedMembers.forEach(member => {
            if (member.district && member.district.toLowerCase() !== 'agra') {
                districtSet.add(member.district);
            }
        });
        return Array.from(districtSet).sort();
    }, [verifiedMembers]);

    // Fetch verified members from API
    useEffect(() => {
        fetchVerifiedMembers();
    }, []);

    // Debug: Log when verifiedMembers changes
    useEffect(() => {
        console.log('verifiedMembers state updated:', verifiedMembers.length, 'members');
        if (verifiedMembers.length > 0) {
            console.log('First member:', verifiedMembers[0]?.name);
        }
    }, [verifiedMembers]);

    const fetchVerifiedMembers = async () => {
        try {
            setLoading(true);
            console.log('Fetching verified members from:', `${API_URL}/auth/verified-members`);

            const response = await fetch(`${API_URL}/auth/verified-members`);
            const data = await response.json();

            console.log('Verified members response:', JSON.stringify(data, null, 2));

            let members: VerifiedMember[] = [];

            if (data.success && data.data && Array.isArray(data.data)) {
                members = data.data;
                console.log('Setting members from data.data:', members.length);
            } else if (Array.isArray(data)) {
                members = data;
                console.log('Setting members from array:', members.length);
            } else if (data.users && Array.isArray(data.users)) {
                members = data.users.filter((u: any) => u.verificationStatus === 'Verified');
                console.log('Setting members from data.users:', members.length);
            }

            console.log('Total members to display:', members.length);
            setVerifiedMembers(members);
        } catch (error: any) {
            console.error('Error fetching verified members:', error);
            setVerifiedMembers([]);
        } finally {
            setLoading(false);
        }
    };

    // Apply search and district filter
    const filteredVolunteers = verifiedMembers.filter((vol) => {
        // District filter
        if (selectedDistrict !== 'all') {
            const volDistrict = vol.district || '';
            if (!volDistrict.toLowerCase().includes(selectedDistrict.toLowerCase())) {
                return false;
            }
        }

        // Search filter
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        const name = vol.name?.toLowerCase() || '';
        const email = vol.email?.toLowerCase() || '';
        const phone = vol.phone || '';

        return name.includes(searchLower) ||
            email.includes(searchLower) ||
            phone.includes(searchLower);
    });

    // Stats
    const totalVerified = selectedDistrict === 'all' ? verifiedMembers.length : filteredVolunteers.length;

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
                            <TranslatedText>Verified Members</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>समाजवादी टेक फोर्स सदस्य</TranslatedText>
                        </Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { flex: 1 }]}>
                            <Text style={styles.statNumber}>{totalVerified}</Text>
                            <Text style={styles.statLabel}>
                                <TranslatedText>Total Verified Members</TranslatedText>
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* District Filter Pills */}
                <View style={styles.districtFilterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.districtScrollContent}
                    >
                        {/* All Districts */}
                        <TouchableOpacity
                            style={[styles.districtPill, selectedDistrict === 'all' && styles.districtPillActive]}
                            onPress={() => setSelectedDistrict('all')}
                        >
                            <Text style={[styles.districtPillText, selectedDistrict === 'all' && styles.districtPillTextActive]}>
                                All Districts
                            </Text>
                        </TouchableOpacity>

                        {/* District Pills */}
                        {uniqueDistricts.map((districtName: string) => {
                            const isActive = selectedDistrict === districtName;
                            return (
                                <TouchableOpacity
                                    key={districtName}
                                    style={[styles.districtPill, isActive && styles.districtPillActive]}
                                    onPress={() => setSelectedDistrict(districtName)}
                                >
                                    <Text style={[styles.districtPillText, isActive && styles.districtPillTextActive]}>
                                        {districtName}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={styles.content}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name..."
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

                    {/* Results Count */}
                    <Text style={styles.resultsText}>
                        <TranslatedText>{`Showing ${filteredVolunteers.length} verified member${filteredVolunteers.length !== 1 ? 's' : ''}`}</TranslatedText>
                    </Text>

                    {/* Loading State */}
                    {loading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={[styles.emptyText, { marginTop: 16 }]}>
                                <TranslatedText>Loading verified members...</TranslatedText>
                            </Text>
                        </View>
                    ) : (
                        /* Volunteers List */
                        <View style={styles.volunteersContainer}>
                            {filteredVolunteers.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <MaterialCommunityIcons name="account-search" size={64} color="#CBD5E1" />
                                    <Text style={styles.emptyText}>
                                        <TranslatedText>No verified members found</TranslatedText>
                                    </Text>
                                    <Text style={styles.emptySubtext}>
                                        <TranslatedText>Try a different search</TranslatedText>
                                    </Text>
                                </View>
                            ) : (
                                filteredVolunteers.map((volunteer, idx) => (
                                    <VolunteerCard
                                        key={volunteer._id || idx}
                                        volunteer={volunteer}
                                        delay={Math.min(idx * 50, 1000)}
                                    />
                                ))
                            )}
                        </View>
                    )}
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
    // District Filter Styles
    districtFilterContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    districtScrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    districtPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    districtPillActive: {
        backgroundColor: '#E30512',
        borderColor: '#E30512',
    },
    districtPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    districtPillTextActive: {
        color: '#fff',
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
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    avatarIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
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
