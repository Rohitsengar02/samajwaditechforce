import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const backgroundColors = isDark
    ? (['#050313', '#130b26', '#1f1237'] as const)
    : (['#e0e7ff', '#f5e9ff', '#ffe8fb'] as const);

  return (
    <LinearGradient colors={backgroundColors} style={styles.screen}>
      <View style={styles.overlay}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Sign In</Text>
          <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
            Welcome back to the VSD Youth Network
          </Text>
        </View>

        <View style={[styles.cardGlass, !isDark && styles.cardGlassLight]}>
          <Text style={[styles.stepTitle, !isDark && styles.stepTitleLight]}>Sign in to continue</Text>

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
              placeholder="Your password"
              placeholderTextColor={isDark ? '#9ca3af' : '#94a3b8'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)')}>
            <LinearGradient
              colors={
                isDark
                  ? (['#4f46e5', '#6366f1'] as const)
                  : (['#818cf8', '#a855f7'] as const)
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.signInFooterRow}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.footerLinkText} onPress={() => router.push('/register')}>
                Create one
              </Text>
            </Text>
          </View>
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
  headerRow: {
    marginBottom: 16,
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
  cardGlassLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 16,
  },
  stepTitleLight: {
    color: '#0f172a',
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
  signInFooterRow: {
    marginTop: 18,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  footerLinkText: {
    color: '#a5b4fc',
    fontWeight: '600',
  },
});
