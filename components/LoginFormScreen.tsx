import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native';
import { Card, Title, Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Floating Particle Component
const FloatingParticle = ({ delay = 0, size = 8, color = SP_RED }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -30,
            duration: 2000,
            delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            delay,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
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
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

export default function LoginFormScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = () => {
    if (phone.length < 10 || password.length < 6) {
      return;
    }
    // Navigate to Dashboard
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Dashboard');
    }
  };

  const handleSignup = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Register');
    }
  };

  const isFormValid = phone.length >= 10 && password.length >= 6;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#ffffff', '#fef2f2', '#f0fdf4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Floating Particles */}
      <View style={styles.particlesContainer}>
        <FloatingParticle delay={0} size={6} color={SP_RED} />
        <FloatingParticle delay={500} size={8} color={SP_GREEN} />
        <FloatingParticle delay={1000} size={5} color={SP_RED} />
        <FloatingParticle delay={1500} size={7} color={SP_GREEN} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Header */}
          <View style={styles.headerSection}>
            <Animated.View style={[styles.logoContainer, { transform: [{ rotate }] }]}>
              <LinearGradient
                colors={[SP_RED, '#b91c1c']}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="bicycle" size={50} color="#fff" />
              </LinearGradient>

              {/* Outer Ring */}
              <View style={styles.outerRing} />
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Title style={styles.title}>Welcome Back</Title>
            </Animated.View>
            <Text style={styles.subtitle}>Sign in to Samajwadi Tech Force</Text>
          </View>

          {/* Login Form Card */}
          <Card style={styles.formCard} elevation={0}>
            <Card.Content style={styles.cardContent}>
              {/* Phone Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  <MaterialCommunityIcons name="phone" size={14} color={SP_RED} /> Mobile Number
                </Text>
                <View style={[styles.inputContainer, phoneFocused && styles.inputContainerFocused]}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    mode="flat"
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#94a3b8"
                    style={styles.textInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    contentStyle={styles.inputContent}
                    textColor="#1e293b"
                  />
                  {phone.length === 10 && (
                    <Animated.View style={styles.checkIcon}>
                      <MaterialCommunityIcons name="check-circle" size={22} color={SP_GREEN} />
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  <MaterialCommunityIcons name="lock" size={14} color={SP_RED} /> Password
                </Text>
                <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
                  <TextInput
                    mode="flat"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    placeholder="Enter password"
                    placeholderTextColor="#94a3b8"
                    style={styles.passwordInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    contentStyle={styles.inputContent}
                    textColor="#1e293b"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isFormValid && styles.loginButtonActive
                ]}
                onPress={handleLogin}
                disabled={!isFormValid}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isFormValid ? [SP_RED, '#b91c1c'] : ['#e2e8f0', '#cbd5e1']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[
                    styles.buttonText,
                    isFormValid && styles.buttonTextActive
                  ]}>
                    Sign In
                  </Text>
                  {isFormValid && <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />}
                </LinearGradient>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#fef2f2', '#fee2e2']}
                style={styles.featureIconBox}
              >
                <MaterialCommunityIcons name="shield-check" size={24} color={SP_RED} />
              </LinearGradient>
              <Text style={styles.featureText}>Secure Login</Text>
            </View>
            <View style={styles.featureCard}>
              <LinearGradient
                colors={['#f0fdf4', '#dcfce7']}
                style={styles.featureIconBox}
              >
                <MaterialCommunityIcons name="flash" size={24} color={SP_GREEN} />
              </LinearGradient>
              <Text style={styles.featureText}>Quick Access</Text>
            </View>
          </View>

          {/* Signup Section */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
              <Text style={styles.signupLink}>Join Now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    left: Math.random() * width,
    top: height * 0.2 + Math.random() * (height * 0.6),
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  outerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(227, 5, 18, 0.2)',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    padding: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    height: 60,
    alignItems: 'center',
  },
  inputContainerFocused: {
    borderColor: SP_RED,
    backgroundColor: '#fff',
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  countryCode: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
    height: '100%',
  },
  countryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    height: '100%',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    height: '100%',
    paddingHorizontal: 16,
    paddingRight: 50,
  },
  inputContent: {
    fontSize: 16,
    color: '#1e293b',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  checkIcon: {
    marginRight: 12,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  loginButtonActive: {
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  buttonTextActive: {
    color: '#ffffff',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    fontSize: 14,
    color: SP_RED,
    fontWeight: '700',
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  featureIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  signupSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  signupButton: {
    marginLeft: 4,
  },
  signupLink: {
    fontSize: 15,
    color: SP_RED,
    fontWeight: '800',
  },
});
