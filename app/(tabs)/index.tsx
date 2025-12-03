import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../../components/TranslatedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';
import { DEFAULT_VOLUNTEERS } from '../../constants/volunteersData';

let volunteersData: any[] = [];
try {
  const rawData = require('./समाजवादी टेक फोर्स से जुड़ें — बने समाजवाद की डिजिटल आवाज़! (Responses) (5).json');
  volunteersData = (rawData as any).default || rawData;
  if (!Array.isArray(volunteersData) || volunteersData.length === 0) {
    volunteersData = DEFAULT_VOLUNTEERS;
  }
} catch (e) {
  console.log("Failed to load volunteers data from JSON, using default.", e);
  volunteersData = DEFAULT_VOLUNTEERS;
}

const { width, height } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Floating Particle Component
const FloatingParticle = ({ delay = 0, duration = 8000 }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            delay: duration - 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: -height,
          duration,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 30,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -30,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity,
          transform: [{ translateY }, { translateX }],
          left: Math.random() * width,
        },
      ]}
    />
  );
};

// Animated Quick Action Card
const QuickActionCard = ({ icon, title, subtitle, color, onPress, delay }: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }}>
      <TouchableOpacity
        style={styles.quickActionCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#fff', '#f8fafc']}
          style={styles.quickActionGradient}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
          </View>
          <View style={styles.quickActionContent}>
            <Text style={styles.quickActionTitle}>
              <TranslatedText>{title}</TranslatedText>
            </Text>
            <Text style={styles.quickActionSubtitle}>
              <TranslatedText>{subtitle}</TranslatedText>
            </Text>
          </View>
          <View style={[styles.quickActionArrow, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name="chevron-right" size={20} color={color} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated News Card
const NewsCard = ({ title, time, category, delay }: any) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
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
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
      <TouchableOpacity style={styles.newsCard} activeOpacity={0.9}>
        <LinearGradient
          colors={['#e2e8f0', '#cbd5e1']}
          style={styles.newsImage}
        >
          <MaterialCommunityIcons name="newspaper" size={40} color={SP_RED} style={{ opacity: 0.5 }} />
        </LinearGradient>
        <View style={styles.newsContent}>
          <View style={styles.newsCategoryBadge}>
            <View style={styles.categoryDot} />
            <Text style={styles.newsCategoryText}>
              <TranslatedText>{category}</TranslatedText>
            </Text>
          </View>
          <Text style={styles.newsTitle} numberOfLines={2}>
            <TranslatedText>{title}</TranslatedText>
          </Text>
          <View style={styles.newsFooter}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
            <Text style={styles.newsTime}>
              <TranslatedText>{time}</TranslatedText>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Feature Card with Animation
const FeatureCard = ({ icon, title, description, color, delay, route }: any) => {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.featureCard}
        activeOpacity={0.9}
        onPress={() => route && router.push(route as any)}
      >
        <Animated.View style={[styles.featureIconContainer, { transform: [{ rotate }] }]}>
          <LinearGradient
            colors={[color, color + 'CC']}
            style={styles.featureIconGradient}
          >
            <MaterialCommunityIcons name={icon} size={32} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.featureTitle}>
          <TranslatedText>{title}</TranslatedText>
        </Text>
        <Text style={styles.featureDescription}>
          <TranslatedText>{description}</TranslatedText>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

import DesktopHome from '../desktop-screen-pages/home';

export default function HomeScreen() {
  const router = useRouter();
  const isDesktop = width >= 768;

  if (isDesktop) {
    return <DesktopHome />;
  }
  const [headerHeight] = useState(new Animated.Value(0));
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [nearbyVolunteers, setNearbyVolunteers] = useState<any[]>([]);

  useEffect(() => {
    fetchNearbyVolunteers();
  }, []);

  const fetchNearbyVolunteers = async () => {
    // Map the raw data to the expected format
    const mapped = volunteersData.slice(0, 5)
      .filter((v: any) => v)
      .map((v: any) => ({
        Name: v['Column2'] || v['आपका पूरा नाम क्या है? '] || 'Unknown',
        District: v['Column4'] || v['जिला '] || 'Unknown',
        distance: null
      }));
    setNearbyVolunteers(mapped);
  };

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  useEffect(() => {
    // Header slide down animation
    Animated.spring(headerHeight, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Pulse animation for bicycle icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const quickActions = [
    { icon: 'image-multiple', title: 'Posters', subtitle: 'Download & customize', color: SP_GREEN, route: '/posters' },
    { icon: 'chart-bar', title: 'Leaderboard', subtitle: 'Check your rank', color: SP_GREEN, route: '/daily-work/leaderboard' },
    { icon: 'calendar-check', title: 'Daily Work', subtitle: 'Tasks & Rewards', color: '#F59E0B', route: '/daily-work' },
    { icon: 'library', title: 'Resources', subtitle: 'Library & Tools', color: '#9333EA', route: '/resources' },
    { icon: 'forum', title: 'Communication', subtitle: 'Discuss & Suggest', color: '#2563EB', route: '/communication' },
    { icon: 'newspaper', title: 'Samajwadi Updates', subtitle: 'Stay updated', color: SP_RED, route: '/news' },
    { icon: 'account-group', title: 'Nearby Volunteers', subtitle: 'Find help nearby', color: '#0891b2', route: '/nearby-volunteers' },

    { icon: 'school', title: 'Training', subtitle: 'Learn & grow', color: '#3B82F6', route: '/training' },
    { icon: 'card-account-details', title: 'ID Card', subtitle: 'Digital identity', color: '#EF4444', route: '/idcard' },
    { icon: 'play-box-multiple', title: 'Reels', subtitle: 'Watch & Share', color: '#E1306C', route: '/reels' },
  ];



  const features = [
    { icon: 'account-plus', title: 'Join Us', description: 'Become a member', color: SP_RED, route: '/joinus' },
    { icon: 'calendar-check', title: 'Events', description: 'Upcoming programs', color: SP_GREEN, route: '/events' },
    { icon: 'hand-heart', title: 'Volunteer', description: 'Make a difference', color: '#3B82F6', route: '/volunteers' },
    { icon: 'phone', title: 'Contact', description: 'Get in touch', color: '#F59E0B', route: '/contact' },
  ];

  return (
    <View style={styles.container}>
      {/* Floating Particles Background */}
      <View style={styles.particlesContainer}>
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 1000} duration={8000 + i * 1000} />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Header */}
        <Animated.View style={{ transform: [{ scale: headerHeight }] }}>
          <LinearGradient
            colors={[SP_RED, '#b91c1c', SP_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                  <MaterialCommunityIcons name="bicycle" size={40} color="#fff" />
                </Animated.View>
                <View>
                  <Text style={styles.headerTitle}>
                    <TranslatedText>समाजवादी टेक फ़ोर्स</TranslatedText>
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    <TranslatedText>Samajwadi Tech force</TranslatedText>
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push('/notifications' as any)}
              >
                <MaterialCommunityIcons name="bell" size={24} color="#fff" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>
                <TranslatedText>नमस्ते! 🙏</TranslatedText>
              </Text>
              <Text style={styles.welcomeSubtext}>
                <TranslatedText>Welcome to Samajwadi Tech Force</TranslatedText>
              </Text>
            </View>

            {/* Decorative Wave */}
            <View style={styles.waveContainer}>
              <View style={styles.wave} />
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={[styles.content, isDesktop && styles.desktopContent]}>
          {/* Samajwadi Updates Banner */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.idCardBanner}
              onPress={() => router.push('/news' as any)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[SP_RED, '#b91c1c', '#991b1b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.idCardGradient}
              >
                <View style={styles.idCardContent}>
                  <View style={styles.idCardLeft}>
                    <View style={styles.idCardIconContainer}>
                      <MaterialCommunityIcons name="newspaper" size={48} color="#fff" />
                    </View>
                    <View style={styles.idCardTextContainer}>
                      <Text style={styles.idCardTitle}>
                        <TranslatedText>Samajwadi Updates</TranslatedText>
                      </Text>
                      <Text style={styles.idCardSubtitle}>
                        <TranslatedText>Stay updated with latest news & announcements</TranslatedText>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.idCardButton}>
                    <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
                  </View>
                </View>

                <View style={styles.shimmer1} />
                <View style={styles.shimmer2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ID Card Banner with Shimmer Effect */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.idCardBanner}
              onPress={() => router.push('/idcard' as any)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[SP_GREEN, '#15803d', '#166534']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.idCardGradient}
              >
                <View style={styles.idCardContent}>
                  <View style={styles.idCardLeft}>
                    <View style={styles.idCardIconContainer}>
                      <MaterialCommunityIcons name="card-account-details" size={48} color="#fff" />
                    </View>
                    <View style={styles.idCardTextContainer}>
                      <Text style={styles.idCardTitle}>
                        <TranslatedText>Download Your ID Card</TranslatedText>
                      </Text>
                      <Text style={styles.idCardSubtitle}>
                        <TranslatedText>Get your digital identity card now</TranslatedText>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.idCardButton}>
                    <MaterialCommunityIcons name="download" size={24} color="#fff" />
                  </View>
                </View>

                <View style={styles.shimmer1} />
                <View style={styles.shimmer2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Nearby Volunteers Preview Section */}
          {nearbyVolunteers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <TranslatedText>Nearby Volunteers</TranslatedText>
                </Text>
                <TouchableOpacity onPress={() => router.push('/nearby-volunteers' as any)}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 24 }}>
                {nearbyVolunteers.map((volunteer, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.volunteerCard}
                    onPress={() => router.push('/nearby-volunteers' as any)}
                  >
                    <View style={styles.volunteerAvatar}>
                      <Text style={styles.volunteerInitials}>{volunteer.Name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.volunteerName}>{volunteer.Name}</Text>
                      <Text style={styles.volunteerDistrict}>{volunteer.District}</Text>
                      {volunteer.distance && (
                        <Text style={styles.volunteerDistance}>{volunteer.distance.toFixed(1)} km away</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <TranslatedText>Quick Actions</TranslatedText>
              </Text>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={SP_RED} />
            </View>
            <View style={styles.quickActionsContainer}>
              {quickActions.map((action, idx) => (
                <QuickActionCard
                  key={idx}
                  {...action}
                  delay={idx * 100}
                  onPress={() => router.push(action.route as any)}
                />
              ))}
            </View>
          </View>

          {/* About Section with Gradient */}
          <View style={styles.section}>
            <View style={styles.aboutCard}>
              <LinearGradient
                colors={[SP_RED, '#b91c1c', SP_DARK]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.aboutGradient}
              >
                <MaterialCommunityIcons name="bicycle" size={64} color="#fff" style={{ opacity: 0.2 }} />
                <Text style={styles.aboutTitle}>
                  <TranslatedText>साइकिल चलाओ देश बचाओ</TranslatedText>
                </Text>
                <Text style={styles.aboutText}>
                  <TranslatedText>Join the movement for a better tomorrow. Together we can bring the change our nation needs.</TranslatedText>
                </Text>
                <TouchableOpacity
                  style={styles.aboutButton}
                  onPress={() => router.push('/about' as any)}
                >
                  <Text style={styles.aboutButtonText}>
                    <TranslatedText>Learn More</TranslatedText>
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <TranslatedText>Explore Features</TranslatedText>
            </Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, idx) => (
                <FeatureCard key={idx} {...feature} delay={idx * 100} />
              ))}
            </View>
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
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    bottom: -20,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: SP_RED,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: SP_RED,
  },
  welcomeSection: {
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  content: {
    paddingHorizontal: 24,
  },
  desktopContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: SP_RED,
  },
  idCardBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: SP_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  idCardGradient: {
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  idCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  idCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  idCardIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  idCardTextContainer: {
    flex: 1,
  },
  idCardTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  idCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  idCardButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shimmer1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shimmer2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  quickActionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsScroll: {
    gap: 16,
    paddingRight: 24,
  },
  newsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  newsCard: {
    width: width >= 768 ? (width - 80) / 3 : width - 80,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  newsImage: {
    height: 140,
  },
  volunteerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  volunteerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SP_RED + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volunteerInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SP_RED,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  volunteerDistrict: {
    fontSize: 12,
    color: '#64748b',
  },
  volunteerDistance: {
    fontSize: 12,
    color: SP_GREEN,
    fontWeight: '600',
    marginTop: 2,
  },

  newsContent: {
    padding: 16,
  },
  newsCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SP_GREEN,
  },
  newsCategoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: SP_GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
    lineHeight: 22,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newsTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  aboutCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  aboutGradient: {
    padding: 36,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  aboutButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIconContainer: {
    marginBottom: 16,
  },
  featureIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
  },
});
