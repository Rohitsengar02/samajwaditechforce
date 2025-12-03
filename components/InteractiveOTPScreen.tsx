import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput as RNTextInput, TouchableOpacity, Animated, Easing, Keyboard, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Floating Bubble Component
const FloatingBubble = ({ delay = 0, size = 60, color = SP_RED, duration = 8000 }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 1000,
      delay,
      useNativeDriver: true,
    }).start();

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
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    />
  );
};

export default function InteractiveOTPScreen({ navigation, route }: any) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const { phone } = route.params;
  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isWideLayout = width >= 768;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Continuous rotation for the lock icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrorMessage(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Animate success checkmark if complete
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(successScale, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      shakeCard();
      setErrorMessage('Please enter the 6-digit code.');
      return;
    }

    if (otpString !== '123456') {
      shakeCard();
      setErrorMessage('Invalid OTP. For testing, please use 123456.');
      return;
    }

    Keyboard.dismiss();
    navigation.navigate('ProfileSetup', { phone });
  };

  const shakeCard = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleResend = () => {
    if (timer === 0) {
      setOtp(['', '', '', '', '', '']);
      setErrorMessage(null);
      setTimer(30);
      inputRefs.current[0]?.focus();
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  const lockRotate = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '10deg', '0deg'],
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
        <FloatingBubble delay={0} size={70} color={SP_GREEN} duration={11000} />
        <FloatingBubble delay={800} size={90} color={SP_RED} duration={9000} />
        <FloatingBubble delay={1600} size={60} color={SP_GREEN} duration={12000} />
        <FloatingBubble delay={400} size={80} color={SP_RED} duration={10000} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, isWideLayout && styles.contentWide, { opacity: fadeAnim }]}>
            {/* Header with Animated Lock Icon */}
            <View style={styles.headerSection}>
              <View style={styles.iconWrapper}>
                <Animated.View style={[styles.lockCircle, { transform: [{ scale: pulseAnim }] }]}>
                  <Animated.View style={{ transform: [{ rotate: lockRotate }] }}>
                    <MaterialCommunityIcons name="lock-outline" size={48} color="#fff" />
                  </Animated.View>
                </Animated.View>

                {/* Decorative Rings */}
                <View style={styles.ring1} />
                <View style={styles.ring2} />
              </View>

              <Title style={styles.title}>Verify Your Number</Title>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to
              </Text>
              <Text style={styles.phoneNumber}>{phone}</Text>
            </View>

            {/* OTP Input Card */}
            <Animated.View style={[styles.cardContainer, { transform: [{ translateX: shakeAnim }] }]}>
              <Card style={styles.otpCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => {
                      const isFocused = focusedIndex === index;
                      const isFilled = digit !== '';

                      return (
                        <Animated.View
                          key={index}
                          style={[
                            styles.otpInputWrapper,
                            isFocused && { transform: [{ scale: 1.1 }, { translateY: -5 }] }
                          ]}
                        >
                          <RNTextInput
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                              styles.otpInput,
                              isFilled && styles.otpInputFilled,
                              isFocused && styles.otpInputFocused,
                              errorMessage ? styles.otpInputError : null
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={() => setFocusedIndex(null)}
                            keyboardType="number-pad"
                            maxLength={1}
                            textAlign="center"
                            selectTextOnFocus
                            selectionColor={SP_RED}
                          />
                          {isFilled && !errorMessage && (
                            <View style={styles.dotIndicator} />
                          )}
                        </Animated.View>
                      );
                    })}
                  </View>

                  {errorMessage && (
                    <View style={styles.errorContainer}>
                      <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.verifyButton, isComplete && styles.verifyButtonActive]}
                    onPress={handleVerifyOTP}
                    disabled={!isComplete}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={isComplete ? [SP_RED, '#b91c1c'] : ['#e2e8f0', '#cbd5e1']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.buttonText, isComplete && styles.buttonTextActive]}>
                        Verify & Continue
                      </Text>
                      <Animated.View style={{ transform: [{ scale: successScale }] }}>
                        <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                      </Animated.View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Resend Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                <Text style={[styles.resendLink, timer === 0 && styles.resendLinkActive]}>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security Info */}
            <View style={styles.securityCard}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={SP_GREEN} />
              <Text style={styles.securityText}>
                Your information is secure and encrypted
              </Text>
            </View>
          </Animated.View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.activeDot]} />
            <View style={styles.progressDot} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 24,
  },
  contentWide: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: SP_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SP_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 2,
  },
  ring1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(0, 153, 51, 0.2)',
    borderStyle: 'dashed',
  },
  ring2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(227, 5, 18, 0.15)',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardContainer: {
    marginBottom: 30,
  },
  otpCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    padding: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    height: 60,
    alignItems: 'center',
  },
  otpInputWrapper: {
    width: 48,
    height: 56,
    position: 'relative',
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  otpInputFilled: {
    borderColor: SP_GREEN,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
  },
  otpInputFocused: {
    borderColor: SP_RED,
    backgroundColor: '#fff',
    borderWidth: 2,
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  otpInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  dotIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SP_GREEN,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  verifyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  verifyButtonActive: {
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#94a3b8',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
  resendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#64748b',
  },
  resendLink: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
  },
  resendLinkActive: {
    color: SP_RED,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: SP_GREEN,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  activeDot: {
    backgroundColor: SP_RED,
    width: 24,
  },
});
