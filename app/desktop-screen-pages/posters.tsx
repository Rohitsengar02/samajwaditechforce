import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, Pressable, ActivityIndicator } from 'react-native';
import { Text, Button, Searchbar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

export default function DesktopPosters() {
    const router = useRouter();
    const [posters, setPosters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Campaign', 'Festival', 'Quotes', 'Events'];

    useEffect(() => {
        fetchPosters();
    }, []);

    const fetchPosters = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/posters`);
            const data = await res.json();
            if (data.posters && Array.isArray(data.posters)) {
                setPosters(data.posters);
            } else if (Array.isArray(data)) {
                setPosters(data);
            }
        } catch (error) {
            console.error('Error fetching posters:', error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedPoster, setSelectedPoster] = useState<any | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePosterPress = (poster: any) => {
        setSelectedPoster(poster);
        setModalVisible(true);
    };

    const handleNormalEdit = () => {
        if (!selectedPoster) return;
        setModalVisible(false);
        router.push({
            pathname: '/desktop-screen-pages/normal-edit',
            params: {
                id: selectedPoster._id,
                imageUrl: selectedPoster.imageUrl,
                title: selectedPoster.title
            }
        } as any);
    };

    const handleDetailedEdit = () => {
        if (!selectedPoster) return;
        setModalVisible(false);
        router.push({
            pathname: '/desktop-screen-pages/poster-editor',
            params: {
                id: selectedPoster._id,
                imageUrl: selectedPoster.imageUrl,
                title: selectedPoster.title
            }
        } as any);
    };

    const filteredPosters = posters.filter(poster =>
        (selectedCategory === 'All' || poster.category === selectedCategory) &&
        (poster.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.pageHeader}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Campaign Posters</Text>
                        <Text style={styles.headerSubtitle}>Download and share high-quality posters</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.controls}>
                        <Searchbar
                            placeholder="Search posters..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={styles.searchBar}
                        />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
                            {categories.map(cat => (
                                <Chip
                                    key={cat}
                                    selected={selectedCategory === cat}
                                    onPress={() => setSelectedCategory(cat)}
                                    style={styles.chip}
                                    selectedColor={SP_RED}
                                >
                                    {cat}
                                </Chip>
                            ))}
                        </ScrollView>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={SP_RED} style={{ marginTop: 50 }} />
                    ) : (
                        <View style={styles.grid}>
                            {filteredPosters.map((poster, index) => (
                                <Pressable key={poster._id || index} style={styles.card} onPress={() => handlePosterPress(poster)}>
                                    <Image source={{ uri: poster.imageUrl }} style={styles.image} />
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>{poster.title}</Text>
                                        <Button mode="contained" buttonColor={SP_RED} compact onPress={() => handlePosterPress(poster)}>Edit</Button>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Selection Modal */}
            {modalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Edit Mode</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </Pressable>
                        </View>
                        <Text style={styles.modalSubtitle}>How would you like to edit this poster?</Text>

                        <View style={styles.modalOptions}>
                            <Pressable style={styles.modalOptionCard} onPress={handleNormalEdit}>
                                <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
                                    <MaterialCommunityIcons name="pencil" size={32} color="#0284c7" />
                                </View>
                                <Text style={styles.optionTitle}>Normal Edit</Text>

                            </Pressable>

                            <Pressable style={styles.modalOptionCard} onPress={handleDetailedEdit}>
                                <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                                    <MaterialCommunityIcons name="palette" size={32} color="#16a34a" />
                                </View>
                                <Text style={styles.optionTitle}>Detailed Edit</Text>

                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 60,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        zIndex: 100,
        position: 'relative'
    },
    headerLogo: { fontSize: 24, fontWeight: '900', color: SP_RED },
    navMenu: { flexDirection: 'row', alignItems: 'center', gap: 32 },
    navItem: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    langSwitch: { fontSize: 14, fontWeight: '600', color: '#64748b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
    loginBtn: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    signupBtn: { backgroundColor: SP_RED, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    dropdownWrapper: { position: 'relative' },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    megaMenu: { position: 'absolute', top: 40, left: -200, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, padding: 24, zIndex: 10000, minWidth: 600 },
    megaMenuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    megaMenuItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, backgroundColor: '#f8f9fa' },
    megaMenuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    megaMenuText: { flex: 1 },
    megaMenuTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
    megaMenuSubtitle: { fontSize: 12, color: '#64748b' },
    pageHeader: {
        backgroundColor: '#fff',
        paddingVertical: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerContent: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        padding: 20,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 20,
    },
    searchBar: {
        width: 300,
        backgroundColor: '#fff',
    },
    categories: {
        flexGrow: 0,
    },
    chip: {
        marginRight: 8,
        backgroundColor: '#fff',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    card: {
        width: '23%',
        minWidth: 250,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    cardFooter: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginRight: 8,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        width: 500,
        maxWidth: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 32,
    },
    modalOptions: {
        gap: 16,
    },
    modalOptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
});
