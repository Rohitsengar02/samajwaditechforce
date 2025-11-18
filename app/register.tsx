import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const STEPS = {
  ACCOUNT: 0,
  PHONE: 1,
  OTP: 2,
  ADDRESS: 3,
  SUCCESS: 4,
} as const;

type StepKey = (typeof STEPS)[keyof typeof STEPS];

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<StepKey>(STEPS.ACCOUNT);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [address, setAddress] = useState({
    house: '',
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
  });

  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);

  const slideAnim = useState(new Animated.Value(0))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];
  const mapOffset = useState(new Animated.Value(0))[0];
  const avatarPulse = useState(new Animated.Value(0))[0];
  const mapPinBounce = useState(new Animated.Value(0))[0];
  const successPulse = useState(new Animated.Value(0))[0];

  const otpInputs = [
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
  ];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mapPinBounce, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(mapPinBounce, {
          toValue: 0,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(successPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(successPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [mapPinBounce, successPulse]);

  const startTransition = (next: StepKey) => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
      setStep(next);
    });
  };

  const handleNextFromAccount = () => {
    startTransition(STEPS.PHONE);
  };

  const handleSendOtp = () => {
    setOtp(['', '', '', '', '']);
    setOtpError('');
    startTransition(STEPS.OTP);
  };

  const handleVerifyOtp = () => {
    const code = otp.join('');
    if (code.length !== 5) {
      setOtpError('Please enter the 5-digit code.');
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      startTransition(STEPS.ADDRESS);
    }, 900);
  };

  const handleConfirmLocation = () => {
    startTransition(STEPS.SUCCESS);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const copy = [...otp];
    copy[index] = value.replace(/[^0-9]/g, '');
    setOtp(copy);

    if (value && index < otpInputs.length - 1) {
      otpInputs[index + 1].current?.focus();
    }
  };

  const handleAddressChange = (key: keyof typeof address, value: string) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
    Animated.timing(mapOffset, {
      toValue: (value.length % 10) / 10,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColors = isDark
    ? (['#050313', '#130b26', '#1f1237'] as const)
    : (['#e0e7ff', '#f5e9ff', '#ffe8fb'] as const);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });

  const mapTranslate = mapOffset.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorRow}>
        {[0, 1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              index <= step && styles.stepDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderAccountStep = () => {
    return (
      <View style={styles.accountGradientWrapper}>
        <View style={[styles.cardGlass, !isDark && styles.cardGlassLight]}>
          <Text style={[styles.stepTitle, !isDark && styles.stepTitleLight]}>Create Your Account</Text>
          <Text style={[styles.stepSubtitle, !isDark && styles.stepSubtitleLight]}>
            Let's set up your profile.
          </Text>

          <View style={styles.accountTopGradient}>
            <View style={styles.accountRow}>
              <View style={styles.accountRowLeft}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarFloat}>
                    <View style={[styles.avatarCircle, !isDark && styles.avatarCircleLight]}>
                      <Text style={[styles.avatarInitials, !isDark && styles.avatarInitialsLight]}>VU</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.avatarButton, !isDark && styles.avatarButtonLight]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.avatarButtonText}>+ Add Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.accountRowRight}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={[styles.input, !isDark && styles.inputLight]}
                    placeholder="First name"
                    placeholderTextColor={isDark ? '#9ca3af' : '#94a3b8'}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={[styles.input, !isDark && styles.inputLight]}
                    placeholder="Last name"
                    placeholderTextColor={isDark ? '#9ca3af' : '#94a3b8'}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>
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
              placeholder="Create a password"
              placeholderTextColor={isDark ? '#9ca3af' : '#94a3b8'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

        

          <View style={styles.socialSection}>
            <View style={styles.socialDividerRow}>
              <View style={styles.socialDividerLine} />
              <Text style={styles.socialDividerText}>or continue with</Text>
              <View style={styles.socialDividerLine} />
            </View>

            <View style={styles.socialButtonsColumn}>
              <TouchableOpacity activeOpacity={0.85}>
                <LinearGradient
                  colors={['#f97316', '#fb7185']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.socialButtonGradient}
                >
                  <View style={[styles.socialButtonInner, !isDark && styles.socialButtonInnerLight]}>
                    <Text style={[styles.socialButtonText, !isDark && styles.socialButtonTextLight]}>
                      Sign up with Google
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

             
            </View>

            <View style={styles.signInRow}>
              <Text style={styles.signInText}>
                Already have an account?{' '}
                <Text
                  style={styles.signInLinkText}
                  onPress={() => router.push('/signin')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPhoneStep = () => {
    return (
      <View style={[styles.cardGlass, !isDark && styles.cardGlassLight]}>
        <Text style={[styles.stepTitle, !isDark && styles.stepTitleLight]}>Verify Your Mobile Number</Text>
        <Text style={[styles.stepSubtitle, !isDark && styles.stepSubtitleLight]}>
          We will send a 5-digit code to your phone to verify your identity.
        </Text>

        <View style={styles.phoneIconRow}>
          <View style={styles.phoneIconCircle}>
            <Animated.View
              style={[
                styles.phoneIconInner,
                {
                  transform: [
                    {
                      scale: mapPinBounce.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.phoneRow}>
          <View style={[styles.phoneCountry, !isDark && styles.phoneCountryLight]}>
            <Text style={[styles.phoneCountryText, !isDark && styles.phoneCountryTextLight]}>+91</Text>
          </View>
          <TextInput
            style={[styles.input, styles.phoneInput, !isDark && styles.inputLight]}
            placeholder="Enter mobile number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={phone.replace('+91', '')}
            onChangeText={(v) => setPhone('+91' + v.replace(/[^0-9]/g, ''))}
          />
        </View>
      </View>
    );
  };

  const renderOtpStep = () => {
    const shake = shakeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 6],
    });

    return (
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <View style={[styles.cardFloating, !isDark && styles.cardFloatingLight]}>
          <Text style={[styles.stepTitle, !isDark && styles.stepTitleLight]}>Enter OTP</Text>
          <Text style={[styles.stepSubtitle, !isDark && styles.stepSubtitleLight]}>
            Check your SMS for the 5-digit verification code.
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <Animated.View
                key={index}
                style={{
                  transform: [
                    {
                      scale: digit ? 1.05 : 1,
                    },
                  ],
                }}
              >
                <TextInput
                  ref={otpInputs[index]}
                  style={[styles.otpInput, !isDark && styles.otpInputLight]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                />
              </Animated.View>
            ))}
          </View>

          <View style={styles.otpFooterRow}>
            <Text style={styles.otpInfoText}>Didn’t receive the code?</Text>
            <TouchableOpacity
              disabled={otpTimer > 0}
              activeOpacity={otpTimer > 0 ? 1 : 0.8}
            >
              <Text style={styles.resendText}>
                {otpTimer > 0 ? `Resend in 0:${otpTimer.toString().padStart(2, '0')}` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
        </View>
      </Animated.View>
    );
  };

  const renderAddressStep = () => {
    return (
      <View style={styles.addressContainer}>
        <Animated.View
          style={[
            styles.mapMock,
            {
              transform: [
                {
                  translateY: mapTranslate,
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#0ea5e9', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mapGradient}
          >
            <View style={styles.mapGrid}>
              <Animated.View
                style={[
                  styles.mapMarker,
                  {
                    transform: [
                      {
                        translateY: mapPinBounce.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -8],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <TouchableOpacity style={styles.locationButton} activeOpacity={0.8}>
              <Text style={styles.locationButtonText}>Use Current Location</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <View style={[styles.cardGlass, !isDark && styles.cardGlassLight]}>
          <Text style={[styles.stepTitle, !isDark && styles.stepTitleLight]}>Enter Your Address</Text>
          <Text style={[styles.stepSubtitle, !isDark && styles.stepSubtitleLight]}>
            This helps us connect you with local coordinators and events.
          </Text>

          <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>House / Flat / Building</Text>
              <TextInput
                style={[styles.input, !isDark && styles.inputLight]}
                placeholder="e.g., 21B, Sunrise Apartments"
                placeholderTextColor="#9ca3af"
                value={address.house}
                onChangeText={(v) => handleAddressChange('house', v)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Street / Locality</Text>
              <TextInput
                style={[styles.input, !isDark && styles.inputLight]}
                placeholder="Street or locality"
                placeholderTextColor="#9ca3af"
                value={address.street}
                onChangeText={(v) => handleAddressChange('street', v)}
              />
            </View>

            <View style={styles.inlineRow}>
              <View style={[styles.formGroup, styles.inlineField]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={[styles.input, !isDark && styles.inputLight]}
                  placeholder="City"
                  placeholderTextColor="#9ca3af"
                  value={address.city}
                  onChangeText={(v) => handleAddressChange('city', v)}
                />
              </View>
              <View style={[styles.formGroup, styles.inlineField]}>
                <Text style={styles.label}>District</Text>
                <TextInput
                  style={[styles.input, !isDark && styles.inputLight]}
                  placeholder="District"
                  placeholderTextColor="#9ca3af"
                  value={address.district}
                  onChangeText={(v) => handleAddressChange('district', v)}
                />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <View style={[styles.formGroup, styles.inlineField]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={[styles.input, !isDark && styles.inputLight]}
                  placeholder="State"
                  placeholderTextColor="#9ca3af"
                  value={address.state}
                  onChangeText={(v) => handleAddressChange('state', v)}
                />
              </View>
              <View style={[styles.formGroup, styles.inlineField]}>
                <Text style={styles.label}>Pincode</Text>
                <TextInput
                  style={[styles.input, !isDark && styles.inputLight]}
                  placeholder="6-digit PIN"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={address.pincode}
                  onChangeText={(v) => handleAddressChange('pincode', v.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderSuccessStep = () => {
    return (
      <View style={[styles.cardFloating, !isDark && styles.cardFloatingLight]}>
        <Text style={[styles.stepTitle, !isDark && styles.stepTitleLight]}>You're All Set!</Text>
        <Text style={[styles.stepSubtitle, !isDark && styles.stepSubtitleLight]}>
          Your profile is now ready. Welcome to the VSD Youth Network.
        </Text>

        <View style={styles.successBadgeWrapper}>
          <Animated.View
            style={[
              styles.successGlow,
              {
                opacity: successPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 0.9],
                }),
                transform: [
                  {
                    scale: successPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.08],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.successCircleOuter}>
            <View style={styles.successCircleInner} />
          </View>
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case STEPS.ACCOUNT:
        return renderAccountStep();
      case STEPS.PHONE:
        return renderPhoneStep();
      case STEPS.OTP:
        return renderOtpStep();
      case STEPS.ADDRESS:
        return renderAddressStep();
      case STEPS.SUCCESS:
        return renderSuccessStep();
      default:
        return null;
    }
  };

  const renderPrimaryButton = () => {
    let label = '';
    let onPress: (() => void) | null = null;
    let colors: readonly [string, string] = ['#4f46e5', '#6366f1'];

    if (step === STEPS.ACCOUNT) {
      label = 'Next';
      onPress = handleNextFromAccount;
      colors = isDark
        ? (['#4f46e5', '#6366f1'] as const)
        : (['#818cf8', '#a855f7'] as const);
    } else if (step === STEPS.PHONE) {
      label = 'Send OTP';
      onPress = handleSendOtp;
      colors = ['#0ea5e9', '#22c55e'] as const;
    } else if (step === STEPS.OTP) {
      label = isVerifying ? 'Verifying...' : 'Verify & Continue';
      onPress = handleVerifyOtp;
      colors = ['#22c55e', '#16a34a'] as const;
    } else if (step === STEPS.ADDRESS) {
      label = 'Confirm Location';
      onPress = handleConfirmLocation;
      colors = ['#f97316', '#fb7185'] as const;
    } else if (step === STEPS.SUCCESS) {
      label = 'Go to Dashboard';
      onPress = () => router.push('/(tabs)');
      colors = ['#22c55e', '#16a34a'] as const;
    }

    if (!onPress) return null;

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={backgroundColors} style={styles.screen}>
      <View style={styles.overlay}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Registration
          </Text>
          <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
            Step {step + 1} of 5
          </Text>
        </View>

        {renderStepIndicator()}

        <View style={styles.contentWrapper}>
          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateX }],
            }}
          >
            {renderCurrentStep()}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          {renderPrimaryButton()}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  contentWrapper: {
    flex: 1,
    marginTop: 8,
  },
  footer: {
    paddingTop: 8,
  },
  accountGradientWrapper: {
    borderRadius: 32,
    padding: 18,
    overflow: 'hidden',
    marginBottom: 8,
  },
  accountTopGradient: {
    borderRadius: 24,
    padding: 12,
    marginBottom: 18,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  accountRowLeft: {
    alignItems: 'center',
  },
  accountRowRight: {
    flex: 1,
    minWidth: 0,
  },
  accountBlobTop: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(244, 114, 182, 0.35)',
  },
  accountBlobBottom: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  headerRow: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerTitleDark: {
    color: '#e5e7eb',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  headerSubtitleDark: {
    color: '#9ca3af',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 6,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.5)',
  },
  stepDotActive: {
    backgroundColor: '#4f46e5',
  },
  cardGlass: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  cardGlassLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
  },
  cardFloatingLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    shadowColor: '#c4b5fd',
  },
  stepTitleLight: {
    color: '#0f172a',
  },
  stepSubtitleLight: {
    color: '#4b5563',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarFloat: {
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(129, 140, 248, 0.6)',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: '#e5e7eb',
  },
  avatarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
  avatarCircleLight: {
    backgroundColor: '#eef2ff',
  },
  avatarInitialsLight: {
    color: '#111827',
  },
  avatarButtonLight: {
    borderColor: '#6366f1',
  },
  avatarButtonText: {
    color: '#c4b5fd',
    fontSize: 13,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    color: '#e5e7eb',
    fontSize: 14,
  },
  inputLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: 'rgba(148, 163, 184, 0.7)',
    color: '#0f172a',
  },
  primaryButton: {
    marginTop: 10,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  phoneCountry: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
  },
  phoneCountryText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  phoneCountryLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: 'rgba(148, 163, 184, 0.7)',
  },
  phoneCountryTextLight: {
    color: '#0f172a',
  },
  phoneInput: {
    flex: 1,
  },
  phoneIconRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconInner: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#38bdf8',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 12,
  },
  otpInput: {
    width: 48,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.7)',
    textAlign: 'center',
    color: '#e5e7eb',
    fontSize: 20,
    fontWeight: '700',
  },
  otpInputLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: 'rgba(148, 163, 184, 0.7)',
    color: '#0f172a',
  },
  otpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  otpInfoText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  resendText: {
    color: '#a5b4fc',
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#f97373',
    fontSize: 13,
    marginBottom: 4,
  },
  verifyButton: {
    marginTop: 14,
  },
  addressContainer: {
    flex: 1,
    gap: 16,
  },
  mapMock: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  mapGradient: {
    padding: 14,
    borderRadius: 24,
  },
  mapGrid: {
    height: 140,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f97316',
    borderWidth: 3,
    borderColor: '#facc15',
  },
  locationButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
  },
  locationButtonText: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '600',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineField: {
    flex: 1,
  },
  successBadgeWrapper: {
    alignItems: 'center',
    marginVertical: 28,
  },
  cardFloating: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.45,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 24 },
    elevation: 20,
  },
  successCircleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22c55e',
  },
  successGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34, 197, 94, 0.45)',
  },
  glassButtonOuter: {
    marginTop: 10,
  },
  glassButtonBorder: {
    borderRadius: 999,
    padding: 2,
  },
  glassButtonInner: {
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  glassButtonText: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
  socialSection: {
    marginTop: 8,
  },
  socialDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  socialDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(148, 163, 184, 0.6)',
  },
  socialDividerText: {
    marginHorizontal: 8,
    fontSize: 12,
    color: '#9ca3af',
  },
  socialButtonsColumn: {
    gap: 10,
  },
  socialButtonGradient: {
    borderRadius: 999,
    padding: 1.5,
  },
  socialButtonInner: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  socialButtonInnerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  socialButtonText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '600',
  },
  socialButtonTextLight: {
    color: '#0f172a',
  },
  signInRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  signInLinkText: {
    color: '#a5b4fc',
    fontWeight: '600',
  },
});
