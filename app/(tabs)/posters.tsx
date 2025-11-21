import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Poster Card Component
const PosterCard = ({ title, category, downloads, image, onCustomize }: any) => {
    const [aspectRatio, setAspectRatio] = useState(1.5); // Default aspect ratio

    useEffect(() => {
        if (image) {
            Image.getSize(image, (width, height) => {
                if (width && height) {
                    setAspectRatio(width / height);
                }
            }, (error) => console.log("Error getting image size:", error));
        }
    }, [image]);

    return (
        <View style={styles.posterCard}>
            <TouchableOpacity activeOpacity={0.9}>
                {image ? (
                    <Image
                        source={{ uri: image }}
                        style={[styles.posterPreview, { aspectRatio, height: undefined }]}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={[SP_RED, '#b91c1c']}
                        style={[styles.posterPreview, { height: 200 }]} // Keep fixed height for gradient fallback
                    >
                        <MaterialCommunityIcons name="image-multiple" size={60} color="#fff" style={{ opacity: 0.5 }} />
                        <Text style={styles.posterTitle}>{title}</Text>
                    </LinearGradient>
                )}

                <View style={styles.posterInfo}>
                    <View style={styles.posterMeta}>
                        <View style={styles.categoryTag}>
                            <Text style={styles.categoryTagText}>{category}</Text>
                        </View>
                        <View style={styles.downloadCount}>
                            <MaterialCommunityIcons name="download" size={14} color="#64748b" />
                            <Text style={styles.downloadText}>{downloads}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.customizeButton}
                        onPress={onCustomize}
                    >
                        <MaterialCommunityIcons name="palette" size={18} color="#fff" />
                        <Text style={styles.customizeButtonText}>Customize</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
};

