import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, Animated, Linking, Pressable, ActivityIndicator } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';
import Footer from '../../components/Footer';
import { TranslatedText } from '../../components/TranslatedText';

export default function DesktopHome() {
    const router = useRouter();
    const [news, setNews] = useState<any[]>([]);
    const [posters, setPosters] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Home content from API
    const [homeContent, setHomeContent] = useState<any>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    // Auto-rotate slides
    useEffect(() => {
        const slides = homeContent?.hero?.slides || [];
        if (slides.length > 1) {
            const interval = setInterval(() => {
                setActiveSlide(prev => (prev + 1) % slides.length);
            }, homeContent?.hero?.autoPlayInterval || 5000);
            return () => clearInterval(interval);
        }
    }, [homeContent]);

    const fetchData = async () => {
        try {
            const url = getApiUrl();
            const token = await AsyncStorage.getItem('userToken');
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

            // Fetch home content from dedicated API
            const homeRes = await fetch(`${url}/home-content`);
            const homeData = await homeRes.json();
            if (homeData.success && homeData.data) {
                setHomeContent(homeData.data);
            }

            const newsRes = await fetch(`${url}/news`);
            const newsData = await newsRes.json();
            if (newsData.success && Array.isArray(newsData.data)) setNews(newsData.data);

            const postersRes = await fetch(`${url}/posters`);
            const postersData = await postersRes.json();
            if (postersData.posters && Array.isArray(postersData.posters)) setPosters(postersData.posters);

            const tasksRes = await fetch(`${url}/tasks`, { headers });
            const tasksData = await tasksRes.json();
            if (tasksData.success && Array.isArray(tasksData.data)) setTasks(tasksData.data);

            const pagesRes = await fetch(`${url}/pages`);
            const pagesData = await pagesRes.json();
            if (pagesData.success && Array.isArray(pagesData.data)) setPages(pagesData.data);

        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get current slide data with defaults
    const getHeroData = () => {
        const slides = homeContent?.hero?.slides || [];
        const currentSlide = slides[activeSlide] || slides[0] || {};
        return {
            badge: currentSlide.badge || 'भारत की सबसे बड़ी समाजवादी पार्टी',
            title: currentSlide.title || 'समाजवादी पार्टी में\nआपका स्वागत है!',
            subtitle: currentSlide.subtitle || 'समाज के हर वर्ग के विकास के लिए समर्पित। समानता, न्याय और समृद्धि के लिए हमारे साथ जुड़ें।',
            image: currentSlide.image || news[0]?.coverImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
            stats: currentSlide.stats || [
                { num: '25L+', label: 'सक्रिय सदस्य' },
                { num: '75+', label: 'सीटें जीतीं' },
                { num: '1000+', label: 'विकास परियोजनाएं' }
            ],
            highlights: currentSlide.highlights || ['Free Laptop योजना', 'किसान पेंशन योजना', 'रोजगार गारंटी'],
            totalSlides: slides.length
        };
    };

    const heroData = getHeroData();

    // Get Track Record data with defaults
    const getTrackRecordData = () => {
        const trackRecord = homeContent?.trackRecord || {};
        return {
            title: trackRecord.title || 'Our Track Record',
            items: trackRecord.items || [
                { icon: 'account-group', num: '10L+', label: 'Active Members' },
                { icon: 'city', num: '75', label: 'Districts Covered' },
                { icon: 'checkbox-marked-circle', num: '1M+', label: 'Tasks Completed' },
                { icon: 'bullhorn', num: '5000+', label: 'Campaigns Run' }
            ]
        };
    };

    const trackRecordData = getTrackRecordData();

    // Get President slides (only active ones) for card display
    const getPresidentSlides = () => {
        const president = homeContent?.president || {};
        const allSlides = president.slides || [];
        // Filter only active slides
        const activeSlides = allSlides.filter((s: any) => s.isActive !== false);
        return activeSlides;
    };

    const presidentSlides = getPresidentSlides();
    const showPresidentSection = presidentSlides.length > 0;

    // Get Legacy data (leaders and cards)
    const getLegacyData = () => {
        const legacy = homeContent?.legacy || {};
        const leaders = (legacy.leaders || []).filter((l: any) => l.isActive !== false);
        const cards = legacy.cards || [];
        return {
            title: legacy.title || 'Our Legacy',
            leaders: leaders.length > 0 ? leaders : [{
                name: 'Mulayam Singh Yadav',
                role: 'Founder',
                image: 'https://i.pinimg.com/474x/a5/ba/d8/a5bad8e597e3fb5b4256385476659dc9.jpg',
                description: 'Visionary leader who founded Samajwadi Party in 1992',
                isActive: true
            }],

        };
    };

    const legacyData = getLegacyData();

    // Get Programs data
    const getProgramsData = () => {
        const programs = homeContent?.programs || {};
        return {
            title: programs.title || 'Our Programs',
            items: programs.items || [
                { title: 'Youth Employment', desc: 'Creating job opportunities', icon: 'briefcase' },
                { title: 'Farmer Welfare', desc: 'Supporting agricultural community', icon: 'sprout' },
                { title: 'Education for All', desc: 'Quality education accessible to everyone', icon: 'school' }
            ]
        };
    };

    const programsData = getProgramsData();

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView showsVerticalScrollIndicator={false}>


                {/* Section 1: Enhanced Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroContainer}>
                        {/* Left Content */}
                        <View style={styles.heroLeft}>
                            <View style={styles.heroBadge}>
                                <MaterialCommunityIcons name="star-circle" size={20} color={SP_RED} />
                                <Text style={styles.heroBadgeText}>{heroData.badge}</Text>
                            </View>

                            <Text style={styles.heroTitle}>
                                {heroData.title.split('\n').map((line: string, i: number) => (
                                    <Text key={i} style={i === 1 ? styles.heroTitleHighlight : undefined}>
                                        {line}{i === 0 ? '\n' : ''}
                                    </Text>
                                ))}
                            </Text>

                            <Text style={styles.heroSubtitle}>{heroData.subtitle}</Text>

                            {/* Hero stats - Dynamic */}
                            <View style={styles.heroStats}>
                                {heroData.stats.map((stat: any, index: number) => (
                                    <React.Fragment key={index}>
                                        {index > 0 && <View style={styles.heroStatDivider} />}
                                        <View style={styles.heroStatItem}>
                                            <Text style={styles.heroStatNumber}>{stat.num}</Text>
                                            <Text style={styles.heroStatLabel}>{stat.label}</Text>
                                        </View>
                                    </React.Fragment>
                                ))}
                            </View>

                            {/* Key Highlights - Dynamic */}
                            <View style={styles.heroHighlights}>
                                {heroData.highlights.map((highlight: string, index: number) => (
                                    <View key={index} style={styles.heroHighlightItem}>
                                        <MaterialCommunityIcons name="check-decagram" size={20} color={SP_GREEN} />
                                        <Text style={styles.heroHighlightText}>{highlight}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Trust Badges */}
                            <View style={styles.heroTrustBadges}>
                                <View style={styles.trustBadge}>
                                    <MaterialCommunityIcons name="shield-check" size={18} color={SP_GREEN} />
                                    <Text style={styles.trustBadgeText}>भरोसेमंद</Text>
                                </View>
                                <View style={styles.trustBadge}>
                                    <MaterialCommunityIcons name="account-heart" size={18} color={SP_RED} />
                                    <Text style={styles.trustBadgeText}>जनता की पार्टी</Text>
                                </View>
                                <View style={styles.trustBadge}>
                                    <MaterialCommunityIcons name="trophy-variant" size={18} color="#FFB800" />
                                    <Text style={styles.trustBadgeText}>विकास केंद्रित</Text>
                                </View>
                            </View>
                        </View>

                        {/* Right Image - Dynamic from Cloudinary */}
                        <View style={styles.heroRight}>
                            <View style={styles.heroImageWrapper}>
                                <Image
                                    source={{ uri: heroData.image }}
                                    style={styles.heroMainImage}
                                    resizeMode="cover"
                                />
                                {/* Floating Card on Image */}
                                <View style={styles.heroFloatingCard}>
                                    <View style={styles.floatingCardIcon}>
                                        <MaterialCommunityIcons name="bullhorn" size={24} color={SP_RED} />
                                    </View>
                                    <View style={styles.floatingCardContent}>
                                        <Text style={styles.floatingCardTitle}>Latest Campaign</Text>
                                        <Text style={styles.floatingCardText}>विकास यात्रा 2024</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Slide Indicators */}
                            {heroData.totalSlides > 1 && (
                                <View style={styles.slideIndicators}>
                                    {Array.from({ length: heroData.totalSlides }).map((_, i) => (
                                        <Pressable
                                            key={i}
                                            onPress={() => setActiveSlide(i)}
                                            style={[styles.slideIndicator, i === activeSlide && styles.slideIndicatorActive]}
                                        />
                                    ))}
                                </View>
                            )}

                            <View style={styles.heroDecoCircle1} />
                            <View style={styles.heroDecoCircle2} />
                        </View>
                    </View>


                </View >

                {/* Section 2: News Updates */}
                < View style={styles.section} >
                    <View style={styles.sectionHeader}>
                        <TranslatedText text="Latest News Updates" style={styles.sectionTitle} />
                        <Button mode="text" textColor={SP_RED} onPress={() => router.push('/news' as any)}>
                            View All →
                        </Button>
                    </View>
                    <View style={styles.newsGrid}>
                        {news.slice(0, 6).map((item, index) => (
                            <Pressable
                                key={item._id || index}
                                style={styles.newsCard}
                                onPress={() => router.push(`/news/${item._id}` as any)}
                            >
                                <Image source={{ uri: item.coverImage }} style={styles.newsImage} />
                                <View style={styles.newsContent}>
                                    <Text style={styles.newsDate}>
                                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </Text>
                                    <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                                    <Text style={styles.newsExcerpt} numberOfLines={2}>{item.excerpt}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View >

                {/* Section 3: Media Gallery / Posters */}
                < View style={[styles.section, { backgroundColor: '#f8fafc' }]} >
                    <View style={styles.sectionHeader}>
                        <TranslatedText text="Campaign Gallery" style={styles.sectionTitle} />
                        <Button mode="text" textColor={SP_RED} onPress={() => router.push('/posters' as any)}>
                            View All →
                        </Button>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
                        {posters.slice(0, 8).map((poster, index) => (
                            <Pressable
                                key={poster._id || index}
                                style={styles.galleryItem}
                                onPress={() => router.push('/posters' as any)}
                            >
                                <Image source={{ uri: poster.imageUrl }} style={styles.galleryImage} />
                                <Text style={styles.galleryTitle}>{poster.title}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View >

                {/* Section 4: Party Achievements - Dynamic */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{trackRecordData.title}</Text>
                    <View style={styles.achievementsGrid}>
                        {trackRecordData.items.map((item: any, index: number) => (
                            <View key={index} style={styles.achievementCard}>
                                <MaterialCommunityIcons
                                    name={item.icon || 'star'}
                                    size={48}
                                    color={index % 2 === 0 ? SP_RED : SP_GREEN}
                                />
                                <Text style={styles.achievementNumber}>{item.num}</Text>
                                <Text style={styles.achievementLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Section 5: Our Leaders - Cards Layout (Only if active slides exist) */}
                {showPresidentSection && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Our Leaders</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.leadersCardsContainer}
                        >
                            {presidentSlides.map((leader: any, index: number) => (
                                <View key={index} style={styles.leaderCard}>
                                    {/* Leader Image */}
                                    <View style={styles.leaderCardImageWrapper}>
                                        <Image
                                            source={{ uri: leader.image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0' }}
                                            style={styles.leaderCardImage}
                                            resizeMode="contain"
                                        />
                                        {/* Badge */}
                                        <View style={styles.leaderCardBadge}>
                                            <Text style={styles.leaderCardBadgeText}>{leader.badge || 'Leader'}</Text>
                                        </View>
                                    </View>

                                    {/* Leader Info */}
                                    <View style={styles.leaderCardInfo}>
                                        <Text style={styles.leaderCardName}>{leader.name || 'Name'}</Text>
                                        <Text style={styles.leaderCardSubtitle}>{leader.subtitle || ''}</Text>

                                        {/* Quote */}
                                        {leader.quote && (
                                            <View style={styles.leaderCardQuote}>
                                                <MaterialCommunityIcons name="format-quote-open" size={16} color={SP_RED} />
                                                <Text style={styles.leaderCardQuoteText} numberOfLines={3}>
                                                    {leader.quote}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Achievements */}
                                        {leader.achievements && leader.achievements.length > 0 && (
                                            <View style={styles.leaderCardAchievements}>
                                                {leader.achievements.slice(0, 2).map((ach: string, idx: number) => (
                                                    <View key={idx} style={styles.leaderCardAchievementItem}>
                                                        <MaterialCommunityIcons name="check-circle" size={14} color={SP_GREEN} />
                                                        <Text style={styles.leaderCardAchievementText} numberOfLines={1}>{ach}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Section 6: Party History & Legacy - Dynamic */}
                <View style={[styles.section, { backgroundColor: '#fff' }]}>
                    <Text style={styles.sectionTitle}>{legacyData.title}</Text>

                    {/* Legacy Leaders Carousel */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.leadersCardsContainer}
                    >
                        {legacyData.leaders.map((leader: any, index: number) => (
                            <View key={index} style={styles.legacyLeaderCard}>
                                <Image
                                    source={{ uri: leader.image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0' }}
                                    style={styles.legacyLeaderImage}
                                    resizeMode="contain"
                                />
                                <View style={styles.legacyLeaderInfo}>
                                    <Text style={styles.legacyLeaderName}>{leader.name}</Text>
                                    <Text style={styles.legacyLeaderRole}>{leader.role}</Text>
                                    {leader.description && (
                                        <Text style={styles.legacyLeaderDesc} numberOfLines={3}>
                                            {leader.description}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>



                </View>

                {/* Section 7: Our Programs - Dynamic */}
                {programsData.items.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{programsData.title}</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.leadersCardsContainer}
                        >
                            {programsData.items.map((program: any, index: number) => (
                                <View key={index} style={styles.programCard}>
                                    {program.image ? (
                                        <Image
                                            source={{ uri: program.image }}
                                            style={styles.programCardImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={index % 2 === 0 ? [SP_RED, '#991b1b'] : [SP_GREEN, '#166534']}
                                            style={styles.programCardGradient}
                                        >
                                            <MaterialCommunityIcons
                                                name={program.icon || 'star'}
                                                size={48}
                                                color="#fff"
                                            />
                                        </LinearGradient>
                                    )}
                                    <View style={styles.programCardContent}>
                                        <Text style={styles.programCardTitle}>{program.title}</Text>
                                        <Text style={styles.programCardDesc} numberOfLines={2}>{program.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Section 8: Join the Movement */}
                < View style={styles.joinSection} >
                    <LinearGradient colors={[SP_RED, '#991b1b']} style={styles.joinGradient}>
                        <MaterialCommunityIcons name="account-multiple-plus" size={64} color="#fff" />
                        <Text style={styles.joinTitle}>Be a Part of Change</Text>
                        <Text style={styles.joinSubtitle}>Join thousands of volunteers working for a better tomorrow</Text>
                        <View style={styles.joinButtons}>
                            <Button
                                mode="contained"
                                buttonColor="#fff"
                                textColor={SP_RED}
                                style={styles.joinButton}
                                onPress={() => router.push('/joinus' as any)}
                            >
                                Join as Volunteer
                            </Button>
                            <Button
                                mode="outlined"
                                textColor="#fff"
                                style={[styles.joinButton, { borderColor: '#fff' }]}
                                onPress={() => router.push('/contact' as any)}
                            >
                                Contact Us
                            </Button>
                        </View>
                    </LinearGradient>
                </View >



                {/* Section 10: Interactive Tools */}
                < View style={[styles.section, { backgroundColor: '#f1f5f9' }]} >
                    <TranslatedText text="Interact with Us" style={styles.sectionTitle} />
                    <View style={styles.interactGrid}>
                        <Pressable style={styles.interactCard} onPress={() => router.push('/idcard' as any)}>
                            <MaterialCommunityIcons name="card-account-details" size={56} color={SP_RED} />
                            <Text style={styles.interactTitle}>Get ID Card</Text>
                            <Text style={styles.interactDesc}>Download your official member ID</Text>
                        </Pressable>
                        <Pressable style={styles.interactCard} onPress={() => router.push('/events' as any)}>
                            <MaterialCommunityIcons name="calendar-star" size={56} color={SP_GREEN} />
                            <Text style={styles.interactTitle}>Upcoming Events</Text>
                            <Text style={styles.interactDesc}>View and register for events</Text>
                        </Pressable>
                        <Pressable style={styles.interactCard} onPress={() => router.push('/volunteers' as any)}>
                            <MaterialCommunityIcons name="map-marker-radius" size={56} color={SP_RED} />
                            <Text style={styles.interactTitle}>Find Volunteers</Text>
                            <Text style={styles.interactDesc}>Connect with nearby members</Text>
                        </Pressable>
                        <Pressable style={styles.interactCard} onPress={() => router.push('/contact' as any)}>
                            <MaterialCommunityIcons name="email-outline" size={56} color={SP_GREEN} />
                            <Text style={styles.interactTitle}>Contact Support</Text>
                            <Text style={styles.interactDesc}>Get help from our team</Text>
                        </Pressable>
                    </View>
                </View >

                {/* Section: Custom Pages */}
                {pages.length > 0 && (
                    <View style={[styles.section, { backgroundColor: '#fff' }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Explore Pages</Text>
                            <Button mode="text" textColor={SP_RED} onPress={() => router.push('/pages' as any)}>
                                View All →
                            </Button>
                        </View>
                        <View style={styles.programsGrid}>
                            {pages.map((page, index) => (
                                <Pressable
                                    key={page._id || index}
                                    style={styles.explorePageCard}
                                    onPress={() => router.push(`/pages/${page._id}` as any)}
                                >
                                    <LinearGradient
                                        colors={[
                                            index % 4 === 0 ? '#fef2f2' : index % 4 === 1 ? '#f0fdf4' : index % 4 === 2 ? '#eff6ff' : '#fef3c7',
                                            index % 4 === 0 ? '#fecaca' : index % 4 === 1 ? '#bbf7d0' : index % 4 === 2 ? '#bfdbfe' : '#fde68a'
                                        ]}
                                        style={styles.explorePageGradient}
                                    >
                                        <MaterialCommunityIcons
                                            name="file-document-outline"
                                            size={40}
                                            color={index % 4 === 0 ? SP_RED : index % 4 === 1 ? SP_GREEN : index % 4 === 2 ? '#2563eb' : '#d97706'}
                                        />
                                    </LinearGradient>
                                    <View style={styles.explorePageContent}>
                                        <Text style={styles.explorePageTitle}>{page.title}</Text>
                                        <Text style={styles.explorePageDesc}>View Details →</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                <Footer />
            </ScrollView >
        </View >
    );
}

function getPlatformIcon(platform: string): any {
    switch (platform?.toLowerCase()) {
        case 'facebook': return 'facebook';
        case 'twitter': return 'twitter';
        case 'instagram': return 'instagram';
        case 'youtube': return 'youtube';
        default: return 'share-variant';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontWeight: '700',
        color: SP_RED,
    },
    navMenu: {
        flexDirection: 'row',
        gap: 32,
        alignItems: 'center',
    },
    navItem: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    langSwitch: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    loginBtn: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    signupBtn: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 24,
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
    // Hero Section Styles
    heroSection: {
        backgroundColor: '#fef3f2',
        paddingHorizontal: 60,
        paddingVertical: 80,
        width: '100%',
        alignItems: 'center',
    },
    heroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 60,
        width: '100%',
        maxWidth: 1600,
    },
    heroLeft: {
        flex: 1,
        paddingRight: 40,
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
        marginBottom: 24,
    },
    heroBadgeText: {
        fontSize: 14,
        color: SP_RED,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 56,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 20,
        lineHeight: 68,
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#64748b',
        lineHeight: 28,
        marginBottom: 32,
    },
    heroButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    heroPrimaryBtn: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 8,
    },
    heroPrimaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    heroSecondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    heroSecondaryBtnText: {
        color: SP_RED,
        fontSize: 16,
        fontWeight: '600',
    },
    heroTitleHighlight: {
        color: SP_RED,
    },
    // Hero Stats
    heroStats: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginVertical: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    heroStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    heroStatNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: SP_RED,
        marginBottom: 4,
    },
    heroStatLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
    heroStatDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 12,
    },
    // Hero Highlights
    heroHighlights: {
        gap: 12,
        marginBottom: 24,
    },
    heroHighlightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    heroHighlightText: {
        fontSize: 15,
        color: '#475569',
        fontWeight: '500',
    },
    // Trust Badges
    heroTrustBadges: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    trustBadgeText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    heroRight: {
        flex: 1,
        position: 'relative',
        alignItems: 'center',
    },
    heroImageWrapper: {
        position: 'relative',
        width: '100%',
        marginBottom: 20,
    },
    heroMainImage: {
        width: '100%',
        height: 500,
        borderRadius: 20,
    },
    heroFloatingCard: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
        maxWidth: 280,
    },
    floatingCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingCardContent: {
        flex: 1,
    },
    floatingCardTitle: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    floatingCardText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    heroSecondaryImages: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    secondaryImageCard: {
        flex: 1,
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    secondaryImage: {
        width: '100%',
        height: 150,
    },
    secondaryImageLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
    heroDecoCircle1: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFE5E5',
        top: -20,
        right: -20,
        zIndex: -1,
    },
    heroDecoCircle2: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFD4D4',
        bottom: 40,
        left: -20,
        zIndex: -1,
    },
    // Action Bar Styles
    actionBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginTop: 40,
        gap: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    actionCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingRight: 20,
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    actionCardContent: {
        flex: 1,
    },
    actionCardLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    actionCardValue: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '600',
    },
    actionSearchBtn: {
        backgroundColor: SP_RED,
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        width: '100%',
        paddingVertical: 80,
        paddingHorizontal: 60,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 42,
        fontWeight: '800',
        color: '#1e293b',
    },
    newsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    newsCard: {
        width: '32%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    newsImage: {
        width: '100%',
        height: 200,
    },
    newsContent: {
        padding: 20,
    },
    newsDate: {
        fontSize: 12,
        color: SP_RED,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 26,
    },
    newsExcerpt: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 22,
    },
    galleryScroll: {
        paddingRight: 60,
        gap: 20,
    },
    galleryItem: {
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    galleryImage: {
        width: '100%',
        height: 360,
    },
    galleryTitle: {
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    achievementsGrid: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 40,
    },
    achievementCard: {
        flex: 1,
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
    },
    achievementNumber: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1e293b',
        marginTop: 16,
    },
    achievementLabel: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
    },
    // Leader Section Styles - Premium Edition
    leaderSection: {
        width: '100%',
        paddingVertical: 100,
        backgroundColor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden',
    },
    leaderDecoTop: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(227, 5, 18, 0.05)',
    },
    leaderDecoBottom: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(0, 153, 51, 0.05)',
    },
    leaderContainer: {
        flexDirection: 'row',
        maxWidth: 1400,
        alignSelf: 'center',
        gap: 80,
        paddingHorizontal: 60,
        zIndex: 1,
    },
    leaderLeftSide: {
        width: 420,
    },
    leaderImageWrapper: {
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
    },
    leaderImage: {
        width: '100%',
        height: 520,
    },
    leaderLogoOverlay: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    leaderLogoBadge: {

        borderRadius: 80,
        width: 400,
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',

        padding: 16,
    },
    leaderLogoImage: {
        width: '100%',
        height: '100%',
    },
    leaderQuickStats: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginTop: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    quickStatItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    quickStatLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
    quickStatValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    quickStatDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 10,
    },
    leaderInfo: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    leaderHeaderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    leaderBadgeIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaderBadge: {
        fontSize: 13,
        color: SP_RED,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    leaderName: {
        fontSize: 52,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12,
        lineHeight: 60,
    },
    leaderSubtitle: {
        fontSize: 20,
        color: '#64748b',
        marginBottom: 28,
        fontWeight: '500',
    },
    leaderQuoteWrapper: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: SP_RED,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quoteIconWrapper: {
        marginBottom: 12,
    },
    leaderQuote: {
        fontSize: 17,
        color: '#334155',
        lineHeight: 28,
        fontStyle: 'italic',
    },
    leaderAchievements: {
        marginBottom: 32,
    },
    achievementsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    achievementsList: {
        gap: 12,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    achievementText: {
        fontSize: 15,
        color: '#475569',
        flex: 1,
    },
    leaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
    },
    leaderPrimaryBtn: {
        backgroundColor: SP_RED,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 10,
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    leaderPrimaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    leaderSocialLinks: {
        flexDirection: 'row',
        gap: 12,
    },
    socialIconBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    legacyGrid: {
        flexDirection: 'row',
        gap: 32,
        marginTop: 40,
    },
    legacyCard: {
        flex: 1,
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
    },
    legacyImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },
    legacyName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 12,
    },
    legacyRole: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    legacyText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 12,
    },
    legacySubtext: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    tasksGrid: {
        flexDirection: 'row',
        gap: 24,
    },
    taskCard: {
        flex: 1,
        padding: 32,
        backgroundColor: '#fff',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    taskIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    taskPoints: {
        fontSize: 16,
        fontWeight: '700',
        color: SP_GREEN,
    },
    joinSection: {
        width: '100%',
        paddingVertical: 80,
        paddingHorizontal: 60,
    },
    joinGradient: {
        padding: 80,
        borderRadius: 24,
        alignItems: 'center',
    },
    joinTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        marginTop: 24,
        marginBottom: 16,
    },
    joinSubtitle: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 32,
        textAlign: 'center',
    },
    joinButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    joinButton: {
        paddingHorizontal: 32,
        paddingVertical: 8,
    },
    programsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        marginTop: 40,
    },
    programCard: {
        width: '23%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    programImage: {
        width: '100%',
        height: 160,
    },
    programContent: {
        padding: 20,
    },
    programTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    programDesc: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    interactGrid: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 40,
    },
    interactCard: {
        flex: 1,
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    interactTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    interactDesc: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    footer: {
        backgroundColor: '#0f172a',
        paddingTop: 80,
        paddingBottom: 40,
    },
    footerContent: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 60,
        marginBottom: 60,
        gap: 40,
    },
    footerColumn: {
        flex: 1,
    },
    footerLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    footerBrand: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    footerDesc: {
        color: '#94a3b8',
        lineHeight: 24,
        marginBottom: 24,
    },
    footerHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 20,
    },
    footerLink: {
        color: '#94a3b8',
        marginBottom: 12,
        fontSize: 15,
    },
    footerText: {
        color: '#94a3b8',
        marginBottom: 8,
        fontSize: 14,
    },
    socialLinks: {
        flexDirection: 'row',
        gap: 16,
    },
    footerBottom: {
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        paddingTop: 30,
        alignItems: 'center',
    },
    copyright: {
        color: '#64748b',
        fontSize: 14,
    },
    // Slide Indicators
    slideIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    slideIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ddd',
    },
    slideIndicatorActive: {
        backgroundColor: SP_RED,
        width: 30,
    },
    // Leader Cards Styles
    leadersCardsContainer: {
        paddingHorizontal: 60,
        gap: 24,
        paddingVertical: 20,
    },
    leaderCard: {
        width: 320,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
    leaderCardImageWrapper: {
        position: 'relative',
        height: 200,
    },
    leaderCardImage: {
        width: '100%',
        height: '100%',
    },
    leaderCardBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: SP_RED,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    leaderCardBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    leaderCardInfo: {
        padding: 20,
    },
    leaderCardName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    leaderCardSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
    },
    leaderCardQuote: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    leaderCardQuoteText: {
        flex: 1,
        fontSize: 13,
        color: '#374151',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    leaderCardAchievements: {
        marginTop: 8,
        gap: 6,
    },
    leaderCardAchievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    leaderCardAchievementText: {
        flex: 1,
        fontSize: 12,
        color: '#4b5563',
    },
    // Legacy Leader Card Styles
    legacyLeaderCard: {
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    legacyLeaderImage: {
        width: '100%',
        height: 200,
    },
    legacyLeaderInfo: {
        padding: 16,
    },
    legacyLeaderName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    legacyLeaderRole: {
        fontSize: 14,
        color: SP_RED,
        fontWeight: '600',
        marginBottom: 8,
    },
    legacyLeaderDesc: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
    },
    legacyCardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 24,
        justifyContent: 'center',
    },
    legacyAchievementCard: {
        width: 180,
        padding: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    // Program Card Styles
    programCardImage: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f8fafc', // Light bg for contain mode
    },
    programCardGradient: {
        width: '100%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    programCardContent: {
        padding: 16,
    },
    programCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    programCardDesc: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
    },
    // Explore Page Card Styles
    explorePageCard: {
        width: 220,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    explorePageGradient: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    explorePageContent: {
        padding: 16,
    },
    explorePageTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    explorePageDesc: {
        fontSize: 13,
        color: SP_RED,
        fontWeight: '600',
    },
});
