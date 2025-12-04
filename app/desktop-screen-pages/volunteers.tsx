import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Import the JSON data
import volunteersData from '../(tabs)/समाजवादी टेक फोर्स से जुड़ें — बने समाजवाद की डिजिटल आवाज़! (Responses) (5).json';
import DesktopHeader from '../../components/DesktopHeader';

export default function DesktopVolunteers() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('all');
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVolunteers();
    }, []);

    const loadVolunteers = () => {
        try {
            // Handle potential default export from JSON import
            const data = (volunteersData as any).default || volunteersData;
            const safeData = Array.isArray(data) ? data : [];

            // Filter only verified volunteers
            const verified = safeData.filter((item: any) =>
                item && item['वेरिफिकेशन स्टेटस ']?.trim() === 'Verified'
            );
            setVolunteers(verified);
        } catch (error) {
            console.error('Error loading volunteers:', error);
            setVolunteers([]);
        } finally {
            setLoading(false);
        }
    };

    // Get unique districts
    const districts = ['all', ...Array.from(new Set(
        volunteers.map(v => v['Column4'] || v['जिला '])
            .filter(Boolean)
    ))];

    // Filter volunteers by search and district
    const filteredVolunteers = volunteers.filter(volunteer => {
        const name = (volunteer['Column2'] || volunteer['आपका पूरा नाम क्या है? '] || '').toLowerCase();
        const district = volunteer['Column4'] || volunteer['जिला '] || '';
        const matchesSearch = name.includes(searchQuery.toLowerCase());
        const matchesDistrict = filterDistrict === 'all' || district === filterDistrict;
        return matchesSearch && matchesDistrict;
    });

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView>
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.badge}><MaterialCommunityIcons name="account-group" size={18} color={SP_RED} /><Text style={styles.badgeText}>Verified Volunteers</Text></View>
                    <Text style={styles.heroTitle}>Our Dedicated Team</Text>
                    <Text style={styles.heroSubtitle}>Meet our verified volunteers working towards a better tomorrow</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}><Text style={styles.statNumber}>{volunteers.length}</Text><Text style={styles.statLabel}>Verified Volunteers</Text></View>
                        <View style={styles.statBox}><Text style={styles.statNumber}>{districts.length - 1}</Text><Text style={styles.statLabel}>Districts</Text></View>
                    </View>
                </View>

                {/* Filter Section */}
                <View style={styles.filterSection}>
                    <View style={styles.searchBox}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.districtFilter}>
                        {districts.map((district) => (
                            <Pressable
                                key={district}
                                style={[styles.districtChip, filterDistrict === district && styles.districtChipActive]}
                                onPress={() => setFilterDistrict(district)}
                            >
                                <Text style={[styles.districtChipText, filterDistrict === district && styles.districtChipTextActive]}>
                                    {district === 'all' ? 'All Districts' : district}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Volunteers Grid */}
                <View style={styles.volunteersGrid}>
                    {filteredVolunteers.map((volunteer, index) => (
                        <View key={index} style={styles.volunteerCard}>
                            <View style={styles.volunteerHeader}>
                                <View style={styles.avatar}>
                                    <MaterialCommunityIcons name="account" size={32} color={SP_RED} />
                                </View>
                                <View style={styles.verifiedBadge}>
                                    <MaterialCommunityIcons name="check-decagram" size={16} color={SP_GREEN} />
                                </View>
                            </View>
                            <Text style={styles.volunteerName}>{volunteer['Column2'] || volunteer["आपका पूरा नाम क्या है? "] || 'N/A'}</Text>
                            <View style={styles.volunteerInfo}>
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
                                    <Text style={styles.infoText}>{volunteer['Column4'] || volunteer["जिला "] || 'N/A'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="office-building" size={16} color="#64748b" />
                                    <Text style={styles.infoText} numberOfLines={1}>{volunteer['Column5'] || volunteer["आपकी विधानसभा (Vidhan Sabha) कौन सी है? "] || 'N/A'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="phone" size={16} color="#64748b" />
                                    <Text style={styles.infoText}>{volunteer['Column3'] || volunteer["आपका मोबाइल नंबर "] || 'N/A'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="school" size={16} color="#64748b" />
                                    <Text style={styles.infoText}>{volunteer['Column14'] || volunteer["क्वालिफिकेशन "] || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={styles.volunteerFooter}>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{volunteer['Column9'] || volunteer["अगर हाँ, तो पार्टी से आपका संबंध क्या है? "] || 'समर्थक'}</Text>
                                </View>
                                <Pressable style={styles.contactBtn}>
                                    <MaterialCommunityIcons name="message-text" size={16} color={SP_RED} />
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>

                {filteredVolunteers.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-search" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No Volunteers Found</Text>
                        <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 60, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', zIndex: 100, position: 'relative' },
    headerLogo: { fontSize: 24, fontWeight: '900', color: SP_RED },
    navMenu: { flexDirection: 'row', alignItems: 'center', gap: 32 },
    navItem: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    langSwitch: { fontSize: 14, fontWeight: '600', color: '#64748b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
    loginBtn: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    signupBtn: { backgroundColor: SP_RED, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    dropdownWrapper: { position: 'relative' },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    megaMenu: { position: 'absolute', top: 40, left: -200, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, padding: 24, zIndex: 10000, minWidth: 600 },
    megaMenuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    megaMenuItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, backgroundColor: '#f8f9fa' },
    megaMenuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    megaMenuText: { flex: 1 },
    megaMenuTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
    megaMenuSubtitle: { fontSize: 12, color: '#64748b' },
    hero: { backgroundColor: '#fef2f2', paddingHorizontal: 60, paddingVertical: 60 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
    badgeText: { fontSize: 14, color: SP_RED, fontWeight: '600' },
    heroTitle: { fontSize: 48, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
    heroSubtitle: { fontSize: 18, color: '#64748b', marginBottom: 32 },
    statsRow: { flexDirection: 'row', gap: 24 },
    statBox: { backgroundColor: '#fff', padding: 24, borderRadius: 16, minWidth: 200 },
    statNumber: { fontSize: 36, fontWeight: '900', color: SP_RED, marginBottom: 8 },
    statLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    filterSection: { paddingHorizontal: 60, paddingVertical: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 20 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1e293b', outlineStyle: 'none' as any },
    districtFilter: { flexGrow: 0 },
    districtChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 12, backgroundColor: '#f1f5f9' },
    districtChipActive: { backgroundColor: SP_RED },
    districtChipText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    districtChipTextActive: { color: '#fff' },
    volunteersGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 60, gap: 24 },
    volunteerCard: { width: '31%', backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    volunteerHeader: { alignItems: 'center', marginBottom: 16, position: 'relative' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center' },
    verifiedBadge: { position: 'absolute', bottom: 0, right: '35%', backgroundColor: '#fff', borderRadius: 12, padding: 4 },
    volunteerName: { fontSize: 18, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 16 },
    volunteerInfo: { gap: 12, marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 14, color: '#64748b', flex: 1 },
    volunteerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    roleBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    roleText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    contactBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', padding: 60 },
    emptyTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 16, color: '#64748b' },
});
