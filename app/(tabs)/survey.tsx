import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function Survey() {
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
        // Here you would send the data to your backend
        console.log('Survey Data:', formData);
        setSubmitted(true);
        setTimeout(() => {
            router.back();
        }, 2000);
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
            <View style={styles.successContainer}>
                <MaterialCommunityIcons name="check-circle" size={80} color={SP_GREEN} />
                <Text style={styles.successTitle}>सर्वेक्षण सफलतापूर्वक जमा हुआ!</Text>
                <Text style={styles.successText}>आपकी राय हमारे लिए महत्वपूर्ण है।</Text>
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
                    <Text style={styles.headerTitle}>जन सर्वेक्षण</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <MaterialCommunityIcons name="clipboard-text" size={50} color={SP_RED} />
                    <Text style={styles.heroTitle}>आपकी राय मायने रखती है</Text>
                    <Text style={styles.heroSubtitle}>
                        कृपया इस सर्वेक्षण में भाग लेकर अपने विचार साझा करें
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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
                                >
                                    <MaterialCommunityIcons
                                        name={star <= formData.rating ? "star" : "star-outline"}
                                        size={40}
                                        color={star <= formData.rating ? "#fbbf24" : "#cbd5e1"}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    </View>

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
                            placeholder="अपनी राय साझा करें"
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
                            placeholder="कोई सुझाव या विचार"
                            value={formData.suggestions}
                            onChangeText={(text) => setFormData({ ...formData, suggestions: text })}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Submit Button */}
                    <Pressable style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>सर्वेक्षण जमा करें</Text>
                        <MaterialCommunityIcons name="send" size={20} color="#fff" />
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
        backgroundColor: SP_RED,
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
    hero: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 12,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
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
        borderColor: SP_RED,
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
        borderColor: SP_RED,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
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
        padding: 18,
        borderRadius: 12,
        marginTop: 12,
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
    },
});
