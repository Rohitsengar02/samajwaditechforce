import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DesktopHeader from '../../components/DesktopHeader';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopChildProtection() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        reporterName: '',
        reporterContact: '',
        isAnonymous: false,
        incidentType: '',
        victimAge: '',
        location: '',
        description: '',
        urgency: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!formData.description || !formData.location) {
            Alert.alert('Required', 'Please provide incident details and location');
            return;
        }

        console.log('Child Protection Report:', formData);
        setSubmitted(true);
        setTimeout(() => {
            router.push('/desktop-screen-pages/home');
        }, 3500);
    };

    const callHelpline = (number: string) => {
        window.open(`tel:${number}`, '_self');
    };

    const incidentTypes = [
        'शारीरिक शोषण (Physical Abuse)',
        'यौन शोषण (Sexual Abuse)',
        'भावनात्मक शोषण (Emotional Abuse)',
        'उपेक्षा (Neglect)',
        'बाल श्रम (Child Labor)',
        'अन्य (Other)',
    ];

    const urgencyLevels = [
        { value: 'immediate', label: 'तत्काल', sublabel: 'Immediate Help', color: '#dc2626', icon: 'alert-octagon' },
        { value: 'urgent', label: 'अत्यावश्यक', sublabel: 'Urgent', color: '#f59e0b', icon: 'clock-alert' },
        { value: 'normal', label: 'सामान्य', sublabel: 'Normal', color: '#3b82f6', icon: 'information' },
    ];

    if (submitted) {
        return (
            <View style={styles.container}>
                <DesktopHeader />
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <MaterialCommunityIcons name="shield-check" size={80} color="#fff" />
                    </View>
                    <Text style={styles.successTitle}>रिपोर्ट सफलतापूर्वक दर्ज की गई</Text>
                    <Text style={styles.successText}>
                        आपकी रिपोर्ट गोपनीय रखी जाएगी। हमारी टीम जल्द से जल्द कार्रवाई करेगी।
                    </Text>
                    <Text style={styles.successSubtext}>
                        आपातकालीन स्थिति में कृपया 1098 (चाइल्डलाइन) पर कॉल करें
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <MaterialCommunityIcons name="shield-account" size={60} color="#dc2626" />
                    <Text style={styles.heroTitle}>बाल संरक्षण एवं रिपोर्टिंग</Text>
                    <Text style={styles.heroSubtitle}>
                        बच्चों की सुरक्षा हमारी प्राथमिकता है। यदि आप किसी बाल शोषण की जानकारी रखते हैं, तो कृपया तुरंत रिपोर्ट करें।
                    </Text>
                </View>

                {/* Emergency Helplines */}
                <View style={styles.helplinesSection}>
                    <Text style={styles.sectionTitle}>आपातकालीन हेल्पलाइन</Text>
                    <View style={styles.helplinesGrid}>
                        <Pressable style={styles.helplineCard} onPress={() => callHelpline('1098')}>
                            <MaterialCommunityIcons name="phone-in-talk" size={40} color="#dc2626" />
                            <Text style={styles.helplineNumber}>1098</Text>
                            <Text style={styles.helplineLabel}>चाइल्डलाइन इंडिया</Text>
                            <Text style={styles.helplineDesc}>24/7 उपलब्ध</Text>
                        </Pressable>
                        <Pressable style={styles.helplineCard} onPress={() => callHelpline('100')}>
                            <MaterialCommunityIcons name="shield-star" size={40} color="#1e40af" />
                            <Text style={styles.helplineNumber}>100</Text>
                            <Text style={styles.helplineLabel}>पुलिस</Text>
                            <Text style={styles.helplineDesc}>तत्काल सहायता</Text>
                        </Pressable>
                        <Pressable style={styles.helplineCard} onPress={() => callHelpline('102')}>
                            <MaterialCommunityIcons name="ambulance" size={40} color="#16a34a" />
                            <Text style={styles.helplineNumber}>102</Text>
                            <Text style={styles.helplineLabel}>एम्बुलेंस</Text>
                            <Text style={styles.helplineDesc}>चिकित्सा सहायता</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Form Container */}
                <View style={styles.formContainer}>
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>गोपनीय रिपोर्ट दर्ज करें</Text>

                        <View style={styles.formGrid}>
                            {/* Left Column */}
                            <View style={styles.column}>
                                {/* Anonymous Toggle */}
                                <Pressable
                                    style={styles.anonymousToggle}
                                    onPress={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                                >
                                    <MaterialCommunityIcons
                                        name={formData.isAnonymous ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={28}
                                        color={SP_GREEN}
                                    />
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={styles.anonymousTitle}>गुमनाम रिपोर्ट करें</Text>
                                        <Text style={styles.anonymousSubtext}>आपकी पहचान गोपनीय रहेगी</Text>
                                    </View>
                                </Pressable>

                                {!formData.isAnonymous && (
                                    <>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>आपका नाम (वैकल्पिक)</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="नाम दर्ज करें"
                                                value={formData.reporterName}
                                                onChangeText={(text) => setFormData({ ...formData, reporterName: text })}
                                            />
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>संपर्क नंबर (वैकल्पिक)</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="10 अंकों का मोबाइल नंबर"
                                                value={formData.reporterContact}
                                                onChangeText={(text) => setFormData({ ...formData, reporterContact: text })}
                                                keyboardType="phone-pad"
                                                maxLength={10}
                                            />
                                        </View>
                                    </>
                                )}

                                {/* Urgency Level */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>गंभीरता स्तर *</Text>
                                    <View style={styles.urgencyGrid}>
                                        {urgencyLevels.map((level) => (
                                            <Pressable
                                                key={level.value}
                                                style={[
                                                    styles.urgencyCard,
                                                    formData.urgency === level.value && {
                                                        backgroundColor: `${level.color}15`,
                                                        borderColor: level.color,
                                                        borderWidth: 2,
                                                    }
                                                ]}
                                                onPress={() => setFormData({ ...formData, urgency: level.value })}
                                            >
                                                <MaterialCommunityIcons
                                                    name={level.icon as any}
                                                    size={36}
                                                    color={formData.urgency === level.value ? level.color : '#cbd5e1'}
                                                />
                                                <Text style={[
                                                    styles.urgencyLabel,
                                                    formData.urgency === level.value && { color: level.color, fontWeight: '700' }
                                                ]}>{level.label}</Text>
                                                <Text style={[
                                                    styles.urgencySublabel,
                                                    formData.urgency === level.value && { color: level.color }
                                                ]}>{level.sublabel}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                {/* Incident Type */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>घटना का प्रकार *</Text>
                                    {incidentTypes.map((type) => (
                                        <Pressable
                                            key={type}
                                            style={[
                                                styles.option,
                                                formData.incidentType === type && styles.optionSelected
                                            ]}
                                            onPress={() => setFormData({ ...formData, incidentType: type })}
                                        >
                                            <View style={[
                                                styles.radio,
                                                formData.incidentType === type && styles.radioSelected
                                            ]}>
                                                {formData.incidentType === type && <View style={styles.radioDot} />}
                                            </View>
                                            <Text style={[
                                                styles.optionText,
                                                formData.incidentType === type && styles.optionTextSelected
                                            ]}>{type}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Right Column */}
                            <View style={styles.column}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>पीड़ित की अनुमानित आयु</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="आयु (वर्ष में)"
                                        value={formData.victimAge}
                                        onChangeText={(text) => setFormData({ ...formData, victimAge: text })}
                                        keyboardType="number-pad"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>स्थान *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="गांव/शहर, जिला, राज्य"
                                        value={formData.location}
                                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>घटना का विस्तृत विवरण *</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="कृपया घटना का विस्तृत विवरण दें। जितनी अधिक जानकारी आप देंगे, उतना बेहतर हम मदद कर सकेंगे।"
                                        value={formData.description}
                                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                                        multiline
                                        numberOfLines={12}
                                    />
                                </View>

                                {/* Privacy Notice */}
                                <View style={styles.privacyCard}>
                                    <MaterialCommunityIcons name="shield-lock" size={24} color="#3b82f6" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.privacyTitle}>गोपनीयता की गारंटी</Text>
                                        <Text style={styles.privacyText}>
                                            आपकी पहचान और जानकारी पूर्णतः सुरक्षित रहेगी। यह केवल बाल संरक्षण और कानूनी कार्यवाई के लिए उपयोग की जाएगी।
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <Pressable style={styles.submitButton} onPress={handleSubmit}>
                            <MaterialCommunityIcons name="send" size={24} color="#fff" />
                            <Text style={styles.submitButtonText}>रिपोर्ट सबमिट करें</Text>
                        </Pressable>
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
    hero: {
        backgroundColor: '#fff',
        paddingVertical: 60,
        paddingHorizontal: 40,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1e293b',
        marginTop: 20,
        marginBottom: 16,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 800,
        lineHeight: 24,
    },
    helplinesSection: {
        padding: 40,
        backgroundColor: '#fef2f2',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 24,
        textAlign: 'center',
    },
    helplinesGrid: {
        flexDirection: 'row',
        gap: 24,
        justifyContent: 'center',
        maxWidth: 1000,
        alignSelf: 'center',
    },
    helplineCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    helplineNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 16,
    },
    helplineLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 8,
    },
    helplineDesc: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 4,
    },
    formContainer: {
        padding: 60,
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    formGrid: {
        flexDirection: 'row',
        gap: 48,
    },
    column: {
        flex: 1,
    },
    anonymousToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        padding: 20,
        borderRadius: 12,
        marginBottom: 28,
        borderWidth: 2,
        borderColor: '#bbf7d0',
    },
    anonymousTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#15803d',
    },
    anonymousSubtext: {
        fontSize: 13,
        color: '#16a34a',
        marginTop: 2,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
    },
    textArea: {
        minHeight: 280,
        textAlignVertical: 'top',
    },
    urgencyGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    urgencyCard: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    urgencyLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 12,
    },
    urgencySublabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 12,
    },
    optionSelected: {
        backgroundColor: '#fee2e2',
        borderColor: '#dc2626',
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: '#dc2626',
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#dc2626',
    },
    optionText: {
        fontSize: 15,
        color: '#64748b',
    },
    optionTextSelected: {
        color: '#dc2626',
        fontWeight: '600',
    },
    privacyCard: {
        flexDirection: 'row',
        backgroundColor: '#dbeafe',
        padding: 20,
        borderRadius: 12,
        gap: 16,
    },
    privacyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e40af',
        marginBottom: 4,
    },
    privacyText: {
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: '#dc2626',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 12,
        marginTop: 32,
        gap: 12,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 60,
    },
    successIcon: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: SP_GREEN,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
        textAlign: 'center',
    },
    successText: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 600,
        lineHeight: 28,
    },
    successSubtext: {
        fontSize: 16,
        color: '#dc2626',
        marginTop: 24,
        textAlign: 'center',
        fontWeight: '600',
    },
});
