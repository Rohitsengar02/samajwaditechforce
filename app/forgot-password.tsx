import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiUrl } from '../utils/api';

const SP_RED = '#E30512';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { email: initialEmail } = useLocalSearchParams<{ email: string }>();

    const [email, setEmail] = useState(initialEmail || '');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSendLink = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const url = getApiUrl();
            const response = await fetch(`${url}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setSent(true);
            } else {
                throw new Error(data.message || 'Failed to send reset link');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="email-check" size={40} color={SP_RED} />
                    </View>
                    <Text style={styles.title}>Check your email</Text>
                    <Text style={styles.text}>We have sent a password reset link to:</Text>
                    <Text style={styles.emailText}>{email}</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace('/signin')}
                    >
                        <Text style={styles.buttonText}>Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <LinearGradient colors={['#fff', '#f0fdf4']} style={StyleSheet.absoluteFill} />

            <View style={styles.card}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>

                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="name@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSendLink}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    backButton: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1a1a1a' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 30, lineHeight: 20 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: '#f8fafc' },
    button: { backgroundColor: SP_RED, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 20, alignSelf: 'center' },
    text: { textAlign: 'center', color: '#666', marginBottom: 8 },
    emailText: { textAlign: 'center', fontWeight: 'bold', color: '#1a1a1a', marginBottom: 30 }
});
