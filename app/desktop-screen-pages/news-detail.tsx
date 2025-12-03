import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Text, Button, Chip, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';
import { TranslatedText } from '../../components/TranslatedText';

const SP_RED = '#E30512';

export default function DesktopNewsDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [news, setNews] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchNewsDetail();
        }
    }, [id]);

    const fetchNewsDetail = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/news/${id}`);
            const data = await res.json();
            if (data.success) {
                setNews(data.data);
            }
        } catch (error) {
            console.error('Error fetching news detail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={SP_RED} />
            </View>
        );
    }

    if (!news) {
        return (
            <View style={styles.errorContainer}>
                <Text>News not found</Text>
                <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Button
                    mode="text"
                    icon="arrow-left"
                    textColor={SP_RED}
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    Back to News
                </Button>

                <View style={styles.articleContainer}>
                    <Text style={styles.title}>{news.title}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="calendar" size={16} color="#64748b" />
                            <Text style={styles.metaText}>
                                {new Date(news.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="eye" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{news.views} Views</Text>
                        </View>
                    </View>

                    <Image
                        source={{ uri: news.coverImage || 'https://via.placeholder.com/800x400' }}
                        style={styles.coverImage}
                    />

                    <View style={styles.articleContent}>
                        {news.content && news.content.map((block: any, index: number) => {
                            if (block.type === 'paragraph') {
                                return (
                                    <Text key={index} style={styles.paragraph}>
                                        {block.content}
                                    </Text>
                                );
                            }
                            return null;
                        })}
                        {(!news.content || news.content.length === 0) && (
                            <Text style={styles.paragraph}>{news.excerpt || news.description}</Text>
                        )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    content: {
        maxWidth: 900,
        width: '100%',
        alignSelf: 'center',
        padding: 40,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    articleContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 16,
        lineHeight: 48,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 32,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    coverImage: {
        width: '100%',
        height: 400,
        borderRadius: 16,
        marginBottom: 40,
        resizeMode: 'cover',
    },
    articleContent: {
        gap: 24,
    },
    paragraph: {
        fontSize: 18,
        color: '#334155',
        lineHeight: 32,
    },
});
