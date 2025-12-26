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

// Samajwadi Theme Colors
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

export default function InteractiveGoogleSignupScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Google OAuth configuration
    const redirectUri = Platform.OS === 'web'
        ? (typeof window !== 'undefined' ? `${window.location.origin}/auth` : AuthSession.makeRedirectUri({ path: 'auth' }))
        : undefined;

    const config: any = {
        clientId: GOOGLE_WEB_CLIENT_ID,
    };

    if (redirectUri) {
        config.redirectUri = redirectUri;
    }

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

            // 2. Call Backend API to register/login
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
                throw new Error(backendData.message || 'Failed to sync with backend');
            }

            // 3. Save Token
            if (backendData.token) {
                await AsyncStorage.setItem('userToken', backendData.token);
                await AsyncStorage.setItem('userInfo', JSON.stringify(backendData));
            }

            // 4. Check if new user or existing user
            if (backendData.isNewUser || backendResponse.status === 201) {
                // New user → Go to Profile Setup
                console.log('🔹 New User - Going to Profile Setup');
                router.replace({
                    pathname: '/register',
                    params: {
                        googleData: JSON.stringify({
                            name: userInfo.name,
                            email: userInfo.email,
                            photo: userInfo.picture
                        })
                    }
                });
            } else {
                // Existing user → Go to Dashboard
                console.log('🔹 Existing User - Going to Dashboard');
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            console.error('Error syncing Google user:', error);
            Alert.alert('Sign Up Failed', error.message || 'Could not complete sign up. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        if (!GOOGLE_WEB_CLIENT_ID && !GOOGLE_ANDROID_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID) {
            Alert.alert("Configuration Missing", "Google Client IDs are not configured.");
            return;
        }

        setLoading(true);
        await promptAsync();
    };

    return (
        <View style={styles.container}>
            {/* Gradient Background */}
            <LinearGradient
                colors={['#ffffff', '#f0fdf4', '#fef2f2']}
                style={styles.background}
            />

            {/* Floating Particles */}
            <View style={styles.particlesContainer}>
                <FloatingParticle delay={0} size={70} left="10%" duration={10000} />
                <FloatingParticle delay={1000} size={90} left="75%" duration={11000} />
                <FloatingParticle delay={500} size={60} left="50%" duration={12000} />
            </View>

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

                {/* Icon */}
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={[SP_RED, '#b91c1c']}
                        style={styles.iconGradient}
                    >
                        <MaterialCommunityIcons name="bicycle" size={64} color="#fff" />
                    </LinearGradient>
                </View>

                {/* Title */}
                <Text style={styles.title}>Join Samajwadi Tech Force</Text>
                <Text style={styles.subtitle}>
                    Connect with millions of supporters{'\n'}across the nation
                </Text>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                        <View style={[styles.featureIcon, { backgroundColor: SP_GREEN + '20' }]}>
                            <MaterialCommunityIcons name="account-group" size={24} color={SP_GREEN} />
                        </View>
                        <Text style={styles.featureText}>Join Community</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={[styles.featureIcon, { backgroundColor: SP_RED + '20' }]}>
                            <MaterialCommunityIcons name="bullhorn" size={24} color={SP_RED} />
                        </View>
                        <Text style={styles.featureText}>Voice Your Ideas</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={[styles.featureIcon, { backgroundColor: '#3b82f6' + '20' }]}>
                            <MaterialCommunityIcons name="vote" size={24} color="#3b82f6" />
                        </View>
                        <Text style={styles.featureText}>Participate</Text>
                    </View>
                </View>

                {/* Google Sign Up Button */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleSignup}
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
                                    <Text style={styles.googleText}>Sign Up with Google</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={20} color={SP_DARK} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Already have account */}
                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.push('/google-signin')}
                >
                    <Text style={styles.loginText}>
                        Already have an account?{' '}
                        <Text style={styles.loginTextBold}>Sign In</Text>
                    </Text>
                </TouchableOpacity>

                {/* Terms */}
                <Text style={styles.termsText}>
                    By continuing, you agree to our{'\n'}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
            </Animated.View>
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
        backgroundColor: SP_RED + '10',
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
    iconContainer: {
        marginTop: 20,
        marginBottom: 32,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: SP_DARK,
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 50,
        gap: 12,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        textAlign: 'center',
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
    loginLink: {
        marginBottom: 32,
    },
    loginText: {
        fontSize: 14,
        color: '#64748b',
    },
    loginTextBold: {
        color: SP_RED,
        fontWeight: '700',
    },
    termsText: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: SP_RED,
        fontWeight: '600',
    },
});
