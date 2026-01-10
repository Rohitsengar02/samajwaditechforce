import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
    Platform,
    Alert,
    RefreshControl,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Button } from 'react-native-paper';
import { getApiUrl } from '../../utils/api';
import { TranslatedText } from '../../components/TranslatedText';
import DesktopPosters from '../desktop-screen-pages/posters';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';

const API_URL = getApiUrl();

interface Poster {
    _id: string;
    title: string;
    imageUrl: string;
    downloadCount: number;
}

export default function PostersScreen() {
    const router = useRouter();
    const isDesktop = width >= 768;

    if (isDesktop) {
        return <DesktopPosters />;
    }

    const [posters, setPosters] = useState<Poster[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    useEffect(() => {
        fetchPosters();
    }, []);

    const fetchPosters = async (pageNum: number = 1, append: boolean = false) => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fetch(`${API_URL}/posters?page=${pageNum}&limit=10`);
            const data = await response.json();

            if (data.posters && data.posters.length > 0) {
                if (append) {
                    setPosters(prev => [...prev, ...data.posters]);
                } else {
                    setPosters(data.posters);
                }

                if (data.pagination) {
                    setHasMore(data.pagination.current < data.pagination.total);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching posters:', error);
            Alert.alert('Error', 'Failed to load posters');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosters(nextPage, true);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchPosters(1, false).then(() => setRefreshing(false));
    }, []);

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;

        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMore();
        }
    };

    const handlePosterPress = async (poster: Poster) => {
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            const user = userInfo ? JSON.parse(userInfo) : null;

            if (!user || user.verificationStatus !== 'Verified') {
                setShowVerifyModal(true);
                return;
            }

            setSelectedPoster(poster);
            setModalVisible(true);
        } catch (error) {
            console.error('Error checking verification:', error);
            setShowVerifyModal(true);
        }
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
        });
    };

    const handleDownload = async (poster: Poster) => {
        try {
            setDownloading(poster._id);

            // Track download
            const token = await AsyncStorage.getItem('token');
            if (token) {
                await fetch(`${API_URL}/posters/${poster._id}/download`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
            }

            if (Platform.OS === 'web') {
                // Web: Download image directly
                const link = document.createElement('a');
                link.href = poster.imageUrl;
                link.download = `${poster.title}.jpg`;
                link.click();
                Alert.alert('Success', 'Poster downloaded!');
            } else {
                // Mobile: Use FileSystem and Sharing
                const fileUri = FileSystem.documentDirectory + `${poster.title}.jpg`;
                const downloadResult = await FileSystem.downloadAsync(
                    poster.imageUrl,
                    fileUri
                );

                if (downloadResult.uri) {
                    await Sharing.shareAsync(downloadResult.uri, {
                        mimeType: 'image/jpeg',
                        dialogTitle: 'Save Poster'
                    });
                    Alert.alert('Success', 'Poster ready to download!');
                }
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download poster');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={SP_RED} />
                <Text style={styles.loadingText}>
                    <TranslatedText>Loading posters...</TranslatedText>
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={[SP_RED, '#b91c1c']} style={styles.header}>
                <Text style={styles.headerTitle}>
                    <TranslatedText>Party Posters</TranslatedText>
                </Text>
                <Text style={styles.headerSubtitle}>
                    <TranslatedText>Tap to edit and customize</TranslatedText>
                </Text>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[SP_RED]} />
                }
            >
                {/* Posters Grid - 2 per row */}
                <View style={styles.postersGrid}>
                    {posters.map((poster) => (
                        <TouchableOpacity
                            key={poster._id}
                            style={styles.posterCard}
                            onPress={() => handlePosterPress(poster)}
                            disabled={downloading === poster._id}
                        >
                            {/* Poster Image */}
                            <Image
                                source={{ uri: poster.imageUrl }}
                                style={styles.posterImage}
                                resizeMode="cover"
                            />

                            {/* Edit Overlay Hint */}
                            <View style={styles.editOverlay}>
                                <MaterialCommunityIcons name="pencil-circle" size={32} color="#fff" />
                            </View>

                            {/* Download Indicator */}
                            {downloading === poster._id && (
                                <View style={styles.downloadingOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {loadingMore && (
                    <View style={styles.loadingMore}>
                        <ActivityIndicator size="small" color={SP_RED} />
                    </View>
                )}
            </ScrollView>

            {/* Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                    <TranslatedText>What would you like to do?</TranslatedText>
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    <TranslatedText>Edit or download this poster</TranslatedText>
                                </Text>

                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={handleDetailedEdit}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                                        <MaterialCommunityIcons name="palette" size={24} color={SP_RED} />
                                    </View>
                                    <View style={styles.buttonTextContainer}>
                                        <Text style={styles.buttonTitle}>
                                            <TranslatedText>Edit Poster</TranslatedText>
                                        </Text>
                                        <Text style={styles.buttonSubtitle}>
                                            <TranslatedText>Add your details and customize</TranslatedText>
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, { borderBottomWidth: 0 }]}
                                    onPress={() => selectedPoster && handleDownload(selectedPoster)}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                                        <MaterialCommunityIcons name="download" size={24} color="#16a34a" />
                                    </View>
                                    <View style={styles.buttonTextContainer}>
                                        <Text style={styles.buttonTitle}>
                                            <TranslatedText>Download Only</TranslatedText>
                                        </Text>
                                        <Text style={styles.buttonSubtitle}>
                                            <TranslatedText>Save without editing</TranslatedText>
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Verification Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showVerifyModal}
                onRequestClose={() => setShowVerifyModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowVerifyModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                    <MaterialCommunityIcons name="shield-alert" size={48} color={SP_RED} />
                                </View>
                                <Text style={[styles.modalTitle, { marginBottom: 8 }]}>
                                    <TranslatedText>Verification Required</TranslatedText>
                                </Text>
                                <Text style={[styles.modalSubtitle, { marginBottom: 24 }]}>
                                    <TranslatedText>You must be a verified member to access and edit posters.</TranslatedText>
                                </Text>

                                <View style={{ gap: 12 }}>
                                    <Button
                                        mode="contained"
                                        buttonColor={SP_RED}
                                        onPress={() => {
                                            setShowVerifyModal(false);
                                            router.push('/(tabs)/profile');
                                        }}
                                        style={{ borderRadius: 8, paddingVertical: 4 }}
                                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                                    >
                                        <TranslatedText>Go to Profile</TranslatedText>
                                    </Button>
                                    <Button
                                        mode="outlined"
                                        textColor="#64748b"
                                        onPress={() => setShowVerifyModal(false)}
                                        style={{ borderRadius: 8, borderColor: '#cbd5e1', paddingVertical: 4 }}
                                    >
                                        <TranslatedText>Cancel</TranslatedText>
                                    </Button>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
        fontSize: 16,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 8,
        paddingBottom: 120,
    },
    postersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    posterCard: {
        width: '48%',
        aspectRatio: 1 / 1.3,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        position: 'relative',
    },
    posterImage: {
        width: '100%',
        height: '100%',
    },
    editOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 4,
    },
    downloadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    buttonTextContainer: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    buttonSubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
});
