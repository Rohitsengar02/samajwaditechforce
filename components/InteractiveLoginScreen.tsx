import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing, Keyboard, Platform, KeyboardAvoidingView, ScrollView, Alert, ActivityIndicator, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Enable web browser redirect for OAuth
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Google OAuth Client IDs
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

// Floating Bubble Component
const FloatingBubble = ({ delay = 0, size = 60, color = SP_RED, duration = 8000 }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(scale, {
      toValue: 1,
      duration: 1000,
      delay,
      useNativeDriver: true,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -height - 100,
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
      style={{
        position: 'absolute',
        bottom: -100,
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
        opacity: 0.15,
        transform: [
          { translateY },
          { translateX },
          { scale },
        ],
      }}
    />
  );
};

export default function InteractiveLoginScreen({ navigation }: any) {
  const router = useRouter(); // Initialize router
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if Google OAuth is properly configured
  const hasGoogleConfig = !!(GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID);

  // Google OAuth Hook with error handling
  // Only configure if we have at least one client ID
  const config: any = hasGoogleConfig ? {
    clientId: GOOGLE_WEB_CLIENT_ID || 'dummy-client-id', // Fallback to prevent crashes
  } : {
    clientId: 'dummy-client-id', // Safe fallback
  };

  // Only add platform-specific IDs if they are defined
  if (GOOGLE_ANDROID_CLIENT_ID) config.androidClientId = GOOGLE_ANDROID_CLIENT_ID;
  if (GOOGLE_IOS_CLIENT_ID) config.iosClientId = GOOGLE_IOS_CLIENT_ID;

  // FIX: Explicitly set redirect URI for Web to match "Authorized redirect URIs" in Google Console
  if (Platform.OS === 'web') {
    const redirectUri = typeof window !== 'undefined'
      ? `${window.location.origin}/auth`
      : AuthSession.makeRedirectUri({ path: 'auth' });
    config.redirectUri = redirectUri;
    console.log('🔹 Mobile Web (Interactive) Redirect URI:', redirectUri);
  }

  // Always call the hook (hooks cannot be conditional)
  // But we'll check hasGoogleConfig before actually using it
  const [request, response, promptAsync] = Google.useAuthRequest(config);

  // Animation Values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bgGradientAnim = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;

  // Animation effects
  useEffect(() => {
    // Continuous rotation for the tech ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Floating particles animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(particlesAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(particlesAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Handle Google Auth Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleUserInfo(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      setLoading(false);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
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
      console.log('🔹 Google User Info:', userInfo);

      // 2. Call Backend to Check User Status
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
      console.log('🔹 Backend Response:', backendData);

      setLoading(false);

      if (!backendResponse.ok) {
        throw new Error(backendData.message || 'Backend sync failed');
      }

      // 3. Save Auth Data (for both new and existing users)
      if (backendData) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(backendData));
        if (backendData.token) {
          await AsyncStorage.setItem('userToken', backendData.token);
        }
      }

      // 4. Logic: Existing vs New
      if (backendData.isNewUser || backendResponse.status === 201) {
        // NEW USER -> Profile Setup
        console.log('🔹 New User -> Profile Setup');
        navigation.navigate('ProfileSetup', {
          googleData: {
            name: userInfo.name,
            email: userInfo.email,
            photo: userInfo.picture,
          }
        });
      } else {
        // EXISTING USER -> Dashboard
        console.log('🔹 Existing User -> Dashboard');
        router.replace('/(tabs)');
      }

    } catch (error) {
      setLoading(false);
      console.error('Error fetching Google user info:', error);
      Alert.alert('Error', 'Failed to verify user with server.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    // Check if Google Client IDs are configured
    if (!hasGoogleConfig) {
      // Alert user about mock mode
      Alert.alert(
        "Configuration Missing",
        "Google Client IDs are not configured. Using mock login for demonstration.",
        [
          {
            text: "OK",
            onPress: () => {
              // For demo/development - use mock data
              setTimeout(() => {
                setLoading(false);
                // Navigate to Profile Setup page first (not Address directly)
                navigation.navigate('ProfileSetup', {
                  googleData: {
                    name: 'Test User',
                    email: 'test@example.com',
                    photo: '' // Empty string for no photo
                  }
                });
              }, 1000);
            }
          }
        ]
      );
      return;
    }

    // Real Google Sign-In
    try {
      const result = await promptAsync();
      // If result is cancelled or fails, reset loading
      if (result.type === 'cancel' || result.type === 'dismiss') {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error('Google login error:', error);
      Alert.alert('Error', 'Failed to start Google sign-in. Please try again or use email sign-in.');
    }
  };



  // Interpolations
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const particleY = particlesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <LinearGradient
        colors={['#ffffff', '#f0fdf4', '#fef2f2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Floating Bubbles */}
      <View style={styles.bubblesContainer}>
        <FloatingBubble delay={0} size={80} color={SP_RED} duration={10000} />
        <FloatingBubble delay={1000} size={60} color={SP_GREEN} duration={12000} />
        <FloatingBubble delay={2000} size={100} color={SP_RED} duration={9000} />
        <FloatingBubble delay={500} size={70} color={SP_GREEN} duration={11000} />
        <FloatingBubble delay={1500} size={50} color={SP_RED} duration={13000} />
        <FloatingBubble delay={2500} size={90} color={SP_GREEN} duration={10500} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Animated Tech Header Element */}
          <View style={styles.headerContainer}>
            <View style={styles.techCircleWrapper}>
              {/* Outer Ring */}
              <Animated.View style={[styles.techRingOuter, { transform: [{ rotate }] }]}>
                <LinearGradient
                  colors={[SP_RED, 'transparent', SP_GREEN, 'transparent']}
                  style={styles.ringGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>

              {/* Inner Ring */}
              <Animated.View style={[styles.techRingInner, { transform: [{ rotate: reverseRotate }] }]}>
                <View style={styles.dot} />
                <View style={[styles.dot, { top: 'auto', bottom: -4, left: 'auto', right: '50%' }]} />
              </Animated.View>

              {/* Central Pulsing Core */}
              <Animated.View style={[styles.coreCircle, { transform: [{ scale: pulseAnim }] }]}>
                <MaterialCommunityIcons
                  name="bicycle"
                  size={40}
                  color="#fff"
                />
              </Animated.View>

              {/* Floating Particles */}
              <Animated.View style={[styles.particle, { top: 0, left: 20, transform: [{ translateY: particleY }] }]} />
              <Animated.View style={[styles.particle, { bottom: 20, right: 20, transform: [{ translateY: Animated.multiply(particleY, -1) }] }]} />
            </View>

            <Text style={styles.title}>Samajwadi Tech Force</Text>
            <Text style={styles.subtitle}>Digital Revolution Begins With You</Text>
          </View>

          {/* Interactive Form Area */}
          <View style={styles.formContainer}>

            {/* Error Message Banner */}
            {authError && (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            {/* Google Login Button - Primary */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color={SP_RED} />
                  <Text style={styles.googleButtonText}>Connecting...</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="gmail" size={28} color="#EA4335" />
                  <Text style={styles.googleButtonText}>Continue with Gmail</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('LoginForm')}
              activeOpacity={0.7}
            >
              <Text style={styles.signInText}>Already have an account? </Text>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel}>Active Members</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>100+</Text>
                <Text style={styles.statLabel}>Cities Covered</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Support</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  techCircleWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  techRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(227, 5, 18, 0.1)',
    borderStyle: 'dashed',
  },
  ringGradient: {
    flex: 1,
    borderRadius: 80,
    opacity: 0.2,
  },
  techRingInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(0, 153, 51, 0.3)',
  },
  dot: {
    position: 'absolute',
    top: -4,
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SP_GREEN,
  },
  coreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SP_RED,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SP_RED,
    opacity: 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  inputWrapper: {
    marginBottom: 24,
    marginTop: 10,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 64,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  inputCardFocused: {
    borderColor: SP_RED,
    borderWidth: 2,
    shadowColor: SP_RED,
    shadowOpacity: 0.1,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    marginRight: 16,
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 18,
    fontWeight: '600',
    height: 64,
  },
  checkIcon: {
    marginLeft: 8,
  },
  buttonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 40,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButton: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#94a3b8',
  },
  bubblesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    bottom: -100,
    left: Math.random() * (width - 100),
    opacity: 0.08,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: SP_RED,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  signInText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  signInLink: {
    fontSize: 15,
    color: SP_RED,
    fontWeight: '700',
  },
  googleButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  otpNoteContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpNoteText: {
    color: '#64748b',
    fontSize: 13,
  },
  termsText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
});
