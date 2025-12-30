import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    Pressable,
    Dimensions,
    TextInput,
    Animated,
    Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiUrl } from '../../utils/api';
import { TranslatedText } from '../../components/TranslatedText';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

const PageCard = ({ page, index, onPress }: { page: any, index: number, onPress: () => void }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                tension: 50,
                friction: 7,
                delay: index * 100,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View style={[
            styles.cardContainer,
            {
                opacity: fadeAnim,
                transform: [{ translateY }]
            }
        ]}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed
                ]}
            >
                <View style={styles.cardVisual}>
                    <LinearGradient
                        colors={[SP_RED + '10', SP_RED + '05']}
                        style={styles.cardGradient}
                    />
                    <View style={styles.cardIconWrapper}>
                        <MaterialCommunityIcons name="web" size={32} color={SP_RED} />
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        <TranslatedText>{page.title}</TranslatedText>
                    </Text>
                    <View style={styles.cardMeta}>
                        <MaterialCommunityIcons name="link-variant" size={14} color="#64748b" />
                        <Text style={styles.cardSlug} numberOfLines={1}>
                            {page.slug || 'Custom Page'}
                        </Text>
                    </View>

                    <View style={styles.cardFooter}>
                        <Text style={styles.viewText}>
                            <TranslatedText>Open Page</TranslatedText>
                        </Text>
                        <View style={styles.arrowIcon}>
                            <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
                        </View>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
};

export default function PagesDirectory() {
    const router = useRouter();
    const [pages, setPages] = useState<any[]>([]);
    const [filteredPages, setFilteredPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredPages(pages.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.slug && p.slug.toLowerCase().includes(searchQuery.toLowerCase()))
            ));
        } else {
            setFilteredPages(pages);
        }
    }, [searchQuery, pages]);

    const fetchPages = async () => {
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/pages`);
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setPages(data.data);
                setFilteredPages(data.data);
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
                <Stack.Screen options={{ title: 'Directories' }} />
                <ActivityIndicator size="large" color={SP_RED} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: false,
                title: 'Directories'
            }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Modern Hero Header */}
                <LinearGradient
                    colors={[SP_RED, '#b91c1c', SP_DARK]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </Pressable>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {pages.length} <TranslatedText>PAGES AVAILABLE</TranslatedText>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerMain}>
                        <Text style={styles.headerTitle}>
                            <TranslatedText>Digital Directory</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>Explore campaigns, initiatives, and the digital movement of Samajwadi Party.</TranslatedText>
                        </Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <MaterialCommunityIcons name="magnify" size={24} color="#94a3b8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search pages..."
                                placeholderTextColor="#94a3b8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery !== '' && (
                                <Pressable onPress={() => setSearchQuery('')}>
                                    <MaterialCommunityIcons name="close-circle" size={20} color="#94a3b8" />
                                </Pressable>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.gridSection}>
                    {filteredPages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="file-search-outline" size={80} color="#e5e7eb" />
                            <Text style={styles.emptyText}>
                                <TranslatedText>No matching pages found</TranslatedText>
                            </Text>
                            <Pressable
                                style={styles.clearButton}
                                onPress={() => setSearchQuery('')}
                            >
                                <Text style={styles.clearButtonText}>
                                    <TranslatedText>Clear Search</TranslatedText>
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {filteredPages.map((page, index) => (
                                <PageCard
                                    key={page._id}
                                    page={page}
                                    index={index}
                                    onPress={() => router.push(`/pages/${page._id}`)}
                                />
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
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 60,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    headerMain: {
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 24,
        maxWidth: '90%',
    },
    searchContainer: {
        position: 'absolute',
        bottom: 5,
        left: 24,
        right: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    gridSection: {
        marginTop: 60,
        paddingHorizontal: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: width > 768 ? '31%' : width > 480 ? '48%' : '100%',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
    },
    cardVisual: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    cardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    cardIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    cardContent: {
        padding: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
        height: 50,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    cardSlug: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    viewText: {
        fontSize: 14,
        fontWeight: '700',
        color: SP_RED,
    },
    arrowIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: SP_RED,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#94a3b8',
        marginTop: 16,
        fontWeight: '600',
    },
    clearButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    clearButtonText: {
        color: '#475569',
        fontWeight: '700',
    },
});

