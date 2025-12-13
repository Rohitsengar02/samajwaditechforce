import React from 'react';
import { View, ScrollView, StyleSheet, Image, Pressable, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

export default function TrainingDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const handleOpenContent = () => {
        if (params.contentUrl && typeof params.contentUrl === 'string') {
            Linking.openURL(params.contentUrl);
        }
    };

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.heroContent}>
                        <Pressable
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={20} color="#64748b" />
                            <Text style={styles.backButtonText}>Back to Training</Text>
                        </Pressable>

                        <View style={styles.phaseBadge}>
                            <Text style={styles.phaseText}>{params.phase || 'Training Module'}</Text>
                        </View>

                        <Text style={styles.heroTitle}>{params.title}</Text>

                        {params.description && (
                            <Text style={styles.heroDescription}>{params.description}</Text>
                        )}

                        <View style={styles.metaInfo}>
                            {params.duration && (
                                <View style={styles.metaItem}>
                                    <MaterialCommunityIcons name="clock-outline" size={20} color="#64748b" />
                                    <Text style={styles.metaText}>{params.duration}</Text>
                                </View>
                            )}
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name={params.type === 'video' ? 'video' : 'file-pdf-box'}
                                    size={20}
                                    color="#64748b"
                                />
                                <Text style={styles.metaText}>
                                    {params.type === 'video' ? 'Video Content' : 'Document'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    <View style={styles.contentCard}>
                        {params.thumbnail && typeof params.thumbnail === 'string' && (
                            <Image
                                source={{ uri: params.thumbnail }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                            />
                        )}

                        {params.contentUrl && typeof params.contentUrl === 'string' ? (
                            <Pressable style={styles.openButton} onPress={handleOpenContent}>
                                <MaterialCommunityIcons
                                    name={params.type === 'video' ? 'play-circle' : 'file-download'}
                                    size={24}
                                    color="#fff"
                                />
                                <Text style={styles.openButtonText}>
                                    {params.type === 'video' ? 'Watch Video' : 'Open Document'}
                                </Text>
                            </Pressable>
                        ) : (
                            <View style={styles.noContentCard}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#cbd5e1" />
                                <Text style={styles.noContentText}>Content not available</Text>
                                <Text style={styles.noContentSubtext}>
                                    This module content is being prepared
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Additional Info */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoCard}>
                            <View style={styles.infoIcon}>
                                <MaterialCommunityIcons name="school" size={24} color={SP_RED} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>Learning Path</Text>
                                <Text style={styles.infoText}>
                                    This module is part of {params.phase || 'the training program'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={styles.infoIcon}>
                                <MaterialCommunityIcons name="certificate" size={24} color={SP_GREEN} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>Completion</Text>
                                <Text style={styles.infoText}>
                                    Complete all modules to earn your certification
                                </Text>
                            </View>
                        </View>
                    </View>
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
    hero: {
        backgroundColor: '#fff',
        paddingVertical: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    heroContent: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    phaseBadge: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    phaseText: {
        fontSize: 14,
        fontWeight: '600',
        color: SP_RED,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 16,
        lineHeight: 50,
    },
    heroDescription: {
        fontSize: 18,
        color: '#64748b',
        lineHeight: 28,
        marginBottom: 32,
        maxWidth: 800,
    },
    metaInfo: {
        flexDirection: 'row',
        gap: 32,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
        marginBottom: 40,
    },
    thumbnail: {
        width: '100%',
        height: 500,
    },
    openButton: {
        backgroundColor: SP_RED,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 20,
        paddingHorizontal: 32,
    },
    openButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    noContentCard: {
        paddingVertical: 80,
        alignItems: 'center',
    },
    noContentText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 16,
    },
    noContentSubtext: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
    },
    infoSection: {
        gap: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        gap: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 15,
        color: '#64748b',
        lineHeight: 22,
    },
});
