import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Title, ProgressBar, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TRAINING_PHASES } from '@/constants/trainingData';

export default function PhaseDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const phase = TRAINING_PHASES.find(p => p.id === id);

    if (!phase) {
        return (
            <View style={styles.container}>
                <Text>Phase not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={[phase.color, '#000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    >
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name={phase.icon as any} size={40} color={phase.color} />
                        </View>
                        <Text style={styles.phaseTitle}>{phase.title}</Text>
                        <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
                    </LinearGradient>
                </View>

                <View style={styles.content}>
                    {/* Overview */}
                    <Card style={styles.overviewCard}>
                        <Card.Content>
                            <Title style={styles.sectionTitle}>Overview</Title>
                            <Text style={styles.description}>{phase.description}</Text>
                        </Card.Content>
                    </Card>

                    {/* Modules List */}
                    <Text style={styles.modulesHeader}>Modules</Text>
                    <View style={styles.modulesList}>
                        {phase.modules.map((module, index) => (
                            <TouchableOpacity
                                key={module.id}
                                style={styles.moduleCard}
                                onPress={() => router.push(`/training/module/${module.id}` as any)}
                            >
                                <View style={[styles.moduleIcon, { backgroundColor: phase.color + '20' }]}>
                                    <Text style={[styles.moduleIndex, { color: phase.color }]}>{index + 1}</Text>
                                </View>
                                <View style={styles.moduleInfo}>
                                    <Text style={styles.moduleTitle}>{module.title}</Text>
                                    <View style={styles.moduleMeta}>
                                        <MaterialCommunityIcons name="clock-outline" size={14} color="#64748b" />
                                        <Text style={styles.metaText}>{module.duration}</Text>
                                        <View style={styles.dot} />
                                        <Text style={styles.metaText}>{module.type}</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                            </TouchableOpacity>
                        ))}
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
    headerContainer: {
        height: 240,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    headerGradient: {
        flex: 1,
        padding: 24,
        paddingTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    phaseTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
        textAlign: 'center',
    },
    phaseSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    content: {
        padding: 24,
        marginTop: -40,
    },
    overviewCard: {
        borderRadius: 16,
        marginBottom: 24,
        elevation: 4,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        color: '#1e293b',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#64748b',
    },
    modulesHeader: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    modulesList: {
        gap: 12,
    },
    moduleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    moduleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    moduleIndex: {
        fontSize: 16,
        fontWeight: '800',
    },
    moduleInfo: {
        flex: 1,
    },
    moduleTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    moduleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#64748b',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
    },
});
