import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput as NativeTextInput } from 'react-native';
import { Text, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TRAINING_PHASES } from '@/constants/trainingData';

const SP_RED = '#E30512';

export default function ModuleDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [submissionText, setSubmissionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);

    // Find module and phase
    let moduleData = null;
    let phaseData = null;

    for (const phase of TRAINING_PHASES) {
        const mod = phase.modules.find(m => m.id === id);
        if (mod) {
            moduleData = mod;
            phaseData = phase;
            break;
        }
    }

    if (!moduleData || !phaseData) {
        return (
            <View style={styles.container}>
                <Text>Module not found</Text>
            </View>
        );
    }

    if (moduleData.type === 'Certificate') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Certification</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <Surface style={{ padding: 40, borderRadius: 24, alignItems: 'center', width: '100%', elevation: 4 }}>
                        <MaterialCommunityIcons name="certificate" size={80} color={SP_RED} />
                        <Text style={{ fontSize: 24, fontWeight: '800', marginTop: 24, color: '#1e293b', textAlign: 'center' }}>
                            Congratulations!
                        </Text>
                        <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 12, marginBottom: 32, lineHeight: 24 }}>
                            You have successfully completed the Samajwadi Party Training Program. You are now a certified member.
                        </Text>

                        <TouchableOpacity
                            style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}
                            onPress={() => Alert.alert('Success', 'Certificate downloaded to your device!')}
                        >
                            <LinearGradient
                                colors={[SP_RED, '#b91c1c']}
                                style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
                            >
                                <MaterialCommunityIcons name="download" size={24} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Download Certificate</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Surface>
                </View>
            </View>
        );
    }

    const handleUpload = () => {
        // Mock upload
        Alert.alert('Select File', 'Choose a photo or video to upload', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Choose from Gallery', onPress: () => setUploadedFile('task_evidence.jpg') }
        ]);
    };

    const handleSubmit = () => {
        if (!submissionText && !uploadedFile) {
            Alert.alert('Error', 'Please provide a description or upload a file.');
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert('Success', 'Task submitted successfully!', [
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
                <Text style={styles.headerTitle} numberOfLines={1}>{moduleData.title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Video/Content Placeholder */}
                <Surface style={styles.mediaContainer} elevation={2}>
                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.mediaPlaceholder}
                    >
                        <MaterialCommunityIcons name="play-circle" size={64} color="#fff" />
                        <Text style={styles.mediaText}>Watch Video Lesson</Text>
                    </LinearGradient>
                </Surface>

                {/* Module Info */}
                <View style={styles.infoSection}>
                    <View style={[styles.tag, { backgroundColor: phaseData.color + '20' }]}>
                        <Text style={[styles.tagText, { color: phaseData.color }]}>{moduleData.type}</Text>
                    </View>
                    <Text style={styles.title}>{moduleData.title}</Text>
                    <Text style={styles.description}>{moduleData.description}</Text>

                    <View style={styles.metaRow}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#64748b" />
                        <Text style={styles.metaText}>{moduleData.duration}</Text>
                    </View>
                </View>

                {/* Task Submission */}
                <View style={styles.submissionSection}>
                    <Text style={styles.sectionTitle}>
                        {moduleData.type === 'Quiz' ? 'Final Assessment' : 'Task Submission'}
                    </Text>
                    <Text style={styles.submissionHelper}>
                        {moduleData.type === 'Quiz'
                            ? 'Click the button below to start the final assessment quiz.'
                            : 'Complete the task described above and submit your proof (photo/video) along with a brief description.'}
                    </Text>

                    {moduleData.type !== 'Quiz' && (
                        <>
                            <Surface style={styles.inputSurface} elevation={1}>
                                <NativeTextInput
                                    style={styles.textInput}
                                    placeholder="Describe your task completion..."
                                    multiline
                                    numberOfLines={4}
                                    value={submissionText}
                                    onChangeText={setSubmissionText}
                                    textAlignVertical="top"
                                />
                            </Surface>

                            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                                <MaterialCommunityIcons name={uploadedFile ? "check-circle" : "cloud-upload"} size={24} color={uploadedFile ? SP_RED : "#64748b"} />
                                <Text style={[styles.uploadText, uploadedFile && { color: SP_RED }]}>
                                    {uploadedFile ? 'File Selected: ' + uploadedFile : 'Upload Photo/Video'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
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
                                <>
                                    <Text style={styles.submitText}>{moduleData.type === 'Quiz' ? 'Start Quiz' : 'Submit Task'}</Text>
                                    <MaterialCommunityIcons name={moduleData.type === 'Quiz' ? "play-circle" : "check"} size={20} color="#fff" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    mediaContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        aspectRatio: 16 / 9,
    },
    mediaPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    mediaText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    infoSection: {
        marginBottom: 32,
    },
    tag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        lineHeight: 24,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#64748b',
        fontWeight: '600',
    },
    submissionSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    submissionHelper: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    inputSurface: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textInput: {
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
        minHeight: 100,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        marginBottom: 24,
        gap: 8,
    },
    uploadText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
