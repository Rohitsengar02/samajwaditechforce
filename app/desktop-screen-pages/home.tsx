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

export default function DesktopHome() {
    const router = useRouter();
    const [news, setNews] = useState<any[]>([]);
    const [posters, setPosters] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMegaMenu, setShowMegaMenu] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const url = getApiUrl();
            const token = await AsyncStorage.getItem('userToken');
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

            const newsRes = await fetch(`${url}/news`);
            const newsData = await newsRes.json();
            if (newsData.success && Array.isArray(newsData.data)) setNews(newsData.data);

            const postersRes = await fetch(`${url}/posters`);
            const postersData = await postersRes.json();
            if (postersData.posters && Array.isArray(postersData.posters)) setPosters(postersData.posters);

            const tasksRes = await fetch(`${url}/tasks`, { headers });
            const tasksData = await tasksRes.json();
            if (tasksData.success && Array.isArray(tasksData.data)) setTasks(tasksData.data);

        } catch (error) {
            console.error('Error fetching home data:', error);
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

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header/Navigation */}
                <View style={styles.header}>
                    <Text style={styles.headerLogo}>समाजवादी पार्टी</Text>
                    <View style={styles.navMenu}>
                        <Pressable onPress={() => router.push('/desktop-screen-pages/home' as any)}>
                            <Text style={styles.navItem}>Home</Text>
                        </Pressable>
                        <Pressable onPress={() => router.push('/desktop-screen-pages/news' as any)}>
                            <Text style={styles.navItem}>News</Text>
                        </Pressable>
                        <Pressable onPress={() => router.push('/desktop-screen-pages/events' as any)}>
                            <Text style={styles.navItem}>Events</Text>
                        </Pressable>

                        <Pressable onPress={() => router.push('/desktop-screen-pages/about' as any)}>
                            <Text style={styles.navItem}>About</Text>
                        </Pressable>
                        <Pressable onPress={() => router.push('/desktop-screen-pages/volunteers' as any)}>
                            <Text style={styles.navItem}>Volunteers</Text>
                        </Pressable>
                        <Pressable onPress={() => router.push('/desktop-screen-pages/daily-work' as any)}>
                            <Text style={styles.navItem}>Daily Work</Text>
                        </Pressable>

                        {/* Quick Access Dropdown */}
                        <View style={styles.dropdownWrapper}>
                            <Pressable
                                style={styles.dropdownTrigger}
                                onPress={() => setShowMegaMenu(!showMegaMenu)}
                            >
                                <Text style={styles.navItem}>Quick Access</Text>
                                <MaterialCommunityIcons
                                    name={showMegaMenu ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#1e293b"
                                />
                            </Pressable>

                            {showMegaMenu && (
                                <View style={styles.megaMenu}>
                                    <View style={styles.megaMenuGrid}>
                                        {/* Row 1 */}
                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/posters' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: `${SP_GREEN}15` }]}>
                                                <MaterialCommunityIcons name="image-multiple" size={24} color={SP_GREEN} />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>Posters</Text>
                                                <Text style={styles.megaMenuSubtitle}>Download & customize</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/desktop-screen-pages/leaderboard' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: `${SP_GREEN}15` }]}>
                                                <MaterialCommunityIcons name="chart-bar" size={24} color={SP_GREEN} />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>Leaderboard</Text>
                                                <Text style={styles.megaMenuSubtitle}>Check your rank</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/desktop-screen-pages/daily-work' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: '#F59E0B15' }]}>
                                                <MaterialCommunityIcons name="calendar-check" size={24} color="#F59E0B" />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>Daily Work</Text>
                                                <Text style={styles.megaMenuSubtitle}>Tasks & Rewards</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/desktop-screen-pages/resources' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: '#9333EA15' }]}>
                                                <MaterialCommunityIcons name="library" size={24} color="#9333EA" />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>Resources</Text>
                                                <Text style={styles.megaMenuSubtitle}>Library & Tools</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/desktop-screen-pages/communication' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: '#2563EB15' }]}>
                                                <MaterialCommunityIcons name="forum" size={24} color="#2563EB" />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>Communication</Text>
                                                <Text style={styles.megaMenuSubtitle}>Discuss & Suggest</Text>
                                            </View>
                                        </Pressable>

                                        {/* Row 2 */}
                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/desktop-screen-pages/news' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: `${SP_RED}15` }]}>
                                                <MaterialCommunityIcons name="newspaper" size={24} color={SP_RED} />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>Samajwadi Updates</Text>
                                                <Text style={styles.megaMenuSubtitle}>Stay updated</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/desktop-screen-pages/training' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: '#3B82F615' }]}>
                                                <MaterialCommunityIcons name="school" size={24} color="#3B82F6" />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>Training</Text>
                                                <Text style={styles.megaMenuSubtitle}>Learn & grow</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/idcard' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: '#EF444415' }]}>
                                                <MaterialCommunityIcons name="card-account-details" size={24} color="#EF4444" />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>ID Card</Text>
                                                <Text style={styles.megaMenuSubtitle}>Digital identity</Text>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            style={styles.megaMenuItem}
                                            onPress={() => { router.push('/desktop-screen-pages/reels' as any); setShowMegaMenu(false); }}
                                        >
                                            <View style={[styles.megaMenuIcon, { backgroundColor: '#E1306C15' }]}>
                                                <MaterialCommunityIcons name="play-box-multiple" size={24} color="#E1306C" />
                                            </View>
                                            <View style={styles.megaMenuText}>
                                                <Text style={styles.megaMenuTitle}>Reels</Text>
                                                <Text style={styles.megaMenuSubtitle}>Watch & Share</Text>
                                            </View>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <Text style={styles.langSwitch}>EN</Text>
                        <Pressable onPress={() => router.push('/register' as any)}>
                            <Text style={styles.loginBtn}>Login</Text>
                        </Pressable>
                        <Pressable
                            style={styles.signupBtn}
                            onPress={() => router.push('/joinus' as any)}
                        >
                            <Text style={styles.signupBtnText}>Join Us</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Section 1: Enhanced Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroContainer}>
                        {/* Left Content */}
                        <View style={styles.heroLeft}>
                            <View style={styles.heroBadge}>
                                <MaterialCommunityIcons name="star-circle" size={20} color={SP_RED} />
                                <Text style={styles.heroBadgeText}>भारत की सबसे बड़ी समाजवादी पार्टी</Text>
                            </View>

                            <Text style={styles.heroTitle}>
                                समाजवादी पार्टी में{'\n'}
                                <Text style={styles.heroTitleHighlight}>आपका स्वागत है!</Text>
                            </Text>

                            <Text style={styles.heroSubtitle}>
                                समाज के हर वर्ग के विकास के लिए समर्पित। समानता, न्याय और समृद्धि के लिए
                                हमारे साथ जुड़ें और उत्तर प्रदेश को विकास की नई ऊंचाइयों पर ले जाएं।
                            </Text>

                            {/* Hero stats */}
                            <View style={styles.heroStats}>
                                <View style={styles.heroStatItem}>
                                    <Text style={styles.heroStatNumber}>25L+</Text>
                                    <Text style={styles.heroStatLabel}>सक्रिय सदस्य</Text>
                                </View>
                                <View style={styles.heroStatDivider} />
                                <View style={styles.heroStatItem}>
                                    <Text style={styles.heroStatNumber}>75+</Text>
                                    <Text style={styles.heroStatLabel}>सीटें जीतीं</Text>
                                </View>
                                <View style={styles.heroStatDivider} />
                                <View style={styles.heroStatItem}>
                                    <Text style={styles.heroStatNumber}>1000+</Text>
                                    <Text style={styles.heroStatLabel}>विकास परियोजनाएं</Text>
                                </View>
                            </View>

                            {/* Key Highlights */}
                            <View style={styles.heroHighlights}>
                                <View style={styles.heroHighlightItem}>
                                    <MaterialCommunityIcons name="check-decagram" size={20} color={SP_GREEN} />
                                    <Text style={styles.heroHighlightText}>Free Laptop योजना</Text>
                                </View>
                                <View style={styles.heroHighlightItem}>
                                    <MaterialCommunityIcons name="check-decagram" size={20} color={SP_GREEN} />
                                    <Text style={styles.heroHighlightText}>किसान पेंशन योजना</Text>
                                </View>
                                <View style={styles.heroHighlightItem}>
                                    <MaterialCommunityIcons name="check-decagram" size={20} color={SP_GREEN} />
                                    <Text style={styles.heroHighlightText}>रोजगार गारंटी</Text>
                                </View>
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

                        {/* Right Image */}
                        <View style={styles.heroRight}>
                            {/* Main Image */}
                            <View style={styles.heroImageWrapper}>
                                <Image
                                    source={{ uri: news[0]?.coverImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0' }}
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

                            {/* Secondary Images Grid */}
                            <View style={styles.heroSecondaryImages}>
                                <View style={styles.secondaryImageCard}>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400' }}
                                        style={styles.secondaryImage}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.secondaryImageLabel}>जन सभा</Text>
                                </View>
                                <View style={styles.secondaryImageCard}>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400' }}
                                        style={styles.secondaryImage}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.secondaryImageLabel}>विकास कार्य</Text>
                                </View>
                            </View>

                            <View style={styles.heroDecoCircle1} />
                            <View style={styles.heroDecoCircle2} />
                        </View>
                    </View>


                </View>

                {/* Section 2: News Updates */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Latest News Updates</Text>
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
                </View>

                {/* Section 3: Media Gallery / Posters */}
                <View style={[styles.section, { backgroundColor: '#f8fafc' }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Campaign Gallery</Text>
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
                </View>

                {/* Section 4: Party Achievements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Track Record</Text>
                    <View style={styles.achievementsGrid}>
                        <View style={styles.achievementCard}>
                            <MaterialCommunityIcons name="account-group" size={48} color={SP_RED} />
                            <Text style={styles.achievementNumber}>10L+</Text>
                            <Text style={styles.achievementLabel}>Active Members</Text>
                        </View>
                        <View style={styles.achievementCard}>
                            <MaterialCommunityIcons name="city" size={48} color={SP_GREEN} />
                            <Text style={styles.achievementNumber}>75</Text>
                            <Text style={styles.achievementLabel}>Districts Covered</Text>
                        </View>
                        <View style={styles.achievementCard}>
                            <MaterialCommunityIcons name="checkbox-marked-circle" size={48} color={SP_RED} />
                            <Text style={styles.achievementNumber}>1M+</Text>
                            <Text style={styles.achievementLabel}>Tasks Completed</Text>
                        </View>
                        <View style={styles.achievementCard}>
                            <MaterialCommunityIcons name="bullhorn" size={48} color={SP_GREEN} />
                            <Text style={styles.achievementNumber}>5000+</Text>
                            <Text style={styles.achievementLabel}>Campaigns Run</Text>
                        </View>
                    </View>
                </View>

                {/* Section 5: Party President - Premium Edition */}
                <View style={styles.leaderSection}>
                    {/* Decorative Background Elements */}
                    <View style={styles.leaderDecoTop} />
                    <View style={styles.leaderDecoBottom} />

                    <View style={styles.leaderContainer}>
                        {/* Left Side - Image & Logo */}
                        <View style={styles.leaderLeftSide}>
                            <View style={styles.leaderImageWrapper}>
                                <Image
                                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Akhilesh_Yadav_Lok_Sabha.jpg' }}
                                    style={styles.leaderImage}
                                    resizeMode="cover"
                                />
                                {/* Party Logo Overlay */}
                                <View style={styles.leaderLogoOverlay}>
                                    <View style={styles.leaderLogoBadge}>
                                        <Image
                                            source={require('../../assets/images/icon.png')}
                                            style={styles.leaderLogoImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Quick Stats Below Image */}
                            <View style={styles.leaderQuickStats}>
                                <View style={styles.quickStatItem}>
                                    <MaterialCommunityIcons name="calendar-check" size={20} color={SP_GREEN} />
                                    <Text style={styles.quickStatLabel}>In Office Since</Text>
                                    <Text style={styles.quickStatValue}>2017</Text>
                                </View>
                                <View style={styles.quickStatDivider} />
                                <View style={styles.quickStatItem}>
                                    <MaterialCommunityIcons name="trophy-award" size={20} color="#FFB800" />
                                    <Text style={styles.quickStatLabel}>Awards</Text>
                                    <Text style={styles.quickStatValue}>15+</Text>
                                </View>
                            </View>
                        </View>

                        {/* Right Side - Info & Content */}
                        <View style={styles.leaderInfo}>
                            {/* Header Badge */}
                            <View style={styles.leaderHeaderBadge}>
                                <View style={styles.leaderBadgeIcon}>
                                    <MaterialCommunityIcons name="shield-star" size={18} color={SP_RED} />
                                </View>
                                <Text style={styles.leaderBadge}>National President</Text>
                            </View>

                            {/* Name & Title */}
                            <Text style={styles.leaderName}>Akhilesh Yadav</Text>
                            <Text style={styles.leaderSubtitle}>समाजवादी पार्टी के राष्ट्रीय अध्यक्ष</Text>

                            {/* Quote Section */}
                            <View style={styles.leaderQuoteWrapper}>
                                <View style={styles.quoteIconWrapper}>
                                    <MaterialCommunityIcons name="format-quote-open" size={32} color={SP_RED} />
                                </View>
                                <Text style={styles.leaderQuote}>
                                    "समाजवाद का अर्थ है - समानता, न्याय और विकास। हम हर वर्ग के लोगों के लिए काम कर रहे हैं और उत्तर प्रदेश को देश का सबसे विकसित राज्य बनाएंगे।"
                                </Text>
                            </View>

                            {/* Key Achievements */}
                            <View style={styles.leaderAchievements}>
                                <Text style={styles.achievementsTitle}>Key Achievements</Text>
                                <View style={styles.achievementsList}>
                                    <View style={styles.achievementItem}>
                                        <MaterialCommunityIcons name="check-circle" size={20} color={SP_GREEN} />
                                        <Text style={styles.achievementText}>Former Chief Minister of UP (2012-2017)</Text>
                                    </View>
                                    <View style={styles.achievementItem}>
                                        <MaterialCommunityIcons name="check-circle" size={20} color={SP_GREEN} />
                                        <Text style={styles.achievementText}>Member of 17th Lok Sabha</Text>
                                    </View>
                                    <View style={styles.achievementItem}>
                                        <MaterialCommunityIcons name="check-circle" size={20} color={SP_GREEN} />
                                        <Text style={styles.achievementText}>Launched 1000+ Development Projects</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Social Links & CTA */}
                            <View style={styles.leaderActions}>
                                <Pressable
                                    style={styles.leaderPrimaryBtn}
                                    onPress={() => router.push('/about' as any)}
                                >
                                    <Text style={styles.leaderPrimaryBtnText}>Read Full Biography</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                                </Pressable>

                                <View style={styles.leaderSocialLinks}>
                                    <Pressable style={styles.socialIconBtn}>
                                        <MaterialCommunityIcons name="twitter" size={24} color="#1DA1F2" />
                                    </Pressable>
                                    <Pressable style={styles.socialIconBtn}>
                                        <MaterialCommunityIcons name="facebook" size={24} color="#1877F2" />
                                    </Pressable>
                                    <Pressable style={styles.socialIconBtn}>
                                        <MaterialCommunityIcons name="instagram" size={24} color="#E4405F" />
                                    </Pressable>
                                    <Pressable style={styles.socialIconBtn}>
                                        <MaterialCommunityIcons name="youtube" size={24} color="#FF0000" />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section 6: Party History & Legacy */}
                <View style={[styles.section, { backgroundColor: '#fff' }]}>
                    <Text style={styles.sectionTitle}>Our Legacy</Text>
                    <View style={styles.legacyGrid}>
                        <View style={styles.legacyCard}>
                            <Image
                                source={{ uri: 'https://i.pinimg.com/474x/a5/ba/d8/a5bad8e597e3fb5b4256385476659dc9.jpg' }}
                                style={styles.legacyImage}
                            />
                            <Text style={styles.legacyName}>Mulayam Singh Yadav</Text>
                            <Text style={styles.legacyRole}>Founder</Text>
                        </View>
                        <View style={styles.legacyCard}>
                            <MaterialCommunityIcons name="history" size={80} color={SP_RED} />
                            <Text style={styles.legacyText}>Founded in 1992</Text>
                            <Text style={styles.legacySubtext}>30+ Years of Service</Text>
                        </View>
                        <View style={styles.legacyCard}>
                            <MaterialCommunityIcons name="trophy" size={80} color={SP_GREEN} />
                            <Text style={styles.legacyText}>Multiple Terms</Text>
                            <Text style={styles.legacySubtext}>3 CM Tenures</Text>
                        </View>
                    </View>
                </View>




                {/* Section 8: Join the Movement */}
                <View style={styles.joinSection}>
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
                </View>

                {/* Section 9: Programs & Initiatives */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Programs</Text>
                    <View style={styles.programsGrid}>
                        <View style={styles.programCard}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644' }}
                                style={styles.programImage}
                            />
                            <View style={styles.programContent}>
                                <Text style={styles.programTitle}>Youth Employment</Text>
                                <Text style={styles.programDesc}>Creating job opportunities for youth</Text>
                            </View>
                        </View>
                        <View style={styles.programCard}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4' }}
                                style={styles.programImage}
                            />
                            <View style={styles.programContent}>
                                <Text style={styles.programTitle}>Farmer Welfare</Text>
                                <Text style={styles.programDesc}>Supporting agricultural community</Text>
                            </View>
                        </View>
                        <View style={styles.programCard}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a' }}
                                style={styles.programImage}
                            />
                            <View style={styles.programContent}>
                                <Text style={styles.programTitle}>Education for All</Text>
                                <Text style={styles.programDesc}>Quality education accessible to everyone</Text>
                            </View>
                        </View>
                        <View style={styles.programCard}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6' }}
                                style={styles.programImage}
                            />
                            <View style={styles.programContent}>
                                <Text style={styles.programTitle}>Women Empowerment</Text>
                                <Text style={styles.programDesc}>Empowering women through various schemes</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section 10: Interactive Tools */}
                <View style={[styles.section, { backgroundColor: '#f1f5f9' }]}>
                    <Text style={styles.sectionTitle}>Interact with Us</Text>
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
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <View style={styles.footerColumn}>
                            <View style={styles.footerLogo}>
                                <MaterialCommunityIcons name="bicycle" size={40} color="#fff" />
                                <Text style={styles.footerBrand}>Samajwadi Tech Force</Text>
                            </View>
                            <Text style={styles.footerDesc}>
                                The official digital wing of Samajwadi Party, dedicated to spreading the message of development and social justice.
                            </Text>
                            <View style={styles.socialLinks}>
                                <MaterialCommunityIcons name="facebook" size={28} color="#fff" />
                                <MaterialCommunityIcons name="twitter" size={28} color="#fff" />
                                <MaterialCommunityIcons name="instagram" size={28} color="#fff" />
                                <MaterialCommunityIcons name="youtube" size={28} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerHeading}>Quick Links</Text>
                            <Text style={styles.footerLink} onPress={() => router.push('/about' as any)}>About Us</Text>
                            <Text style={styles.footerLink} onPress={() => router.push('/news' as any)}>Latest News</Text>
                            <Text style={styles.footerLink} onPress={() => router.push('/joinus' as any)}>Join Us</Text>
                            <Text style={styles.footerLink} onPress={() => router.push('/contact' as any)}>Contact</Text>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerHeading}>Resources</Text>
                            <Text style={styles.footerLink} onPress={() => router.push('/posters' as any)}>Posters</Text>
                            <Text style={styles.footerLink} onPress={() => router.push('/idcard' as any)}>ID Card</Text>
                            <Text style={styles.footerLink} onPress={() => router.push('/daily-work' as any)}>Daily Tasks</Text>
                            <Text style={styles.footerLink} onPress={() => router.push('/events' as any)}>Events</Text>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerHeading}>Contact Info</Text>
                            <Text style={styles.footerText}>Samajwadi Party HQ</Text>
                            <Text style={styles.footerText}>19, Vikramaditya Marg</Text>
                            <Text style={styles.footerText}>Lucknow, Uttar Pradesh</Text>
                            <Text style={styles.footerText}>Phone: 0522-2234455</Text>
                        </View>
                    </View>
                    <View style={styles.footerBottom}>
                        <Text style={styles.copyright}>© 2024 Samajwadi Tech Force. All rights reserved.</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
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
});
