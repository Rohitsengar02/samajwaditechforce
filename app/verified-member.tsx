import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Text, Card, Button, RadioButton, Chip, Title, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import IDCardPreview from '@/components/idcards/IDCardPreview';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function VerifiedMemberScreen() {
    const router = useRouter();
    const [role, setRole] = useState('Member');
    const [status, setStatus] = useState('Not Verified');
    const [showBack, setShowBack] = useState(false);

    // Mock member data for preview
    const memberData = {
        fullName: 'Samajwadi Member',
        mobile: '9876543210',
        district: 'Lucknow',
        vidhanSabha: 'Lucknow Central',
        photoUri: 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png',
        partyRole: role
    };

    const roles = [
        'Member',
        'Volunteer',
        'District Coordinator',
        'Booth Adhyaksh',
        'Sector Prabhari'
    ];

    const handleVerify = () => {
        setStatus('Pending Verification');
        Alert.alert('Success', 'Your verification request has been submitted. We will review your details shortly.');
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Title style={styles.headerTitle}>Membership & Verification</Title>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Registration Status */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="shield-account" size={24} color={SP_RED} />
                            <Text style={styles.sectionTitle}>Registration Status</Text>
                        </View>

                        <View style={[styles.statusBadge, status === 'Verified' ? styles.verified : styles.notVerified]}>
                            <MaterialCommunityIcons
                                name={status === 'Verified' ? "check-decagram" : "alert-circle-outline"}
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.statusText}>{status}</Text>
                        </View>

                        <Text style={styles.statusDescription}>
                            {status === 'Verified'
                                ? 'Your profile is verified. You can now access all member features.'
                                : 'Complete your profile and select a role to request verification.'}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Role Selection */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="account-tie" size={24} color={SP_RED} />
                            <Text style={styles.sectionTitle}>Select Member Role</Text>
                        </View>
                        <Text style={styles.helperText}>Choose the role you want to apply for:</Text>

                        <View style={styles.rolesContainer}>
                            {roles.map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.roleChip, role === r && styles.roleChipSelected]}
                                    onPress={() => setRole(r)}
                                >
                                    <Text style={[styles.roleText, role === r && styles.roleTextSelected]}>{r}</Text>
                                    {role === r && <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card.Content>
                </Card>

                {/* Digital ID Card Preview */}
                <View style={styles.previewSection}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="card-account-details" size={24} color={SP_RED} />
                        <Text style={styles.sectionTitle}>Digital ID Card Preview</Text>
                    </View>

                    <View style={styles.idCardContainer}>
                        <IDCardPreview memberData={{ ...memberData, partyRole: role }} showBack={showBack} />
                    </View>

                    <TouchableOpacity style={styles.flipButton} onPress={() => setShowBack(!showBack)}>
                        <MaterialCommunityIcons name="rotate-3d-variant" size={20} color={SP_RED} />
                        <Text style={styles.flipButtonText}>{showBack ? 'View Front' : 'View Back'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleVerify}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={[SP_RED, '#b91c1c']}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>Submit for Verification</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        marginBottom: 20,
        borderRadius: 16,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        marginBottom: 12,
    },
    verified: {
        backgroundColor: SP_GREEN,
    },
    notVerified: {
        backgroundColor: '#ef4444',
    },
    statusText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    statusDescription: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 14,
        lineHeight: 20,
    },
    helperText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    rolesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 6,
    },
    roleChipSelected: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    roleTextSelected: {
        color: '#fff',
    },
    previewSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    idCardContainer: {
        transform: [{ scale: 0.9 }],
        marginVertical: -10,
    },
    flipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    flipButtonText: {
        color: SP_RED,
        fontWeight: '600',
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
