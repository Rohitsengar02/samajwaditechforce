import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RESOURCES, RESOURCE_CATEGORIES } from '@/constants/resourceData';

const SP_RED = '#E30512';

export default function ResourceDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Find resource and its category
    let resource: any = null;
    let categoryColor = SP_RED;

    Object.keys(RESOURCES).forEach(catKey => {
        const found = RESOURCES[catKey].find(r => r.id === id);
        if (found) {
            resource = found;
            const catInfo = RESOURCE_CATEGORIES.find(c => c.id === catKey);
            if (catInfo) categoryColor = catInfo.color;
        }
    });

    if (!resource) {
        return (
            <View style={styles.container}>
                <Text>Resource not found</Text>
            </View>
        );
    }

    const handleAction = () => {
        if (resource.type === 'Video') {
            Alert.alert('Play Video', 'Video player would open here.');
        } else {
            Alert.alert('Download', `Downloading ${resource.title}...`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{resource.type}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Preview Section */}
                <Surface style={styles.previewContainer} elevation={4}>
                    {resource.type === 'Video' ? (
                        <View style={styles.videoPlaceholder}>
                            <Image source={{ uri: resource.thumbnail }} style={styles.previewImage} />
                            <View style={styles.playOverlay}>
                                <MaterialCommunityIcons name="play-circle" size={64} color="#fff" />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Image source={{ uri: resource.thumbnail }} style={styles.previewImage} />
                        </View>
                    )}
                </Surface>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={[styles.tag, { backgroundColor: categoryColor + '20' }]}>
                        <Text style={[styles.tagText, { color: categoryColor }]}>{resource.type}</Text>
                    </View>

                    <Text style={styles.title}>{resource.title}</Text>

                    <View style={styles.metaRow}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color="#64748b" />
                        <Text style={styles.metaText}>{resource.duration || resource.format}</Text>
                    </View>

                    <Text style={styles.description}>
                        This is a detailed description of the resource. It provides context, learning objectives, or usage instructions for the {resource.type.toLowerCase()}.
                    </Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleAction}
                >
                    <LinearGradient
                        colors={[categoryColor, '#000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.actionGradient}
                    >
                        <MaterialCommunityIcons
                            name={resource.type === 'Video' ? 'play' : 'download'}
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.actionText}>
                            {resource.type === 'Video' ? 'Watch Now' : 'Download Resource'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
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
    previewContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
    },
    videoPlaceholder: {
        flex: 1,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePlaceholder: {
        flex: 1,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    playOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
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
        marginBottom: 12,
        lineHeight: 32,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    metaText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 26,
    },
    actionButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    actionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
