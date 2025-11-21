import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Notification Card Component
const NotificationCard = ({ notification, onPress, delay }: any) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getIconName = (type: string) => {
        switch (type) {
            case 'news': return 'newspaper';
            case 'event': return 'calendar';
            case 'update': return 'bell-ring';
            case 'message': return 'message';
            default: return 'bell';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'news': return SP_RED;
            case 'event': return SP_GREEN;
            case 'update': return '#3B82F6';
            case 'message': return '#F59E0B';
            default: return '#64748b';
        }
    };

    return (
        <Animated.View
            style={[
                styles.notificationCard,
                { transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }
            ]}
        >
            <TouchableOpacity
                style={styles.notificationContent}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <View style={[styles.notificationIcon, { backgroundColor: getIconColor(notification.type) + '20' }]}>
                    <MaterialCommunityIcons
                        name={getIconName(notification.type)}
                        size={24}
                        color={getIconColor(notification.type)}
                    />
                </View>

                <View style={styles.notificationText}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                    </Text>
                    <View style={styles.notificationFooter}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                        {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                </View>

                <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function NotificationsScreen() {
    const router = useRouter();
    const isDesktop = width >= 768;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [selectedFilter, setSelectedFilter] = useState('All');

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please enable notifications to receive updates.');
        }
    };

    const sendTestNotification = async (notification: any) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: notification.title,
                    body: notification.message,
                    data: { type: notification.type },
                    sound: true,
                },
                trigger: null,
            });

            Alert.alert(
                'Notification Sent! 🔔',
                `You should receive a notification: "${notification.title}"`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to send notification');
            console.error(error);
        }
    };

    const notifications = [
        {
            id: 1,
            type: 'news',
            title: 'New Article Published',
            message: 'समाजवादी टेक फोर्स का विस्तार पूरे देश में - Read the latest update',
            time: '2 hours ago',
            read: false,
        },
        {
            id: 2,
            type: 'event',
            title: 'Upcoming Event',
            message: 'Tech Force meeting scheduled for tomorrow at 10 AM',
            time: '5 hours ago',
            read: false,
        },
        {
            id: 3,
            type: 'update',
            title: 'App Update Available',
            message: 'New features and improvements are now available',
            time: '1 day ago',
            read: true,
        },
        {
            id: 4,
            type: 'message',
            title: 'New Message',
            message: 'You have received a message from the admin',
            time: '2 days ago',
            read: true,
        },
        {
            id: 5,
            type: 'news',
            title: 'Policy Update',
            message: 'किसानों के लिए नई योजना की घोषणा - Check details',
            time: '3 days ago',
            read: true,
        },
    ];

    const filters = ['All', 'News', 'Events', 'Updates', 'Messages'];

    const filteredNotifications = notifications.filter(notif => {
        if (selectedFilter === 'All') return true;
        return notif.type === selectedFilter.toLowerCase().slice(0, -1);
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[SP_RED, '#b91c1c']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        <Text style={styles.headerSubtitle}>{notifications.filter(n => !n.read).length} unread</Text>
                    </View>
                    <TouchableOpacity style={styles.headerButton}>
                        <MaterialCommunityIcons name="check-all" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim }, isDesktop && styles.desktopContent]}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {filters.map((filter, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.filterChip,
                                    selectedFilter === filter && styles.filterChipActive
                                ]}
                                onPress={() => setSelectedFilter(filter)}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    selectedFilter === filter && styles.filterChipTextActive
                                ]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.infoBanner}>
                        <LinearGradient
                            colors={[SP_GREEN, '#15803d']}
                            style={styles.infoBannerGradient}
                        >
                            <MaterialCommunityIcons name="information" size={24} color="#fff" />
                            <Text style={styles.infoBannerText}>
                                Tap any notification to send a test push notification to your device
                            </Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.notificationsList}>
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification, idx) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    delay={idx * 100}
                                    onPress={() => sendTestNotification(notification)}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="bell-off" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>No notifications found</Text>
                                <Text style={styles.emptyStateSubtext}>Try selecting a different filter</Text>
                            </View>
                        )}
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
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    content: {
        padding: 16,
    },
    desktopContent: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
    },
    filterContainer: {
        gap: 12,
        paddingVertical: 16,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterChipActive: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    infoBanner: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    infoBannerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 13,
        color: '#fff',
        fontWeight: '600',
        lineHeight: 20,
    },
    notificationsList: {
        gap: 12,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    notificationIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationText: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    notificationTime: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    unreadDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: SP_RED,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#64748b',
        marginTop: 16,
        marginBottom: 4,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#94a3b8',
    },
});
