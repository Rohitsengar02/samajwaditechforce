import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiUrl } from '../utils/api';

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function EditProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
                setName(parsedUser.name || '');
                setEmail(parsedUser.email || '');
                setPhone(parsedUser.phone || '');
                setGender(parsedUser.gender || '');
                setDob(parsedUser.dob || '');
                setProfileImage(parsedUser.profileImage || null);
            }
        } catch (error) {
            console.error('Failed to load user data', error);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // Cloudinary Config
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dssmutzly/image/upload";
    const UPLOAD_PRESET = "multimallpro";

    const uploadImageToCloudinary = async (uri: string) => {
        const data = new FormData();
        data.append('file', {
            uri,
            type: 'image/jpeg',
            name: 'profile_image.jpg',
        } as any);
        data.append('upload_preset', UPLOAD_PRESET);
        data.append('cloud_name', 'dssmutzly');

        try {
            const res = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: data,
            });
            const result = await res.json();
            if (result.secure_url) {
                return result.secure_url;
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            console.error('Cloudinary Upload Error:', error);
            return null;
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let imageUrl = profileImage;

            // Upload image if it's a local URI (not already a URL)
            if (profileImage && !profileImage.startsWith('http')) {
                setUploading(true);
                const uploadedUrl = await uploadImageToCloudinary(profileImage);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    Alert.alert('Error', 'Failed to upload image');
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Not authenticated');
                return;
            }

            // API URL Logic
            const url = getApiUrl();

            console.log('Updating profile at:', `${url}/auth/profile`);

            const response = await fetch(`${url}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    phone,
                    gender,
                    dob,
                    profileImage: imageUrl,
                }),
            });

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('JSON Parse Error:', e);
                console.log('Raw Response:', responseText);
                throw new Error(`Server Error: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update local storage
            const updatedUser = { ...user, ...data };
            await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));

            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[SP_RED, '#b91c1c']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Profile Image */}
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.image} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Text style={styles.placeholderText}>
                                        {name ? name.charAt(0).toUpperCase() : 'SP'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.cameraIcon}>
                                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email (Read Only)</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={email}
                                editable={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Gender</Text>
                                <TextInput
                                    style={styles.input}
                                    value={gender}
                                    onChangeText={setGender}
                                    placeholder="Male/Female"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Date of Birth</Text>
                                <TextInput
                                    style={styles.input}
                                    value={dob}
                                    onChangeText={setDob}
                                    placeholder="DD/MM/YYYY"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={loading ? ['#666', '#444'] : [SP_RED, '#b91c1c']}
                        style={styles.saveButtonGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {uploading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={SP_RED} />
                    <Text style={styles.loadingText}>Uploading Image...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
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
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: SP_GREEN,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    placeholderText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: SP_RED,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    changePhotoText: {
        marginTop: 12,
        color: SP_RED,
        fontWeight: '600',
        fontSize: 16,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    disabledInput: {
        backgroundColor: '#f1f5f9',
        color: '#94a3b8',
    },
    row: {
        flexDirection: 'row',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    saveButton: {
        marginBottom: 50,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    loadingText: {
        marginTop: 10,
        color: SP_RED,
        fontWeight: '600',
    },
});
