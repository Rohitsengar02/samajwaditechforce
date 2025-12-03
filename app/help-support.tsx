import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SP_RED = '#E30512';

export default function HelpSupportScreen() {
    const router = useRouter();

    const handleEmail = () => {
        Linking.openURL('mailto:support@samajwadiparty.in');
    };

    const handleCall = () => {
        Linking.openURL('tel:+911234567890');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <MaterialCommunityIcons name="lifebuoy" size={48} color={SP_RED} style={styles.icon} />
                    <Text style={styles.cardTitle}>How can we help you?</Text>
                    <Text style={styles.cardText}>
                        Our dedicated support team is here to assist you with any questions or issues you may have regarding the app or your membership.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Options</Text>

                    <TouchableOpacity style={styles.option} onPress={handleEmail}>
                        <View style={[styles.optionIcon, { backgroundColor: '#eff6ff' }]}>
                            <MaterialCommunityIcons name="email" size={24} color="#2563eb" />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>Email Support</Text>
                            <Text style={styles.optionSubtitle}>support@samajwadiparty.in</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option} onPress={handleCall}>
                        <View style={[styles.optionIcon, { backgroundColor: '#f0fdf4' }]}>
                            <MaterialCommunityIcons name="phone" size={24} color="#16a34a" />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>Call Us</Text>
                            <Text style={styles.optionSubtitle}>+91 917307127762</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {/* Add FAQ items here if needed */}
                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>How do I update my profile?</Text>
                        <Text style={styles.faqAnswer}>Go to the Profile tab and tap on the "Edit Profile" option to update your details.</Text>
                    </View>
                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>How can I download my ID card?</Text>
                        <Text style={styles.faqAnswer}>Navigate to the Profile tab and select "ID Card" to view and download your digital ID.</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    icon: {
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
        marginLeft: 4,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    optionSubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
    faqItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
});
