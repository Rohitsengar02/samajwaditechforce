import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

export default function DesktopEvents() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/events`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setEvents(data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventStatus = (date: string) => {
        const eventDate = new Date(date);
        const today = new Date();
        return eventDate >= today ? 'upcoming' : 'past';
    };

    const filteredEvents = filter === 'all'
        ? events
        : events.filter(event => getEventStatus(event.date) === filter);

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <View style={styles.heroBannerContent}>
                        <View style={styles.heroBadge}>
                            <MaterialCommunityIcons name="calendar-star" size={20} color={SP_RED} />
                            <Text style={styles.heroBadgeText}>Upcoming Events</Text>
                        </View>
                        <Text style={styles.heroTitle}>Join Us in Building{'\n'}a Better Tomorrow</Text>
                        <Text style={styles.heroSubtitle}>
                            Participate in our rallies, town halls, and community events across Uttar Pradesh
                        </Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterSection}>
                    <View style={styles.filterTabs}>
                        <Pressable
                            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                            onPress={() => setFilter('all')}
                        >
                            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                                All Events
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.filterTab, filter === 'upcoming' && styles.filterTabActive]}
                            onPress={() => setFilter('upcoming')}
                        >
                            <Text style={[styles.filterTabText, filter === 'upcoming' && styles.filterTabTextActive]}>
                                Upcoming
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.filterTab, filter === 'past' && styles.filterTabActive]}
                            onPress={() => setFilter('past')}
                        >
                            <Text style={[styles.filterTabText, filter === 'past' && styles.filterTabTextActive]}>
                                Past Events
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Events Grid */}
                {loading ? (
                    <ActivityIndicator size="large" color={SP_RED} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.eventsGrid}>
                        {filteredEvents.map((event, index) => (
                            <Pressable
                                key={event._id || index}
                                style={styles.eventCard}
                                onPress={() => { }}
                            >
                                <Image
                                    source={{ uri: event.image || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400' }}
                                    style={styles.eventImage}
                                    resizeMode="cover"
                                />

                                {/* Date Badge Overlay */}
                                <View style={styles.dateBadge}>
                                    <Text style={styles.dateDay}>
                                        {new Date(event.date || Date.now()).getDate()}
                                    </Text>
                                    <Text style={styles.dateMonth}>
                                        {new Date(event.date || Date.now()).toLocaleDateString('en-US', { month: 'short' })}
                                    </Text>
                                </View>

                                <View style={styles.eventContent}>
                                    <View style={styles.eventMeta}>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>
                                                {getEventStatus(event.date) === 'upcoming' ? 'UPCOMING' : 'PAST EVENT'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.eventTitle} numberOfLines={2}>
                                        {event.title || 'Samajwadi Party Rally'}
                                    </Text>

                                    <View style={styles.eventDetails}>
                                        <View style={styles.eventDetailItem}>
                                            <MaterialCommunityIcons name="clock-outline" size={16} color="#64748b" />
                                            <Text style={styles.eventDetailText}>
                                                {new Date(event.date || Date.now()).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </View>
                                        <View style={styles.eventDetailItem}>
                                            <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
                                            <Text style={styles.eventDetailText} numberOfLines={1}>
                                                {event.location || 'Lucknow, UP'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Pressable style={styles.registerBtn}>
                                        <Text style={styles.registerBtnText}>
                                            {getEventStatus(event.date) === 'upcoming' ? 'Register Now' : 'View Details'}
                                        </Text>
                                        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                                    </Pressable>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Empty State */}
                {!loading && filteredEvents.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-remove" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyStateTitle}>No Events Found</Text>
                        <Text style={styles.emptyStateText}>
                            {filter === 'upcoming'
                                ? 'There are no upcoming events at the moment.'
                                : filter === 'past'
                                    ? 'No past events to display.'
                                    : 'No events available.'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    // Hero Banner
    heroBanner: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 60,
        paddingVertical: 80,
        borderBottomWidth: 1,
        borderBottomColor: '#fee2e2',
    },
    heroBannerContent: {
        maxWidth: 800,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    heroBadgeText: {
        fontSize: 14,
        color: SP_RED,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 16,
        lineHeight: 56,
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#64748b',
        lineHeight: 28,
    },
    // Filter Section
    filterSection: {
        paddingHorizontal: 60,
        paddingVertical: 32,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    filterTabs: {
        flexDirection: 'row',
        gap: 16,
    },
    filterTab: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
    },
    filterTabActive: {
        backgroundColor: SP_RED,
    },
    filterTabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    filterTabTextActive: {
        color: '#fff',
    },
    // Events Grid
    eventsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 60,
        gap: 24,
    },
    eventCard: {
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
    eventImage: {
        width: '100%',
        height: 200,
    },
    dateBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dateDay: {
        fontSize: 24,
        fontWeight: '900',
        color: SP_RED,
        lineHeight: 28,
    },
    dateMonth: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    eventContent: {
        padding: 20,
    },
    eventMeta: {
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
        lineHeight: 26,
    },
    eventDetails: {
        gap: 8,
        marginBottom: 16,
    },
    eventDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    eventDetailText: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    registerBtn: {
        backgroundColor: SP_RED,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
    },
    registerBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        padding: 60,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
});
