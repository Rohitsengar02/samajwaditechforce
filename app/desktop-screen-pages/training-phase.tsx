import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getApiUrl } from '../../utils/api';
import { LinearGradient } from 'expo-linear-gradient';

const SP_RED = '#E30512';

import DesktopHeader from '../../components/DesktopHeader';

const PHASE_GRADIENTS = [
    { colors: ['#E30512', '#b91c1c'] as const },
    { colors: ['#009933', '#15803d'] as const },
    { colors: ['#FFD700', '#F59E0B'] as const },
    { colors: ['#3b82f6', '#1e40af'] as const },
];

export default function TrainingPhase() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const gradientIndex = parseInt(params.gradientIndex as string) || 0;
    const gradient = PHASE_GRADIENTS[gradientIndex];

    useEffect(() => {
        fetchPhaseModules();
    }, []);

    const fetchPhaseModules = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/training`);
            const data = await res.json();
            let allModules = [];

            if (data.modules && Array.isArray(data.modules)) {
                allModules = data.modules;
            } else if (Array.isArray(data)) {
                allModules = data;
            }

            // Filter modules by phase
            const phaseModules = allModules.filter(
                (module: any) => module.phase === params.phase
            );
            setModules(phaseModules);
        } catch (error) {
            console.error('Error fetching phase modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModulePress = (module: any) => {
        router.push({
            pathname: '/desktop-screen-pages/training-detail',
            params: {
                id: module._id,
                title: module.title,
                description: module.description || '',
                phase: module.phase,
                type: module.type,
                contentUrl: module.contentUrl || '',
                thumbnail: module.thumbnail || '',
                duration: module.duration || ''
            }
        } as any);
    };

    const filteredModules = modules.filter(module =>
        module.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Hero Section with Gradient */}
                <LinearGradient
                    colors={gradient.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pageHeader}
                >
                    <View style={styles.headerContent}>
                        <Pressable
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={20} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.backButtonText}>Back to Phases</Text>
                        </Pressable>

                        <Text style={styles.headerTitle}>{params.phase}</Text>
                        <Text style={styles.headerSubtitle}>
                            {params.moduleCount} {params.moduleCount === '1' ? 'Module' : 'Modules'} Available
                        </Text>
                    </View>

                    {/* Decorative Pattern */}
                    <View style={styles.decorativePattern}>
                        <MaterialCommunityIcons
                            name="school"
                            size={200}
                            color="rgba(255,255,255,0.1)"
                        />
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    <View style={styles.controls}>
                        <Searchbar
                            placeholder="Search modules..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={styles.searchBar}
                        />
                    </View>

                    {loading ? (
                        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={SP_RED} />
                            <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>Loading modules...</Text>
                        </View>
                    ) : filteredModules.length === 0 ? (
                        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                            <MaterialCommunityIcons name="school-outline" size={64} color="#cbd5e1" />
                            <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: '#64748b' }}>
                                No modules found
                            </Text>
                            <Text style={{ marginTop: 8, fontSize: 14, color: '#94a3b8' }}>
                                {searchQuery ? 'Try adjusting your search' : 'No modules available for this phase yet'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {filteredModules.map((module, index) => (
                                <Pressable
                                    key={module._id || index}
                                    style={styles.card}
                                    onPress={() => handleModulePress(module)}
                                >
                                    <View style={styles.cardImageContainer}>
                                        {module.thumbnail ? (
                                            <Image source={{ uri: module.thumbnail }} style={styles.cardImage} resizeMode="cover" />
                                        ) : (
                                            <View style={[styles.cardImage, styles.placeholderImage]}>
                                                <MaterialCommunityIcons
                                                    name={module.type === 'video' ? 'play-circle' : 'file-document'}
                                                    size={48}
                                                    color={gradient.colors[0]}
                                                />
                                            </View>
                                        )}
                                        <View style={[styles.typeBadge, { backgroundColor: gradient.colors[0] }]}>
                                            <MaterialCommunityIcons
                                                name={module.type === 'video' ? 'video' : 'file-pdf-box'}
                                                size={14}
                                                color="#fff"
                                            />
                                            <Text style={styles.typeText}>
                                                {module.type === 'video' ? 'Video' : 'Document'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle} numberOfLines={2}>{module.title}</Text>

                                        {module.description && (
                                            <Text style={styles.cardDescription} numberOfLines={2}>
                                                {module.description}
                                            </Text>
                                        )}

                                        <View style={styles.cardFooter}>
                                            {module.duration && (
                                                <View style={styles.durationInfo}>
                                                    <MaterialCommunityIcons name="clock-outline" size={16} color="#64748b" />
                                                    <Text style={styles.durationText}>{module.duration}</Text>
                                                </View>
                                            )}

                                            <Pressable
                                                style={[styles.startBtn, { backgroundColor: gradient.colors[0] }]}
                                                onPress={() => handleModulePress(module)}
                                            >
                                                <Text style={styles.startBtnText}>
                                                    {module.type === 'video' ? 'Watch' : 'Read'}
                                                </Text>
                                                <MaterialCommunityIcons name="chevron-right" size={16} color="#fff" />
                                            </Pressable>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    pageHeader: {
        paddingVertical: 80,
        position: 'relative',
        overflow: 'hidden',
    },
    headerContent: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
        zIndex: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    headerTitle: {
        fontSize: 56,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    headerSubtitle: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
    },
    decorativePattern: {
        position: 'absolute',
        bottom: -50,
        right: -50,
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    controls: {
        marginBottom: 32,
    },
    searchBar: {
        backgroundColor: '#fff',
        elevation: 0,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    card: {
        width: '31%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardImageContainer: {
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    placeholderImage: {
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'uppercase',
    },
    cardContent: {
        padding: 20
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 24
    },
    cardDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    durationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    durationText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    startBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    startBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },
});
