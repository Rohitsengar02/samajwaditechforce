import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing, Keyboard, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Card, Title, Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

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
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
        },
      ]}
    />
  );
};

export default function InteractiveLoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);

  // Animation Values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const inputScale = useRef(new Animated.Value(1)).current;
  const bgGradientAnim = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;

  const isWideLayout = width >= 768;

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

  // React to typing
  const handlePhoneChange = (text: string) => {
    setPhone(text);

    // "Energize" animation on typing
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Shift background gradient slightly
    Animated.timing(bgGradientAnim, {
      toValue: text.length / 10, // 0 to 1 based on length
      duration: 300,
      useNativeDriver: false, // Color interpolation doesn't support native driver
    }).start();
  };

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(inputScale, {
      toValue: 1.02,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(inputScale, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleSendOTP = async () => {
    if (phone.length < 10) return;
    Keyboard.dismiss();
    navigation.navigate('OTPVerification', { phone });
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
                  name={phone.length > 0 ? "cellphone-text" : "bicycle"}
                  size={40}
                  color="#fff"
                />
              </Animated.View>

              {/* Floating Particles */}
              <Animated.View style={[styles.particle, { top: 0, left: 20, transform: [{ translateY: particleY }] }]} />
              <Animated.View style={[styles.particle, { bottom: 20, right: 20, transform: [{ translateY: Animated.multiply(particleY, -1) }] }]} />
            </View>

            <Title style={styles.title}>Samajwadi Tech Force</Title>
            <Text style={styles.subtitle}>Digital Revolution Begins With You</Text>
          </View>

          {/* Interactive Form Area */}
          <View style={styles.formContainer}>
            <Animated.View style={[styles.inputWrapper, { transform: [{ scale: inputScale }] }]}>
              <View style={[styles.inputCard, focused && styles.inputCardFocused]}>
                <View style={styles.countryCode}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.code}>+91</Text>
                </View>

                <TextInput
                  mode="flat"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="Enter Mobile Number"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor={SP_DARK}
                  selectionColor={SP_RED}
                />

                {/* Validation Checkmark */}
                {phone.length === 10 && (
                  <View style={styles.checkIcon}>
                    <MaterialCommunityIcons name="check-circle" size={24} color={SP_GREEN} />
                  </View>
                )}
              </View>
            </Animated.View>

            <TouchableOpacity
              style={[styles.buttonContainer, phone.length < 10 && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={phone.length < 10}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={phone.length >= 10 ? [SP_RED, '#b91c1c'] : ['#e2e8f0', '#cbd5e1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={[styles.buttonText, phone.length < 10 && styles.buttonTextDisabled]}>
                  Get Verification Code
                </Text>
                {phone.length >= 10 && (
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('LoginForm')}
              activeOpacity={0.7}
            >
              <Text style={styles.signInText}>Already have an account? </Text>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>

            {/* Features Grid - Removed as per request */}
            {/* <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: '#fef2f2' }]}>
                  <MaterialCommunityIcons name="bullhorn-outline" size={24} color={SP_RED} />
                </View>
                <Text style={styles.featureText}>Campaign Updates</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: '#f0fdf4' }]}>
                  <MaterialCommunityIcons name="account-group-outline" size={24} color={SP_GREEN} />
                </View>
                <Text style={styles.featureText}>Join Community</Text>
              </View>
            </View> */}

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

            {/* Info Card */}

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
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: SP_RED,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: 20,
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
});
