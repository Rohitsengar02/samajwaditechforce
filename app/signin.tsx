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
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Enable web browser redirect for OAuth
WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Google OAuth Client IDs
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

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


  // Google OAuth Hook
  // Different redirect URIs for web vs native
  const redirectUri = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? `${window.location.origin}/auth` : AuthSession.makeRedirectUri({ path: 'auth' }))
    : AuthSession.makeRedirectUri({
      path: 'auth',
      preferLocalhost: false,
    });

  // For native dev, use Expo proxy (update to match new owner)
  const proxyRedirectUri = Platform.OS === 'web' ? redirectUri : "https://auth.expo.io/@gaga4422/samajwadi-party";

  const config: any = {
    clientId: GOOGLE_WEB_CLIENT_ID,
    // Use web redirect URI for web, proxy for native dev
    redirectUri: Platform.OS === 'web' ? redirectUri : (__DEV__ ? proxyRedirectUri : redirectUri)
  };

  console.log('🔹 Mobile Sign In - Using redirectUri:', config.redirectUri);

  if (GOOGLE_ANDROID_CLIENT_ID) config.androidClientId = GOOGLE_ANDROID_CLIENT_ID;
  if (GOOGLE_IOS_CLIENT_ID) config.iosClientId = GOOGLE_IOS_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest(config);

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

  // Handle Google Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleBackendSync(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      console.error('Google Auth Error:', response.error);
      Alert.alert('Authentication Error', 'Could not sign in with Google. Check Redirect URI configuration.');
    }
  }, [response]);

  const handleGoogleBackendSync = async (accessToken: string) => {
    try {
      setLoading(true);
      // 1. Get User Details from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoResponse.json();
      console.log('🔹 Google User Info:', userInfo);

      // 2. Call Backend API to Create/Login User
      const apiUrl = getApiUrl();
      const backendResponse = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.picture,
          googleId: userInfo.id
        })
      });

      const backendData = await backendResponse.json();
      console.log('🔹 Backend Sync Response:', backendData);

      if (!backendResponse.ok) {
        throw new Error(backendData.message || 'Failed to sync with backend');
      }

      // 3. Save to Local Storage
      await AsyncStorage.setItem('userInfo', JSON.stringify(backendData));
      if (backendData.token) {
        await AsyncStorage.setItem('userToken', backendData.token);
      }

      setLoading(false);
      setLoading(false);

      if (backendData.isNewUser || backendResponse.status === 201) {
        // Redirect to Profile Setup for new users
        router.push({
          pathname: '/profile-setup',
          params: { googleData: JSON.stringify({ name: userInfo.name, email: userInfo.email, photo: userInfo.picture }) }
        });
      } else {
        router.push('/(tabs)');
      }

    } catch (error: any) {
      console.error('Error syncing Google user:', error);
      Alert.alert('Login Failed', 'Could not sync with server. ' + error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Check if Google Client IDs are configured
    if (!GOOGLE_WEB_CLIENT_ID && !GOOGLE_ANDROID_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID) {
      Alert.alert("Configuration Missing", "Google Client IDs are not configured.");
      return;
    }

    // Force show the Redirect URI
    const uriToShow = Platform.OS === 'web'
      ? (typeof window !== 'undefined' ? `${window.location.origin}/auth` : AuthSession.makeRedirectUri({ path: 'auth' }))
      : (__DEV__ ? proxyRedirectUri : redirectUri);

    console.log('🔹 LOGIN Redirect URI:', uriToShow);

    // On Web, alert might fail or look bad, and we need direct user interaction for popup
    if (Platform.OS === 'web') {
      promptAsync();
      return;
    }

    if (__DEV__) {
      Alert.alert(
        "Redirect URI Info",
        `Please ensure this URI is added to Google Cloud Console > Authorized redirect URIs:\n\n${uriToShow}`,
        [{
          text: "Continue",
          onPress: () => {
            promptAsync();
          }
        }, {
          text: "Cancel",
          style: 'cancel'
        }]
      );
    } else {
      promptAsync();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
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
              {/* Google Login Button (Mobile) */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or email</Text>
                <View style={styles.dividerLine} />
              </View>

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

  // Google OAuth Hook
  // For Web, explicitly set redirect URI
  const redirectUri = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? `${window.location.origin}/auth` : AuthSession.makeRedirectUri({ path: 'auth' }))
    : undefined;

  const config: any = {
    clientId: GOOGLE_WEB_CLIENT_ID,
  };

  if (redirectUri) {
    config.redirectUri = redirectUri;
    console.log('🔹 Desktop Sign In - Using redirectUri:', redirectUri);
  }

  if (GOOGLE_ANDROID_CLIENT_ID) config.androidClientId = GOOGLE_ANDROID_CLIENT_ID;
  if (GOOGLE_IOS_CLIENT_ID) config.iosClientId = GOOGLE_IOS_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const fetchGoogleUserInfo = async (accessToken: string) => {
    try {
      setLoading(true);
      // 1. Get Google User Info
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoResponse.json();
      console.log('🔹 Desktop Google Info:', userInfo);

      // 2. Call Backend API to Get Real JWT
      const apiUrl = getApiUrl();
      const backendResponse = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.picture,
          googleId: userInfo.id
        })
      });

      const backendData = await backendResponse.json();
      console.log('🔹 Backend Sync Response (Desktop):', backendData);

      if (!backendResponse.ok) {
        throw new Error(backendData.message || 'Failed to sync with backend');
      }

      // 3. Save Backend JWT, NOT Google Token
      await AsyncStorage.setItem('userInfo', JSON.stringify(backendData));
      if (backendData.token) {
        await AsyncStorage.setItem('userToken', backendData.token);
      }

      setLoading(false);
      setLoading(false);

      if (backendData.isNewUser || backendResponse.status === 201) {
        // Redirect to Profile Setup for new users
        router.push({
          pathname: '/profile-setup',
          params: { googleData: JSON.stringify({ name: userInfo.name, email: userInfo.email, photo: userInfo.picture }) }
        });
      } else {
        router.push('/(tabs)');
      }
    } catch (error: any) {
      console.error('Error syncing Google user:', error);
      Alert.alert('Sign In Failed', 'Could not sync with server. ' + error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Check if Google Client IDs are configured
    if (!GOOGLE_WEB_CLIENT_ID && !GOOGLE_ANDROID_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID) {
      Alert.alert("Configuration Missing", "Google Client IDs are not configured.");
      return;
    }

    // Determine the URI being used
    const uriToShow = Platform.OS === 'web'
      ? (window.location.origin + '/auth')
      : (__DEV__ ? "https://auth.expo.io/@gaga4422/samajwadi-party" : AuthSession.makeRedirectUri({ path: 'auth' }));

    console.log('🔹 LOGIN Redirect URI:', uriToShow);

    // On Web, alert might fail or look bad, and we need direct user interaction for popup
    if (Platform.OS === 'web') {
      promptAsync();
      return;
    }

    // Alert the URI so the user can verify it against Google Cloud Console
    if (__DEV__) {
      Alert.alert(
        "Redirect URI Info",
        `Please ensure this URI is added to Google Cloud Console > Authorized redirect URIs:\n\n${uriToShow}`,
        [{
          text: "Continue",
          onPress: () => promptAsync()
        }, {
          text: "Cancel",
          style: 'cancel'
        }]
      );
    } else {
      await promptAsync();
    }
  };

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

              <TouchableOpacity
                style={styles.desktopGoogleButton}
                onPress={handleGoogleLogin}
              >
                <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
                <Text style={styles.desktopGoogleText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
                <Text style={{ marginHorizontal: 10, color: '#9ca3af', fontSize: 13, fontWeight: '500' }}>OR EMAIL</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
              </View>

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
  // Mobile Google Button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 50,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    zIndex: 10, // Ensure clickable
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
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
    marginBottom: 24,
  },
  // Desktop Google Button
  desktopGoogleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 50,
    borderRadius: 12,
    gap: 12,
    zIndex: 10, // Ensure clickable
    elevation: 2,
  },
  desktopGoogleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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
