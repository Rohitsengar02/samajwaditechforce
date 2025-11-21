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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Profile Option Card
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
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
        {showArrow && (
          <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Stats Card
const StatCard = ({ icon, value, label, color, delay }: any) => {
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
    <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const isDesktop = width >= 768;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.push('/onboarding' as any);
          }
        },
      ]
    );
  };

  const stats = [
    { icon: 'newspaper', value: '24', label: 'News Read', color: SP_RED },
    { icon: 'image-multiple', value: '12', label: 'Downloads', color: SP_GREEN },
    { icon: 'school', value: '3', label: 'Completed', color: '#3B82F6' },
    { icon: 'calendar-check', value: '8', label: 'Events', color: '#F59E0B' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
              <TouchableOpacity style={styles.settingsButton}>
                <MaterialCommunityIcons name="cog" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[SP_GREEN, '#15803d']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>SP</Text>
              </LinearGradient>
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <Text style={styles.userName}>Samajwadi Member</Text>
            <Text style={styles.userEmail}>member@samajwadiparty.in</Text>
            <View style={[styles.memberBadge, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#fca5a5" />
              <Text style={[styles.memberBadgeText, { color: '#fca5a5' }]}>Not Verified</Text>
            </View>

            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => router.push('/verified-member' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyButtonText}>Verify Profile Now</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={[styles.content, isDesktop && styles.desktopContent]}>
            {/* Stats Grid */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Your Activity</Text>
              <View style={styles.statsGrid}>
                {stats.map((stat, idx) => (
                  <StatCard key={idx} {...stat} delay={idx * 100} />
                ))}
              </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.optionsContainer}>
                <ProfileOption
                  icon="account-edit"
                  title="Edit Profile"
                  subtitle="Update your information"
                  onPress={() => Alert.alert('Edit Profile', 'Coming soon!')}
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
                  title="Privacy & Security"
                  subtitle="Manage your privacy settings"
                  onPress={() => Alert.alert('Privacy', 'Coming soon!')}
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
                  subtitle="हिंदी / English"
                  onPress={() => Alert.alert('Language', 'Coming soon!')}
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
                  onPress={() => Alert.alert('Support', 'Email: support@samajwadiparty.in')}
                  delay={0}
                />
                <ProfileOption
                  icon="information"
                  title="About"
                  subtitle="App version 1.0.0"
                  onPress={() => Alert.alert('About', 'Samajwadi Party App v1.0.0')}
                  delay={100}
                />
                <ProfileOption
                  icon="file-document"
                  title="Terms & Conditions"
                  subtitle="Read our terms"
                  onPress={() => Alert.alert('Terms', 'Coming soon!')}
                  delay={200}
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
              <Text style={styles.footerSubtext}>Samajwadi Party © 2024</Text>
            </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
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
  verifyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
