import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, Card, TextInput, RadioButton, Checkbox, Title, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';

const SP_RED = '#E30512';

const inputTheme = {
    colors: {
        primary: SP_RED,
        onSurface: '#1e293b', // Input Text Color
        onSurfaceVariant: '#64748b', // Label Color
        text: '#1e293b',
        placeholder: '#94a3b8',
        background: '#ffffff'
    }
};

export default function VerifiedMemberScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form State
    const [district, setDistrict] = useState('');
    const [vidhanSabha, setVidhanSabha] = useState('');
    const [isPartyMember, setIsPartyMember] = useState('No');
    const [partyRole, setPartyRole] = useState('');
    const [partyJoiningDate, setPartyJoiningDate] = useState('');
    const [socialMedia, setSocialMedia] = useState<string[]>([]);
    const [qualification, setQualification] = useState('');
    const [canVisitLucknow, setCanVisitLucknow] = useState('No');
    const [email, setEmail] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
                setEmail(parsedUser.email || '');
                // Pre-fill
                if (parsedUser.district) setDistrict(parsedUser.district);
                if (parsedUser.vidhanSabha) setVidhanSabha(parsedUser.vidhanSabha);
                if (parsedUser.isPartyMember) setIsPartyMember(parsedUser.isPartyMember);
                if (parsedUser.partyRole) setPartyRole(parsedUser.partyRole);
                if (parsedUser.partyJoiningDate) setPartyJoiningDate(parsedUser.partyJoiningDate);
                if (parsedUser.socialMedia) setSocialMedia(parsedUser.socialMedia);
                if (parsedUser.qualification) setQualification(parsedUser.qualification);
                if (parsedUser.canVisitLucknow) setCanVisitLucknow(parsedUser.canVisitLucknow);
            }
        } catch (error) {
            console.error('Failed to load user data', error);
        }
    };

    const toggleSocialMedia = (platform: string) => {
        if (socialMedia.includes(platform)) {
            setSocialMedia(socialMedia.filter(p => p !== platform));
        } else {
            setSocialMedia([...socialMedia, platform]);
        }
    };

    const handleVerify = async () => {
        if (!district || !vidhanSabha || !qualification) {
            Alert.alert('Error', 'Please fill all required fields (District, Vidhan Sabha, Qualification)');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Not authenticated');
                return;
            }

            // API URL Logic
            const url = getApiUrl();
            console.log('Submitting verification to:', `${url}/auth/verification-request`);

            const response = await fetch(`${url}/auth/verification-request`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    district,
                    vidhanSabha,
                    isPartyMember,
                    partyRole: isPartyMember === 'Yes' ? partyRole : '',
                    partyJoiningDate: isPartyMember === 'Yes' ? partyJoiningDate : '',
                    socialMedia,
                    qualification,
                    canVisitLucknow,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message + (data.error ? `: ${data.error}` : '') || 'Failed to submit verification request');
            }

            // Update local storage
            const updatedUser = { ...user, ...data.user };
            await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));

            Alert.alert('Success', 'Verification request submitted successfully!');
            router.back();
        } catch (error: any) {
            console.error('Verify error:', error);
            const msg = error.message.includes('JSON')
                ? 'Server Error. Check Backend Logs.'
                : (error.message || 'Network request failed.');
            Alert.alert('Submission Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Title style={styles.headerTitle}>Membership Verification</Title>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="card-account-details" size={24} color={SP_RED} />
                                <Text style={styles.sectionTitle}>Basic Details</Text>
                            </View>

                            <TextInput
                                label="Email ID"
                                value={email}
                                mode="outlined"
                                disabled
                                style={styles.input}
                                theme={inputTheme}
                                textColor="#334155"
                            />

                            <TextInput
                                label="District (जिला) *"
                                value={district}
                                onChangeText={setDistrict}
                                mode="outlined"
                                style={styles.input}
                                placeholder="Ex: Lucknow, Kanpur"
                                theme={inputTheme}
                                textColor="#1e293b"
                            />

                            <TextInput
                                label="Vidhan Sabha (विधानसभा) *"
                                value={vidhanSabha}
                                onChangeText={setVidhanSabha}
                                mode="outlined"
                                style={styles.input}
                                placeholder="Ex: Lucknow Central"
                                theme={inputTheme}
                                textColor="#1e293b"
                            />

                            <TextInput
                                label="Qualification (क्वालिफिकेशन) *"
                                value={qualification}
                                onChangeText={setQualification}
                                mode="outlined"
                                style={styles.input}
                                placeholder="Ex: 12th, Graduate, IIT"
                                theme={inputTheme}
                                textColor="#1e293b"
                            />
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="account-group" size={24} color={SP_RED} />
                                <Text style={styles.sectionTitle}>Party Affiliation</Text>
                            </View>

                            <Text style={styles.question}>क्या आप समाजवादी पार्टी से जुड़े हैं?</Text>
                            <RadioButton.Group onValueChange={value => setIsPartyMember(value)} value={isPartyMember}>
                                <View style={styles.radioRow}>
                                    <View style={styles.radioItem}>
                                        <RadioButton value="Yes" color={SP_RED} />
                                        <Text style={{ color: '#334155', fontWeight: '500' }}>Yes (हाँ)</Text>
                                    </View>
                                    <View style={styles.radioItem}>
                                        <RadioButton value="No" color={SP_RED} />
                                        <Text style={{ color: '#334155', fontWeight: '500' }}>No (नहीं)</Text>
                                    </View>
                                </View>
                            </RadioButton.Group>

                            {isPartyMember === 'Yes' && (
                                <>
                                    <TextInput
                                        label="Party Role (पार्टी से आपका संबंध क्या है?)"
                                        value={partyRole}
                                        onChangeText={setPartyRole}
                                        mode="outlined"
                                        style={styles.input}
                                        placeholder="Ex: Karyakarta, Booth Adhyaksh"
                                        theme={inputTheme}
                                        textColor="#1e293b"
                                    />

                                    <TextInput
                                        label="Party Joining Date (पार्टी में कब से हैं?)"
                                        value={partyJoiningDate}
                                        onChangeText={setPartyJoiningDate}
                                        mode="outlined"
                                        style={styles.input}
                                        placeholder="Ex: 2020, Jan 2019, 5 years"
                                        keyboardType="default"
                                        theme={inputTheme}
                                        textColor="#1e293b"
                                    />
                                </>
                            )}
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="share-variant" size={24} color={SP_RED} />
                                <Text style={styles.sectionTitle}>Social Media & Availability</Text>
                            </View>

                            <Text style={styles.question}>आप किन-किन सोशल मीडिया प्लेटफॉर्म पर सक्रिय हैं?</Text>
                            <View style={styles.checkboxContainer}>
                                {['Facebook', 'Instagram', 'Twitter (X)', 'YouTube'].map(platform => (
                                    <View key={platform} style={styles.checkboxItem}>
                                        <Checkbox
                                            status={socialMedia.includes(platform) ? 'checked' : 'unchecked'}
                                            onPress={() => toggleSocialMedia(platform)}
                                            color={SP_RED}
                                        />
                                        <Text style={{ color: '#334155', fontWeight: '500' }}>{platform}</Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={styles.question}>क्या आप होने वाली मीटिंग में लखनऊ आ पाएंगे?</Text>
                            <RadioButton.Group onValueChange={value => setCanVisitLucknow(value)} value={canVisitLucknow}>
                                <View style={styles.radioRow}>
                                    <View style={styles.radioItem}>
                                        <RadioButton value="Yes" color={SP_RED} />
                                        <Text style={{ color: '#334155', fontWeight: '500' }}>Yes (हाँ)</Text>
                                    </View>
                                    <View style={styles.radioItem}>
                                        <RadioButton value="No" color={SP_RED} />
                                        <Text style={{ color: '#334155', fontWeight: '500' }}>No (नहीं)</Text>
                                    </View>
                                </View>
                            </RadioButton.Group>
                        </Card.Content>
                    </Card>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleVerify}
                        disabled={loading}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={loading ? ['#666', '#444'] : [SP_RED, '#b91c1c']}
                            style={styles.submitGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.submitText}>Submit for Verification</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
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
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 10,
        marginTop: 10,
    },
    radioRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 10,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    checkboxContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 8,
        gap: 4
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        marginTop: 10,
        marginBottom: 30,
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
