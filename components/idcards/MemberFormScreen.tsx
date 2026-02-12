import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, TextInput as RNTextInput, KeyboardAvoidingView, Platform, Image, useWindowDimensions } from 'react-native';
import { Card, Title, Text, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import IDCardPreview from './IDCardPreview';
import { uploadImageToAPI } from '../../utils/upload';

const { width, height } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

const TOTAL_STEPS = 4;

export default function MemberFormScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Form Data
    const [fullName, setFullName] = useState('');
    const [mobile, setMobile] = useState('');
    const [district, setDistrict] = useState('');
    const [vidhanSabha, setVidhanSabha] = useState('');
    const [age, setAge] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isPartyMember, setIsPartyMember] = useState<'yes' | 'no' | ''>('');
    const [partyRole, setPartyRole] = useState('');
    const [memberSince, setMemberSince] = useState('');  // Joining date
    const [socialMedia, setSocialMedia] = useState<string[]>([]);
    const [email, setEmail] = useState('');
    const [qualification, setQualification] = useState('');
    const [canAttendLucknow, setCanAttendLucknow] = useState<'yes' | 'no' | ''>('');

    const [showErrors, setShowErrors] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const { width: screenWidth } = useWindowDimensions();
    const isDesktop = screenWidth > 900;

    const memberData = {
        fullName,
        mobile,
        district,
        vidhanSabha,
        age,
        qualification,
        photo: photoUri,  // For IDCardPreview
        photoUri,         // For form state
        email,
        partyRole,
        memberSince,      // Joining date
        socialMedia,
        isPartyMember,
        canAttendLucknow
    };

    useEffect(() => {
        slideAnim.setValue(50);
        fadeAnim.setValue(0);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentStep]);

    const toggleSocialMedia = (platform: string) => {
        if (socialMedia.includes(platform)) {
            setSocialMedia(socialMedia.filter(p => p !== platform));
        } else {
            setSocialMedia([...socialMedia, platform]);
        }
    };

    const validateStep = () => {
        switch (currentStep) {
            case 0:
                return fullName && mobile.length === 10 && district && vidhanSabha && age;
            case 1:
                return isPartyMember && (isPartyMember === 'no' || (partyRole && memberSince));
            case 2:
                return socialMedia.length > 0 && email && qualification;
            case 3:
                return canAttendLucknow;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (!validateStep()) {
            setShowErrors(true);
            return;
        }

        setShowErrors(false);

        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setShowErrors(false);
        }
    };

    const handlePhotoUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;

            try {
                // Upload to R2 via Backend API
                const uploadedUrl = await uploadImageToAPI(imageUri, 'members');
                if (uploadedUrl) {
                    setPhotoUri(uploadedUrl);
                } else {
                    setPhotoUri(imageUri);
                }
            } catch (error) {
                console.error('Upload error:', error);
                // Fallback to local URI
                setPhotoUri(imageUri);
            }
        }
    };

    const handleSubmit = () => {
        const memberData = {
            fullName,
            mobile,
            district,
            vidhanSabha,
            age,
            photo: photoUri,
            photoUri,
            isPartyMember,
            partyRole,
            memberSince,
            socialMedia,
            email,
            qualification,
            canAttendLucknow,
        };

        router.push({
            pathname: '/member-idcard',
            params: { memberData: JSON.stringify(memberData) }
        });
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.stepTitle}>व्यक्तिगत जानकारी</Text>

                        {/* Photo Upload */}
                        <View style={styles.photoUploadSection}>
                            <Text style={styles.label}>अपनी फोटो अपलोड करें *</Text>
                            <TouchableOpacity style={styles.photoUploadButton} onPress={handlePhotoUpload}>
                                {photoUri ? (
                                    <Image source={{ uri: photoUri }} style={styles.uploadedPhoto} />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <MaterialCommunityIcons name="camera-plus" size={40} color={SP_GREEN} />
                                        <Text style={styles.photoPlaceholderText}>फोटो चुनें</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>आपका पूरा नाम क्या है? *</Text>
                            <RNTextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="पूरा नाम दर्ज करें"
                                placeholderTextColor="#94a3b8"
                            />
                            {showErrors && !fullName && <Text style={styles.errorText}>कृपया नाम दर्ज करें</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>आपका मोबाइल नंबर *</Text>
                            <View style={styles.phoneInputContainer}>
                                <Text style={styles.countryCode}>+91</Text>
                                <RNTextInput
                                    style={[styles.input, { flex: 1, marginTop: 0 }]}
                                    value={mobile}
                                    onChangeText={setMobile}
                                    placeholder="मोबाइल नंबर"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                            {showErrors && mobile.length !== 10 && <Text style={styles.errorText}>10 अंकों का मोबाइल नंबर दर्ज करें</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>जिला (District) *</Text>
                            <RNTextInput
                                style={styles.input}
                                value={district}
                                onChangeText={setDistrict}
                                placeholder="जिला का नाम"
                                placeholderTextColor="#94a3b8"
                            />
                            {showErrors && !district && <Text style={styles.errorText}>कृपया जिला दर्ज करें</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>आपकी विधानसभा *</Text>
                            <RNTextInput
                                style={styles.input}
                                value={vidhanSabha}
                                onChangeText={setVidhanSabha}
                                placeholder="विधानसभा का नाम"
                                placeholderTextColor="#94a3b8"
                            />
                            {showErrors && !vidhanSabha && <Text style={styles.errorText}>कृपया विधानसभा दर्ज करें</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>आपकी उम्र *</Text>
                            <RNTextInput
                                style={styles.input}
                                value={age}
                                onChangeText={setAge}
                                placeholder="उम्र"
                                placeholderTextColor="#94a3b8"
                                keyboardType="number-pad"
                                maxLength={3}
                            />
                            {showErrors && !age && <Text style={styles.errorText}>कृपया उम्र दर्ज करें</Text>}
                        </View>
                    </Animated.View>
                );

            case 1:
                return (
                    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.stepTitle}>पार्टी से संबंध</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>क्या आप समाजवादी पार्टी से जुड़े हैं? *</Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={[styles.radioButton, isPartyMember === 'yes' && styles.radioButtonActive]}
                                    onPress={() => setIsPartyMember('yes')}
                                >
                                    <Text style={[styles.radioText, isPartyMember === 'yes' && styles.radioTextActive]}>हाँ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.radioButton, isPartyMember === 'no' && styles.radioButtonActive]}
                                    onPress={() => setIsPartyMember('no')}
                                >
                                    <Text style={[styles.radioText, isPartyMember === 'no' && styles.radioTextActive]}>नहीं</Text>
                                </TouchableOpacity>
                            </View>
                            {showErrors && !isPartyMember && <Text style={styles.errorText}>कृपया चयन करें</Text>}
                        </View>

                        {isPartyMember === 'yes' && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>पार्टी से आपका संबंध क्या है? *</Text>
                                    <Text style={styles.hint}>(पद, भूमिका या कार्य बताएं)</Text>
                                    <RNTextInput
                                        style={[styles.input, styles.textArea]}
                                        value={partyRole}
                                        onChangeText={setPartyRole}
                                        placeholder="यहाँ लिखें..."
                                        placeholderTextColor="#94a3b8"
                                        multiline
                                        numberOfLines={3}
                                    />
                                    {showErrors && !partyRole && <Text style={styles.errorText}>कृपया भूमिका बताएं</Text>}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>पार्टी में कब से हैं? *</Text>
                                    <Text style={styles.hint}>(जैसे: 15 जनवरी 2020 या जनवरी 2020)</Text>
                                    <RNTextInput
                                        style={styles.input}
                                        value={memberSince}
                                        onChangeText={setMemberSince}
                                        placeholder="जैसे: जनवरी 2020"
                                        placeholderTextColor="#94a3b8"
                                    />
                                    {showErrors && !memberSince && <Text style={styles.errorText}>कृपया तारीख बताएं</Text>}
                                </View>
                            </>
                        )}
                    </Animated.View>
                );

            case 2:
                return (
                    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.stepTitle}>सोशल मीडिया और योग्यता</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>आप किन-किन सोशल मीडिया प्लेटफ़ॉर्म पर सक्रिय हैं? *</Text>
                            {['Facebook', 'Twitter (X)', 'Instagram', 'YouTube', 'WhatsApp'].map(platform => (
                                <TouchableOpacity
                                    key={platform}
                                    style={styles.checkboxRow}
                                    onPress={() => toggleSocialMedia(platform)}
                                >
                                    <View style={[styles.checkbox, socialMedia.includes(platform) && styles.checkboxChecked]}>
                                        {socialMedia.includes(platform) && (
                                            <MaterialCommunityIcons name="check" size={16} color="#fff" />
                                        )}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{platform}</Text>
                                </TouchableOpacity>
                            ))}
                            {showErrors && socialMedia.length === 0 && <Text style={styles.errorText}>कम से कम एक प्लेटफ़ॉर्म चुनें</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>आपका ईमेल ID *</Text>
                            <RNTextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="email@example.com"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {showErrors && !email && <Text style={styles.errorText}>कृपया ईमेल दर्ज करें</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>आपकी क्वालिफिकेशन *</Text>
                            <RNTextInput
                                style={styles.input}
                                value={qualification}
                                onChangeText={setQualification}
                                placeholder="शिक्षा योग्यता"
                                placeholderTextColor="#94a3b8"
                            />
                            {showErrors && !qualification && <Text style={styles.errorText}>कृपया योग्यता दर्ज करें</Text>}
                        </View>
                    </Animated.View>
                );

            case 3:
                return (
                    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.stepTitle}>ट्रेनिंग और मीटिंग</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                क्या आप डिजिटल ट्रेनिंग व मीटिंग के लिए समाजवादी पार्टी कार्यालय, लखनऊ आ सकते हैं? *
                            </Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={[styles.radioButton, canAttendLucknow === 'yes' && styles.radioButtonActive]}
                                    onPress={() => setCanAttendLucknow('yes')}
                                >
                                    <Text style={[styles.radioText, canAttendLucknow === 'yes' && styles.radioTextActive]}>हाँ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.radioButton, canAttendLucknow === 'no' && styles.radioButtonActive]}
                                    onPress={() => setCanAttendLucknow('no')}
                                >
                                    <Text style={[styles.radioText, canAttendLucknow === 'no' && styles.radioTextActive]}>नहीं</Text>
                                </TouchableOpacity>
                            </View>
                            {showErrors && !canAttendLucknow && <Text style={styles.errorText}>कृपया चयन करें</Text>}
                        </View>

                        {canAttendLucknow === 'yes' && (
                            <View style={styles.whatsappCard}>
                                <MaterialCommunityIcons name="whatsapp" size={32} color={SP_GREEN} />
                                <Text style={styles.whatsappTitle}>व्हाट्सऐप ग्रुप से जुड़ें</Text>
                                <Text style={styles.whatsappText}>
                                    मीटिंग की जानकारी के लिए नीचे दिए गए लिंक पर क्लिक करें
                                </Text>
                                <TouchableOpacity style={styles.whatsappButton}>
                                    <LinearGradient
                                        colors={[SP_GREEN, '#15803d']}
                                        style={styles.whatsappGradient}
                                    >
                                        <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
                                        <Text style={styles.whatsappButtonText}>ग्रुप ज्वाइन करें</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, isDesktop && { flexDirection: 'row' }]}>
            <LinearGradient colors={['#ffffff', '#f0fdf4']} style={styles.background} />

            <View style={{ flex: 1, maxWidth: isDesktop ? 600 : '100%', zIndex: 2 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <LinearGradient colors={[SP_RED, '#b91c1c']} style={styles.headerGradient}>
                            <MaterialCommunityIcons name="bicycle" size={32} color="#fff" />
                            <Title style={styles.headerTitle}>समाजवादी टेक फ़ोर्स</Title>
                            <Text style={styles.headerSubtitle}>सदस्य सूचना फ़ॉर्म</Text>
                        </LinearGradient>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        {[...Array(TOTAL_STEPS)].map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    index <= currentStep && styles.progressDotActive,
                                    index < currentStep && styles.progressDotCompleted,
                                ]}
                            >
                                {index < currentStep && (
                                    <MaterialCommunityIcons name="check" size={12} color="#fff" />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Form Content */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center' }}>
                            <Card style={styles.card}>
                                <Card.Content style={styles.cardContent}>
                                    {renderStep()}
                                </Card.Content>
                            </Card>
                        </View>
                    </ScrollView>

                    {/* Navigation Buttons */}
                    <View style={styles.navButtons}>
                        <View style={{ flexDirection: 'row', width: '100%', maxWidth: 600, alignSelf: 'center', gap: 12 }}>
                            {currentStep > 0 && (
                                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                    <MaterialCommunityIcons name="arrow-left" size={20} color={SP_RED} />
                                    <Text style={styles.backButtonText}>पिछला</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
                                onPress={handleNext}
                            >
                                <LinearGradient
                                    colors={[SP_RED, '#b91c1c']}
                                    style={styles.nextGradient}
                                >
                                    <Text style={styles.nextButtonText}>
                                        {currentStep === TOTAL_STEPS - 1 ? 'सबमिट करें' : 'अगला'}
                                    </Text>
                                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>

            {isDesktop && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#e2e8f0', backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <View style={{ transform: [{ scale: 0.85 }] }}>
                        <Title style={{ textAlign: 'center', marginBottom: 20, color: '#64748b', fontWeight: 'bold' }}>Live Preview</Title>
                        <IDCardPreview memberData={memberData} showBack={currentStep >= 1} />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 20,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    header: {
        paddingTop: height * 0.06,
    },
    headerGradient: {
        padding: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginTop: 12,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    progressDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressDotActive: {
        backgroundColor: SP_RED,
    },
    progressDotCompleted: {
        backgroundColor: SP_GREEN,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 24,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardContent: {
        padding: 20,
    },
    stepContainer: {
        minHeight: 300,
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    hint: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 4,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    countryCode: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        backgroundColor: '#f1f5f9',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    radioButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    radioButtonActive: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
    },
    radioText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    radioTextActive: {
        color: '#fff',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '600',
    },
    whatsappCard: {
        backgroundColor: '#f0fdf4',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    whatsappTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#166534',
        marginTop: 12,
    },
    whatsappText: {
        fontSize: 14,
        color: '#15803d',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    whatsappButton: {
        borderRadius: 12,
        overflow: 'hidden',
        width: '100%',
    },
    whatsappGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    whatsappButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    errorText: {
        fontSize: 13,
        color: '#ef4444',
        marginTop: 4,
        fontWeight: '600',
    },
    navButtons: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    backButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
        gap: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: SP_RED,
    },
    nextButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    nextGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    photoUploadSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    photoUploadButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: SP_GREEN,
        borderStyle: 'dashed',
        marginTop: 12,
    },
    uploadedPhoto: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoPlaceholderText: {
        marginTop: 8,
        fontSize: 13,
        color: SP_GREEN,
        fontWeight: '600',
    },
});
