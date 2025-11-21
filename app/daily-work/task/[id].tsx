import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DAILY_TASKS } from '@/constants/dailyWorkData';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [description, setDescription] = useState('');

    const task = DAILY_TASKS.find(t => t.id === id);

    if (!task) {
        return (
            <View style={styles.container}>
                <Text>Task not found</Text>
            </View>
        );
    }

    const handleUpload = () => {
        Alert.alert('Upload Proof', 'Choose proof type', [
            { text: 'Screenshot', onPress: () => setUploadedFile('screenshot.jpg') },
            { text: 'Photo', onPress: () => setUploadedFile('photo.jpg') },
            { text: 'Cancel', style: 'cancel' }
        ]);
    };

    const handleSubmit = () => {
        if (!uploadedFile) {
            Alert.alert('Error', 'Please upload proof of your work.');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert('Success', 'Task submitted for review! Points will be added shortly.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 1500);
    };

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
                                name={task.icon as any}
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

                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#64748b" />
                            <Text style={styles.metaText}>Deadline: {task.deadline}</Text>
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

                        <TouchableOpacity style={styles.uploadArea} onPress={handleUpload}>
                            {uploadedFile ? (
                                <View style={styles.filePreview}>
                                    <MaterialCommunityIcons name="file-image" size={40} color={SP_RED} />
                                    <Text style={styles.fileName}>{uploadedFile}</Text>
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
});
