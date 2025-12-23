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
    Alert,
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

interface SocialLink {
    id: string;
    name: string;
    icon: any;
    url: string;
    color: string;
    description: string;
}

// Mappings for social platforms
const PLATFORM_MAPPINGS: Record<string, any> = {
    facebook: { name: 'Facebook', icon: 'facebook', color: '#1877F2', description: 'Follow us on Facebook' },
    twitter: { name: 'Twitter / X', icon: 'twitter', color: '#000000', description: 'Follow us on X (Twitter)' },
    instagram: { name: 'Instagram', icon: 'instagram', color: '#E4405F', description: 'Follow us on Instagram' },
    youtube: { name: 'YouTube', icon: 'youtube', color: '#FF0000', description: 'Subscribe to our channel' },
    whatsapp: { name: 'WhatsApp Community', icon: 'whatsapp', color: '#25D366', description: 'Join our WhatsApp group' },
    telegram: { name: 'Telegram', icon: 'telegram', color: '#0088cc', description: 'Join our Telegram channel' },
    linkedin: { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', description: 'Connect on LinkedIn' },
    website: { name: 'Official Website', icon: 'web', color: '#E30512', description: 'Visit our official website' },
};

const SocialLinkCard = ({ link, delay }: { link: SocialLink; delay: number }) => {
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

    const handlePress = async () => {
        try {
            const supported = await Linking.canOpenURL(link.url);
            if (supported) {
                await Linking.openURL(link.url);
            } else {
                Alert.alert('Error', `Cannot open ${link.name}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open link');
        }
    };

    return (
        <Animated.View
            style={[
                styles.socialCard,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
        >
            <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
                <LinearGradient
                    colors={['#fff', '#f8fafc']}
                    style={styles.socialCardGradient}
                >
                    <View style={[styles.iconContainer, { backgroundColor: link.color + '15' }]}>
                        <MaterialCommunityIcons name={link.icon} size={32} color={link.color} />
                    </View>

                    <View style={styles.socialCardContent}>
                        <Text style={styles.socialName}>
                            <TranslatedText>{link.name}</TranslatedText>
                        </Text>
                        <Text style={styles.socialDescription}>
                            <TranslatedText>{link.description}</TranslatedText>
                        </Text>
                    </View>

                    <View style={[styles.arrowButton, { backgroundColor: link.color + '15' }]}>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={link.color} />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function JoinUsPage() {
    const router = useRouter();
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSocialLinks();
    }, []);

    const fetchSocialLinks = async () => {
        try {
            const url = getApiUrl();
            const res = await fetch(`${url}/footer`);
            const data = await res.json();

            if (data.success && data.data) {
                const footerData = data.data;
                const socialCols = (footerData.columns || []).filter((c: any) => c.type === 'social');

                let allLinks: SocialLink[] = [];

                // Aggregate links from all social columns if multiple exist
                socialCols.forEach((col: any) => {
                    if (col.social) {
                        const social = col.social;
                        Object.keys(PLATFORM_MAPPINGS).forEach((key, index) => {
                            if (social[key]) {
                                // Check if link already exists to avoid duplicates
                                const exists = allLinks.some(l => l.name === PLATFORM_MAPPINGS[key].name);
                                if (!exists) {
                                    allLinks.push({
                                        id: key + '-' + Math.random(),
                                        url: social[key],
                                        ...PLATFORM_MAPPINGS[key]
                                    });
                                }
                            }
                        });
                    }
                });

                // If no database links, fallback to empty or handle as needed. 
                // For now, let's show whatever we found.
                if (allLinks.length > 0) {
                    setSocialLinks(allLinks);
                } else {
                    // Start with empty, maybe show empty state?
                    setSocialLinks([]);
                }
            }
        } catch (error) {
            console.error('Error fetching social links:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient colors={[SP_RED, '#b91c1c', SP_DARK]} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <MaterialCommunityIcons name="account-multiple-plus" size={64} color="#fff" />
                        <Text style={styles.headerTitle}>
                            <TranslatedText>Join Samajwadi Tech Force</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>Connect with us on social media</TranslatedText>
                        </Text>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Welcome Section */}
                    <View style={styles.welcomeCard}>
                        <LinearGradient
                            colors={[SP_GREEN + '15', SP_GREEN + '08']}
                            style={styles.welcomeGradient}
                        >
                            <MaterialCommunityIcons name="hand-wave" size={40} color={SP_GREEN} />
                            <Text style={styles.welcomeTitle}>
                                <TranslatedText>Connect & Grow Together</TranslatedText>
                            </Text>
                            <Text style={styles.welcomeText}>
                                <TranslatedText>Join our vibrant community across multiple platforms. Stay updated with the latest news, participate in discussions, and be part of the digital revolution.</TranslatedText>
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Social Media Links */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <TranslatedText>📱 Social Media Platforms</TranslatedText>
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            <TranslatedText>Follow us on your favorite platforms</TranslatedText>
                        </Text>

                        {loading ? (
                            <Text style={{ textAlign: 'center', color: '#666', marginVertical: 20 }}>Loading links...</Text>
                        ) : socialLinks.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: '#666', marginVertical: 20 }}>No social links configured yet.</Text>
                        ) : (
                            <View style={styles.socialLinksContainer}>
                                {socialLinks.map((link, idx) => (
                                    <SocialLinkCard key={link.id} link={link} delay={idx * 80} />
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Benefits Section */}
                    <View style={styles.benefitsSection}>
                        <Text style={styles.sectionTitle}>
                            <TranslatedText>✨ Why Join Us?</TranslatedText>
                        </Text>

                        <View style={styles.benefitCard}>
                            <View style={styles.benefitIcon}>
                                <MaterialCommunityIcons name="bell-ring" size={24} color={SP_RED} />
                            </View>
                            <View style={styles.benefitContent}>
                                <Text style={styles.benefitTitle}>
                                    <TranslatedText>Instant Updates</TranslatedText>
                                </Text>
                                <Text style={styles.benefitDesc}>
                                    <TranslatedText>Get real-time notifications about party news, events, and programs</TranslatedText>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitCard}>
                            <View style={styles.benefitIcon}>
                                <MaterialCommunityIcons name="forum" size={24} color={SP_GREEN} />
                            </View>
                            <View style={styles.benefitContent}>
                                <Text style={styles.benefitTitle}>
                                    <TranslatedText>Community Engagement</TranslatedText>
                                </Text>
                                <Text style={styles.benefitDesc}>
                                    <TranslatedText>Connect with like-minded individuals and participate in discussions</TranslatedText>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitCard}>
                            <View style={styles.benefitIcon}>
                                <MaterialCommunityIcons name="trophy" size={24} color="#F59E0B" />
                            </View>
                            <View style={styles.benefitContent}>
                                <Text style={styles.benefitTitle}>
                                    <TranslatedText>Exclusive Content</TranslatedText>
                                </Text>
                                <Text style={styles.benefitDesc}>
                                    <TranslatedText>Access exclusive content, training materials, and digital resources</TranslatedText>
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitCard}>
                            <View style={styles.benefitIcon}>
                                <MaterialCommunityIcons name="account-group" size={24} color="#3B82F6" />
                            </View>
                            <View style={styles.benefitContent}>
                                <Text style={styles.benefitTitle}>
                                    <TranslatedText>Networking</TranslatedText>
                                </Text>
                                <Text style={styles.benefitDesc}>
                                    <TranslatedText>Build connections with district heads and active members</TranslatedText>
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Call to Action */}
                    <View style={styles.ctaCard}>
                        <LinearGradient
                            colors={[SP_RED, '#b91c1c']}
                            style={styles.ctaGradient}
                        >
                            <MaterialCommunityIcons name="bicycle" size={48} color="#fff" />
                            <Text style={styles.ctaTitle}>
                                <TranslatedText>साइकिल चलाओ देश बचाओ</TranslatedText>
                            </Text>
                            <Text style={styles.ctaText}>
                                <TranslatedText>Join the movement for a better tomorrow. Together we can bring the change our nation needs.</TranslatedText>
                            </Text>
                        </LinearGradient>
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
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
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
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#fff',
        marginTop: 16,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        textAlign: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    welcomeCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
    },
    welcomeGradient: {
        padding: 24,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
        textAlign: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20,
    },
    socialLinksContainer: {
        gap: 12,
    },
    socialCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    socialCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    socialCardContent: {
        flex: 1,
    },
    socialName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    socialDescription: {
        fontSize: 13,
        color: '#64748b',
    },
    arrowButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitsSection: {
        marginBottom: 32,
    },
    benefitCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    benefitIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    benefitContent: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    benefitDesc: {
        fontSize: 13,
        lineHeight: 20,
        color: '#64748b',
    },
    ctaCard: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    ctaGradient: {
        padding: 32,
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginTop: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    ctaText: {
        fontSize: 14,
        lineHeight: 22,
        color: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
    },
});
