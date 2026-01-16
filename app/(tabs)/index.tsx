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
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TranslatedText } from '../../components/TranslatedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
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

// District coordinates for location-based sorting (copy from nearby-volunteers)
const DISTRICT_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'kanpur nagar': { lat: 26.4499, lng: 80.3319 },
  'kanpur dehat': { lat: 26.3000, lng: 79.9500 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'prayagraj': { lat: 25.4358, lng: 81.8463 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'meerut': { lat: 28.9845, lng: 77.7064 },
  'gorakhpur': { lat: 26.7606, lng: 83.3732 },
  'gorkhapur': { lat: 26.7606, lng: 83.3732 },  // Common typo
  'kaushambi': { lat: 25.5315, lng: 81.3870 },
  'sirathu': { lat: 25.5320, lng: 81.3280 },
  'renukoot': { lat: 24.2166, lng: 83.0318 },
  'kannauj': { lat: 27.0545, lng: 79.9219 },
  'kannoj': { lat: 27.0545, lng: 79.9219 },
  'sitapur': { lat: 27.5706, lng: 80.6817 },
  'barabanki': { lat: 26.9260, lng: 81.1916 },
  'pratapgarh': { lat: 25.8961, lng: 81.9450 },
  'rasulabad': { lat: 25.9000, lng: 81.9500 },
  'mohammdabad': { lat: 26.7600, lng: 83.4100 },
  'kalyanpur': { lat: 26.4999, lng: 80.2919 },
  'kidwai nagar': { lat: 26.4580, lng: 80.3500 },
  'lahrpur': { lat: 27.5500, lng: 80.7800 },
  'shamli': { lat: 29.4527, lng: 77.3148 },
  'kairana': { lat: 29.3949, lng: 77.2042 },
  'chilupar': { lat: 26.7606, lng: 83.3732 },  // Near Gorakhpur
};

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
    fetchDynamicPages();
  }, []);

  const [dynamicPages, setDynamicPages] = useState<any[]>([]);

  const fetchDynamicPages = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/pages`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setDynamicPages(data.data);
      }
    } catch (error) {
      console.error('Error fetching dynamic pages:', error);
    }
  };

  const fetchNearbyVolunteers = async () => {
    try {
      // Try to get user location
      let userLoc: { latitude: number; longitude: number } | null = null;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        userLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      // Helper to get coordinates for a district/place
      const getCoords = (place: any) => {
        // Handle non-string values (numbers, undefined, null)
        if (!place || typeof place !== 'string') return null;
        const normalized = place.toLowerCase().trim().replace(/\s+/g, ' ') || '';
        if (!normalized) return null;
        if (DISTRICT_COORDINATES[normalized]) return DISTRICT_COORDINATES[normalized];
        // Try first word
        const firstWord = normalized.split(' ')[0];
        if (DISTRICT_COORDINATES[firstWord]) return DISTRICT_COORDINATES[firstWord];
        // Try partial match
        for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
          if (normalized.includes(key) || key.includes(normalized)) return coords;
        }
        return null;
      };

      // Map ALL volunteers with distance
      const allVolunteers = volunteersData
        .filter((v: any) => v)
        .map((v: any) => {
          const district = v['Column4'] || v['Column12'] || '';
          const vidhanSabha = v['Column5'] || '';
          const coords = getCoords(district) || getCoords(vidhanSabha);

          let distance: number | null = null;
          if (userLoc && coords) {
            distance = getDistanceFromLatLonInKm(
              userLoc.latitude, userLoc.longitude,
              coords.lat, coords.lng
            );
          }

          return {
            Name: v['Column2'] || v['आपका पूरा नाम क्या है? '] || 'Unknown',
            District: district || vidhanSabha || 'Unknown',
            distance,
          };
        });

      // Sort by distance (nearest first)
      allVolunteers.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

      // Take top 5 nearest
      setNearbyVolunteers(allVolunteers.slice(0, 5));
    } catch (error) {
      console.error('Error fetching nearby volunteers:', error);
      // Fallback - show first 5
      const fallback = volunteersData.slice(0, 5)
        .filter((v: any) => v)
        .map((v: any) => ({
          Name: v['Column2'] || 'Unknown',
          District: v['Column4'] || v['Column12'] || 'Unknown',
          distance: null,
        }));
      setNearbyVolunteers(fallback);
    }
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


    { icon: 'newspaper', title: 'Samajwadi Updates', subtitle: 'Stay updated', color: SP_RED, route: '/news' },
    { icon: 'account-group', title: 'Nearby Volunteers', subtitle: 'Find help nearby', color: '#0891b2', route: '/nearby-volunteers' },

    { icon: 'school', title: 'Training', subtitle: 'Learn & grow', color: '#3B82F6', route: '/training' },
    { icon: 'card-account-details', title: 'ID Card', subtitle: 'Digital identity', color: '#EF4444', route: '/idcard' },
    { icon: 'play-box-multiple', title: 'Reels', subtitle: 'Watch & Share', color: '#E1306C', route: '/reels' },

    { icon: 'view-grid-plus', title: 'All Pages', subtitle: 'View Directory', color: '#111827', route: '/pages' }
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
                  <Image
                    source={require('../../assets/images/stf_logo.jpg')}
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                    resizeMode="cover"
                  />
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

          {/* Survey Banner */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.idCardBanner}
              onPress={() => router.push('/(tabs)/survey' as any)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb', '#1d4ed8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.idCardGradient}
              >
                <View style={styles.idCardContent}>
                  <View style={styles.idCardLeft}>
                    <View style={styles.idCardIconContainer}>
                      <MaterialCommunityIcons name="clipboard-text" size={48} color="#fff" />
                    </View>
                    <View style={styles.idCardTextContainer}>
                      <Text style={styles.idCardTitle}>
                        <TranslatedText>जन सर्वेक्षण</TranslatedText>
                      </Text>
                      <Text style={styles.idCardSubtitle}>
                        <TranslatedText>अपनी राय साझा करें और बदलाव का हिस्सा बनें</TranslatedText>
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

          {/* Feedback Banner */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.idCardBanner}
              onPress={() => router.push('/(tabs)/feedback' as any)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706', '#b45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.idCardGradient}
              >
                <View style={styles.idCardContent}>
                  <View style={styles.idCardLeft}>
                    <View style={styles.idCardIconContainer}>
                      <MaterialCommunityIcons name="message-text" size={48} color="#fff" />
                    </View>
                    <View style={styles.idCardTextContainer}>
                      <Text style={styles.idCardTitle}>
                        <TranslatedText>फीडबैक दें</TranslatedText>
                      </Text>
                      <Text style={styles.idCardSubtitle}>
                        <TranslatedText>हमें बताएं कि हम कैसे सुधार कर सकते हैं</TranslatedText>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.idCardButton}>
                    <MaterialCommunityIcons name="send" size={24} color="#fff" />
                  </View>
                </View>

                <View style={styles.shimmer1} />
                <View style={styles.shimmer2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Child Protection Banner */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.idCardBanner}
              onPress={() => router.push('/(tabs)/child-protection' as any)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#dc2626', '#b91c1c', '#991b1b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.idCardGradient}
              >
                <View style={styles.idCardContent}>
                  <View style={styles.idCardLeft}>
                    <View style={styles.idCardIconContainer}>
                      <MaterialCommunityIcons name="shield-account" size={48} color="#fff" />
                    </View>
                    <View style={styles.idCardTextContainer}>
                      <Text style={styles.idCardTitle}>
                        <TranslatedText>बाल संरक्षण</TranslatedText>
                      </Text>
                      <Text style={styles.idCardSubtitle}>
                        <TranslatedText>बाल शोषण की रिपोर्ट करें - गोपनीय और सुरक्षित</TranslatedText>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.idCardButton}>
                    <MaterialCommunityIcons name="alert-octagon" size={24} color="#fff" />
                  </View>
                </View>

                <View style={styles.shimmer1} />
                <View style={styles.shimmer2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Points History Banner */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.idCardBanner}
              onPress={() => router.push('/desktop-screen-pages/points-history' as any)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.idCardGradient}
              >
                <View style={styles.idCardContent}>
                  <View style={styles.idCardLeft}>
                    <View style={styles.idCardIconContainer}>
                      <MaterialCommunityIcons name="star-circle" size={48} color="#fff" />
                    </View>
                    <View style={styles.idCardTextContainer}>
                      <Text style={styles.idCardTitle}>
                        <TranslatedText>पॉइंट्स देखें</TranslatedText>
                      </Text>
                      <Text style={styles.idCardSubtitle}>
                        <TranslatedText>अपने सभी पॉइंट्स और रिवॉर्ड्स देखें</TranslatedText>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.idCardButton}>
                    <MaterialCommunityIcons name="trophy" size={24} color="#fff" />
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 24, paddingVertical: 4 }}>
                {nearbyVolunteers.map((volunteer, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.volunteerCard}
                    onPress={() => router.push('/nearby-volunteers' as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.volunteerAvatar}>
                      <Image
                        source={require('../../assets/images/icon.png')}
                        style={styles.volunteerLogo}
                      />
                    </View>
                    <View style={styles.volunteerInfo}>
                      <Text style={styles.volunteerName} numberOfLines={1} ellipsizeMode="tail">
                        {volunteer.Name || 'Unknown'}
                      </Text>
                      <Text style={styles.volunteerDistrict} numberOfLines={1} ellipsizeMode="tail">
                        {volunteer.District || 'Unknown'}
                      </Text>
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
    padding: 14,
    borderRadius: 16,
    width: 160,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  volunteerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: SP_RED + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: SP_RED + '30',
  },
  volunteerInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: SP_RED,
  },
  volunteerLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: 'contain',
  },
  volunteerInfo: {
    width: '100%',
    alignItems: 'center',
  },
  volunteerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    maxWidth: '100%',
  },
  volunteerDistrict: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
    maxWidth: '100%',
  },
  volunteerDistance: {
    fontSize: 11,
    color: SP_GREEN,
    fontWeight: '600',
    marginTop: 4,
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
