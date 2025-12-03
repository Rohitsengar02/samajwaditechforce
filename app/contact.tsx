import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../components/TranslatedText';

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

export default function ContactPage() {
    const router = useRouter();

    const openMap = () => {
        const address = "19, Vikramaditya Marg, Gulistan Colony, Lucknow, Uttar Pradesh 226001";
        const url = Platform.select({
            ios: `maps:0,0?q=${address}`,
            android: `geo:0,0?q=${address}`,
        });
        if (url) Linking.openURL(url);
    };

    const openDialer = (number: string) => {
        Linking.openURL(`tel:${number.replace(/\s/g, '')}`);
    };

    const openEmail = (email: string) => {
        Linking.openURL(`mailto:${email}`);
    };

    const openYouTube = () => {
        Linking.openURL('https://www.youtube.com/@SamajwadiPartyOfficial');
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
                        <MaterialCommunityIcons name="card-account-phone" size={64} color="#fff" />
                        <Text style={styles.headerTitle}>
                            <TranslatedText>Contact Us</TranslatedText>
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            <TranslatedText>We are here to help & listen</TranslatedText>
                        </Text>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Office Location Section */}
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
                                            <TranslatedText>19, Vikramaditya Marg, Gulistan Colony, Lucknow, Uttar Pradesh 226001</TranslatedText>
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

                    {/* Contact Numbers */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <TranslatedText>📞 Call Us</TranslatedText>
                        </Text>
                        <ContactCard
                            icon="phone"
                            title="Main Office"
                            subtitle="+91 96217 62121"
                            action={() => openDialer('9621762121')}
                            delay={100}
                            color="#3B82F6"
                        />
                        <ContactCard
                            icon="cellphone"
                            title="Support Line"
                            subtitle="+91 73071 27762"
                            action={() => openDialer('7307127762')}
                            delay={200}
                            color="#3B82F6"
                        />
                    </View>

                    {/* Email Addresses */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <TranslatedText>✉️ Email Us</TranslatedText>
                        </Text>
                        <ContactCard
                            icon="email"
                            title="General Inquiry"
                            subtitle="info@samajwaditechforce.com"
                            action={() => openEmail('info@samajwaditechforce.com')}
                            delay={300}
                            color="#F59E0B"
                        />
                        <ContactCard
                            icon="email-outline"
                            title="Support Team"
                            subtitle="contact@samajwaditechforce.com"
                            action={() => openEmail('contact@samajwaditechforce.com')}
                            delay={400}
                            color="#F59E0B"
                        />
                    </View>

                    {/* Videos & Songs Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <TranslatedText>🎵 youtube</TranslatedText>
                        </Text>
                        <Animated.View style={styles.mediaCard}>
                            <TouchableOpacity onPress={openYouTube} activeOpacity={0.9}>
                                <LinearGradient colors={['#FF0000', '#cc0000']} style={styles.mediaGradient}>
                                    <View style={styles.mediaContent}>
                                        <MaterialCommunityIcons name="youtube" size={48} color="#fff" />
                                        <View style={styles.mediaTextContainer}>
                                            <Text style={styles.mediaTitle}>
                                                <TranslatedText>Samajwadi Party Official</TranslatedText>
                                            </Text>
                                            <Text style={styles.mediaSubtitle}>
                                                <TranslatedText>Watch latest campaigns, songs & speeches</TranslatedText>
                                            </Text>
                                        </View>
                                        <MaterialCommunityIcons name="open-in-new" size={24} color="#fff" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
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
});
