import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, useWindowDimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getApiUrl } from '../../utils/api';
import PageRenderer from '../../components/page-builder/PageRenderer';
import DesktopHeader from '../../components/DesktopHeader';
import Footer from '../../components/Footer';

export default function DynamicPage() {
    const { width } = useWindowDimensions();
    const { id } = useLocalSearchParams();
    const [page, setPage] = useState<any>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPage();
    }, [id]);

    const fetchPage = async () => {
        try {
            if (!id) return;
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/pages/${id}`);
            const data = await response.json();

            if (data.success) {
                setPage(data.data);

                let sectionsData = data.data.content;
                try {
                    if (typeof sectionsData === 'string') {
                        sectionsData = JSON.parse(sectionsData || '[]');
                    } else if (!Array.isArray(sectionsData)) {
                        sectionsData = [];
                    }
                    setSections(sectionsData);
                } catch (e) {
                    console.error('Error parsing sections:', e);
                    setSections([]);
                }
            } else {
                setError('Page not found');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load page');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#E30512" />
            </View>
        );
    }

    if (error || !page) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <DesktopHeader />
                <View style={[styles.mainContent, { alignItems: 'center', justifyContent: 'center', paddingHorizontal: width < 768 ? 20 : 80 }]}>
                    <Text style={{ fontSize: 18, color: '#ef4444', marginBottom: 8 }}>Oops!</Text>
                    <Text style={{ color: '#6b7280' }}>{error || 'Page not found'}</Text>
                </View>
                <Footer />
            </View>
        );
    }

    const viewport = width < 768 ? 'mobile' : 'desktop';

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <DesktopHeader />

                <View style={[styles.mainContent, { paddingHorizontal: width < 768 ? 20 : 80 }]}>
                    {/* Page Title Section (Optional) */}
                    {/* 
                    <View style={styles.pageHeader}>
                        <Text style={styles.pageTitle}>{page.title}</Text>
                    </View>
                    */}

                    <PageRenderer sections={sections} viewport={viewport} />
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
    centerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainContent: {
        width: '100%',
        maxWidth: 1400,
        alignSelf: 'center',
        paddingVertical: 40,
        minHeight: 600,
    },
    pageHeader: {
        marginBottom: 40,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1e293b',
    }
});
