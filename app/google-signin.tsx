import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
    Platform,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/api';

// Enable web browser redirect for OAuth
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

// SamajwadiTheme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

// Google OAuth Client IDs
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

// Floating Particle Component
const FloatingParticle = ({ delay = 0, size = 60, left = '10%', duration = 8000 }: any) => {
    const translateY = useRef(new Animated.Value(height + 100)).current;
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
                styles.particle,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    left,
                    transform: [{ translateY }, { translateX }, { scale }],
                },
            ]}
        />
    );
};

export default function InteractiveGoogleSigninScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Email/Password state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const welcomeScale = useRef(new Animated.Value(0.8)).current;

    // Google OAuth configuration
    // Use the Reverse Client ID scheme for redirect
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'com.googleusercontent.apps.994334881012-4nls5jej6oehnreecpft35h09chgo1bu',
        path: 'oauth2redirect/google'
    });

    const config: any = {
        clientId: GOOGLE_WEB_CLIENT_ID,
        redirectUri: redirectUri,
    };

    // Pass androidClientId to ensure SHA-1 verification matches
    if (GOOGLE_ANDROID_CLIENT_ID) config.androidClientId = GOOGLE_ANDROID_CLIENT_ID;
    if (GOOGLE_IOS_CLIENT_ID) config.iosClientId = GOOGLE_IOS_CLIENT_ID;

    const [request, response, promptAsync] = Google.useAuthRequest(config);

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
            Animated.spring(welcomeScale, {
                toValue: 1,
                friction: 6,
                tension: 30,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.quad),
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
                handleGoogleBackendSync(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            console.error('Google Auth Error:', response.error);
            Alert.alert('Authentication Error', 'Could not sign in with Google. Please try again.');
            setLoading(false);
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

            // 2. Call Backend API to login
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

            if (!backendResponse.ok) {
                throw new Error(backendData.message || 'Failed to sign in');
            }

            // 3. Save Token
            if (backendData.token) {
                await AsyncStorage.setItem('userToken', backendData.token);
                await AsyncStorage.setItem('userInfo', JSON.stringify(backendData));
            }

            // 4. Navigate to Dashboard
            console.log('🔹 Sign in successful - Going to Dashboard');
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Error signing in:', error);
            Alert.alert('Sign In Failed', error.message || 'Could not complete sign in. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSignin = async () => {
        if (!GOOGLE_WEB_CLIENT_ID && !GOOGLE_ANDROID_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID) {
            Alert.alert("Configuration Missing", "Google Client IDs are not configured.");
            return;
        }

        setLoading(true);
        await promptAsync();
    };

    const handleEmailSignin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter both email and password');
            return;
        }

        setEmailLoading(true);
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token and user info
            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(data));

            // Navigate to dashboard
            Alert.alert('Success', 'Welcome back!');
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Sign In Failed', error.message);
        } finally {
            setEmailLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}>
                {/* Gradient Background */}
                <LinearGradient
                    colors={['#ffffff', '#fef2f2', '#f0fdf4']}
                    style={styles.background}
                />

                {/* Floating Particles */}
                <View style={styles.particlesContainer}>
                    <FloatingParticle delay={0} size={80} left="15%" duration={9000} />
                    <FloatingParticle delay={800} size={100} left="70%" duration={10000} />
                    <FloatingParticle delay={400} size={70} left="45%" duration={11000} />
                </View>

                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={24} color={SP_DARK} />
                        </TouchableOpacity>

                        {/* Welcome Message */}
                        <Animated.View
                            style={[
                                styles.welcomeContainer,
                                {
                                    transform: [{ scale: welcomeScale }],
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={[SP_GREEN, '#15803d']}
                                style={styles.welcomeBadge}
                            >
                                <MaterialCommunityIcons name="hand-wave" size={32} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                            <Text style={styles.welcomeSubtitle}>
                                Continue where you left off{'\n'}and stay connected
                            </Text>
                        </Animated.View>

                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="bicycle" size={56} color={SP_RED} />
                            </View>
                        </View>

                        {/* Benefits */}
                        <View style={styles.benefitsContainer}>
                            <View style={styles.benefitItem}>
                                <MaterialCommunityIcons name="check-circle" size={20} color={SP_GREEN} />
                                <Text style={styles.benefitText}>Access all features</Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <MaterialCommunityIcons name="check-circle" size={20} color={SP_GREEN} />
                                <Text style={styles.benefitText}>Stay updated</Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <MaterialCommunityIcons name="check-circle" size={20} color={SP_GREEN} />
                                <Text style={styles.benefitText}>Connect with community</Text>
                            </View>
                        </View>

                        {/* Email/Password Form */}
                        <View style={styles.formSection}>
                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#94a3b8"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialCommunityIcons
                                        name={showPassword ? "eye-off" : "eye"}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Email Sign In Button */}
                            <TouchableOpacity
                                style={[styles.emailButton, emailLoading && styles.buttonDisabled]}
                                onPress={handleEmailSignin}
                                disabled={emailLoading}
                            >
                                <LinearGradient
                                    colors={[SP_RED, '#b91c1c']}
                                    style={styles.emailGradient}
                                >
                                    {emailLoading ? (
                                        <>
                                            <MaterialCommunityIcons name="loading" size={24} color="#fff" />
                                            <Text style={styles.emailButtonText}>Signing In...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="login" size={24} color="#fff" />
                                            <Text style={styles.emailButtonText}>Sign In</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Sign In Button */}
                        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={handleGoogleSignin}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#fff', '#f8f9fa']}
                                    style={styles.googleGradient}
                                >
                                    {loading ? (
                                        <>
                                            <MaterialCommunityIcons name="loading" size={24} color={SP_RED} />
                                            <Text style={styles.googleText}>Signing In...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="google" size={24} color="#EA4335" />
                                            <Text style={styles.googleText}>Sign In with Google</Text>
                                            <MaterialCommunityIcons name="arrow-right" size={20} color={SP_DARK} />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Don't have account */}
                        <TouchableOpacity
                            style={styles.signupLink}
                            onPress={() => router.push('/google-signup')}
                        >
                            <Text style={styles.signupText}>
                                Don't have an account?{' '}
                                <Text style={styles.signupTextBold}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Privacy Note */}
                        <View style={styles.privacyNote}>
                            <MaterialCommunityIcons name="shield-check" size={16} color={SP_GREEN} />
                            <Text style={styles.privacyText}>
                                Your data is secure and encrypted
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
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
    particlesContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    particle: {
        position: 'absolute',
        backgroundColor: SP_GREEN + '10',
        bottom: -100,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: height * 0.08,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: height * 0.06,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    welcomeBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: SP_GREEN,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    welcomeTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: SP_DARK,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
    },
    iconContainer: {
        marginBottom: 40,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: SP_RED + '15',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: SP_RED + '30',
    },
    benefitsContainer: {
        width: '100%',
        marginBottom: 40,
        gap: 16,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    benefitText: {
        fontSize: 15,
        color: SP_DARK,
        fontWeight: '600',
    },
    googleButton: {
        width: '100%',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    googleGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    googleText: {
        fontSize: 16,
        fontWeight: '700',
        color: SP_DARK,
        flex: 1,
        textAlign: 'center',
    },
    signupLink: {
        marginBottom: 24,
    },
    signupText: {
        fontSize: 14,
        color: '#64748b',
    },
    signupTextBold: {
        color: SP_RED,
        fontWeight: '700',
    },
    privacyNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: SP_GREEN + '10',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    privacyText: {
        fontSize: 12,
        color: '#15803d',
        fontWeight: '600',
    },
    formSection: {
        width: '100%',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: SP_DARK,
    },
    emailButton: {
        width: '100%',
        marginBottom: 0,
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    emailGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 12,
    },
    emailButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
    },
});
