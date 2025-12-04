import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function ChildProtection() {
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

        // In production, send to backend API
        console.log('Child Protection Report:', formData);
        setSubmitted(true);
        setTimeout(() => {
            router.back();
        }, 3000);
    };

    const callHelpline = (number: string) => {
        Linking.openURL(`tel:${number}`);
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
        { value: 'immediate', label: 'तत्काल सहायता चाहिए (Immediate Help Needed)', color: '#dc2626' },
        { value: 'urgent', label: 'अत्यावश्यक (Urgent)', color: '#f59e0b' },
        { value: 'normal', label: 'सामान्य (Normal)', color: '#3b82f6' },
    ];

    if (submitted) {
        return (
            <View style={styles.successContainer}>
                <MaterialCommunityIcons name="shield-check" size={80} color={SP_GREEN} />
                <Text style={styles.successTitle}>रिपोर्ट सफलतापूर्वक दर्ज की गई</Text>
                <Text style={styles.successText}>
                    आपकी रिपोर्ट गोपनीय रखी जाएगी। हम जल्द से जल्द कार्रवाई करेंगे।
                </Text>
                <Text style={styles.successSubtext}>
                    आपातकालीन स्थिति में कृपया 1098 (चाइल्डलाइन) पर कॉल करें
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>बाल संरक्षण</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Alert Banner */}
                <View style={styles.alertBanner}>
                    <MaterialCommunityIcons name="alert-octagon" size={32} color="#dc2626" />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.alertTitle}>आपातकालीन हेल्पलाइन</Text>
                        <Pressable onPress={() => callHelpline('1098')}>
                            <Text style={styles.alertNumber}>📞 1098 - चाइल्डलाइन इंडिया</Text>
                        </Pressable>
                        <Pressable onPress={() => callHelpline('100')}>
                            <Text style={styles.alertNumber}>📞 100 - पुलिस</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>बाल शोषण की रिपोर्ट करें</Text>
                    <Text style={styles.infoText}>
                        यदि आप किसी बच्चे के साथ दुर्व्यवहार या शोषण के बारे में जानते हैं, तो कृपया तुरंत रिपोर्ट करें।
                        आपकी पहचान गोपनीय रखी जाएगी।
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Anonymous Toggle */}
                    <Pressable
                        style={styles.anonymousToggle}
                        onPress={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                    >
                        <MaterialCommunityIcons
                            name={formData.isAnonymous ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={SP_GREEN}
                        />
                        <Text style={styles.anonymousText}>गुमनाम रिपोर्ट करें (Anonymous Report)</Text>
                    </Pressable>

                    {!formData.isAnonymous && (
                        <>
                            {/* Reporter Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>आपका नाम (वैकल्पिक)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="नाम दर्ज करें"
                                    value={formData.reporterName}
                                    onChangeText={(text) => setFormData({ ...formData, reporterName: text })}
                                />
                            </View>

                            {/* Reporter Contact */}
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
                        <View style={styles.urgencyContainer}>
                            {urgencyLevels.map((level) => (
                                <Pressable
                                    key={level.value}
                                    style={[
                                        styles.urgencyOption,
                                        formData.urgency === level.value && {
                                            backgroundColor: `${level.color}15`,
                                            borderColor: level.color
                                        }
                                    ]}
                                    onPress={() => setFormData({ ...formData, urgency: level.value })}
                                >
                                    <MaterialCommunityIcons
                                        name={level.value === 'immediate' ? 'bell-alert' : level.value === 'urgent' ? 'clock-alert' : 'information'}
                                        size={24}
                                        color={formData.urgency === level.value ? level.color : '#cbd5e1'}
                                    />
                                    <Text style={[
                                        styles.urgencyText,
                                        formData.urgency === level.value && { color: level.color, fontWeight: '600' }
                                    ]}>{level.label}</Text>
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

                    {/* Victim Age */}
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

                    {/* Location */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>स्थान *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="गांव/शहर, जिला"
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>घटना का विवरण *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="कृपया घटना का विस्तृत विवरण दें..."
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={6}
                        />
                    </View>

                    {/* Privacy Notice */}
                    <View style={styles.privacyCard}>
                        <MaterialCommunityIcons name="shield-lock" size={20} color="#3b82f6" />
                        <Text style={styles.privacyText}>
                            आपकी जानकारी पूर्णतः गोपनीय रहेगी और केवल बाल संरक्षण उद्देश्यों के लिए उपयोग की जाएगी।
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <Pressable style={styles.submitButton} onPress={handleSubmit}>
                        <MaterialCommunityIcons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>रिपोर्ट सबमिट करें</Text>
                    </Pressable>
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
        backgroundColor: '#dc2626',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    alertBanner: {
        backgroundColor: '#fee2e2',
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: '#dc2626',
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#991b1b',
        marginBottom: 8,
    },
    alertNumber: {
        fontSize: 15,
        color: '#dc2626',
        fontWeight: '600',
        marginTop: 4,
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 22,
    },
    form: {
        padding: 20,
    },
    anonymousToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    anonymousText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#15803d',
        marginLeft: 12,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
    },
    textArea: {
        minHeight: 150,
        textAlignVertical: 'top',
    },
    urgencyContainer: {
        gap: 12,
    },
    urgencyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    urgencyText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 12,
        flex: 1,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
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
        width: 20,
        height: 20,
        borderRadius: 10,
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
        width: 10,
        height: 10,
        borderRadius: 5,
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
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
    },
    privacyText: {
        flex: 1,
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: '#dc2626',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 40,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 20,
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 24,
    },
    successSubtext: {
        fontSize: 14,
        color: '#dc2626',
        marginTop: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
});
