import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DesktopHeader from '../../components/DesktopHeader';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopSurvey() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        district: '',
        vidhanSabha: '',
        rating: 0,
        topIssue: '',
        partyPerformance: '',
        suggestions: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        console.log('Survey Data:', formData);
        setSubmitted(true);
        setTimeout(() => {
            router.push('/desktop-screen-pages/home');
        }, 2500);
    };

    const issues = [
        'शिक्षा (Education)',
        'स्वास्थ्य (Healthcare)',
        'रोजगार (Employment)',
        'सड़क और बुनियादी ढांचा (Roads & Infrastructure)',
        'कानून व्यवस्था (Law & Order)',
        'अन्य (Other)',
    ];

    if (submitted) {
        return (
            <View style={styles.container}>
                <DesktopHeader />
                <View style={styles.successContainer}>
                    <MaterialCommunityIcons name="check-circle" size={100} color={SP_GREEN} />
                    <Text style={styles.successTitle}>सर्वेक्षण सफलतापूर्वक जमा हुआ!</Text>
                    <Text style={styles.successText}>आपकी राय हमारे लिए बहुत महत्वपूर्ण है। धन्यवाद!</Text>
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
                    <View style={styles.badge}>
                        <MaterialCommunityIcons name="clipboard-text" size={18} color={SP_RED} />
                        <Text style={styles.badgeText}>Public Survey</Text>
                    </View>
                    <Text style={styles.heroTitle}>जन सर्वेक्षण - आपकी राय मायने रखती है</Text>
                    <Text style={styles.heroSubtitle}>
                        कृपया इस सर्वेक्षण में भाग लेकर अपने विचार साझा करें। आपका योगदान हमें जनता की सेवा में बेहतर बनाने में मदद करेगा।
                    </Text>
                </View>

                {/* Form Container */}
                <View style={styles.formContainer}>
                    <View style={styles.formCard}>
                        <View style={styles.formGrid}>
                            {/* Left Column */}
                            <View style={styles.column}>
                                {/* Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>पूरा नाम *</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name="account" size={20} color="#64748b" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="अपना नाम दर्ज करें"
                                            value={formData.name}
                                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                                        />
                                    </View>
                                </View>

                                {/* Age */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>उम्र *</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name="calendar" size={20} color="#64748b" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="आपकी उम्र"
                                            value={formData.age}
                                            onChangeText={(text) => setFormData({ ...formData, age: text })}
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                </View>

                                {/* District */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>जिला *</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="अपना जिला दर्ज करें"
                                            value={formData.district}
                                            onChangeText={(text) => setFormData({ ...formData, district: text })}
                                        />
                                    </View>
                                </View>

                                {/* Vidhan Sabha */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>विधानसभा *</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name="office-building" size={20} color="#64748b" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="आपकी विधानसभा"
                                            value={formData.vidhanSabha}
                                            onChangeText={(text) => setFormData({ ...formData, vidhanSabha: text })}
                                        />
                                    </View>
                                </View>

                                {/* Rating */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>समाजवादी पार्टी को रेटिंग दें *</Text>
                                    <View style={styles.ratingContainer}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Pressable
                                                key={star}
                                                onPress={() => setFormData({ ...formData, rating: star })}
                                                style={styles.starButton}
                                            >
                                                <MaterialCommunityIcons
                                                    name={star <= formData.rating ? "star" : "star-outline"}
                                                    size={48}
                                                    color={star <= formData.rating ? "#fbbf24" : "#cbd5e1"}
                                                />
                                            </Pressable>
                                        ))}
                                    </View>
                                    {formData.rating > 0 && (
                                        <Text style={styles.ratingText}>
                                            {formData.rating === 5 ? '🎉 उत्कृष्ट!' : formData.rating >= 3 ? '👍 अच्छा' : '🤔 सुधार की आवश्यकता'}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Right Column */}
                            <View style={styles.column}>
                                {/* Top Issue */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>आपके क्षेत्र की सबसे बड़ी समस्या *</Text>
                                    {issues.map((issue) => (
                                        <Pressable
                                            key={issue}
                                            style={[
                                                styles.option,
                                                formData.topIssue === issue && styles.optionSelected
                                            ]}
                                            onPress={() => setFormData({ ...formData, topIssue: issue })}
                                        >
                                            <View style={[
                                                styles.radio,
                                                formData.topIssue === issue && styles.radioSelected
                                            ]}>
                                                {formData.topIssue === issue && <View style={styles.radioDot} />}
                                            </View>
                                            <Text style={[
                                                styles.optionText,
                                                formData.topIssue === issue && styles.optionTextSelected
                                            ]}>{issue}</Text>
                                        </Pressable>
                                    ))}
                                </View>

                                {/* Party Performance */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>पार्टी के प्रदर्शन पर आपकी राय</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="अपनी राय विस्तार से साझा करें..."
                                        value={formData.partyPerformance}
                                        onChangeText={(text) => setFormData({ ...formData, partyPerformance: text })}
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>

                                {/* Suggestions */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>सुझाव (वैकल्पिक)</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="कोई सुझाव या विचार..."
                                        value={formData.suggestions}
                                        onChangeText={(text) => setFormData({ ...formData, suggestions: text })}
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <Pressable style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>सर्वेक्षण जमा करें</Text>
                            <MaterialCommunityIcons name="send" size={24} color="#fff" />
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
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        marginBottom: 20,
    },
    badgeText: {
        color: SP_RED,
        fontSize: 14,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 16,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 700,
        lineHeight: 24,
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
        gap: 40,
    },
    column: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 28,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        minHeight: 52,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        marginLeft: 12,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
    },
    textArea: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        textAlignVertical: 'top',
        minHeight: 120,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    starButton: {
        padding: 4,
    },
    ratingText: {
        fontSize: 14,
        color: SP_GREEN,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
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
        borderColor: SP_RED,
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
        borderColor: SP_RED,
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: SP_RED,
    },
    optionText: {
        fontSize: 15,
        color: '#64748b',
    },
    optionTextSelected: {
        color: SP_RED,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: SP_RED,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 12,
        marginTop: 20,
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
    successTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 24,
        textAlign: 'center',
    },
    successText: {
        fontSize: 18,
        color: '#64748b',
        marginTop: 16,
        textAlign: 'center',
        maxWidth: 500,
    },
});
