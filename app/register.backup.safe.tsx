import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Image,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiUrl } from '../utils/api';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

import InteractiveOTPScreen from '../components/InteractiveOTPScreen';
import ProfileSetupScreen from '../components/ProfileSetupScreen';
import InteractiveCompleteScreen from '../components/InteractiveCompleteScreen';
import AddressFormScreen from '../components/AddressFormScreen';
import EmailVerificationScreen from '../components/EmailVerificationScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Enable web browser redirect for OAuth
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

const STEPS = {
    LOGIN: 0,
    OTP: 1,
    PROFILE: 2,
    ADDRESS: 3,
    VERIFICATION: 4,
    COMPLETE: 5,
} as const;

type StepKey = (typeof STEPS)[keyof typeof STEPS];

// Theme Colors
const SP_RED = '#E30512';
const SP_DARK = '#1a1a1a';

export default function RegisterScreen() {
    const router = useRouter();
    const [step, setStep] = useState<StepKey>(STEPS.LOGIN);
    const [phone, setPhone] = useState<string>('');
    const [googleData, setGoogleData] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const params = useLocalSearchParams();

    // Handle Google Redirect Data
    useEffect(() => {
        if (params?.googleData && step === STEPS.LOGIN) {
            try {
                const googleDataRaw = params.googleData;
                const googleDataStr = Array.isArray(googleDataRaw) ? googleDataRaw[0] : googleDataRaw;

                if (googleDataStr) {
                    const parsed = JSON.parse(googleDataStr);
                    setGoogleData(parsed);
                    setStep(STEPS.PROFILE);
                }
            } catch (e) {
                console.error('Failed to parse initial googleData:', e);
            }
        }
    }, [params?.googleData, step]);

    // Google OAuth Configuration (Matching signin.tsx logic)
    const redirectUri = Platform.OS === 'web'
        ? (typeof window !== 'undefined' ? `${window.location.origin}/auth` : AuthSession.makeRedirectUri({ path: 'auth' }))
        : AuthSession.makeRedirectUri({
            path: 'auth',
            preferLocalhost: false,
        });

    const config: any = {
        clientId: GOOGLE_WEB_CLIENT_ID,
        redirectUri: Platform.OS === 'web' ? redirectUri : redirectUri // Use standard redirectUri for native
    };

    if (GOOGLE_ANDROID_CLIENT_ID) config.androidClientId = GOOGLE_ANDROID_CLIENT_ID;
    if (GOOGLE_IOS_CLIENT_ID) config.iosClientId = GOOGLE_IOS_CLIENT_ID;

    const [request, response, promptAsync] = Google.useAuthRequest(config);

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                handleGoogleBackendSync(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            Alert.alert('Authentication Error', 'Could not sign in with Google.');
        }
    }, [response]);

    const handleGoogleBackendSync = async (accessToken: string) => {
        try {
            setLoading(true);
            const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userInfo = await userInfoResponse.json();

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
            if (!backendResponse.ok) {
                throw new Error(backendData.message || 'Failed to sync with backend');
            }

            if (backendData.token) {
                await AsyncStorage.setItem('userToken', backendData.token);
                await AsyncStorage.setItem('userInfo', JSON.stringify(backendData));
            }

            if (backendData.isNewUser || backendResponse.status === 201) {
                setGoogleData({
                    name: userInfo.name,
                    email: userInfo.email,
                    photo: userInfo.picture
                });
                setStep(STEPS.PROFILE);
            } else {
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Safe Navigation Objects
    const otpNavigation = {
        goBack: () => setStep(STEPS.LOGIN),
        navigate: (screen: string, params?: any) => { if (screen === 'ProfileSetup') setStep(STEPS.PROFILE); },
    };
    const profileNavigation = {
        goBack: () => setStep(STEPS.LOGIN),
        navigate: (screen: string, params?: any) => { if (screen === 'AddressForm') { if (params?.profileData) setProfileData(params.profileData); setStep(STEPS.ADDRESS); } },
    };
    const addressNavigation = {
        goBack: () => setStep(STEPS.PROFILE),
        navigate: (screen: string, params?: any) => { if (screen === 'ServiceSelection') setStep(STEPS.COMPLETE); },
    };
    const verificationNavigation = {
        navigate: (screen: string) => { if (screen === 'Complete') setStep(STEPS.COMPLETE); else if (screen === 'Login') setStep(STEPS.LOGIN); }
    };
    const completeNavigation = {
        navigate: (screen: string) => { if (screen === 'Dashboard') router.push('/(tabs)'); else if (screen === 'LoginForm') router.push('/signin'); }
    };

    const renderLoginStep = () => (
        <View style={styles.contentContainer}>
            <View style={styles.headerSection}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>SP</Text>
                </View>
                <Text style={styles.title}>Samajwadi Tech Force</Text>
                <Text style={styles.subtitle}>Digital Revolution Begins With You</Text>
            </View>

            <View style={styles.formSection}>
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={() => promptAsync()}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#E30512" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <MaterialCommunityIcons name="google" size={24} color="#EA4335" />
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.signInButton}
                    onPress={() => router.push('/signin')}
                >
                    <Text style={styles.signInText}>Already have an account? <Text style={{ fontWeight: 'bold', color: SP_RED }}>Sign In</Text></Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footerSection}>
                <Text style={styles.footerText}>© 2024 Samajwadi Party</Text>
            </View>
        </View>
    );

    const renderStep = () => {
        switch (step) {
            case STEPS.LOGIN: return renderLoginStep();
            case STEPS.OTP: return <InteractiveOTPScreen navigation={otpNavigation} route={{ params: { phone } }} />;
            case STEPS.PROFILE: return <ProfileSetupScreen navigation={profileNavigation} route={{ params: { phone, googleData } }} />;
            case STEPS.ADDRESS: return <AddressFormScreen navigation={addressNavigation} route={{ params: { phone, profileData } }} />;
            case STEPS.VERIFICATION: return <EmailVerificationScreen navigation={verificationNavigation} route={{ params: { email: profileData?.email } }} />;
            case STEPS.COMPLETE: return <InteractiveCompleteScreen navigation={completeNavigation} />;
            default: return null;
        }
    };

    return (
        <ErrorBoundary>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#ffffff', '#f0fdf4', '#fef2f2']}
                    style={StyleSheet.absoluteFill}
                />
                {renderStep()}
            </View>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '900',
        color: SP_RED,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: SP_DARK,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    formSection: {
        gap: 16,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    googleButton: {
        backgroundColor: '#fff',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    signInButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    signInText: {
        fontSize: 15,
        color: '#666',
    },
    footerSection: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
    }
});
