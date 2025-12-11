import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Text, Title } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { checkEmailVerified, resendVerificationEmail, signOutUser } from '../utils/firebase';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

interface EmailVerificationScreenProps {
    navigation: any;
    route: { params?: { email?: string } };
}

export default function EmailVerificationScreen({ navigation, route }: EmailVerificationScreenProps) {
    const email = route?.params?.email || 'your email';
    const [checking, setChecking] = useState(false);
    const [resending, setResending] = useState(false);
    const [verified, setVerified] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [message, setMessage] = useState('');

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const checkAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulse animation for the email icon
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

        // Check verification status every 3 seconds
        const interval = setInterval(async () => {
            const isVerified = await checkEmailVerified();
            if (isVerified) {
                setVerified(true);
                clearInterval(interval);

                // Play success animation
                Animated.spring(checkAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }).start();

                // Navigate after delay
                setTimeout(() => {
                    navigation.navigate('Complete');
                }, 2000);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Countdown timer for resend button
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0) return;

        setResending(true);
        const result = await resendVerificationEmail();
        setResending(false);

        if (result.success) {
            setMessage('Verification email sent!');
            setCountdown(60); // 60 second cooldown
        } else {
            setMessage(result.error || 'Failed to resend email');
        }

        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
    };

    const handleCheckManually = async () => {
        setChecking(true);
        const isVerified = await checkEmailVerified();
        setChecking(false);

        if (isVerified) {
            setVerified(true);
            Animated.spring(checkAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                navigation.navigate('Complete');
            }, 2000);
        } else {
            setMessage('Email not verified yet. Please check your inbox.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleChangeEmail = async () => {
        await signOutUser();
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#ffffff', '#f0fdf4', '#fef2f2']} style={styles.background} />

            <View style={styles.content}>
                {/* Animated Icon */}
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: verified ? checkAnim : pulseAnim }] }]}>
                    {verified ? (
                        <LinearGradient colors={[SP_GREEN, '#15803d']} style={styles.iconGradient}>
                            <MaterialCommunityIcons name="check" size={60} color="#fff" />
                        </LinearGradient>
                    ) : (
                        <LinearGradient colors={[SP_RED, '#b91c1c']} style={styles.iconGradient}>
                            <MaterialCommunityIcons name="email-open" size={60} color="#fff" />
                        </LinearGradient>
                    )}
                </Animated.View>

                {/* Title */}
                <Title style={styles.title}>
                    {verified ? 'Email Verified!' : 'Verify Your Email'}
                </Title>

                {/* Description */}
                <Text style={styles.description}>
                    {verified
                        ? 'Your email has been successfully verified. Redirecting...'
                        : `We've sent a verification link to:`
                    }
                </Text>

                {!verified && (
                    <Text style={styles.email}>{email}</Text>
                )}

                {!verified && (
                    <Text style={styles.hint}>
                        Click the link in the email to verify your account. The page will update automatically.
                    </Text>
                )}

                {/* Message */}
                {message ? (
                    <Text style={[styles.message, message.includes('sent') ? styles.successMessage : styles.errorMessage]}>
                        {message}
                    </Text>
                ) : null}

                {/* Buttons */}
                {!verified && (
                    <View style={styles.buttonsContainer}>
                        {/* Check Status Button */}
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleCheckManually}
                            disabled={checking}
                            activeOpacity={0.8}
                        >
                            <LinearGradient colors={[SP_GREEN, '#15803d']} style={styles.buttonGradient}>
                                <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                                <Text style={styles.buttonText}>
                                    {checking ? 'Checking...' : 'I\'ve Verified'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Resend Button */}
                        <TouchableOpacity
                            style={[styles.secondaryButton, countdown > 0 && styles.buttonDisabled]}
                            onPress={handleResend}
                            disabled={resending || countdown > 0}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="email-check" size={20} color={countdown > 0 ? '#94a3b8' : SP_RED} />
                            <Text style={[styles.secondaryButtonText, countdown > 0 && styles.disabledText]}>
                                {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
                            </Text>
                        </TouchableOpacity>

                        {/* Change Email Button */}
                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={handleChangeEmail}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.linkText}>Use a different email</Text>
                        </TouchableOpacity>
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
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconGradient: {
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
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 8,
    },
    email: {
        fontSize: 18,
        fontWeight: '700',
        color: SP_RED,
        textAlign: 'center',
        marginBottom: 16,
    },
    hint: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    successMessage: {
        color: SP_GREEN,
        backgroundColor: '#f0fdf4',
    },
    errorMessage: {
        color: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
        marginTop: 16,
    },
    primaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    secondaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: SP_RED,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonDisabled: {
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: SP_RED,
    },
    disabledText: {
        color: '#94a3b8',
    },
    linkButton: {
        padding: 12,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
        color: '#64748b',
        textDecorationLine: 'underline',
    },
});
