import React, { useState, useRef, useEffect } from 'react';
import { registerWithEmail } from '../utils/firebase';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Animated, Easing, TextInput as RNTextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Card, Title, Text, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

interface ProfileSetupProps {
  navigation: any;
  route: { params?: { phone?: string; mode?: 'edit'; googleData?: { name?: string; email?: string; photo?: string } } };
}

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

// Custom Animated Input Component
const AnimatedInput = ({ label, value, onChangeText, icon, error, ...props }: any) => {
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: focused || value ? 1 : 0,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const labelStyle = {
    top: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, -10],
    }),
    fontSize: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error ? '#ef4444' : (focused ? SP_RED : '#64748b'),
  };

  const containerStyle = {
    borderColor: error ? '#ef4444' : (focused ? SP_RED : '#e2e8f0'),
    borderWidth: focused ? 2 : 1,
    backgroundColor: focused ? '#fff' : '#f8fafc',
    transform: [{ translateX: shakeAnim }],
  };

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text style={[styles.floatingLabel, labelStyle]}>
        {label}
      </Animated.Text>
      <Animated.View style={[styles.animatedInputContainer, containerStyle]}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={focused ? SP_RED : '#94a3b8'}
            style={styles.inputIcon}
          />
        )}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          style={[styles.nativeInput, icon && { paddingLeft: 40 }]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor="transparent"
          selectionColor={SP_RED}
          {...props}
        />
      </Animated.View>
    </View>
  );
};

