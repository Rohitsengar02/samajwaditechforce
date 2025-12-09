import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiUrl } from '../utils/api';
import { Alert } from 'react-native';

import InteractiveLoginScreen from '../components/InteractiveLoginScreen';
import InteractiveOTPScreen from '../components/InteractiveOTPScreen';
import ProfileSetupScreen from '../components/ProfileSetupScreen';
import InteractiveCompleteScreen from '../components/InteractiveCompleteScreen';
import AddressFormScreen from '../components/AddressFormScreen';

const STEPS = {
  LOGIN: 0,
  OTP: 1,
  PROFILE: 2,
  ADDRESS: 3,
  COMPLETE: 4,
} as const;

type StepKey = (typeof STEPS)[keyof typeof STEPS];

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>(STEPS.LOGIN);
  const [phone, setPhone] = useState<string>('');

  const [profileData, setProfileData] = useState<any>(null);

  const { width } = Dimensions.get('window');
  const isWideLayout = width >= 768;

  // On desktop/web, show a custom dedicated register UI instead of the mobile interactive flow
  if (isWideLayout) {
    return <DesktopRegisterScreen />;
  }

  const loginNavigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'OTPVerification') {
        setPhone(params?.phone ?? '');
        setStep(STEPS.OTP);
      } else if (screen === 'LoginForm') {
        router.push('/signin');
      }
    },
  };

  const otpNavigation = {
    goBack: () => {
      setStep(STEPS.LOGIN);
    },
    navigate: (screen: string, params?: any) => {
      if (screen === 'ProfileSetup') {
        setStep(STEPS.PROFILE);
      }
    },
  };

  const profileNavigation = {
    goBack: () => {
      setStep(STEPS.OTP);
    },
    navigate: (screen: string, params?: any) => {
      if (screen === 'AddressForm') {
        if (params?.profileData) {
          setProfileData(params.profileData);
        }
        setStep(STEPS.ADDRESS);
      }
    },
  };

  const addressNavigation = {
    goBack: () => {
      setStep(STEPS.PROFILE);
    },
    navigate: (screen: string, params?: any) => {
      if (screen === 'ServiceSelection') {
        setStep(STEPS.COMPLETE);
      }
    },
  };

  const completeNavigation = {
    navigate: (screen: string) => {
      if (screen === 'Dashboard') {
        router.push('/(tabs)');
      } else if (screen === 'LoginForm') {
        router.push('/signin');
      }
    },
  };

  const renderStep = () => {
    switch (step) {
      case STEPS.LOGIN:
        return <InteractiveLoginScreen navigation={loginNavigation} />;
      case STEPS.OTP:
        return (
          <InteractiveOTPScreen
            navigation={otpNavigation}
            route={{ params: { phone } }}
          />
        );
      case STEPS.PROFILE:
        return (
          <ProfileSetupScreen
            navigation={profileNavigation}
            route={{ params: { phone } }}
          />
        );
      case STEPS.ADDRESS:
        return (
          <AddressFormScreen
            navigation={addressNavigation}
            route={{ params: { phone, profileData } }}
          />
        );
      case STEPS.COMPLETE:
        return <InteractiveCompleteScreen navigation={completeNavigation} />;
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderStep()}</View>;
}

function DesktopRegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Samajwadi Theme Colors
  const SP_RED = '#E30512';
  const SP_GREEN = '#009933';
  const SP_DARK = '#1a1a1a';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  const heroStyle = {
    transform: [
      {
        translateY: heroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
    ],
  };

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);

    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          name: fullName,
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowOtpModal(true);
        setOtp('');
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Error', 'Network error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length === 0 || otpLoading) return;
    setOtpLoading(true);

    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setShowOtpModal(false);
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.push('/(tabs)') }
        ]);
      } else {
        Alert.alert('Error', data.message || 'OTP Verification failed.');
      }
    } catch (error) {
      console.error('Verification Error:', error);
      Alert.alert('Error', 'Network error. Please check your internet connection.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    router.push('/signin');
  };

  return (
    <View style={styles.desktopScreen}>
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef', '#dee2e6']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Background Elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.desktopOverlay}>
        <View style={styles.desktopRow}>
          {/* Left Side - Hero Content */}
          <Animated.View style={[styles.desktopLeft, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
              colors={[SP_RED, '#b91c1c']}
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
                    Join the Samajwadi Tech Force
                  </Text>
                  <Text style={styles.desktopLeftSubtitle}>
                    Be part of the digital revolution. Connect, campaign, and contribute to the change.
                  </Text>
                </View>

                <Animated.View style={[styles.illustrationContainer, heroStyle]}>
                  {/* Abstract Bicycle / Wheel Representation */}
                  <View style={styles.wheelContainer}>
                    <MaterialCommunityIcons name="bicycle" size={120} color="rgba(255,255,255,0.9)" />
                  </View>
                  <View style={styles.floatingCard}>
                    <MaterialCommunityIcons name="account-group" size={24} color={SP_RED} />
                    <Text style={styles.floatingCardText}>Join Community</Text>
                  </View>
                  <View style={[styles.floatingCard, styles.floatingCardRight]}>
                    <MaterialCommunityIcons name="bullhorn" size={24} color={SP_GREEN} />
                    <Text style={[styles.floatingCardText, { color: SP_GREEN }]}>Voice of Youth</Text>
                  </View>
                </Animated.View>

                <View style={styles.desktopLeftFooter}>
                  <Text style={styles.desktopLeftFooterText}>© 2024 Samajwadi Party</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Right Side - Registration Form */}
          <Animated.View style={[styles.desktopRight, { opacity: fadeAnim }]}>
            <BlurView intensity={80} tint="light" style={styles.desktopCard}>
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>Enter your details to get started</Text>

              <View style={styles.formContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Akhilesh Yadav"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                >
                  <LinearGradient
                    colors={canSubmit ? [SP_GREEN, '#15803d'] : ['#e5e7eb', '#d1d5db']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                      {loading ? 'Creating Account...' : 'Register'}
                    </Text>
                    {canSubmit && <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>Already have an account?</Text>
                  <TouchableOpacity onPress={handleGoToSignIn}>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </View>

        {/* OTP Modal */}
        {showOtpModal && (
          <View style={styles.otpOverlay}>
            <BlurView intensity={40} tint="dark" style={styles.otpBlur}>
              <View style={styles.otpCard}>
                <View style={styles.otpIconContainer}>
                  <MaterialCommunityIcons name="cellphone-message" size={32} color={SP_RED} />
                </View>
                <Text style={styles.otpTitle}>Verify Mobile</Text>
                <Text style={styles.otpSubtitle}>
                  Enter the 6-digit code sent to {phone}
                </Text>

                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleVerifyOtp}
                  disabled={otp.length < 6 || otpLoading}
                  style={styles.otpButton}
                >
                  <LinearGradient
                    colors={[SP_RED, '#b91c1c']}
                    style={styles.otpButtonGradient}
                  >
                    <Text style={styles.otpButtonText}>
                      {otpLoading ? 'Verifying...' : 'Verify & Continue'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowOtpModal(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  desktopScreen: {
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
    backgroundColor: 'rgba(227, 5, 18, 0.05)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(0, 153, 51, 0.05)',
  },
  desktopOverlay: {
    flex: 1,
    paddingHorizontal: 64,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  desktopRow: {
    flexDirection: 'row',
    maxWidth: 1200,
    width: '100%',
    height: 700,
    alignSelf: 'center',
    gap: 40,
  },
  desktopLeft: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#E30512',
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
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 56,
    marginBottom: 16,
  },
  desktopLeftSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 28,
    maxWidth: 400,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wheelContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  floatingCard: {
    position: 'absolute',
    top: 40,
    left: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingCardRight: {
    top: 'auto',
    bottom: 60,
    left: 'auto',
    right: 0,
  },
  floatingCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E30512',
  },
  desktopLeftFooter: {
    marginTop: 32,
  },
  desktopLeftFooterText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  desktopRight: {
    flex: 1,
    justifyContent: 'center',
  },
  desktopCard: {
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
  formTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  formContent: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1a1a1a',
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: '#009933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  submitTextDisabled: {
    color: '#9ca3af',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  loginText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#E30512',
    fontSize: 15,
    fontWeight: '700',
  },
  otpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  otpBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  otpCard: {
    width: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  otpIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(227, 5, 18, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  otpInput: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    marginBottom: 24,
    backgroundColor: '#f9fafb',
    color: '#1a1a1a',
  },
  otpButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  otpButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});
