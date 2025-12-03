import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Animated,
  Easing,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';



export default function SignInScreen() {
  const isWideLayout = width >= 768;
  return isWideLayout ? <DesktopSignInScreen /> : <MobileSignInScreen />;
}

function MobileSignInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      // Dynamic URL determination to ensure Android works
      // Dynamic URL determination to ensure Android works
      const url = getApiUrl();
      const loginUrl = `${url}/auth/login`;

      console.log('📡 Login attempt:', { loginUrl, email });

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📡 Response status:', response.status);
      console.log('📡 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await AsyncStorage.setItem('userInfo', JSON.stringify(data));
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
      }

      router.push('/(tabs)');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#2d1b4e'] : ['#ffffff', '#f0fdf4']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Background */}
      <View style={[styles.bgCircleMobile, { backgroundColor: 'rgba(227, 5, 18, 0.08)' }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.headerRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.mobileLogoContainer}>
                <Text style={styles.mobileLogoText}>SP</Text>
              </View>
              <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Welcome Back</Text>
              <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
                Sign in to continue your journey
              </Text>
            </Animated.View>

            <Animated.View style={[styles.cardGlass, !isDark && styles.cardGlassLight, { opacity: fadeAnim }]}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.input, !isDark && styles.inputLight]}
                  placeholder="name@example.com"
                  placeholderTextColor={isDark ? '#9ca3af' : '#94a3b8'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, !isDark && styles.inputLight]}
                  placeholder="Your password"
                  placeholderTextColor={isDark ? '#9ca3af' : '#94a3b8'}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity activeOpacity={0.9} onPress={handleLogin} disabled={loading}>
                <LinearGradient
                  colors={loading ? ['#666', '#444'] : [SP_RED, '#b91c1c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                  {!loading && <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.signInFooterRow}>
                <Text style={styles.footerText}>
                  Don't have an account?{' '}
                  <Text style={styles.footerLinkText} onPress={() => router.push('/register')}>
                    Create one
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function DesktopSignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heroAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [heroAnim]);

  const heroStyle = {
    transform: [
      {
        translateY: heroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
    ],
  } as const;

  const canSubmit = email.trim().length > 0 && password.length >= 4;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);

    try {
      // Dynamic URL determination to ensure Android works
      // Dynamic URL determination to ensure Android works
      const url = getApiUrl();

      const response = await fetch(`${url}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await AsyncStorage.setItem('userInfo', JSON.stringify(data));
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
      }

      router.push('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    router.push('/register');
  };

  return (
    <View style={styles.desktopSignScreen}>
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef', '#dee2e6']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.desktopSignOverlay}>
        <View style={styles.desktopSignRow}>
          {/* Left Side - Hero */}
          <Animated.View style={[styles.desktopSignLeft, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={[SP_GREEN, '#15803d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.desktopLeftCard}
            >
              <View style={styles.desktopLeftContent}>
                <View>
                  <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>SP</Text>
                  </View>

                  <Text style={styles.desktopLeftTitle}>
                    Welcome Back, Comrade
                  </Text>
                  <Text style={styles.desktopLeftSubtitle}>
                    Sign in to your Samajwadi Tech Force workspace to coordinate booths, events, and digital outreach.
                  </Text>

                  <View style={styles.desktopSignBullets}>
                    <View style={styles.bulletItem}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                      <Text style={styles.bulletText}>Manage booth assignments</Text>
                    </View>
                    <View style={styles.bulletItem}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                      <Text style={styles.bulletText}>Track campaign progress</Text>
                    </View>
                    <View style={styles.bulletItem}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                      <Text style={styles.bulletText}>Connect with local teams</Text>
                    </View>
                  </View>
                </View>

                <Animated.View style={[styles.illustrationContainer, heroStyle]}>
                  <View style={styles.laptopContainer}>
                    <MaterialCommunityIcons name="laptop" size={180} color="rgba(255,255,255,0.9)" />
                    <View style={styles.screenContent}>
                      <View style={styles.screenBar} />
                      <View style={[styles.screenBar, { width: '60%' }]} />
                      <View style={[styles.screenBar, { width: '40%' }]} />
                    </View>
                  </View>
                </Animated.View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Right Side - Form */}
          <Animated.View style={[styles.desktopSignRight, { opacity: fadeAnim }]}>
            <BlurView intensity={80} tint="light" style={styles.desktopSignCard}>
              <Text style={styles.desktopSignCardTitle}>Sign In</Text>
              <Text style={styles.desktopSignCardSubtitle}>
                Use your registered email and password.
              </Text>

              <View style={styles.desktopSignFieldGroup}>
                <Text style={styles.desktopSignFieldLabel}>Email address</Text>
                <TextInput
                  style={styles.desktopSignInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.desktopSignFieldGroup}>
                <Text style={styles.desktopSignFieldLabel}>Password</Text>
                <TextInput
                  style={styles.desktopSignInput}
                  placeholder="Your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!canSubmit || loading}
                onPress={handleLogin}
                style={[
                  styles.desktopSignPrimaryButton,
                  !canSubmit && styles.desktopSignPrimaryButtonDisabled,
                ]}
              >
                <LinearGradient
                  colors={canSubmit ? [SP_RED, '#b91c1c'] : ['#e5e7eb', '#d1d5db']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.desktopSignPrimaryButtonGradient}
                >
                  <Text
                    style={[
                      styles.desktopSignPrimaryButtonText,
                      !canSubmit && styles.desktopSignPrimaryButtonTextMuted,
                    ]}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Text>
                  {canSubmit && <MaterialCommunityIcons name="login" size={20} color="#fff" />}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.desktopSignFooterRow}>
                <Text style={styles.desktopSignFooterText}>
                  New here?{' '}
                  <Text
                    style={styles.desktopSignFooterLink}
                    onPress={handleGoToRegister}
                  >
                    Create an account
                  </Text>
                </Text>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  desktopSignScreen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(0, 153, 51, 0.05)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(227, 5, 18, 0.05)',
  },
  bgCircleMobile: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mobileLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: SP_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mobileLogoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerTitleDark: {
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerSubtitleDark: {
    color: '#9ca3af',
  },
  cardGlass: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardGlassLight: {
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputLight: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  signInFooterRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLinkText: {
    color: SP_RED,
    fontWeight: '700',
  },
  // Desktop Styles
  desktopSignOverlay: {
    flex: 1,
    paddingHorizontal: 64,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  desktopSignRow: {
    flexDirection: 'row',
    maxWidth: 1200,
    width: '100%',
    height: 600,
    alignSelf: 'center',
    gap: 40,
  },
  desktopSignLeft: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: SP_GREEN,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  desktopLeftCard: {
    flex: 1,
    padding: 48,
  },
  desktopLeftContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  desktopLeftTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 50,
    marginBottom: 16,
  },
  desktopLeftSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 28,
    maxWidth: 400,
    marginBottom: 32,
  },
  desktopSignBullets: {
    gap: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laptopContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContent: {
    position: 'absolute',
    top: 45,
    width: 120,
    height: 80,
    gap: 8,
    padding: 10,
  },
  screenBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    width: '80%',
  },
  desktopSignRight: {
    flex: 1,
    justifyContent: 'center',
  },
  desktopSignCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 32,
    padding: 48,
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
  },
  desktopSignCardTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  desktopSignCardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  desktopSignFieldGroup: {
    marginBottom: 20,
  },
  desktopSignFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  desktopSignInput: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1a1a1a',
  },
  desktopSignPrimaryButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  desktopSignPrimaryButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  desktopSignPrimaryButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  desktopSignPrimaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  desktopSignPrimaryButtonTextMuted: {
    color: '#9ca3af',
  },
  desktopSignFooterRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  desktopSignFooterText: {
    color: '#666',
    fontSize: 15,
  },
  desktopSignFooterLink: {
    color: SP_RED,
    fontWeight: '700',
  },
});
