import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiUrl } from '../../utils/api';
import DesktopHeader from '../../components/DesktopHeader';
import Footer from '../../components/Footer';

const { width } = Dimensions.get('window');

const GRADIENTS = [
    ['#ff9a9e', '#fad0c4'], // Soft Pink
    ['#a18cd1', '#fbc2eb'], // Purple to Pink
    ['#84fab0', '#8fd3f4'], // Mint to Blue
    ['#e0c3fc', '#8ec5fc'], // Lavender
    ['#fccb90', '#d57eeb'], // Orange to Purple
    ['#e2ebf0', '#cfd9df'], // Silver
    ['#43e97b', '#38f9d7'], // Green Teal
    ['#fa709a', '#fee140'], // Pink Yellow
];

export default function PagesDirectory() {
    const router = useRouter();
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/pages`);
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setPages(data.data);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ title: 'All Pages' }} />
                <ActivityIndicator size="large" color="#E30512" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: false,
                title: 'All Pages'
            }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <DesktopHeader />

                <View style={styles.contentWrapper}>
                    <View style={styles.headerSection}>
                        <Text style={styles.mainTitle}>Explore Pages</Text>
                        <Text style={styles.subTitle}>Discover campaigns, initiatives, and updates.</Text>
                    </View>

                    {pages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="file-document-outline" size={64} color="#e5e7eb" />
                            <Text style={styles.emptyText}>No pages found</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {pages.map((page, index) => {
                                const gradientColors = GRADIENTS[index % GRADIENTS.length];
                                return (
                                    <Pressable
                                        key={page._id}
                                        style={({ pressed }) => [
                                            styles.card,
                                            pressed && styles.cardPressed
                                        ]}
                                        onPress={() => router.push(`/pages/${page._id}`)}
                                    >
                                        <View style={styles.imageContainer}>
                                            <LinearGradient
                                                colors={gradientColors as any}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.cardGradient}
                                            />
                                            <View style={styles.cardIconBadge}>
                                                <MaterialCommunityIcons name="web" size={24} color="#E30512" />
                                            </View>
                                        </View>

                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle} numberOfLines={2}>{page.title}</Text>
                                            <View style={styles.cardMeta}>
                                                <MaterialCommunityIcons name="link-variant" size={14} color="#94a3b8" />
                                                <Text style={styles.cardSlug} numberOfLines={1}>
                                                    {page.slug || 'Custom Page'}
                                                </Text>
                                            </View>

                                            <View style={styles.cardFooter}>
                                                <Text style={styles.viewLink}>View Page</Text>
                                                <MaterialCommunityIcons name="arrow-right" size={16} color="#E30512" />
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>

                <Footer />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentWrapper: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
        minHeight: 500,
    },
    headerSection: {
        marginBottom: 40,
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: 42,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        justifyContent: 'center',
    },
    card: {
        width: 340,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexGrow: 1,
        maxWidth: 380,
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    imageContainer: {
        height: 200,
        position: 'relative',
        backgroundColor: '#f8fafc',
    },
    cardGradient: {
        width: '100%',
        height: '100%',
    },
    cardIconBadge: {
        position: 'absolute',
        bottom: -24,
        right: 24,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardContent: {
        padding: 24,
        paddingTop: 32,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 28,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    cardSlug: {
        fontSize: 14,
        color: '#94a3b8',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 'auto',
    },
    viewLink: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E30512',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#9ca3af',
        marginTop: 16,
    },
});
