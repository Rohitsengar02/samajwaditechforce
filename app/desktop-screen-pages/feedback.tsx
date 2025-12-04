import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DesktopHeader from '../../components/DesktopHeader';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function DesktopFeedback() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: '',
        subject: '',
        message: '',
        satisfactionLevel: 0,
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        console.log('Feedback Data:', formData);
        setSubmitted(true);
        setTimeout(() => {
            router.push('/desktop-screen-pages/home');
        }, 2500);
    };

    const categories = [
        { id: 'activities', label: 'पार्टी गतिविधियाँ', icon: 'calendar-star' },
        { id: 'app', label: 'ऐप की समस्याएं', icon: 'cellphone-cog' },
        { id: 'suggestion', label: 'सुझाव', icon: 'lightbulb-on' },
        { id: 'complaint', label: 'शिकायत', icon: 'alert-circle' },
        { id: 'praise', label: 'प्रशंसा', icon: 'heart' },
        { id: 'other', label: 'अन्य', icon: 'dots-horizontal' },
    ];

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
                        धन्यवाद! हम आपके फीडबैक की समीक्षा करेंगे और जल्द ही आपसे संपर्क करेंगे।
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
                        <MaterialCommunityIcons name="message-text" size={50} color="#fff" />
                    </View>
                    <Text style={styles.heroTitle}>हमें बताएं आप क्या सोचते हैं</Text>
                    <Text style={styles.heroSubtitle}>
                        आपका फीडबैक हमें बेहतर बनाने में मदद करता है। कृपया अपने अनुभव और सुझाव हमारे साथ साझा करें।
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
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="account" size={18} color={SP_GREEN} /> नाम *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="आपका पूरा नाम"
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    />
                                </View>

                                {/* Email */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="email" size={18} color={SP_GREEN} /> ईमेल
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                {/* Phone */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="phone" size={18} color={SP_GREEN} /> मोबाइल नंबर *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10 अंकों का मोबाइल नंबर"
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>

                                {/* Category */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="folder" size={18} color={SP_GREEN} /> श्रेणी चुनें *
                                    </Text>
                                    <View style={styles.categoriesGrid}>
                                        {categories.map((cat) => (
                                            <Pressable
                                                key={cat.id}
                                                style={[
                                                    styles.categoryCard,
                                                    formData.category === cat.id && styles.categoryCardSelected
                                                ]}
                                                onPress={() => setFormData({ ...formData, category: cat.id })}
                                            >
                                                <MaterialCommunityIcons
                                                    name={cat.icon as any}
                                                    size={32}
                                                    color={formData.category === cat.id ? SP_GREEN : '#94a3b8'}
                                                />
                                                <Text style={[
                                                    styles.categoryLabel,
                                                    formData.category === cat.id && styles.categoryLabelSelected
                                                ]}>{cat.label}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                {/* Satisfaction Level */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="heart" size={18} color={SP_GREEN} /> संतुष्टि स्तर
                                    </Text>
                                    <View style={styles.satisfactionContainer}>
                                        {[
                                            { value: 1, icon: 'emoticon-sad', color: '#ef4444', label: 'असंतुष्ट' },
                                            { value: 2, icon: 'emoticon-neutral', color: '#f59e0b', label: 'ठीक' },
                                            { value: 3, icon: 'emoticon-happy', color: '#10b981', label: 'संतुष्ट' },
                                            { value: 4, icon: 'emoticon-excited', color: SP_GREEN, label: 'बहुत खुश' },
                                        ].map((item) => (
                                            <Pressable
                                                key={item.value}
                                                style={[
                                                    styles.satisfactionOption,
                                                    formData.satisfactionLevel === item.value && {
                                                        backgroundColor: `${item.color}15`,
                                                        borderColor: item.color,
                                                        borderWidth: 2,
                                                    }
                                                ]}
                                                onPress={() => setFormData({ ...formData, satisfactionLevel: item.value })}
                                            >
                                                <MaterialCommunityIcons
                                                    name={item.icon as any}
                                                    size={48}
                                                    color={formData.satisfactionLevel === item.value ? item.color : '#cbd5e1'}
                                                />
                                                <Text style={[
                                                    styles.satisfactionLabel,
                                                    formData.satisfactionLevel === item.value && {
                                                        color: item.color,
                                                        fontWeight: '700'
                                                    }
                                                ]}>{item.label}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Right Column */}
                            <View style={styles.column}>
                                {/* Subject */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="subtitles" size={18} color={SP_GREEN} /> विषय *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="संक्षेप में बताएं"
                                        value={formData.subject}
                                        onChangeText={(text) => setFormData({ ...formData, subject: text })}
                                    />
                                </View>

                                {/* Message */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="message-text" size={18} color={SP_GREEN} /> विस्तार से बताएं *
                                    </Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="अपना फीडबैक विस्तार से लिखें..."
                                        value={formData.message}
                                        onChangeText={(text) => setFormData({ ...formData, message: text })}
                                        multiline
                                        numberOfLines={12}
                                    />
                                </View>

                                {/* Info Card */}
                                <View style={styles.infoCard}>
                                    <MaterialCommunityIcons name="shield-check" size={24} color="#3b82f6" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoTitle}>गोपनीयता की गारंटी</Text>
                                        <Text style={styles.infoText}>
                                            आपकी जानकारी सुरक्षित रहेगी और केवल समाजवादी पार्टी द्वारा आंतरिक उपयोग के लिए प्रयोग की जाएगी।
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <Pressable style={styles.submitButton} onPress={handleSubmit}>
                            <MaterialCommunityIcons name="send" size={24} color="#fff" />
                            <Text style={styles.submitButtonText}>फीडबैक सबमिट करें</Text>
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
        paddingVertical: 60,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    heroIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 16,
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
    inputGroup: {
        marginBottom: 28,
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
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: '48%',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    categoryCardSelected: {
        backgroundColor: '#dcfce7',
        borderColor: SP_GREEN,
    },
    categoryLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
    },
    categoryLabelSelected: {
        color: SP_GREEN,
        fontWeight: '700',
    },
    satisfactionContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    satisfactionOption: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    satisfactionLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#dbeafe',
        padding: 20,
        borderRadius: 12,
        gap: 16,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e40af',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: SP_GREEN,
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
