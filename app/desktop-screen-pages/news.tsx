import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, Pressable, ActivityIndicator } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

export default function DesktopNews() {
    const router = useRouter();
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/news`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setNews(data.data);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', 'politics', 'development', 'announcements', 'government'];

    const filteredNews = selectedCategory === 'all'
        ? news
        : news.filter(item => item.category?.toLowerCase() === selectedCategory);

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Top 3 Featured News in a Row */}
                {!loading && news.length > 0 && (
                    <View style={styles.topFeaturedSection}>
                        <View style={styles.topFeaturedRow}>
                            {news.slice(0, 3).map((item, index) => (
                                <Pressable
                                    key={item._id || index}
                                    style={styles.topFeaturedCard}
                                    onPress={() => router.push(`/news/${item._id}` as any)}
                                >
                                    <Image
                                        source={{ uri: item.coverImage || 'https://via.placeholder.com/400x300' }}
                                        style={styles.topFeaturedImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.topFeaturedContent}>
                                        <View style={styles.topFeaturedMeta}>
                                            <View style={styles.categoryBadge}>
                                                <Text style={styles.categoryText}>{item.category || 'NEWS'}</Text>
                                            </View>
                                            <View style={styles.dateBadge}>
                                                <MaterialCommunityIcons name="clock-outline" size={12} color="#64748b" />
                                                <Text style={styles.dateTextSmall}>
                                                    {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.topFeaturedTitle} numberOfLines={2}>{item.title}</Text>
                                        <Text style={styles.topFeaturedDescription} numberOfLines={2}>
                                            {item.description || 'Read more about this important update...'}
                                        </Text>
                                        <View style={styles.topFeaturedFooter}>
                                            <View style={styles.authorInfoSmall}>
                                                <View style={styles.avatarSmall}>
                                                    <MaterialCommunityIcons name="account" size={14} color={SP_RED} />
                                                </View>
                                                <Text style={styles.authorNameSmall}>Akhilesh Y.</Text>
                                            </View>
                                            <View style={styles.readTime}>
                                                <MaterialCommunityIcons name="book-open-outline" size={12} color="#64748b" />
                                                <Text style={styles.readTimeText}>3 min</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Category Filter */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Recently Added</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        {categories.map((cat) => (
                            <Pressable
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === cat && styles.categoryChipActive
                                ]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    selectedCategory === cat && styles.categoryChipTextActive
                                ]}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* News Grid */}
                {loading ? (
                    <ActivityIndicator size="large" color={SP_RED} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.newsGrid}>
                        {filteredNews.slice(3).map((item, index) => (
                            <Pressable
                                key={item._id || index}
                                style={styles.newsCard}
                                onPress={() => router.push(`/news/${item._id}` as any)}
                            >
                                <Image
                                    source={{ uri: item.coverImage || 'https://via.placeholder.com/350x230' }}
                                    style={styles.newsImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.newsContent}>
                                    <View style={styles.newsMeta}>
                                        <View style={styles.categoryBadgeSmall}>
                                            <Text style={styles.categoryTextSmall}>
                                                {item.category || 'BUSINESS'}
                                            </Text>
                                        </View>
                                        <Text style={styles.newsDate}>
                                            {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </Text>
                                    </View>
                                    <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                                    <Text style={styles.newsExcerpt} numberOfLines={3}>
                                        {item.description || 'Click to read the full article and stay updated with latest developments...'}
                                    </Text>
                                    <View style={styles.newsFooter}>
                                        <View style={styles.authorInfoSmall}>
                                            <View style={styles.avatarSmall}>
                                                <MaterialCommunityIcons name="account" size={16} color={SP_RED} />
                                            </View>
                                            <Text style={styles.authorNameSmall}>Akhilesh Y.</Text>
                                        </View>
                                        <View style={styles.readTime}>
                                            <MaterialCommunityIcons name="book-open-outline" size={14} color="#64748b" />
                                            <Text style={styles.readTimeText}>3 min</Text>
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Load More Button */}
                {!loading && filteredNews.length > 9 && (
                    <View style={styles.loadMoreContainer}>
                        <Pressable style={styles.loadMoreBtn}>
                            <Text style={styles.loadMoreText}>Load More Articles</Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color={SP_RED} />
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    topFeaturedSection: {
        paddingHorizontal: 60,
        paddingTop: 40,
        paddingBottom: 20,
    },
    topFeaturedRow: {
        flexDirection: 'row',
        gap: 24,
    },
    topFeaturedCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    topFeaturedImage: {
        width: '100%',
        height: 250,
    },
    topFeaturedContent: {
        padding: 20,
    },
    topFeaturedMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dateTextSmall: {
        fontSize: 11,
        color: '#64748b',
    },
    topFeaturedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 10,
        lineHeight: 24,
    },
    topFeaturedDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    topFeaturedFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
    },
    heroSection: {
        padding: 60,
        gap: 24,
    },
    heroCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    heroImage: {
        width: '100%',
        height: 450,
    },
    heroContent: {
        padding: 32,
    },
    heroMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: SP_RED,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    categoryText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#64748b',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
        lineHeight: 44,
    },
    heroDescription: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
        marginBottom: 20,
    },
    heroFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    readMore: {
        fontSize: 14,
        fontWeight: '600',
        color: SP_RED,
    },
    secondaryFeatured: {
        flexDirection: 'row',
        gap: 24,
    },
    secondaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    secondaryImage: {
        width: '100%',
        height: 220,
    },
    secondaryContent: {
        padding: 20,
    },
    secondaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 12,
        marginBottom: 8,
        lineHeight: 24,
    },
    secondaryMeta: {
        fontSize: 13,
        color: '#64748b',
    },
    filterSection: {
        paddingHorizontal: 60,
        paddingVertical: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
    },
    categoriesScroll: {
        flexGrow: 0,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 8,
        backgroundColor: '#f1f5f9',
    },
    categoryChipActive: {
        backgroundColor: SP_RED,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    newsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 60,
        gap: 24,
    },
    newsCard: {
        width: '31%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    newsImage: {
        width: '100%',
        height: 200,
    },
    newsContent: {
        padding: 20,
    },
    newsMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryBadgeSmall: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    categoryTextSmall: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    newsDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 10,
        lineHeight: 24,
    },
    newsExcerpt: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    newsFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
    },
    authorInfoSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorNameSmall: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    readTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readTimeText: {
        fontSize: 12,
        color: '#64748b',
    },
    loadMoreContainer: {
        padding: 60,
        paddingTop: 20,
        alignItems: 'center',
    },
    loadMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: SP_RED,
    },
    loadMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: SP_RED,
    },
    // Header Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 60,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        zIndex: 100,
        position: 'relative',
    },
    headerLogo: {
        fontSize: 24,
        fontWeight: '900',
        color: SP_RED,
    },
    navMenu: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    navItem: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    langSwitch: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#f1f5f9',
    },
    loginBtn: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    signupBtn: {
        backgroundColor: SP_RED,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    signupBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Mega Menu Styles
    dropdownWrapper: {
        position: 'relative',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    megaMenu: {
        position: 'absolute',
        top: 40,
        left: -200,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        padding: 24,
        zIndex: 10000,
        minWidth: 600,
    },
    megaMenuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    megaMenuItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
    },
    megaMenuIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    megaMenuText: {
        flex: 1,
    },
    megaMenuTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    megaMenuSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
});
