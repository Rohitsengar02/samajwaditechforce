import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function Feedback() {
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
            router.back();
        }, 2000);
    };

    const categories = [
        'पार्टी गतिविधियाँ',
        'ऐप की समस्याएं',
        'सुझाव',
        'शिकायत',
        'प्रशंसा',
        'अन्य',
    ];

    if (submitted) {
        return (
            <View style={styles.successContainer}>
                <MaterialCommunityIcons name="check-decagram" size={80} color={SP_GREEN} />
                <Text style={styles.successTitle}>फीडबैक प्राप्त हुआ!</Text>
                <Text style={styles.successText}>धन्यवाद! हम जल्द ही आपसे संपर्क करेंगे।</Text>
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
                    <Text style={styles.headerTitle}>फीडबैक</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="message-text" size={40} color="#fff" />
                    </View>
                    <Text style={styles.heroTitle}>हमें बताएं आप क्या सोचते हैं</Text>
                    <Text style={styles.heroSubtitle}>
                        आपका फीडबैक हमें बेहतर बनाने में मदद करता है
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <MaterialCommunityIcons name="account" size={16} color={SP_RED} /> नाम *
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
                            <MaterialCommunityIcons name="email" size={16} color={SP_RED} /> ईमेल
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
                            <MaterialCommunityIcons name="phone" size={16} color={SP_RED} /> मोबाइल नंबर *
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
                            <MaterialCommunityIcons name="folder" size={16} color={SP_RED} /> श्रेणी चुनें *
                        </Text>
                        <View style={styles.categoriesGrid}>
                            {categories.map((cat) => (
                                <Pressable
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        formData.category === cat && styles.categoryChipSelected
                                    ]}
                                    onPress={() => setFormData({ ...formData, category: cat })}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        formData.category === cat && styles.categoryTextSelected
                                    ]}>{cat}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Satisfaction Level */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <MaterialCommunityIcons name="heart" size={16} color={SP_RED} /> संतुष्टि स्तर
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
                                        }
                                    ]}
                                    onPress={() => setFormData({ ...formData, satisfactionLevel: item.value })}
                                >
                                    <MaterialCommunityIcons
                                        name={item.icon as any}
                                        size={32}
                                        color={formData.satisfactionLevel === item.value ? item.color : '#cbd5e1'}
                                    />
                                    <Text style={[
                                        styles.satisfactionLabel,
                                        formData.satisfactionLevel === item.value && { color: item.color, fontWeight: '600' }
                                    ]}>{item.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Subject */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <MaterialCommunityIcons name="subtitles" size={16} color={SP_RED} /> विषय *
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
                            <MaterialCommunityIcons name="message-text" size={16} color={SP_RED} /> विस्तार से बताएं *
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="अपना फीडबैक विस्तार से लिखें..."
                            value={formData.message}
                            onChangeText={(text) => setFormData({ ...formData, message: text })}
                            multiline
                            numberOfLines={6}
                        />
                    </View>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons name="information" size={20} color="#3b82f6" />
                        <Text style={styles.infoText}>
                            आपकी जानकारी सुरक्षित रहेगी और केवल समाजवादी पार्टी द्वारा उपयोग की जाएगी।
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <Pressable style={styles.submitButton} onPress={handleSubmit}>
                        <MaterialCommunityIcons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>फीडबैक सबमिट करें</Text>
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
        backgroundColor: SP_GREEN,
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
        padding: 32,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: SP_GREEN,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
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
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryChipSelected: {
        backgroundColor: '#dcfce7',
        borderColor: SP_GREEN,
    },
    categoryText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: SP_GREEN,
        fontWeight: '700',
    },
    satisfactionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    satisfactionOption: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    satisfactionLabel: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#dbeafe',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: SP_GREEN,
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
    },
});
