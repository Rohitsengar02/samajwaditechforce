import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RESOURCE_CATEGORIES, RESOURCES } from '@/constants/resourceData';

const SP_RED = '#E30512';

export default function ResourceListScreen() {
    const { category } = useLocalSearchParams();
    const router = useRouter();

    const categoryInfo = RESOURCE_CATEGORIES.find(c => c.id === category);
    const resources = RESOURCES[category as string] || [];

    if (!categoryInfo) {
        return (
            <View style={styles.container}>
                <Text>Category not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[categoryInfo.color, '#000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{categoryInfo.title}</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.headerIcon}>
                    <MaterialCommunityIcons name={categoryInfo.icon as any} size={40} color="#fff" />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {resources.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="folder-open-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No resources found in this category.</Text>
                    </View>
                ) : (
                    resources.map((resource, index) => (
                        <TouchableOpacity
                            key={resource.id}
                            style={styles.resourceCard}
                            onPress={() => router.push(`/resources/detail/${resource.id}` as any)}
                            activeOpacity={0.9}
                        >
                            <Image source={{ uri: resource.thumbnail }} style={styles.thumbnail} />
                            <View style={styles.cardContent}>
                                <View style={styles.typeBadge}>
                                    <MaterialCommunityIcons
                                        name={
                                            resource.type === 'Video' ? 'play-circle' :
                                                resource.type === 'Document' ? 'file-document' :
                                                    resource.type === 'Template' ? 'image-edit' : 'file'
                                        }
                                        size={14}
                                        color={categoryInfo.color}
                                    />
                                    <Text style={[styles.typeText, { color: categoryInfo.color }]}>{resource.type}</Text>
                                </View>
                                <Text style={styles.resourceTitle} numberOfLines={2}>{resource.title}</Text>
                                <View style={styles.metaRow}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
                                    <Text style={styles.metaText}>{resource.duration || resource.format}</Text>
                                </View>
                            </View>
                            <View style={styles.actionButton}>
                                <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                            </View>
                        </TouchableOpacity>
                    ))
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
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    headerIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        opacity: 0.9,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 16,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
    resourceCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        height: 100,
    },
    thumbnail: {
        width: 100,
        height: '100%',
        backgroundColor: '#e2e8f0',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
        backgroundColor: '#f8fafc',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    resourceTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    actionButton: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#f1f5f9',
    },
});
