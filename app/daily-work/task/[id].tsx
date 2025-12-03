import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, TextInput, Linking } from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

interface Task {
    _id: string;
    title: string;
    description: string;
    type: string;
    points: number;
    deadline?: string;
    status: string;
    linkToShare?: string;
    platform?: string;
    completed?: boolean;
}

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTaskDetails();
    }, [id]);

    const fetchTaskDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = getApiUrl();
            const response = await fetch(`${url}/tasks/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await response.json();
            if (data.success) {
                setTask(data.data);
            } else {
                Alert.alert('Error', 'Task not found');
                router.back();
            }
        } catch (error) {
            console.error('Error fetching task:', error);
            Alert.alert('Error', 'Failed to load task details');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setUploadedImage(result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!uploadedImage) {
            Alert.alert('Error', 'Please upload proof of your work.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = getApiUrl();

            const response = await fetch(`${url}/tasks/${id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    comment: description,
                    proofImage: uploadedImage // Sending base64 string
                })
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', `Task submitted! You earned ${data.pointsEarned} points.`, [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to submit task');
            }
        } catch (error) {
            console.error('Error submitting task:', error);
            Alert.alert('Error', 'Failed to submit task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openLink = () => {
        if (task?.linkToShare) {
            Linking.openURL(task.linkToShare);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={SP_RED} />
            </View>
        );
    }

    if (!task) {
        return (
            <View style={styles.container}>
                <Text>Task not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Task Info Card */}
                <Surface style={styles.taskCard} elevation={2}>
                    <View style={styles.iconRow}>
                        <View style={[styles.iconContainer, { backgroundColor: task.status === 'Completed' ? '#dcfce7' : '#fee2e2' }]}>
                            <MaterialCommunityIcons
                                name={task.type === 'Social Media' ? 'share-variant' : 'checkbox-marked-circle-outline'}
                                size={32}
                                color={task.status === 'Completed' ? SP_GREEN : SP_RED}
                            />
                        </View>
                        <View style={styles.pointsBadge}>
                            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                            <Text style={styles.pointsText}>{task.points} Points</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{task.title}</Text>
                    <Text style={styles.description}>{task.description}</Text>

                    {task.linkToShare && (
                        <TouchableOpacity style={styles.linkButton} onPress={openLink}>
                            <Text style={styles.linkButtonText}>Open Link</Text>
                            <MaterialCommunityIcons name="open-in-new" size={16} color="#fff" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#64748b" />
                            <Text style={styles.metaText}>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="tag-outline" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{task.type}</Text>
                        </View>
                    </View>
                </Surface>

                {/* Submission Section */}
                {task.status === 'Completed' ? (
                    <Surface style={styles.completedCard} elevation={1}>
                        <MaterialCommunityIcons name="check-circle" size={48} color={SP_GREEN} />
                        <Text style={styles.completedTitle}>Task Completed!</Text>
                        <Text style={styles.completedText}>You have earned {task.points} points for this task.</Text>
                    </Surface>
                ) : (
                    <View style={styles.submissionForm}>
                        <Text style={styles.sectionTitle}>Submit Proof</Text>

                        <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                            {uploadedImage ? (
                                <View style={styles.filePreview}>
                                    <Image source={{ uri: uploadedImage }} style={{ width: 200, height: 200, borderRadius: 10, marginBottom: 10 }} resizeMode="cover" />
                                    <Text style={styles.changeText}>Tap to change</Text>
                                </View>
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="cloud-upload" size={40} color="#94a3b8" />
                                    <Text style={styles.uploadText}>Upload Screenshot / Photo</Text>
                                    <Text style={styles.uploadSubtext}>Tap to select file</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.label}>Add a Note (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Describe your work..."
                            multiline
                            numberOfLines={3}
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={isSubmitting ? ['#cbd5e1', '#94a3b8'] : [SP_RED, '#b91c1c']}
                                style={styles.submitGradient}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitText}>Submit Task</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    content: {
        padding: 20,
    },
    taskCard: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginBottom: 24,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    pointsText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#b45309',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        lineHeight: 24,
        marginBottom: 20,
    },
    metaContainer: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 13,
    },
    completedCard: {
        padding: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    completedTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    completedText: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
    },
    submissionForm: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#f8fafc',
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 12,
        marginBottom: 4,
    },
    uploadSubtext: {
        fontSize: 13,
        color: '#94a3b8',
    },
    filePreview: {
        alignItems: 'center',
    },
    fileName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 8,
    },
    changeText: {
        fontSize: 13,
        color: SP_RED,
        marginTop: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        minHeight: 80,
        marginBottom: 24,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SP_RED,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    linkButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
