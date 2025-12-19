import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, Card, TextInput, RadioButton, Checkbox, Title, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';
import { Dropdown } from 'react-native-element-dropdown';

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
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVidhansabhas, setLoadingVidhansabhas] = useState(false);

    // Dropdown data
    const [districts, setDistricts] = useState<string[]>([]);
    const [vidhansabhas, setVidhansabhas] = useState<any[]>([]);
    const [filteredVidhansabhas, setFilteredVidhansabhas] = useState<any[]>([]);

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
        fetchDistricts();
        fetchVidhansabhas();
    }, []);

    // Filter vidhansabhas when district changes
    useEffect(() => {
        if (district) {
            const filtered = vidhansabhas.filter(v =>
                v.district && v.district.toLowerCase() === district.toLowerCase()
            );
            setFilteredVidhansabhas(filtered);
        } else {
            setFilteredVidhansabhas(vidhansabhas);
        }
    }, [district, vidhansabhas]);

    const fetchDistricts = async () => {
        try {
            setLoadingDistricts(true);
            const url = getApiUrl();
            const response = await fetch(`${url}/vidhansabha/districts`);
            const data = await response.json();

            if (data.success) {
                setDistricts(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch districts:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const fetchVidhansabhas = async () => {
        try {
            setLoadingVidhansabhas(true);
            const url = getApiUrl();
            const response = await fetch(`${url}/vidhansabha`);
            const data = await response.json();

            if (data.success) {
                setVidhansabhas(data.data || []);
                setFilteredVidhansabhas(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch vidhansabhas:', error);
        } finally {
            setLoadingVidhansabhas(false);
        }
    };

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

    const handleDateChange = (text: string) => {
        // Remove all non-numeric characters
        const cleaned = text.replace(/[^0-9]/g, '');

        let formatted = '';

        // Add "/" after day (2 digits)
        if (cleaned.length >= 1) {
            formatted = cleaned.substring(0, 2);
        }

        // Add "/" after month (4 digits total: DD/MM)
        if (cleaned.length >= 3) {
            formatted += '/' + cleaned.substring(2, 4);
        }

        // Add year (YYYY)
        if (cleaned.length >= 5) {
            formatted += '/' + cleaned.substring(4, 8);
        }

        // Limit to 10 characters (DD/MM/YYYY)
        if (formatted.length <= 10) {
            setPartyJoiningDate(formatted);
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
            router.push('/(tabs)/profile');
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

                            {/* District Dropdown */}
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.dropdownLabel}>District (जिला) *</Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={districts.map(d => ({ label: d, value: d }))}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select District"
                                    searchPlaceholder="Search district..."
                                    value={district}
                                    onChange={item => {
                                        setDistrict(item.value);
                                        setVidhanSabha(''); // Reset vidhan sabha when district changes
                                    }}
                                    renderLeftIcon={() => (
                                        <MaterialCommunityIcons
                                            name="map-marker"
                                            size={20}
                                            color={SP_RED}
                                            style={{ marginRight: 8 }}
                                        />
                                    )}
                                    disable={loadingDistricts}
                                />
                                {loadingDistricts && (
                                    <ActivityIndicator size="small" color={SP_RED} style={{ position: 'absolute', right: 10, top: 40 }} />
                                )}
                            </View>

                            {/* Vidhan Sabha Dropdown */}
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.dropdownLabel}>Vidhan Sabha (विधानसभा) *</Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={filteredVidhansabhas.map(v => ({
                                        label: `${v.constituencyNumber}. ${v.constituencyName}`,
                                        value: v.constituencyName
                                    }))}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={district ? "Select Vidhan Sabha" : "First select a district"}
                                    searchPlaceholder="Search vidhan sabha..."
                                    value={vidhanSabha}
                                    onChange={item => {
                                        setVidhanSabha(item.value);
                                    }}
                                    renderLeftIcon={() => (
                                        <MaterialCommunityIcons
                                            name="office-building"
                                            size={20}
                                            color={SP_RED}
                                            style={{ marginRight: 8 }}
                                        />
                                    )}
                                    disable={!district || loadingVidhansabhas}
                                />
                                {loadingVidhansabhas && (
                                    <ActivityIndicator size="small" color={SP_RED} style={{ position: 'absolute', right: 10, top: 40 }} />
                                )}
                            </View>

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
                                    {/* Party Role Dropdown */}
                                    <View style={styles.dropdownContainer}>
                                        <Text style={styles.dropdownLabel}>Party Role (पार्टी से आपका संबंध क्या है?)</Text>
                                        <Dropdown
                                            style={styles.dropdown}
                                            placeholderStyle={styles.placeholderStyle}
                                            selectedTextStyle={styles.selectedTextStyle}
                                            inputSearchStyle={styles.inputSearchStyle}
                                            iconStyle={styles.iconStyle}
                                            data={[
                                                { label: 'Karyakarta (कार्यकर्ता)', value: 'Karyakarta' },
                                                { label: 'Booth Adhyaksh (बूथ अध्यक्ष)', value: 'Booth Adhyaksh' },
                                                { label: 'Ward Adhyaksh (वार्ड अध्यक्ष)', value: 'Ward Adhyaksh' },
                                                { label: 'Block Adhyaksh (ब्लॉक अध्यक्ष)', value: 'Block Adhyaksh' },
                                                { label: 'Mandal Adhyaksh (मंडल अध्यक्ष)', value: 'Mandal Adhyaksh' },
                                                { label: 'District Adhyaksh (जिला अध्यक्ष)', value: 'District Adhyaksh' },
                                                { label: 'State Secretary (राज्य सचिव)', value: 'State Secretary' },
                                                { label: 'General Secretary (महासचिव)', value: 'General Secretary' },
                                                { label: 'MLA (विधायक)', value: 'MLA' },
                                                { label: 'MP (सांसद)', value: 'MP' },
                                                { label: 'Minister (मंत्री)', value: 'Minister' },
                                                { label: 'Other (अन्य)', value: 'Other' },
                                            ]}
                                            search
                                            maxHeight={300}
                                            labelField="label"
                                            valueField="value"
                                            placeholder="Select Party Role"
                                            searchPlaceholder="Search role..."
                                            value={partyRole}
                                            onChange={item => {
                                                setPartyRole(item.value);
                                            }}
                                            renderLeftIcon={() => (
                                                <MaterialCommunityIcons
                                                    name="account-star"
                                                    size={20}
                                                    color={SP_RED}
                                                    style={{ marginRight: 8 }}
                                                />
                                            )}
                                        />
                                    </View>

                                    <TextInput
                                        label="Party Joining Date (पार्टी में कब से हैं?)"
                                        value={partyJoiningDate}
                                        onChangeText={handleDateChange}
                                        mode="outlined"
                                        style={styles.input}
                                        placeholder="DD/MM/YYYY"
                                        keyboardType="numeric"
                                        theme={inputTheme}
                                        textColor="#1e293b"
                                        maxLength={10}
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
    // Dropdown styles
    dropdownContainer: {
        marginBottom: 16,
    },
    dropdownLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    dropdown: {
        height: 56,
        borderColor: '#94a3b8',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#94a3b8',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#1e293b',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        borderColor: '#94a3b8',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
});
