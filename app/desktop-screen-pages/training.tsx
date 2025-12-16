import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';
import { LinearGradient } from 'expo-linear-gradient';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

// Phase gradients with unique colors
const PHASE_GRADIENTS = [
    { colors: ['#E30512', '#b91c1c'] as const, icon: 'numeric-1-circle' },
    { colors: ['#009933', '#15803d'] as const, icon: 'numeric-2-circle' },
    { colors: ['#FFD700', '#F59E0B'] as const, icon: 'numeric-3-circle' },
    { colors: ['#3b82f6', '#1e40af'] as const, icon: 'numeric-4-circle' },
];

export default function DesktopTraining() {
    const router = useRouter();
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTrainingModules();
    }, []);

    const fetchTrainingModules = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/training`);
            const data = await res.json();
            if (data.modules && Array.isArray(data.modules)) {
                setModules(data.modules);
            } else if (Array.isArray(data)) {
                setModules(data);
            }
        } catch (error) {
            console.error('Error fetching training modules:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group modules by phase
    const groupedModules = modules.reduce((acc: any, module) => {
        const phase = module.phase || 'Other';
        if (!acc[phase]) {
            acc[phase] = [];
        }
        acc[phase].push(module);
        return acc;
    }, {});

    // Always show 4 default phases, even if no modules
    const DEFAULT_PHASES = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];

    // Ensure all default phases exist
    DEFAULT_PHASES.forEach(phase => {
        if (!groupedModules[phase]) {
            groupedModules[phase] = [];
        }
    });

    // Get phases sorted (default phases first, then others)
    const phases = Object.keys(groupedModules).sort((a, b) => {
        const phaseNumberA = a.match(/\d+/)?.[0];
        const phaseNumberB = b.match(/\d+/)?.[0];

        if (phaseNumberA && phaseNumberB) {
            return parseInt(phaseNumberA) - parseInt(phaseNumberB);
        }
        if (phaseNumberA) return -1;
        if (phaseNumberB) return 1;
        return a.localeCompare(b);
    });

    const handlePhasePress = (phase: string, index: number) => {
        const moduleCount = groupedModules[phase]?.length || 0;
        router.push({
            pathname: '/desktop-screen-pages/training-phase',
            params: {
                phase: phase,
                moduleCount: moduleCount,
                gradientIndex: index % PHASE_GRADIENTS.length
            }
        } as any);
    };

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.pageHeader}>
                    <View style={styles.headerContent}>
                        <View style={styles.badge}>
                            <MaterialCommunityIcons name="school" size={18} color={SP_RED} />
                            <Text style={styles.badgeText}>Training Center</Text>
                        </View>
                        <Text style={styles.headerTitle}>Learn & Lead</Text>
                        <Text style={styles.headerSubtitle}>Build skills to become effective leaders and changemakers</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {loading ? (
                        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={SP_RED} />
                            <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>Loading training modules...</Text>
                        </View>
                    ) : phases.length === 0 ? (
                        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                            <MaterialCommunityIcons name="school-outline" size={64} color="#cbd5e1" />
                            <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: '#64748b' }}>
                                No training phases available
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.sectionTitle}>Training Phases</Text>
                            <Text style={styles.sectionSubtitle}>
                                Select a phase to view available modules and start your learning journey
                            </Text>

                            <View style={styles.phasesGrid}>
                                {phases.map((phase, index) => {
                                    const gradient = PHASE_GRADIENTS[index % PHASE_GRADIENTS.length];
                                    const phaseNumber = phase.match(/\d+/)?.[0] || (index + 1);
                                    const moduleCount = groupedModules[phase]?.length || 0;

                                    return (
                                        <Pressable
                                            key={phase}
                                            onPress={() => handlePhasePress(phase, index)}
                                        >
                                            <LinearGradient
                                                colors={gradient.colors}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.phaseCard}
                                            >
                                                <View style={styles.phaseCardHeader}>
                                                    <View style={styles.phaseIconContainer}>
                                                        <MaterialCommunityIcons
                                                            name={gradient.icon as any}
                                                            size={48}
                                                            color="rgba(255,255,255,0.9)"
                                                        />
                                                    </View>
                                                    <View style={styles.phaseArrow}>
                                                        <MaterialCommunityIcons
                                                            name="arrow-right"
                                                            size={24}
                                                            color="rgba(255,255,255,0.8)"
                                                        />
                                                    </View>
                                                </View>

                                                <View style={styles.phaseCardContent}>
                                                    <Text style={styles.phaseCardTitle}>{phase}</Text>
                                                    <Text style={styles.phaseCardSubtitle}>
                                                        {moduleCount} {moduleCount === 1 ? 'Module' : 'Modules'}
                                                    </Text>
                                                </View>

                                                <View style={styles.phaseCardFooter}>
                                                    <View style={styles.moduleIndicators}>
                                                        {Array.from({ length: Math.min(moduleCount, 5) }).map((_, i) => (
                                                            <View key={i} style={styles.moduleIndicator} />
                                                        ))}
                                                        {moduleCount > 5 && (
                                                            <Text style={styles.moreModules}>+{moduleCount - 5}</Text>
                                                        )}
                                                    </View>
                                                </View>

                                                {/* Decorative Pattern */}
                                                <View style={styles.decorativePattern}>
                                                    <MaterialCommunityIcons
                                                        name="school"
                                                        size={120}
                                                        color="rgba(255,255,255,0.1)"
                                                    />
                                                </View>
                                            </LinearGradient>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </>
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
        backgroundColor: '#fef2f2',
        paddingVertical: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#fecaca',
    },
    headerContent: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    badgeText: {
        fontSize: 14,
        color: SP_RED,
        fontWeight: '600'
    },
    headerTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12
    },
    headerSubtitle: {
        fontSize: 18,
        color: '#64748b',
        maxWidth: 600,
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',

        paddingTop: 40,
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 40,
    },
    phasesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        width: '100%',
    },
    phaseCard: {
        width: '31%',
        minWidth: 280,
        height: 280,
        borderRadius: 20,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    phaseCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'auto',
    },
    phaseIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    phaseArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    phaseCardContent: {
        marginTop: 24,
    },
    phaseCardTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
    },
    phaseCardSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    phaseCardFooter: {
        marginTop: 24,
    },
    moduleIndicators: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    moduleIndicator: {
        width: 32,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    moreModules: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        marginLeft: 4,
    },
    decorativePattern: {
        position: 'absolute',
        bottom: -30,
        right: -30,
        opacity: 1,
    },
});
