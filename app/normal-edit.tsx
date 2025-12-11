import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { TEMPLATES, RenderBottomBar } from '../components/posteredit/BottomBarTemplates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Preview mode: Large poster with minimal buttons
const PREVIEW_POSTER_WIDTH = width - 20; // Almost full width
// Edit mode: Smaller poster to make room for form
const EDIT_AVAILABLE_HEIGHT = height - 80 - 280 - 60;
const EDIT_POSTER_WIDTH = Math.min(width - 40, EDIT_AVAILABLE_HEIGHT * 0.7);

const STEPS = [
    { key: 'name', label: 'Your Name', placeholder: 'Enter your full name', icon: 'account' },
    { key: 'designation', label: 'Designation', placeholder: 'e.g. MLA, District President', icon: 'badge-account-horizontal' },
    { key: 'mobile', label: 'Mobile Number', placeholder: 'Enter 10-digit number', icon: 'phone', keyboardType: 'phone-pad' },
    { key: 'social', label: 'Social Handle', placeholder: '@username', icon: 'at' },
    { key: 'address', label: 'Address', placeholder: 'Enter your address', icon: 'map-marker' },
    { key: 'photo', label: 'Profile Photo', placeholder: 'Select your photo', icon: 'camera' },
];

export default function NormalEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, imageUrl, title } = params;

    const [currentStep, setCurrentStep] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false); // Start in preview mode
    const [details, setDetails] = useState({
        name: '',
        designation: '',
        mobile: '',
        social: '',
        address: '',
        photo: null as string | null,
    });
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
    const [showFrameModal, setShowFrameModal] = useState(false);
    const [imageAspectRatio, setImageAspectRatio] = useState(4 / 5);

    const viewShotRef = useRef<any>(null);
    const [saving, setSaving] = useState(false);

    // Auto-fill from user profile on mount
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            // Try to get token for API call
            const token = await AsyncStorage.getItem('userToken');
            let user = null;

            // Fetch fresh data from API if token exists
            if (token) {
                try {
                    const apiUrl = getApiUrl();
                    const response = await fetch(`${apiUrl}/auth/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        user = await response.json();
                        console.log('Fresh user data from API:', user);
                        // Update AsyncStorage with fresh data
                        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
                    }
                } catch (apiError) {
                    console.log('API fetch failed, using cached data');
                }
            }

            // Fall back to cached data if API failed
            if (!user) {
                const userInfoStr = await AsyncStorage.getItem('userInfo');
                if (userInfoStr) {
                    user = JSON.parse(userInfoStr);
                    console.log('Cached user data:', user);
                }
            }

            if (user) {
                // Build address from nested address object
                let fullAddress = '';
                if (user.address && typeof user.address === 'object') {
                    const parts = [
                        user.address.street,
                        user.address.city,
                        user.address.state
                    ].filter(Boolean);
                    fullAddress = parts.join(', ');
                } else if (user.district) {
                    fullAddress = `${user.vidhanSabha || ''}, ${user.district}`;
                }

                console.log('Setting details:', {
                    name: user.name,
                    designation: user.partyRole,
                    mobile: user.phone,
                    address: fullAddress,
                    photo: user.profileImage
                });

                setDetails({
                    name: user.name || '',
                    designation: user.partyRole || '',
                    mobile: user.phone || '',
                    social: user.socialHandle || (user.email ? `@${user.email.split('@')[0]}` : ''),
                    address: fullAddress,
                    photo: user.profileImage || null,
                });
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    useEffect(() => {
        if (imageUrl) {
            Image.getSize(imageUrl as string, (w, h) => {
                setImageAspectRatio(w / h);
            }, (error) => {
                console.error('Failed to get image size', error);
            });
        }
    }, [imageUrl]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSave();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setDetails(prev => ({ ...prev, photo: result.assets[0].uri }));
        }
    };

    const handleSave = async () => {
        if (!viewShotRef.current) return;
        setSaving(true);
        try {
            const uri = await viewShotRef.current.capture();
            if (Platform.OS === 'web') {
                const link = document.createElement('a');
                link.href = uri;
                link.download = `poster-${Date.now()}.png`;
                link.click();
            } else {
                const { status } = await MediaLibrary.requestPermissionsAsync(true);
                if (status === 'granted') {
                    await MediaLibrary.saveToLibraryAsync(uri);
                    Alert.alert('Saved', 'Poster saved to gallery!');
                } else {
                    Alert.alert('Permission needed', 'Please grant permission to save the poster.');
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save poster');
        } finally {
            setSaving(false);
        }
    };

    const renderInput = () => {
        const step = STEPS[currentStep];

        if (step.key === 'photo') {
            return (
                <View style={styles.photoInputContainer}>
                    <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                        {details.photo ? (
                            <Image source={{ uri: details.photo }} style={styles.photoPreview} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <MaterialCommunityIcons name="camera-plus" size={40} color="#94a3b8" />
                                <Text style={styles.photoPlaceholderText}>Tap to upload photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.inputContainer}>
                <MaterialCommunityIcons name={step.icon as any} size={24} color={SP_RED} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={step.placeholder}
                    value={(details as any)[step.key]}
                    onChangeText={(text) => setDetails(prev => ({ ...prev, [step.key]: text }))}
                    keyboardType={(step.keyboardType as any) || 'default'}
                    autoFocus
                />
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient colors={[SP_RED, '#b91c1c']} style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Normal Edit</Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
                {/* Poster Preview Area - No label */}
                <View style={styles.previewContainer}>
                    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={[styles.posterContainer, { width: isEditMode ? EDIT_POSTER_WIDTH : PREVIEW_POSTER_WIDTH }]}>
                        <Image
                            source={{ uri: imageUrl as string }}
                            style={[styles.posterImage, { width: '100%', height: undefined, aspectRatio: imageAspectRatio }]}
                            resizeMode="contain"
                        />

                        {/* Dynamic Bottom Bar - External (Below Image) */}
                        <View style={{ width: '100%' }}>
                            <RenderBottomBar
                                template={selectedTemplate}
                                details={details}
                                width={isEditMode ? EDIT_POSTER_WIDTH : PREVIEW_POSTER_WIDTH}
                            />
                        </View>
                    </ViewShot>
                </View>

                {/* Bottom Action Area - Safe from navbar */}
                <SafeAreaView edges={['bottom']} style={styles.formArea}>
                    {!isEditMode ? (
                        /* Preview Mode - Show 3 buttons: Save, Edit, Change Frame */
                        <View style={styles.navigationButtons}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: SP_RED,
                                    borderRadius: 16,
                                    paddingVertical: 16,
                                    alignItems: 'center',
                                }}
                                onPress={handleSave}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                        <MaterialCommunityIcons name="download" size={28} color="#fff" />
                                    </View>
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                                        {saving ? 'Saving...' : 'Save'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: '#3b82f6',
                                    borderRadius: 16,
                                    paddingVertical: 16,
                                    alignItems: 'center',
                                    marginHorizontal: 6,
                                }}
                                onPress={() => {
                                    setCurrentStep(0);
                                    setIsEditMode(true);
                                }}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                        <MaterialCommunityIcons name="pencil" size={28} color="#fff" />
                                    </View>
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Edit</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: '#f1f5f9',
                                    borderRadius: 16,
                                    paddingVertical: 16,
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#e2e8f0',
                                }}
                                onPress={() => setShowFrameModal(true)}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{ backgroundColor: SP_RED + '20', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                        <MaterialCommunityIcons name="image-frame" size={28} color={SP_RED} />
                                    </View>
                                    <Text style={{ color: '#334155', fontWeight: '700', fontSize: 14 }}>Frame</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* Edit Mode - Show step-by-step form */
                        <>
                            <View style={styles.stepIndicator}>
                                {STEPS.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.stepDot,
                                            index <= currentStep ? styles.activeDot : styles.inactiveDot
                                        ]}
                                    />
                                ))}
                            </View>

                            <Text style={styles.stepTitle}>
                                Step {currentStep + 1}: {STEPS[currentStep].label}
                            </Text>

                            {renderInput()}

                            <View style={styles.navigationButtons}>
                                {currentStep === STEPS.length - 1 ? (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.navButton, styles.prevButton]}
                                            onPress={() => setCurrentStep(prev => prev - 1)}
                                        >
                                            <Text style={styles.prevButtonText}>Back</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.navButton, styles.nextButton]}
                                            onPress={() => setIsEditMode(false)}
                                        >
                                            <MaterialCommunityIcons name="check" size={20} color="#fff" />
                                            <Text style={[styles.nextButtonText, { marginLeft: 4 }]}>Done</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.navButton, styles.prevButton]}
                                            onPress={() => {
                                                if (currentStep > 0) {
                                                    setCurrentStep(prev => prev - 1);
                                                } else {
                                                    setIsEditMode(false);
                                                }
                                            }}
                                        >
                                            <Text style={styles.prevButtonText}>
                                                {currentStep === 0 ? 'Cancel' : 'Back'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.navButton, styles.nextButton]}
                                            onPress={handleNext}
                                        >
                                            <Text style={styles.nextButtonText}>Next</Text>
                                            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </>
                    )}
                </SafeAreaView>
            </ScrollView>

            <Modal
                visible={showFrameModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFrameModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowFrameModal(false)}
                    />
                    <SafeAreaView edges={['bottom']} style={styles.bottomSheet}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Frame</Text>
                            <TouchableOpacity onPress={() => setShowFrameModal(false)} style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        {/* Swipe hint */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color="#94a3b8" />
                            <Text style={{ color: '#94a3b8', fontSize: 12, marginHorizontal: 8 }}>Swipe to see more frames</Text>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
                        </View>

                        <View style={{ position: 'relative' }}>
                            {/* Left Arrow */}
                            <View style={{ position: 'absolute', left: 5, top: '40%', zIndex: 10 }}>
                                <MaterialCommunityIcons name="chevron-left" size={32} color={SP_RED} />
                            </View>

                            {/* Right Arrow */}
                            <View style={{ position: 'absolute', right: 5, top: '40%', zIndex: 10 }}>
                                <MaterialCommunityIcons name="chevron-right" size={32} color={SP_RED} />
                            </View>

                            <FlatList
                                data={TEMPLATES}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.carouselContent}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.carouselItem,
                                            { width: width }
                                        ]}
                                        onPress={() => {
                                            setSelectedTemplate(item.id);
                                            setShowFrameModal(false);
                                        }}
                                    >
                                        <View style={{ paddingHorizontal: 50, width: '100%' }}>
                                            <View style={[
                                                styles.framePreviewContainer,
                                                selectedTemplate === item.id && styles.selectedFrameBorder
                                            ]}>
                                                <RenderBottomBar
                                                    template={item.id}
                                                    details={{ ...details, name: 'Your Name', designation: 'Designation' }}
                                                    width={width - 100 - 28}
                                                />
                                            </View>
                                            <Text style={[
                                                styles.templateName,
                                                selectedTemplate === item.id && styles.selectedTemplateName
                                            ]}>{item.name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between', // Distribute space evenly
    },
    previewContainer: {
        padding: 8,
        paddingTop: 5, // Minimal top padding
        alignItems: 'center',
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 12,
    },
    posterContainer: {
        width: width - 40,
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        overflow: 'hidden', // Clip any overflow
    },
    posterImage: {
        width: '100%',
        // Height is set dynamically based on aspect ratio
    },
    bottomBar: {
        width: '100%',
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 0,
    },
    bottomBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    barPhotoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: SP_RED,
        overflow: 'hidden',
        marginRight: 12,
    },
    barPhoto: {
        width: '100%',
        height: '100%',
    },
    barTextContainer: {
        flex: 1,
    },
    barName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    barDesignation: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    barContactContainer: {
        alignItems: 'flex-end',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    contactText: {
        fontSize: 10,
        color: '#334155',
        marginLeft: 4,
        fontWeight: '600',
    },
    partyStrip: {
        height: 6,
        width: '100%',
    },
    formArea: {
        backgroundColor: '#fff',
        marginHorizontal: 10, // Reduced from 20
        borderRadius: 16,
        padding: 16, // Reduced from 24
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12, // Reduced from 24
        gap: 6, // Reduced from 8
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: SP_RED,
        width: 24,
    },
    inactiveDot: {
        backgroundColor: '#e2e8f0',
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 24,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
    },
    photoInputContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photoButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        alignItems: 'center',
    },
    photoPlaceholderText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    navButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    prevButton: {
        backgroundColor: '#f1f5f9',
    },
    nextButton: {
        backgroundColor: SP_RED,
    },
    prevButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginRight: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        padding: 20,
        paddingBottom: 40,
    },
    templateItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedTemplateItem: {
        borderColor: SP_RED,
    },
    templatePreview: {
        width: '100%',
        aspectRatio: 4 / 5,
        backgroundColor: '#e2e8f0',
        position: 'relative',
    },
    templateImage: {
        width: '100%',
        height: '100%',
    },
    templateBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    templateName: {
        padding: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    selectedTemplateName: {
        color: SP_RED,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackdrop: {
        flex: 1,
    },
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 60,
        height: '35%', // Approx 35% of screen
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    carouselContent: {
        alignItems: 'center',
        paddingBottom: 20, // Extra padding to ensure frames are visible above navbar
    },
    carouselItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    framePreviewContainer: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        padding: 12,
    },
    selectedFrameBorder: {
        borderColor: SP_RED,
    },
});
