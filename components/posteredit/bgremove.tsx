import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { removeBackground } from '../../utils/backgroundRemoval';

import { getApiUrl } from '../../utils/api';

const API_URL = getApiUrl();

const RemoveBackground = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setProcessedImage(null);
        }
    };

    const handleRemoveBackground = async () => {
        if (!selectedImage) {
            Alert.alert('Error', 'Please select an image first!');
            return;
        }

        setLoading(true);
        setProcessedImage(null);

        try {
            if (Platform.OS === 'web') {
                // Use @imgly/background-removal for Web
                const blob = await removeBackground(selectedImage);
                const url = URL.createObjectURL(blob);
                setProcessedImage(url);
                Alert.alert('Success', 'Background removed successfully!');
            } else {
                // Keep existing backend logic for Native
                const base64 = await FileSystem.readAsStringAsync(selectedImage, {
                    encoding: 'base64',
                });

                const response = await fetch(`${API_URL}/ai/remove-background`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image: `data:image/jpeg;base64,${base64}`,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    setProcessedImage(data.image);
                    Alert.alert('Success', 'Background removed successfully!');
                } else {
                    Alert.alert('Error', data.error || 'Failed to remove background');
                }
            }
        } catch (error) {
            console.error('Background removal failed:', error);
            Alert.alert('Error', 'Something went wrong. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!processedImage) return;

        try {
            if (Platform.OS === 'web') {
                const link = document.createElement('a');
                link.href = processedImage;
                link.download = 'background-removed.png';
                link.click();
            } else {
                // For native, we need to download the file locally first
                const filename = processedImage.split('/').pop() || 'processed.png';
                const fileUri = (FileSystem.cacheDirectory || '') + filename;

                const downloadRes = await FileSystem.downloadAsync(processedImage, fileUri);
                await Sharing.shareAsync(downloadRes.uri);
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download image');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.card}>
                <Text style={styles.title}>Background Removal</Text>

                <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#64748b" />
                    <Text style={styles.uploadText}>
                        {selectedImage ? 'Change Image' : 'Select Image'}
                    </Text>
                </TouchableOpacity>

                {selectedImage && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleRemoveBackground}
                    disabled={loading || !selectedImage}
                    style={[styles.processButton, (loading || !selectedImage) && styles.disabledButton]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Remove Background</Text>
                    )}
                </TouchableOpacity>
            </View>

            {processedImage && (
                <View style={styles.card}>
                    <Text style={styles.title}>Processed Image</Text>
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: processedImage }} style={styles.previewImage} resizeMode="contain" />
                    </View>

                    <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
                        <Ionicons name="download-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Download Image</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FB',
    },
    content: {
        padding: 20,
        gap: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF4938',
        marginBottom: 16,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        marginBottom: 20,
    },
    uploadText: {
        marginTop: 8,
        color: '#64748b',
        fontWeight: '500',
    },
    previewContainer: {
        height: 200,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    processButton: {
        backgroundColor: '#FF4938',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadButton: {
        backgroundColor: '#16a34a',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#cbd5e1',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default RemoveBackground;