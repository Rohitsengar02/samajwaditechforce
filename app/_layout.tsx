import './global.css';
import { LanguageProvider } from '../context/LanguageContext';
import { useEffect } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';




export default function RootLayout() {
  useFrameworkReady();
  const segments = useSegments();
  const router = useRouter();
  const currentRoute = segments[0];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const inAuthGroup = ['signin', 'register', 'onboarding'].includes(currentRoute as string);

        if (userToken && inAuthGroup) {
          // User is logged in but trying to access auth screens, redirect to tabs
          router.replace('/(tabs)');
        }
      } catch (e) {
        console.error('Auth check failed:', e);
      }
    };

    checkAuth();
  }, [segments]);

  // Hide WhatsApp button on these screens
  const hideOnRoutes = ['onboarding', 'register', 'signin'];
  const shouldHideWhatsApp = hideOnRoutes.includes(currentRoute as string);

  // Debug log
  console.log('Current route:', currentRoute, 'Segments:', segments, 'Should hide WhatsApp:', shouldHideWhatsApp);

  return (
    <LanguageProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  whatsappButton: {
    position: 'absolute',
    bottom: 67,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 9999,
  },
});
