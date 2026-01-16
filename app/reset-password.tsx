import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getApiUrl } from '../utils/api';

const SP_RED = '#E30512';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { token } = useLocalSearchParams<{ token: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Normalize token
    const resetToken = Array.isArray(token) ? token[0] : token;

    // If no token, show error (or redirect)
    if (!resetToken) {
        return (
            <View style={styles.container}>
                <Text>Invalid or missing token</Text>
            </View>
        );
    }

    const handleReset = async () => {
        console.log('Resetting password...', { resetToken });
        if (password.length < 6) {
            if (Platform.OS === 'web') alert('Password must be at least 6 characters');
            else Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            if (Platform.OS === 'web') alert('Passwords do not match');
            else Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const url = getApiUrl();
            const response = await fetch(`${url}/auth/reset-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, password })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.replace('/signin');
                }, 2000);
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (error: any) {
            console.error(error);
            if (Platform.OS === 'web') alert(error.message);
            else Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="check-circle" size={40} color="#16a34a" />
                    </View>
                    <Text style={styles.title}>Password Reset!</Text>
                    <Text style={styles.text}>Your password has been successfully updated.</Text>
                    <Text style={styles.subtext}>Redirecting to Login...</Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <LinearGradient colors={['#fff', '#f0fdf4']} style={StyleSheet.absoluteFill} />

            <View style={styles.card}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>Create a new password for your account.</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.passwordWrapper}>
                        <TextInput
                            style={styles.inputWithIcon}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="New password"
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <MaterialCommunityIcons
                                name={showPassword ? "eye-off" : "eye"}
                                size={24}
                                color="#9ca3af"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordWrapper}>
                        <TextInput
                            style={styles.inputWithIcon}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            secureTextEntry={!showPassword}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleReset}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Reset Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1a1a1a' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: '#f8fafc' },
    inputWithIcon: { flex: 1, padding: 14, fontSize: 16 },
    passwordWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, backgroundColor: '#f8fafc' },
    eyeIcon: { padding: 10 },
    button: { backgroundColor: SP_RED, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 20, alignSelf: 'center' },
    text: { textAlign: 'center', color: '#1a1a1a', marginBottom: 8, fontSize: 16, fontWeight: '600' },
    subtext: { textAlign: 'center', color: '#666' }
});
