import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    Platform,
    ScrollView,
    Alert,
    Modal,
    FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ViewShot from 'react-native-view-shot';
import { TEMPLATES, RenderBottomBar } from '../../components/posteredit/BottomBarTemplates';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';

const STEPS = [
    { key: 'name', label: 'Your Name', placeholder: 'Enter your full name', icon: 'account' },
    { key: 'designation', label: 'Designation', placeholder: 'e.g. District President', icon: 'badge-account-horizontal' },
    { key: 'mobile', label: 'Mobile Number', placeholder: 'Enter 10-digit number', icon: 'phone', keyboardType: 'phone-pad' },
    { key: 'social', label: 'Social Handle', placeholder: '@username', icon: 'at' },
    { key: 'address', label: 'Address', placeholder: 'Enter your address', icon: 'map-marker' },
    { key: 'photo', label: 'Profile Photo', placeholder: 'Select your photo', icon: 'camera' },
];

export default function DesktopNormalEdit() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, imageUrl, title } = params;

    const [details, setDetails] = useState({
        name: '',
        designation: '',
        mobile: '',
        social: '',
        address: '',
        photo: null as string | null,
    });
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
    const [imageAspectRatio, setImageAspectRatio] = useState(4 / 5);
    const viewShotRef = useRef<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (imageUrl) {
            Image.getSize(imageUrl as string, (w, h) => {
                setImageAspectRatio(w / h);
            }, (error) => {
                console.error('Failed to get image size', error);
            });
        }
    }, [imageUrl]);

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
            const link = document.createElement('a');
            link.href = uri;
            link.download = `poster-${Date.now()}.png`;
            link.click();
            Alert.alert('Success', 'Poster downloaded!');
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save poster');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                    <Text style={styles.backText}>Back to Posters</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Normal Edit</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <MaterialCommunityIcons name="download" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Download'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Left: Preview */}
                <View style={styles.previewSection}>
                    <View style={styles.previewCard}>
                        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={styles.posterContainer}>
                            <Image
                                source={{ uri: imageUrl as string }}
                                style={[styles.posterImage, { aspectRatio: imageAspectRatio }]}
                                resizeMode="cover"
                            />
                            <View style={{ width: '100%' }}>
                                <RenderBottomBar
                                    template={selectedTemplate}
                                    details={details}
                                    width={500} // Fixed width for desktop preview
                                />
                            </View>
                        </ViewShot>
                    </View>
                </View>

                {/* Right: Form */}
                <ScrollView style={styles.formSection} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Enter Details</Text>

                        {STEPS.map((step) => (
                            <View key={step.key} style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{step.label}</Text>
                                {step.key === 'photo' ? (
                                    <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                                        {details.photo ? (
                                            <Image source={{ uri: details.photo }} style={styles.photoPreview} />
                                        ) : (
                                            <View style={styles.photoPlaceholder}>
                                                <MaterialCommunityIcons name="camera-plus" size={32} color="#94a3b8" />
                                                <Text style={styles.photoPlaceholderText}>Upload Photo</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name={step.icon as any} size={20} color="#64748b" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder={step.placeholder}
                                            value={(details as any)[step.key]}
                                            onChangeText={(text) => setDetails(prev => ({ ...prev, [step.key]: text }))}
                                        />
                                    </View>
                                )}
                            </View>
                        ))}

                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Select Frame Style</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.framesScroll}>
                            {TEMPLATES.map((template) => (
                                <TouchableOpacity
                                    key={template.id}
                                    style={[
                                        styles.frameOption,
                                        selectedTemplate === template.id && styles.selectedFrame
                                    ]}
                                    onPress={() => setSelectedTemplate(template.id)}
                                >
                                    <Text style={[
                                        styles.frameName,
                                        selectedTemplate === template.id && styles.selectedFrameText
                                    ]}>{template.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        height: 70,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: SP_RED,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        padding: 32,
        gap: 32,
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
    },
    previewSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    previewCard: {
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    posterContainer: {
        width: 500,
        backgroundColor: '#fff',
    },
    posterImage: {
        width: '100%',
        height: undefined,
    },
    formSection: {
        width: 400,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        backgroundColor: '#f8fafc',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
    },
    photoButton: {
        height: 100,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
    },
    photoPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    photoPlaceholderText: {
        fontSize: 14,
        color: '#64748b',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    framesScroll: {
        flexDirection: 'row',
        gap: 12,
    },
    frameOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedFrame: {
        backgroundColor: '#fee2e2',
        borderColor: SP_RED,
    },
    frameName: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    selectedFrameText: {
        color: SP_RED,
        fontWeight: '600',
    },
});
