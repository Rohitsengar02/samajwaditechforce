import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Switch,
  Alert,
  Platform,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';
// Removed problematic imports that cause crashes on Android:
// - signOutUser from firebase (uses require() for native modules)
// - useLanguage from LanguageContext
// - TranslatedText component

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Profile Option Card - uses plain Text to avoid TranslatedText crash
const ProfileOption = ({ icon, title, subtitle, onPress, showArrow = true, delay = 0 }: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.optionCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.optionIcon}>
          <MaterialCommunityIcons name={icon} size={24} color={SP_RED} />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
          )}
        </View>
        {showArrow && (
          <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};


// Direct export without ErrorBoundary wrapper
export default function ProfileScreen() {
  const router = useRouter();
  const isDesktop = width >= 768;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hardcoded language values (removed useLanguage to prevent crash)
  const language = 'en';
  const setLanguage = async (_code: string) => { };
  const availableLanguages = [{ code: 'en', name: 'English', nativeName: 'English' }];

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = availableLanguages.filter((lang: any) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLanguageName = availableLanguages.find((l: any) => l.code === language)?.name || 'English';

  const [showVerifiedSuccess, setShowVerifiedSuccess] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // 1. Load from local storage first for speed
      const localUserInfo = await AsyncStorage.getItem('userInfo');
      const token = await AsyncStorage.getItem('userToken');

      if (localUserInfo) {
        setUser(JSON.parse(localUserInfo));
      }

      // 2. Fetch fresh data from API if token exists
      if (token) {
        const url = getApiUrl();

        const response = await fetch(`${url}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          console.log('Session expired or token invalid. Logging out.');
          await performLogout();
          return;
        }

        if (response.ok) {
          const freshData = await response.json();
          setUser(freshData);
          // Update local storage
          await AsyncStorage.setItem('userInfo', JSON.stringify(freshData));
        }
      }
    } catch (error) {
      console.error('Failed to load user profile', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    // For Web, direct logout without Alert (simpler UX for web)
    if (Platform.OS === 'web') {
      performLogout();
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout
        },
      ]
    );
  };

  const performLogout = async () => {
    try {
      // Clear local storage (removed signOutUser import that was causing crashes)
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('userToken');
      // Navigate to signin (handles both web desktop and mobile layouts)
      router.replace('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback navigation even on error
      router.replace('/signin');
    }
  };



  // Show loading spinner while initial data loads
  if (loading && !user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient
          colors={[SP_RED, '#b91c1c', SP_DARK]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ alignItems: 'center' }}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 18, marginTop: 16, fontWeight: '600' }}>
            Loading Profile...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[SP_RED]} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header with Profile */}
          <LinearGradient
            colors={[SP_RED, '#b91c1c', SP_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={[styles.settingsButton, user?.verificationStatus === 'Verified' && styles.verifiedButton]}
                onPress={() => {
                  if (user?.verificationStatus === 'Verified') {
                    setShowVerifiedSuccess(true);
                  } else {
                    router.push('/verified-member');
                  }
                }}
              >
                {user?.verificationStatus === 'Verified' ? (
                  <>
                    <MaterialCommunityIcons name="check-decagram" size={20} color="#fff" />
                    <Text style={styles.verifyButtonText}>Verified</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
                    <Text style={styles.verifyButtonText}>Verify here</Text>
                    {/* Show badge if fields are missing */}
                    {(!user?.district || !user?.vidhanSabha || !user?.qualification) && (
                      <View style={styles.settingsBadge}>
                        <MaterialCommunityIcons name="alert-circle" size={12} color="#fff" />
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[SP_GREEN, '#15803d']}
                style={styles.avatar}
              >
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={{ width: 92, height: 92, borderRadius: 46 }}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'SP'}
                  </Text>
                )}
              </LinearGradient>
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={() => router.push('/edit-profile')}
              >
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <Text style={styles.userName}>{user?.name || 'Samajwadi Member'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'member@samajwadiparty.in'}</Text>

            <View style={[styles.memberBadge, { backgroundColor: user?.verificationStatus === 'Verified' ? 'rgba(0,153,51,0.2)' : 'rgba(0,0,0,0.3)' }]}>
              <MaterialCommunityIcons
                name={user?.verificationStatus === 'Verified' ? "check-decagram" : "alert-circle"}
                size={16}
                color={user?.verificationStatus === 'Verified' ? "#4ade80" : "#fca5a5"}
              />
              <Text style={[styles.memberBadgeText, { color: user?.verificationStatus === 'Verified' ? "#4ade80" : "#fca5a5" }]}>
                {user?.verificationStatus === 'Verified' ? 'Verified Member' : (user?.verificationStatus === 'Pending' ? 'Verification Pending' : 'Not Verified')}
              </Text>
            </View>

            {/* Show Verify Button if required fields are missing */}
            {/* Verify Buttons/Warnings Removed as per user request */}
            {/*
            {user?.verificationStatus !== 'Verified' && (
              !user?.district || !user?.vidhanSabha || !user?.qualification
            ) && (
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => router.push('/verified-member' as any)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="alert-circle" size={16} color="#fff" />
                  <Text style={styles.verifyButtonText}>
                    {user?.verificationStatus === 'Pending' ? 'Complete Verification' : 'Verify Profile Now'}
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
                </TouchableOpacity>
              )}

            {user?.verificationStatus === 'Pending' && (
              !user?.district || !user?.vidhanSabha || !user?.qualification
            ) && (
                <View style={styles.warningBox}>
                  <MaterialCommunityIcons name="information" size={20} color="#f59e0b" />
                  <Text style={styles.warningText}>
                    Please complete all required fields to proceed with verification
                  </Text>
                </View>
              )}
            */}

            {user?.verificationStatus === 'Verified' && (
              <View style={styles.verifiedDetailsContainer}>
                <Text style={styles.verifiedDetailsTitle}>Member Details</Text>
                <View style={styles.verifiedDetailRow}>
                  <Text style={styles.verifiedDetailValue}>{user?.vidhanSabha}</Text>
                </View>
                <View style={styles.verifiedDetailRow}>
                  <Text style={styles.verifiedDetailLabel}>Role:</Text>
                  <Text style={styles.verifiedDetailValue}>{user?.partyRole || 'Member'}</Text>
                </View>
                <View style={styles.verifiedDetailRow}>
                  <Text style={styles.verifiedDetailLabel}>ID:</Text>
                  <Text style={styles.verifiedDetailValue}>{user?._id?.substring(0, 8).toUpperCase()}</Text>
                </View>
              </View>
            )}
          </LinearGradient>

          <View style={[styles.content, isDesktop && styles.desktopContent]}>
            {/* Leaderboard Points Section */}
            <View style={styles.pointsSection}>
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pointsCard}
              >
                {/* Decorative Elements */}
                <View style={styles.decorativeBg}>
                  <MaterialCommunityIcons name="trophy" size={180} color="rgba(255,255,255,0.1)" />
                </View>

                <View style={styles.pointsContent}>
                  <View style={styles.pointsHeader}>
                    <View style={styles.trophyContainer}>
                      <MaterialCommunityIcons name="trophy-award" size={32} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pointsLabel}>Leaderboard Points</Text>
                      <Text style={styles.pointsSubLabel}>Your contribution score</Text>
                    </View>
                  </View>

                  <View style={styles.pointsValueContainer}>
                    <Text style={styles.pointsValue}>{user?.points || 0}</Text>
                    <Text style={styles.pointsSuffix}>pts</Text>
                  </View>

                  <View style={styles.pointsFooter}>
                    <View style={styles.pointsBadge}>
                      <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                      <Text style={styles.pointsBadgeText}>
                        {user?.points >= 1000 ? 'Gold Member' : user?.points >= 500 ? 'Silver Member' : user?.points >= 100 ? 'Bronze Member' : 'Rising Star'}
                      </Text>
                    </View>
                    <View style={styles.pointsProgress}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(((user?.points || 0) % 1000) / 10, 100)}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {user?.points >= 1000 ? 'Max Level!' : `${1000 - ((user?.points || 0) % 1000)} points to next level`}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.optionsContainer}>
                <ProfileOption
                  icon="account-edit"
                  title="Edit Profile"
                  subtitle="Update your information"
                  onPress={() => router.push('/edit-profile')}
                  delay={0}
                />
                <ProfileOption
                  icon="card-account-details"
                  title="ID Card"
                  subtitle="View your digital ID"
                  onPress={() => router.push('/idcard' as any)}
                  delay={100}
                />
                <ProfileOption
                  icon="shield-account"
                  title="Privacy & Policy"
                  subtitle="Read our privacy policy"
                  onPress={() => router.push('/privacy-policy')}
                  delay={200}
                />
              </View>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.optionsContainer}>
                <View style={styles.optionCard}>
                  <View style={styles.optionIcon}>
                    <MaterialCommunityIcons name="bell" size={24} color={SP_RED} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Notifications</Text>
                    <Text style={styles.optionSubtitle}>Enable push notifications</Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#cbd5e1', true: SP_GREEN }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.optionCard}>
                  <View style={styles.optionIcon}>
                    <MaterialCommunityIcons name="theme-light-dark" size={24} color={SP_RED} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Dark Mode</Text>
                    <Text style={styles.optionSubtitle}>Switch to dark theme</Text>
                  </View>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#cbd5e1', true: SP_GREEN }}
                    thumbColor="#fff"
                  />
                </View>

                <ProfileOption
                  icon="translate"
                  title="Language"
                  subtitle={currentLanguageName}
                  onPress={() => setShowLanguageModal(true)}
                  delay={100}
                />
              </View>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              <View style={styles.optionsContainer}>
                <ProfileOption
                  icon="help-circle"
                  title="Help & Support"
                  subtitle="Get help and contact us"
                  onPress={() => router.push('/help-support')}
                  delay={0}
                />
                <ProfileOption
                  icon="email"
                  title="Contact Us"
                  subtitle="Send us a message"
                  onPress={() => router.push('/contact-us')}
                  delay={100}
                />
                <ProfileOption
                  icon="refresh"
                  title="Return & Refund"
                  subtitle="Policy regarding donations"
                  onPress={() => router.push('/return-refund')}
                  delay={200}
                />
                <ProfileOption
                  icon="information"
                  title="About"
                  subtitle="App version 1.0.0"
                  onPress={() => router.push('/about')}
                  delay={300}
                />
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[SP_RED, '#b91c1c']}
                style={styles.logoutGradient}
              >
                <MaterialCommunityIcons name="logout" size={24} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <MaterialCommunityIcons name="bicycle" size={32} color="#cbd5e1" />
              <Text style={styles.footerText}>साइकिल चलाओ देश बचाओ</Text>
              <Text style={styles.footerSubtext}>Samajwadi Tech Force © 2024</Text>
            </View>
          </View>
        </Animated.View >
      </ScrollView >

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search language..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <FlatList
              data={filteredLanguages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    language === item.code && styles.languageItemSelected
                  ]}
                  onPress={async () => {
                    await setLanguage(item.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <View>
                    <Text style={[
                      styles.languageName,
                      language === item.code && styles.languageNameSelected
                    ]}>
                      {item.nativeName}
                    </Text>
                    <Text style={[
                      styles.languageSubName,
                      language === item.code && styles.languageSubNameSelected
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  {language === item.code && (
                    <MaterialCommunityIcons name="check" size={20} color={SP_RED} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Already Verified Success Modal */}
      <Modal
        visible={showVerifiedSuccess}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVerifiedSuccess(false)}
      >
        <View style={styles.verifiedModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowVerifiedSuccess(false)}
          />
          <Animated.View style={styles.verifiedModalContent}>
            <LinearGradient
              colors={['#f0fdf4', '#ffffff']}
              style={styles.verifiedModalGradient}
            >
              <View style={styles.verifiedSuccessIcon}>
                <MaterialCommunityIcons name="check-decagram" size={80} color={SP_GREEN} />
                <View style={styles.verifiedIconBadge}>
                  <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
                </View>
              </View>

              <Text style={styles.verifiedSuccessTitle}>Identity Verified!</Text>
              <Text style={styles.verifiedSuccessSubtitle}>
                You are a recognized member of the Samajwadi Tech Force. Your dedication and support are highly appreciated.
              </Text>

              <View style={styles.verifiedBadgeRow}>
                <View style={styles.verifiedInfoItem}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={SP_GREEN} />
                  <Text style={styles.verifiedInfoText}>Official Member</Text>
                </View>
                <View style={styles.verifiedInfoItem}>
                  <MaterialCommunityIcons name="medal" size={20} color="#FFB800" />
                  <Text style={styles.verifiedInfoText}>Authentic Profile</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.verifiedCloseBtn}
                onPress={() => setShowVerifiedSuccess(false)}
              >
                <LinearGradient
                  colors={[SP_GREEN, '#15803d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.verifiedCloseGradient}
                >
                  <Text style={styles.verifiedCloseText}>Great!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    alignItems: 'center',
  },
  headerContent: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  settingsButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  verifiedButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  settingsBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: SP_RED,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SP_RED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  memberBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  desktopContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  pointsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  pointsCard: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  decorativeBg: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    opacity: 1,
  },
  pointsContent: {
    position: 'relative',
    zIndex: 1,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  trophyContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsLabel: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pointsSubLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 2,
  },
  pointsValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 20,
  },
  pointsValue: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  pointsSuffix: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
  },
  pointsFooter: {
    gap: 16,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointsBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF8C00',
  },
  pointsProgress: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#94a3b8',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  verifiedDetailsContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  verifiedDetailsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 14,

  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 158, 11, 0.3)',
    gap: 12,
  },
  warningText: {
    color: '#fef3c7',
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
    lineHeight: 16,
  },
  verifiedDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 4,
  },
  verifiedDetailLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  verifiedDetailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  languageItemSelected: {
    backgroundColor: '#fef2f2',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  languageNameSelected: {
    color: SP_RED,
    fontWeight: '700',
  },
  languageSubName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  languageSubNameSelected: {
    color: SP_RED,
  },
  // Verified Success Modal Styles
  verifiedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  verifiedModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  verifiedModalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  verifiedSuccessIcon: {
    position: 'relative',
    marginBottom: 20,
  },
  verifiedIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  verifiedSuccessTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#065f46',
    marginBottom: 12,
    textAlign: 'center',
  },
  verifiedSuccessSubtitle: {
    fontSize: 16,
    color: '#065f46',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 24,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  verifiedInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  verifiedInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  verifiedCloseBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  verifiedCloseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifiedCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