export default function ProfileSetupScreen({ navigation, route }: ProfileSetupProps) {
  const phoneFromLogin = route?.params?.phone ?? '';
  const mode = route?.params?.mode;
  const googleData = route?.params?.googleData;

  const isEditMode = mode === 'edit';

  // Pre-fill from Google data if available
  const [fullName, setFullName] = useState(googleData?.name || '');
  const [phone, setPhone] = useState(phoneFromLogin || '');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState(googleData?.email || '');
  const [hasPhoto, setHasPhoto] = useState<boolean>(!!googleData?.photo);
  const [photoUri, setPhotoUri] = useState<string | null>(googleData?.photo || null);
  const [password, setPassword] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const photoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
    ]).start();

    // Photo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(photoScale, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(photoScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const [uploading, setUploading] = useState(false);

  // Cloudinary Config
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dssmutzly/image/upload";
  const UPLOAD_PRESET = "multimallpro";

  const uploadImageToCloudinary = async (uri: string) => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'profile_image.jpg',
    } as any);
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('cloud_name', 'dssmutzly');

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      return null;
    }
  };

  const handleNext = async () => {
    const valid =
      !!fullName &&
      phone.length === 10 &&
      !!gender &&
      !!dob &&
      isValidEmail(email) &&
      password.length >= 6;

    if (!valid) {
      setShowErrors(true);
      return;
    }

    setUploading(true);

    let uploadedImageUrl = photoUri;

    if (photoUri && hasPhoto) {
      const cloudUrl = await uploadImageToCloudinary(photoUri);

      if (cloudUrl) {
        uploadedImageUrl = cloudUrl;
      }
    }

    // Register with Firebase if not in edit mode
    if (!isEditMode) {
      const { user, error } = await registerWithEmail(email, password);

      if (error) {
        setUploading(false);
        Alert.alert('Registration Failed', error);
        return;
      }
    }

    setUploading(false);

    const profileData: any = {
      name: fullName,
      email,
      gender,
      dob,
      phone: phone,
      password,
      profileImage: uploadedImageUrl,
    };

    console.log('Profile data (UI only):', profileData);

    if (isEditMode) {
      navigation.goBack();
    } else {
      navigation.navigate('AddressForm', { profileData });
    }
  };

  const handlePhotoPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setHasPhoto(true);
    }
  };

  const isValid =
    !!fullName &&
    phone.length === 10 &&
    !!gender &&
    !!dob &&
    isValidEmail(email) &&
    password.length >= 6;

  const handleDobChange = (value: string) => {
    let digits = value.replace(/[^0-9]/g, '').slice(0, 8);
    if (digits.length >= 5) {
      digits = `${digits.slice(0, 2)} /${digits.slice(2, 4)}/${digits.slice(4, 8)} `;
    } else if (digits.length >= 3) {
      digits = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    setDob(digits);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#f0fdf4', '#fef2f2']} style={styles.background} />

      {/* Floating Bubbles */}
      <View style={styles.bubblesContainer}>
        <FloatingBubble delay={0} size={70} color={SP_RED} duration={10000} />
        <FloatingBubble delay={1000} size={90} color={SP_GREEN} duration={11000} />
        <FloatingBubble delay={500} size={60} color={SP_RED} duration={12000} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <Title style={styles.headerTitle}>Complete Your Profile</Title>
              <Text style={styles.headerSubtitle}>Just a few more details to get  started</Text>
            </View>

            {/* Photo Upload */}
            <Animated.View style={[styles.photoSection, { transform: [{ scale: photoScale }] }]}>
              <TouchableOpacity
                style={styles.photoContainer}
                onPress={handlePhotoPress}
                activeOpacity={0.8}
              >
                {hasPhoto && photoUri ? (
                  <View style={styles.photoPreview}>
                    <Image source={{ uri: photoUri }} style={styles.photoImage} />
                    <View style={styles.editBadge}>
                      <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <LinearGradient
                      colors={[SP_RED, '#b91c1c']}
                      style={styles.photoGradient}
                    >
                      <MaterialCommunityIcons name="camera-plus" size={32} color="#fff" />
                    </LinearGradient>
                    <View style={styles.uploadRing} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.photoHint}>Upload Profile Photo</Text>
            </Animated.View>

            {/* Form Card */}
            <Card style={styles.formCard}>
              <Card.Content style={styles.cardContent}>
                <AnimatedInput
                  label="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  icon="account-outline"
                  error={showErrors && !fullName}
                />
                {showErrors && !fullName && (
                  <Text style={styles.errorText}>Full name is required</Text>
                )}

                <AnimatedInput
                  label="Mobile Number"
                  value={phone}
                  onChangeText={(text: string) => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
                  icon="phone-outline"
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={showErrors && phone.length !== 10}
                />
                {showErrors && phone.length !== 10 && (
                  <Text style={styles.errorText}>Enter a valid 10-digit mobile number</Text>
                )}

                {/* Gender Selection */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.sectionLabel}>Gender</Text>
                  <View style={styles.genderRow}>
                    {[
                      { label: 'Male', icon: 'gender-male' },
                      { label: 'Female', icon: 'gender-female' },
                      { label: 'Other', icon: 'gender-transgender' }
                    ].map(option => {
                      const selected = gender === option.label;
                      return (
                        <TouchableOpacity
                          key={option.label}
                          onPress={() => setGender(option.label)}
                          activeOpacity={0.7}
                          style={[styles.genderChip, selected && styles.genderChipSelected]}
                        >
                          <MaterialCommunityIcons
                            name={option.icon as any}
                            size={20}
                            color={selected ? '#fff' : '#64748b'}
                          />
                          <Text style={[styles.genderText, selected && styles.genderTextSelected]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {showErrors && !gender && (
                    <Text style={styles.errorText}>Please select a gender</Text>
                  )}
                </View>

                <AnimatedInput
                  label="Date of Birth (DD/MM/YYYY)"
                  value={dob}
                  onChangeText={handleDobChange}
                  icon="calendar-outline"
                  keyboardType="number-pad"
                  maxLength={10}
                  error={showErrors && (!dob || dob.length !== 10)}
                />
                {showErrors && (!dob || dob.length !== 10) && (
                  <Text style={styles.errorText}>Enter a valid date</Text>
                )}

                <AnimatedInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  icon="email-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  // Email is read-only as it comes from auth
                  editable={false}
                  error={showErrors && !isValidEmail(email)}
                />
                {showErrors && !isValidEmail(email) && (
                  <Text style={styles.errorText}>Enter a valid email</Text>
                )}

                <View style={styles.passwordWrapper}>
                  <AnimatedInput
                    label="Create Password"
                    value={password}
                    onChangeText={setPassword}
                    icon="lock-outline"
                    secureTextEntry={!showPassword}
                    error={showErrors && password.length < 6}
                  />
                  <TouchableOpacity
                    style={styles.passwordEyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
                {showErrors && password.length < 6 && (
                  <Text style={styles.errorText}>Password must be at least 6 characters</Text>
                )}

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleNext}
                  disabled={(!isEditMode && !isValid) || uploading}
                  style={[styles.submitButton, ((!isEditMode && !isValid) || uploading) && styles.submitButtonDisabled]}
                >
                  <LinearGradient
                    colors={(!isEditMode && !isValid) ? ['#e5e7eb', '#d1d5db'] : [SP_GREEN, '#15803d']}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.submitText, (!isEditMode && !isValid) && styles.submitTextDisabled]}>
                      {isEditMode ? 'Update Profile' : (uploading ? 'Uploading Image...' : 'Complete Setup')}
                    </Text>
                    {(isEditMode || isValid) && (
                      <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: height * 0.06,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  uploadRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(227, 5, 18, 0.2)',
    borderStyle: 'dashed',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: SP_RED,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoHint: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  formCard: {
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
  inputWrapper: {
    marginBottom: 24,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: 12,
    fontWeight: '600',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  animatedInputContainer: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  nativeInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1e293b',
    height: '100%',
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  genderChipSelected: {
    backgroundColor: SP_RED,
    borderColor: SP_RED,
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  genderText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  genderTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordEyeButton: {
    position: 'absolute',
    right: 16,
    top: 28,
    zIndex: 2,
    padding: 4,
  },
  errorText: {
    marginTop: -16,
    marginBottom: 16,
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
    fontWeight: '500',
  },
  submitButton: {
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  submitTextDisabled: {
    color: '#94a3b8',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
    gap: 8,
    backgroundColor: 'transparent',
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
