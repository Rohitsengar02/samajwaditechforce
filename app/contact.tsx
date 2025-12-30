import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    Linking,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../components/TranslatedText';
import { getApiUrl } from '../utils/api';

const { width } = Dimensions.get('window');

const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

const ContactCard = ({ icon, title, subtitle, action, delay, color = SP_RED }: any) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.card,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
        >
            <TouchableOpacity onPress={action} activeOpacity={0.8}>
                <LinearGradient
                    colors={['#fff', '#f8fafc']}
                    style={styles.cardGradient}
                >
                    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                        <MaterialCommunityIcons name={icon} size={32} color={color} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>
                            <TranslatedText>{title}</TranslatedText>
                        </Text>
                        <Text style={styles.cardSubtitle}>
                            <TranslatedText>{subtitle}</TranslatedText>
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

interface ContactSettings {
    pageTitle: string;
    pageSubtitle: string;
    address: string;
    email: string;
    phone: string;
    officeHours: string;
    formTitle: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    submitButtonText: string;
    successMessage: string;
    additionalInfo: string;
    socialMedia: Array<{ platform: string; url: string; icon: string }>;
}

export default function ContactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<ContactSettings>({
        pageTitle: 'Contact Us',
        pageSubtitle: 'We are here to help & listen',
        address: '19, Vikramaditya Marg, Gulistan Colony, Lucknow, Uttar Pradesh 226001',
        email: 'contact@samajwaditechforce.com',
        phone: '+91 96217 62121',
        officeHours: '',
        formTitle: 'Send us a Message',
        nameLabel: 'Full Name',
        emailLabel: 'Email Address',
        messageLabel: 'Message',
        submitButtonText: 'Send Message',
        successMessage: 'Your message has been sent!',
        additionalInfo: '',
        socialMedia: [],
    });

    const API_URL = getApiUrl();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/contact-settings`);
            const data = await res.json();
            if (data.success) {
                setSettings({ ...settings, ...data.data });
            }
        } catch (error) {
            console.error('Error fetching contact settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const openMap = () => {
        const url = Platform.select({
            ios: `maps:0,0?q=${settings.address}`,
            android: `geo:0,0?q=${settings.address}`,
        });
        if (url) Linking.openURL(url);
    };

    const openDialer = (number: string) => {
        Linking.openURL(`tel:${number.replace(/\s/g, '')}`);
    };

    const openEmail = (email: string) => {
        Linking.openURL(`mailto:${email}`);
    };

    const openSocialMedia = (url: string) => {
        Linking.openURL(url);
    };

    const getSocialIcon = (platform: string): string => {
        const icons: { [key: string]: string } = {
            facebook: 'facebook',
            twitter: 'twitter',
            instagram: 'instagram',
            linkedin: 'linkedin',
            youtube: 'youtube',
            whatsapp: 'whatsapp',
            telegram: 'send',
        };
        return icons[platform.toLowerCase()] || 'link';
    };

    const getSocialColor = (platform: string): string => {
        const colors: { [key: string]: string } = {
            facebook: '#1877F2',
            twitter: '#1DA1F2',
            instagram: '#E4405F',
            linkedin: '#0A66C2',
            youtube: '#FF0000',
            whatsapp: '#25D366',
            telegram: '#0088CC',
        };
        return colors[platform.toLowerCase()] || SP_RED;
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={SP_RED} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient colors={[SP_RED, '#b91c1c', SP_DARK]} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <MaterialCommunityIcons name="card-account-phone" size={64} color="#fff" />
                        <Text style={styles.headerTitle}>
                            <TranslatedText>{settings.pageTitle}</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>{settings.pageSubtitle}</TranslatedText>
                        </Text>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Office Location Section */}
                    {settings.address && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <TranslatedText>📍 Party Office</TranslatedText>
                            </Text>
                            <Animated.View style={styles.locationCard}>
                                <TouchableOpacity onPress={openMap} activeOpacity={0.9}>
                                    <LinearGradient colors={['#fff', '#fff']} style={styles.locationGradient}>
                                        <View style={styles.mapPlaceholder}>
                                            <LinearGradient colors={[SP_GREEN + '20', SP_GREEN + '10']} style={styles.mapBackground}>
                                                <MaterialCommunityIcons name="map-marker-radius" size={48} color={SP_GREEN} />
                                            </LinearGradient>
                                        </View>
                                        <View style={styles.locationInfo}>
                                            <Text style={styles.locationName}>
                                                <TranslatedText>Samajwadi Party Karyalay</TranslatedText>
                                            </Text>
                                            <Text style={styles.locationAddress}>
                                                <TranslatedText>{settings.address}</TranslatedText>
                                            </Text>
                                            <View style={styles.directionButton}>
                                                <Text style={styles.directionText}>
                                                    <TranslatedText>Get Directions</TranslatedText>
                                                </Text>
                                                <MaterialCommunityIcons name="arrow-right" size={16} color={SP_GREEN} />
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    )}

                    {/* Contact Numbers */}
                    {settings.phone && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <TranslatedText>📞 Call Us</TranslatedText>
                            </Text>
                            <ContactCard
                                icon="phone"
                                title="Main Office"
                                subtitle={settings.phone}
                                action={() => openDialer(settings.phone)}
                                delay={100}
                                color="#3B82F6"
                            />
                        </View>
                    )}

                    {/* Email Addresses */}
                    {settings.email && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <TranslatedText>✉️ Email Us</TranslatedText>
                            </Text>
                            <ContactCard
                                icon="email"
                                title="General Inquiry"
                                subtitle={settings.email}
                                action={() => openEmail(settings.email)}
                                delay={200}
                                color="#F59E0B"
                            />
                        </View>
                    )}

                    {/* Office Hours */}
                    {settings.officeHours && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <TranslatedText>🕒 Office Hours</TranslatedText>
                            </Text>
                            <View style={styles.card}>
                                <LinearGradient colors={['#fff', '#f8fafc']} style={styles.cardGradient}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#10b981' + '15' }]}>
                                        <MaterialCommunityIcons name="clock-outline" size={32} color="#10b981" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardSubtitle}>
                                            <TranslatedText>{settings.officeHours}</TranslatedText>
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        </View>
                    )}

                    {/* Social Media Links */}
                    {settings.socialMedia && settings.socialMedia.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <TranslatedText>🔗 Follow Us</TranslatedText>
                            </Text>
                            <View style={styles.socialContainer}>
                                {settings.socialMedia.map((social, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.socialButton, { backgroundColor: getSocialColor(social.platform) }]}
                                        onPress={() => openSocialMedia(social.url)}
                                    >
                                        <MaterialCommunityIcons
                                            name={getSocialIcon(social.platform) as any}
                                            size={24}
                                            color="#fff"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Additional Info */}
                    {settings.additionalInfo && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <TranslatedText>ℹ️ Additional Information</TranslatedText>
                            </Text>
                            <View style={styles.infoCard}>
                                <Text style={styles.infoText}>
                                    <TranslatedText>{settings.additionalInfo}</TranslatedText>
                                </Text>
                            </View>
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
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginTop: 16,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
        marginTop: -20,
    },
    section: {
        marginTop: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    locationCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        backgroundColor: '#fff',
    },
    locationGradient: {
        padding: 0,
    },
    mapPlaceholder: {
        height: 120,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    mapBackground: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationInfo: {
        padding: 20,
    },
    locationName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 6,
    },
    locationAddress: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 22,
        marginBottom: 16,
    },
    directionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: SP_GREEN + '15',
        gap: 6,
    },
    directionText: {
        fontSize: 14,
        fontWeight: '700',
        color: SP_GREEN,
    },
    mediaCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    mediaGradient: {
        padding: 24,
    },
    mediaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    mediaTextContainer: {
        flex: 1,
    },
    mediaTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    mediaSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    socialContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 24,
    },
});