// Customize Modal Component
const CustomizeModal = ({ visible, onClose, posterData }: any) => {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [description, setDescription] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imageAspectRatio, setImageAspectRatio] = useState(1.5); // Default to landscape
    const viewShotRef = useRef<any>(null);

    useEffect(() => {
        if (posterData?.image) {
            Image.getSize(posterData.image, (width, height) => {
                if (width && height) {
                    setImageAspectRatio(width / height);
                }
            }, (error) => {
                console.log("Could not get image size, using default", error);
            });
        }
    }, [posterData]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleDownload = async () => {
        if (!name || !position) {
            Alert.alert('Required Fields', 'Please enter your name and position');
            return;
        }

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant storage permissions to download posters.');
                return;
            }

            const uri = await viewShotRef.current.capture();
            const asset = await MediaLibrary.createAssetAsync(uri);

            try {
                const album = await MediaLibrary.getAlbumAsync('Samajwadi Posters');
                if (album == null) {
                    await MediaLibrary.createAlbumAsync('Samajwadi Posters', asset, false);
                } else {
                    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                }
            } catch (e) {
                console.log("Album organization failed, but image saved.");
            }

            Alert.alert('Success!', 'Poster downloaded successfully');
        } catch (error) {
            console.error("Download error:", error);
            Alert.alert('Error', 'Failed to download poster. Please try again.');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Customize Poster</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        {/* Live Preview */}
                        <View style={styles.previewSection}>
                            <Text style={styles.sectionTitle}>Live Preview</Text>
                            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                                <View style={styles.posterContainer} collapsable={false}>
                                    {/* Poster Banner */}
                                    {posterData?.image ? (
                                        <Image
                                            source={{ uri: posterData.image }}
                                            style={[styles.posterBanner, { aspectRatio: imageAspectRatio }]}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={[SP_RED, '#b91c1c']}
                                            style={styles.posterBanner}
                                        >
                                            <Text style={styles.bannerText}>समाजवादी विकास मुख, देश की</Text>
                                            <Text style={styles.bannerText}>राजनीति के भविष्य समाजवादी पार्टी के</Text>
                                            <Text style={styles.bannerText}>राष्ट्रीय अध्यक्ष, उत्तर प्रदेश के पूर्व मुख्यमंत्री</Text>

                                            <View style={styles.leaderSection}>
                                                <MaterialCommunityIcons name="account-circle" size={120} color="#fff" style={{ opacity: 0.3 }} />
                                            </View>

                                            <Text style={styles.leaderName}>श्री अखिलेश</Text>
                                        </LinearGradient>
                                    )}

                                    {/* User Details Section */}
                                    <View style={styles.userDetailsSection}>
                                        <View style={styles.userInfoContainer}>
                                            {/* Profile Image */}
                                            <View style={styles.profileImageContainer}>
                                                {profileImage ? (
                                                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                                                ) : (
                                                    <View style={styles.profilePlaceholder}>
                                                        <MaterialCommunityIcons name="account" size={40} color="#64748b" />
                                                    </View>
                                                )}
                                            </View>

                                            {/* User Text Info */}
                                            <View style={styles.userTextInfo}>
                                                <Text style={styles.userPosition}>{position || 'MLA'}</Text>
                                                <Text style={styles.userName}>{name || 'Your Name'}</Text>
                                                <Text style={styles.userDescription} numberOfLines={2}>
                                                    {description || 'Add a little bit of body text'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* SP Stripes */}
                                        <View style={styles.stripesContainer}>
                                            {[...Array(5)].map((_, i) => (
                                                <View key={i} style={styles.stripe} />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </ViewShot>
                        </View>

                        {/* Input Fields */}
                        <View style={styles.inputSection}>
                            <Text style={styles.sectionTitle}>Your Details</Text>

                            {/* Profile Image Picker */}
                            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                                <MaterialCommunityIcons name="camera" size={24} color={SP_RED} />
                                <Text style={styles.imagePickerText}>
                                    {profileImage ? 'Change Profile Image' : 'Upload Profile Image'}
                                </Text>
                            </TouchableOpacity>

                            {/* Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Name (नाम) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            {/* Position Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Position (उपाधि/पद) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., MLA, Karyakarta, etc."
                                    value={position}
                                    onChangeText={setPosition}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            {/* Description Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description (विवरण)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Add a brief description"
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        {/* Download Button */}
                        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                            <LinearGradient
                                colors={[SP_GREEN, '#15803d']}
                                style={styles.downloadGradient}
                            >
                                <MaterialCommunityIcons name="download" size={24} color="#fff" />
                                <Text style={styles.downloadButtonText}>Download Poster</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default function PostersScreen() {
    const [showCustomize, setShowCustomize] = useState(false);
    const [selectedPoster, setSelectedPoster] = useState<any>(null);

    const posters = [
        {
            id: 1,
            title: 'Akhilesh Poster',
            category: 'Campaign',
            downloads: '2.5K',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvMdNBcD-Xj_LIEHpcyplECD3wb5v_UjRD9A&s'
        },
        {
            id: 2,
            title: 'Party Event',
            category: 'Event',
            downloads: '1.8K',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX9BRULQhFa95LVK-a0Ul71tjkKKVnwzZU4g&s'
        },
        {
            id: 3,
            title: 'Youth Campaign',
            category: 'Youth',
            downloads: '3.2K',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaJoh7rtXeiyAd5k-DjKSiDtxro_iPzPB3Dg&s'
        },
        {
            id: 4,
            title: 'Farmer Support',
            category: 'Policy',
            downloads: '1.5K',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaJoh7rtXeiyAd5k-DjKSiDtxro_iPzPB3Dg&s'
        },
    ];

    const handleCustomize = (poster: any) => {
        setSelectedPoster(poster);
        setShowCustomize(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[SP_RED, '#b91c1c']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Posters</Text>
                <Text style={styles.headerSubtitle}>Customize & Download</Text>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.postersGrid}>
                    {posters.map((poster) => (
                        <PosterCard
                            key={poster.id}
                            {...poster}
                            onCustomize={() => handleCustomize(poster)}
                        />
                    ))}
                </View>
            </ScrollView>

            <CustomizeModal
                visible={showCustomize}
                onClose={() => setShowCustomize(false)}
                posterData={selectedPoster}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    postersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    posterCard: {
        width: width > 768 ? (width - 80) / 4 : '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    posterPreview: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        marginTop: 12,
    },
    posterInfo: {
        padding: 16,
    },
    posterMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryTag: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    categoryTagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    downloadCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    downloadText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    customizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: SP_RED,
        paddingVertical: 12,
        borderRadius: 12,
    },
    customizeButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    modalContent: {
        padding: 20,
    },
    previewSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    posterContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    posterBanner: {
        width: '100%',
        // aspectRatio removed to allow dynamic sizing based on image
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    leaderSection: {
        marginVertical: 10,
    },
    leaderName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    userDetailsSection: {
        backgroundColor: '#f8fafc',
        flexDirection: 'row',
        padding: 16,
    },
    userInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 16,
    },
    profileImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: SP_RED,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profilePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userTextInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    userPosition: {
        fontSize: 12,
        fontWeight: '700',
        color: SP_RED,
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 4,
    },
    userDescription: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 18,
    },
    stripesContainer: {
        width: 60,
        gap: 8,
        justifyContent: 'center',
    },
    stripe: {
        height: 12,
        backgroundColor: SP_RED,
        borderRadius: 2,
    },
    inputSection: {
        marginBottom: 24,
    },
    imagePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: SP_RED,
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    imagePickerText: {
        fontSize: 14,
        fontWeight: '700',
        color: SP_RED,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#1e293b',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    downloadButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    downloadGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    downloadButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
});
