import './global.css';
import { LanguageProvider } from '../context/LanguageContext';
import { useEffect, useRef, useState } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider } from 'react-native-paper';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Configure notifications globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useFrameworkReady();
  const segments = useSegments();
  const router = useRouter();
  const currentRoute = segments[0];
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const [appIsReady, setAppIsReady] = useState(false);

  // Hide splash screen and check auth
  useEffect(() => {
    const prepareApp = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const inAuthGroup = ['signin', 'register', 'onboarding'].includes(currentRoute as string);

        if (userToken && inAuthGroup) {
          // User is logged in but trying to access auth screens, redirect to tabs
          router.replace('/(tabs)');
        }

        setAppIsReady(true);
      } catch (e) {
        console.error('Auth check failed:', e);
        setAppIsReady(true);
      } finally {
        // Hide splash screen after app is ready
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, [segments]);

  // Setup global notification handling
  useEffect(() => {
    // Setup Socket.IO connection for notifications
    const socketService = require('../services/socketService').default;
    socketService.connect();

    // Listener for when notification is received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received in foreground:', notification);
    });

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 User tapped notification:', response);
      // Navigate to notifications page
      router.push('/notifications');
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Hide WhatsApp button on these screens
  const hideOnRoutes = ['onboarding', 'register', 'signin'];
  const shouldHideWhatsApp = hideOnRoutes.includes(currentRoute as string);

  // Debug log
  console.log('Current route:', currentRoute, 'Segments:', segments, 'Should hide WhatsApp:', shouldHideWhatsApp);

  return (
    <LanguageProvider>
      <PaperProvider>
        <View style={{ flex: 1 }}>
          {!appIsReady ? null : (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          )}
          <StatusBar style="auto" />
        </View>
      </PaperProvider>
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
