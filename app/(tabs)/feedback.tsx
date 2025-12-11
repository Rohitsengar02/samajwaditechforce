import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function Feedback() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        mohalla: '',
        mobile: '',
        leaderName: '',
        assembly: '',
        meetingFrequency: '',
        listeningSkills: '',
        workPerformance: '',
        teamSupport: '',
        behaviour: '',
        publicImage: '',
        socialMedia: '',
        supportLevel: '',
        feedback: '',
        rating: 0,
    });

    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            console.log('Feedback Data:', formData);

            // Basic validation
            if (!formData.name) {
                Alert.alert('त्रुटि', 'कृपया अपना नाम भरें');
                return;
            }

            setSubmitting(true);

            // Get API URL
            const apiUrl = getApiUrl();

            const response = await fetch(`${apiUrl}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                setTimeout(() => {
                    router.back();
                }, 2500);
            } else {
                Alert.alert('Error', 'कुछ गलत हुआ: ' + (data.error || 'अज्ञात त्रुटि'));
            }
        } catch (error) {
            console.error('Submission Error:', error);
            Alert.alert('Error', 'फीडबैक सबमिट करने में त्रुटि। कृपया पुनः प्रयास करें।');
        } finally {
            setSubmitting(false);
        }
    };

    const renderRadioGroup = (key: keyof typeof formData, options: string[], label: string) => (
        <View style={styles.inputGroup}>
            <Text style={styles.questionLabel}>{label}</Text>
            <View style={styles.radioContainer}>
                {options.map((option) => (
                    <Pressable
                        key={option}
                        style={[
                            styles.radioOption,
                            formData[key] === option && styles.radioOptionSelected
                        ]}
                        onPress={() => setFormData({ ...formData, [key]: option })}
                    >
                        <MaterialCommunityIcons
                            name={formData[key] === option ? "radiobox-marked" : "radiobox-blank"}
                            size={20}
                            color={formData[key] === option ? SP_GREEN : '#64748b'}
                        />
                        <Text style={[
                            styles.radioText,
                            formData[key] === option && styles.radioTextSelected
                        ]}>{option}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );

    if (submitted) {
        return (
            <View style={styles.successContainer}>
                <MaterialCommunityIcons name="check-decagram" size={80} color={SP_GREEN} />
                <Text style={styles.successTitle}>फीडबैक प्राप्त हुआ!</Text>
                <Text style={styles.successText}>धन्यवाद! आपकी राय हमारे लिए महत्वपूर्ण है।</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>फीडबैक</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={32} color="#fff" />
                    </View>
                    <Text style={styles.heroTitle}>जनता की राय</Text>
                    <Text style={styles.heroSubtitle}>
                        अपने क्षेत्र के प्रतिनिधि के बारे में राय साझा करें
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Section 1: Personal Info */}
                    <Text style={styles.sectionHeader}>1️⃣ आपकी जानकारी</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>नाम (इच्छानुसार)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="अपना नाम लिखें"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>मोहल्ला / गांव</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="मोहल्ला / गांव का नाम"
                            value={formData.mohalla}
                            onChangeText={(text) => setFormData({ ...formData, mohalla: text })}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>मोबाइल (इच्छानुसार)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="मोबाइल नंबर"
                            value={formData.mobile}
                            onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Section 2: Candidate Info */}
                    <Text style={styles.sectionHeader}>2️⃣ प्रतिनिधि / क्षेत्र</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>उम्मीदवार / नेता का नाम</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="नाम लिखें"
                            value={formData.leaderName}
                            onChangeText={(text) => setFormData({ ...formData, leaderName: text })}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>विधानसभा / वार्ड</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="विधानसभा / वार्ड का नाम"
                            value={formData.assembly}
                            onChangeText={(text) => setFormData({ ...formData, assembly: text })}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Section 3: Public Connection */}
                    <Text style={styles.sectionHeader}>3️⃣ जनता से जुड़ाव</Text>
                    {renderRadioGroup(
                        'meetingFrequency',
                        ['नियमित', 'कभी-कभी', 'बहुत कम', 'कभी नहीं'],
                        'उम्मीदवार आपसे या लोगों से कितनी बार मिलते हैं?'
                    )}
                    {renderRadioGroup(
                        'listeningSkills',
                        ['बहुत अच्छी तरह', 'ठीक-ठाक', 'कमज़ोर'],
                        'क्या वो आपकी समस्याएँ ध्यान से सुनते हैं?'
                    )}

                    <View style={styles.divider} />

                    {/* Section 4: Performance */}
                    <Text style={styles.sectionHeader}>4️⃣ कार्यक्षमता</Text>
                    {renderRadioGroup(
                        'workPerformance',
                        ['बहुत अच्छा', 'अच्छा', 'औसत', 'कमजोर'],
                        'क्षेत्र की समस्याओं पर कितना काम कर रहे हैं?'
                    )}
                    {renderRadioGroup(
                        'teamSupport',
                        ['हमेशा', 'कभी-कभी', 'नहीं'],
                        'क्या उनकी टीम आपकी मदद करती है?'
                    )}

                    <View style={styles.divider} />

                    {/* Section 5: Behaviour & Image */}
                    <Text style={styles.sectionHeader}>5️⃣ व्यवहार एवं छवि</Text>
                    {renderRadioGroup(
                        'behaviour',
                        ['सम्मानजनक', 'सामान्य', 'खराब'],
                        'आम जनता से व्यवहार कैसा है?'
                    )}
                    {renderRadioGroup(
                        'publicImage',
                        ['बहुत अच्छी', 'अच्छी', 'सामान्य', 'नकारात्मक'],
                        'सार्वजनिक छवि कैसी है?'
                    )}

                    <View style={styles.divider} />

                    {/* Section 6: Digital & Social Media */}
                    <Text style={styles.sectionHeader}>6️⃣ सोशल मीडिया</Text>
                    {renderRadioGroup(
                        'socialMedia',
                        ['हाँ, बहुत', 'थोड़ा', 'नहीं'],
                        'क्या वो सोशल मीडिया पर सक्रिय हैं?'
                    )}

                    <View style={styles.divider} />

                    {/* Section 7: Support Level */}
                    <Text style={styles.sectionHeader}>7️⃣ समर्थन स्तर</Text>
                    {renderRadioGroup(
                        'supportLevel',
                        ['निश्चित रूप से', 'शायद', 'नहीं'],
                        'क्या आप अगले चुनाव में समर्थन देंगे?'
                    )}

                    <View style={styles.divider} />

                    {/* Section 8: Feedback */}
                    <Text style={styles.sectionHeader}>8️⃣ सुझाव / राय</Text>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="अपने सुझाव यहाँ लिखें..."
                            value={formData.feedback}
                            onChangeText={(text) => setFormData({ ...formData, feedback: text })}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Section 9: Overall Rating */}
                    <Text style={styles.sectionHeader}>9️⃣ रेटिंग</Text>
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Pressable
                                key={star}
                                onPress={() => setFormData({ ...formData, rating: star })}
                                style={styles.starButton}
                            >
                                <MaterialCommunityIcons
                                    name={star <= formData.rating ? "star" : "star-outline"}
                                    size={36}
                                    color={star <= formData.rating ? "#F59E0B" : "#cbd5e1"}
                                />
                            </Pressable>
                        ))}
                    </View>

                    {/* Submit Button */}
                    <Pressable
                        style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Text style={styles.submitButtonText}>कृपया प्रतीक्षा करें...</Text>
                        ) : (
                            <>
                                <MaterialCommunityIcons name="send" size={20} color="#fff" />
                                <Text style={styles.submitButtonText}>सबमिट करें</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: SP_GREEN,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
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
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: SP_GREEN,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
    },
    form: {
        padding: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    questionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 10,
        lineHeight: 22,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    radioContainer: {
        gap: 8,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 10,
    },
    radioOptionSelected: {
        backgroundColor: '#dcfce7',
        borderColor: SP_GREEN,
    },
    radioText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    radioTextSelected: {
        color: SP_GREEN,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 24,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    starButton: {
        padding: 4,
    },
    submitButton: {
        backgroundColor: SP_GREEN,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
        marginTop: 32,
        marginBottom: 20,
        gap: 8,
        shadowColor: SP_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
