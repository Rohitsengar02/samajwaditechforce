import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RESOURCE_CATEGORIES } from '@/constants/resourceData';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResourceLibraryScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Header */}
                    <LinearGradient
                        colors={[SP_RED, '#b91c1c']}
                        style={styles.header}
                    >
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Resource Library</Text>
                            <View style={{ width: 40 }} />
                        </View>
                        <Text style={styles.headerSubtitle}>
                            Everything you need to succeed in your digital campaign.
                        </Text>

                        {/* Search Bar Placeholder */}
                        <Surface style={styles.searchBar} elevation={2}>
                            <MaterialCommunityIcons name="magnify" size={24} color="#94a3b8" />
                            <Text style={styles.searchText}>Search resources...</Text>
                        </Surface>
                    </LinearGradient>

                    {/* Categories Grid */}
                    <View style={styles.gridContainer}>
                        {RESOURCE_CATEGORIES.map((category, index) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryCard}
                                onPress={() => router.push(`/resources/${category.id}` as any)}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={[category.color, category.color + 'DD']}
                                    style={styles.cardGradient}
                                >
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name={category.icon as any} size={32} color={category.color} />
                                    </View>
                                    <Text style={styles.cardTitle}>{category.title}</Text>
                                    <Text style={styles.cardDescription} numberOfLines={2}>
                                        {category.description}
                                    </Text>
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.exploreText}>Explore</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 40,
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
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 24,
        lineHeight: 22,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
    },
    searchText: {
        color: '#94a3b8',
        fontSize: 15,
    },
    gridContainer: {
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    categoryCard: {
        width: (width - 56) / 2,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        height: 180,
    },
    cardGradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
        lineHeight: 20,
    },
    cardDescription: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    exploreText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
});
