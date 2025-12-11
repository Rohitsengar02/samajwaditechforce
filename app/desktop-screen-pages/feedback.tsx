import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DesktopHeader from '../../components/DesktopHeader';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopFeedback() {
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

    const handleSubmit = async () => {
        try {
            console.log('Feedback Data:', formData);

            // Basic validation
            if (!formData.name) {
                alert('कृपया अपना नाम भरें');
                return;
            }

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
                    router.push('/desktop-screen-pages/home');
                }, 3500);
            } else {
                alert('Something went wrong: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Submission Error:', error);
            alert('Error submitting feedback. Please try again.');
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
                            size={24}
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
            <View style={styles.container}>
                <DesktopHeader />
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <MaterialCommunityIcons name="check-decagram" size={80} color="#fff" />
                    </View>
                    <Text style={styles.successTitle}>फीडबैक सफलतापूर्वक प्राप्त हुआ!</Text>
                    <Text style={styles.successText}>
                        धन्यवाद! आपकी राय हमारे लिए महत्वपूर्ण है।
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
                    <View style={styles.heroIcon}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={50} color="#fff" />
                    </View>
                    <Text style={styles.heroTitle}>जनता की राय / फीडबैक फॉर्म</Text>
                    <Text style={styles.heroSubtitle}>
                        अपने क्षेत्र के प्रतिनिधि और विकास कार्यों के बारे में अपनी राय साझा करें
                    </Text>
                </View>

                {/* Form Container */}
                <View style={styles.formContainer}>
                    <View style={styles.formCard}>

                        {/* Section 1: Personal Info */}
                        <Text style={styles.sectionHeader}>1️⃣ आपकी जानकारी</Text>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>नाम (इच्छानुसार)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="अपना नाम लिखें"
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>मोहल्ला / गांव</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="मोहल्ला / गांव का नाम"
                                    value={formData.mohalla}
                                    onChangeText={(text) => setFormData({ ...formData, mohalla: text })}
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>मोबाइल (इच्छानुसार)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="मोबाइल नंबर"
                                    value={formData.mobile}
                                    onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Section 2: Candidate Info */}
                        <Text style={styles.sectionHeader}>2️⃣ उम्मीदवार / मौजूदा विधायक / सक्रिय नेता / क्षेत्र</Text>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>उम्मीदवार / मौजूदा विधायक / सक्रिय नेता का नाम</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="नाम लिखें"
                                    value={formData.leaderName}
                                    onChangeText={(text) => setFormData({ ...formData, leaderName: text })}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>विधानसभा / वार्ड</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="विधानसभा / वार्ड का नाम"
                                    value={formData.assembly}
                                    onChangeText={(text) => setFormData({ ...formData, assembly: text })}
                                />
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Section 3: Public Connection */}
                        <Text style={styles.sectionHeader}>3️⃣ जनता से जुड़ाव (Public Connection)</Text>
                        {renderRadioGroup(
                            'meetingFrequency',
                            ['नियमित', 'कभी-कभी', 'बहुत कम', 'कभी नहीं'],
                            'उम्मीदवार आपसे या आपके क्षेत्र के लोगों से कितनी बार मिलते हैं?'
                        )}
                        {renderRadioGroup(
                            'listeningSkills',
                            ['बहुत अच्छी तरह', 'ठीक-ठाक', 'कमज़ोर'],
                            'उम्मीदवार / मौजूदा विधायक / सक्रिय नेता आपकी समस्याएँ कितनी ध्यान से सुनते हैं?'
                        )}

                        <View style={styles.divider} />

                        {/* Section 4: Performance */}
                        <Text style={styles.sectionHeader}>4️⃣ कार्यक्षमता (Performance on Ground)</Text>
                        {renderRadioGroup(
                            'workPerformance',
                            ['बहुत अच्छा', 'अच्छा', 'औसत', 'कमजोर'],
                            'क्षेत्र की समस्याओं (सड़क, बिजली, पानी, स्वास्थ्य आदि) पर उम्मीदवार कितना काम कर रहे हैं?'
                        )}
                        {renderRadioGroup(
                            'teamSupport',
                            ['हमेशा', 'कभी-कभी', 'नहीं'],
                            'उम्मीदवार / मौजूदा विधायक / सक्रिय नेता की टीम/कार्यकर्ता आपकी मदद करते हैं?'
                        )}

                        <View style={styles.divider} />

                        {/* Section 5: Behaviour & Image */}
                        <Text style={styles.sectionHeader}>5️⃣ सार्वजनिक व्यवहार (Behaviour & Image)</Text>
                        {renderRadioGroup(
                            'behaviour',
                            ['सम्मानजनक', 'सामान्य', 'खराब'],
                            'उम्मीदवार आम जनता से कैसा व्यवहार रखते हैं?'
                        )}
                        {renderRadioGroup(
                            'publicImage',
                            ['बहुत अच्छी', 'अच्छी', 'सामान्य', 'नकारात्मक'],
                            'उनकी सार्वजनिक छवि कैसी है?'
                        )}

                        <View style={styles.divider} />

                        {/* Section 6: Digital & Social Media */}
                        <Text style={styles.sectionHeader}>6️⃣ डिजिटल और सोशल मीडिया</Text>
                        {renderRadioGroup(
                            'socialMedia',
                            ['हाँ, बहुत', 'थोड़ा', 'नहीं'],
                            'क्या उम्मीदवार सोशल मीडिया पर सक्रिय रहते हैं?'
                        )}

                        <View style={styles.divider} />

                        {/* Section 7: Support Level */}
                        <Text style={styles.sectionHeader}>7️⃣ आपका समर्थन स्तर (Your Support Level)</Text>
                        {renderRadioGroup(
                            'supportLevel',
                            ['निश्चित रूप से', 'शायद', 'नहीं'],
                            'क्या आप अगले चुनाव में इस उम्मीदवार को समर्थन देंगे?'
                        )}

                        <View style={styles.divider} />

                        {/* Section 8: Feedback */}
                        <Text style={styles.sectionHeader}>8️⃣ आपकी राय / सुझाव (Your Feedback)</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.questionLabel}>कृपया अपने सुझाव लिखें:</Text>
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
                        <Text style={styles.sectionHeader}>9️⃣ कुल मिलाकर रेटिंग (Overall Rating)</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.questionLabel}>उम्मीदवार / मौजूदा विधायक / सक्रिय नेता को आप कितने अंक देना चाहेंगे? (1 सबसे कम, 5 सबसे अच्छा)</Text>
                            <View style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Pressable
                                        key={star}
                                        onPress={() => setFormData({ ...formData, rating: star })}
                                        style={styles.starButton}
                                    >
                                        <MaterialCommunityIcons
                                            name={star <= formData.rating ? "star" : "star-outline"}
                                            size={40}
                                            color={star <= formData.rating ? "#F59E0B" : "#cbd5e1"}
                                        />
                                        <Text style={[styles.starLabel, star <= formData.rating && styles.starLabelSelected]}>{star}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Submit Button */}
                        <Pressable style={styles.submitButton} onPress={handleSubmit}>
                            <MaterialCommunityIcons name="send" size={24} color="#fff" />
                            <Text style={styles.submitButtonText}>फॉर्म जमा करें</Text>
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
        backgroundColor: SP_GREEN,
        paddingVertical: 40,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        maxWidth: 700,
        lineHeight: 24,
    },
    formContainer: {
        padding: 40,
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 24,
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    halfWidth: {
        flex: 1,
        minWidth: 300,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    questionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
        lineHeight: 24,
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
    inputGroup: {
        marginBottom: 24,
    },
    radioContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        gap: 8,
    },
    radioOptionSelected: {
        backgroundColor: '#dcfce7',
        borderColor: SP_GREEN,
    },
    radioText: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '500',
    },
    radioTextSelected: {
        color: SP_GREEN,
        fontWeight: '700',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 32,
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    starButton: {
        alignItems: 'center',
        gap: 4,
    },
    starLabel: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
    },
    starLabelSelected: {
        color: '#F59E0B',
    },
    submitButton: {
        backgroundColor: SP_GREEN,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 12,
        marginTop: 40,
        gap: 12,
        shadowColor: SP_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
        width: 120,
        height: 120,
        borderRadius: 60,
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
});
