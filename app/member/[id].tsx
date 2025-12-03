import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function MemberProfilePage() {
    const { id } = useLocalSearchParams();
    const [memberData, setMemberData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemberData();
    }, [id]);

    const fetchMemberData = async () => {
        try {
            // Replace with your actual API endpoint
            const response = await fetch(`https://your-api.com/api/members/${id}`);
            const data = await response.json();
            setMemberData(data);
        } catch (error) {
            console.error('Error fetching member data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate age from DOB
    const calculateAge = (dob: string) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={SP_RED} />
                <Text style={styles.loadingText}>Loading member profile...</Text>
            </View>
        );
    }

    if (!memberData) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={64} color={SP_RED} />
                <Text style={styles.errorText}>Member not found</Text>
            </View>
        );
    }

    const isVerified = memberData.verificationStatus === 'Verified';
    const age = calculateAge(memberData.dob);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#ffffff', '#f8fafc', '#f0fdf4']}
                style={styles.background}
            />

            {/* Header with Logo */}
            <View style={styles.header}>
                <Image
                    source={{ uri: "https://res.cloudinary.com/dssmutzly/image/upload/v1763543757/928c21d2-4d75-46a6-9265-0531d5433c29_txhwun.png" }}
                    style={styles.logo}
                />
                <Text style={styles.partyName}>समाजवादी टेक फोर्स</Text>
                <Text style={styles.tagline}>Samajwadi Tech Force</Text>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.photoSection}>
                    <Image
                        source={{
                            uri: memberData.profilePhoto || memberData.profileImage || "https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png"
                        }}
                        style={styles.profilePhoto}
                    />
                    <View style={styles.photoBorder} />
                </View>

                <View style={styles.nameSection}>
                    <View style={styles.nameRow}>
                        <Text style={styles.memberName}>{memberData.name}</Text>
                        {isVerified && (
                            <View style={styles.verifiedBadge}>
                                <MaterialCommunityIcons name="check-decagram" size={24} color={SP_GREEN} />
                            </View>
                        )}
                    </View>

                    <View style={styles.statusBadge}>
                        <MaterialCommunityIcons
                            name={isVerified ? "shield-check" : "shield-alert"}
                            size={16}
                            color={isVerified ? SP_GREEN : '#f59e0b'}
                        />
                        <Text style={[styles.statusText, { color: isVerified ? SP_GREEN : '#f59e0b' }]}>
                            {isVerified ? 'Verified Member' : 'Pending Verification'}
                        </Text>
                    </View>

                    <Text style={styles.memberRole}>{memberData.partyRole || 'Member'}</Text>
                    <Text style={styles.memberId}>ID: {memberData._id}</Text>
                </View>
            </View>

            {/* Information Sections */}
            <View style={styles.infoSection}>
                {/* Personal Information */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="account-circle" size={24} color={SP_RED} />
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                    </View>

                    <View style={styles.infoGrid}>
                        {memberData.phone && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="phone" size={20} color="#64748b" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Mobile</Text>
                                    <Text style={styles.infoValue}>+91 {memberData.phone}</Text>
                                </View>
                            </View>
                        )}

                        {memberData.email && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="email" size={20} color="#64748b" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{memberData.email}</Text>
                                </View>
                            </View>
                        )}

                        {age && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="calendar" size={20} color="#64748b" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Age</Text>
                                    <Text style={styles.infoValue}>{age} years</Text>
                                </View>
                            </View>
                        )}

                        {memberData.qualification && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="school" size={20} color="#64748b" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Qualification</Text>
                                    <Text style={styles.infoValue}>{memberData.qualification}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Location Information */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="map-marker" size={24} color={SP_RED} />
                        <Text style={styles.sectionTitle}>Location</Text>
                    </View>

                    <View style={styles.infoGrid}>
                        {memberData.district && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="city" size={20} color="#64748b" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>District</Text>
                                    <Text style={styles.infoValue}>{memberData.district}</Text>
                                </View>
                            </View>
                        )}

                        {memberData.vidhanSabha && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="office-building" size={20} color="#64748b" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Vidhan Sabha</Text>
                                    <Text style={styles.infoValue}>{memberData.vidhanSabha}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Party Information */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="account-group" size={24} color={SP_RED} />
                        <Text style={styles.sectionTitle}>Party Information</Text>
                    </View>

                    <View style={styles.infoGrid}>
                        {memberData.partyJoiningDate && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="calendar-check" size={20} color="#64748b" />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Member Since</Text>
                                    <Text style={styles.infoValue}>{new Date(memberData.partyJoiningDate).getFullYear()}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="account-star" size={20} color="#64748b" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Role</Text>
                                <Text style={styles.infoValue}>{memberData.partyRole || 'Member'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <MaterialCommunityIcons name="web" size={16} color="#94a3b8" />
                <Text style={styles.footerText}>www.samajwaditechforce.com</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 40,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        color: '#64748b',
        fontWeight: '700',
    },

    // Header
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 32,
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    partyName: {
        fontSize: 24,
        fontWeight: '900',
        color: SP_RED,
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },

    // Profile Card
    profileCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 24,
    },
    photoSection: {
        position: 'relative',
        marginBottom: 20,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    photoBorder: {
        position: 'absolute',
        top: -4,
        left: -4,
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 4,
        borderColor: SP_RED,
    },
    nameSection: {
        alignItems: 'center',
        width: '100%',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    memberName: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
    },
    verifiedBadge: {
        backgroundColor: '#f0fdf4',
        borderRadius: 20,
        padding: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
    },
    memberRole: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 8,
    },
    memberId: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Information Sections
    infoSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#f1f5f9',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    infoGrid: {
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '700',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '600',
    },
});
