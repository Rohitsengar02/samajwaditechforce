import './global.css';
import { LanguageProvider } from '../context/LanguageContext';
import { useEffect, useRef, useState } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View, TouchableOpacity, StyleSheet, Linking, Image, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider } from 'react-native-paper';

// Google Analytics Configuration
const GA_MEASUREMENT_ID = 'G-7T9VMCWJYH';

// Initialize Google Analytics for Web
const initGoogleAnalytics = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Create and inject gtag script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Initialize dataLayer and gtag function
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    `;
    document.head.appendChild(script2);

    console.log('✅ Google Analytics initialized');
  }
};

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

import { WhatsAppButton } from '../components/WhatsAppButton';
import { ErrorBoundary } from '../components/ErrorBoundary';

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
        // Initialize Google Analytics
        initGoogleAnalytics();

        const userToken = await AsyncStorage.getItem('userToken');
        // NOTE: We allow 'register' even if userToken exists to support the multi-step profile setup flow
        const inAuthGroup = ['signin', 'onboarding'].includes(currentRoute as string);

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
  }, []); // Run only once on mount

  // Check auth on route changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        // NOTE: We allow 'register' even if userToken exists to support the multi-step profile setup flow
        const inAuthGroup = ['signin', 'onboarding'].includes(currentRoute as string);

        if (userToken && inAuthGroup) {
          // User is logged in but trying to access auth screens, redirect to tabs
          router.replace('/(tabs)');
        }
      } catch (e) {
        console.error('Auth check failed:', e);
      }
    };

    if (appIsReady) {
      checkAuth();
    }
  }, [segments, appIsReady]);

  // Setup global notification handling
  useEffect(() => {
    try {
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
    } catch (error) {
      console.warn('Socket.IO or notifications setup failed:', error);
      // App can continue without real-time features
    }

    return () => {
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch (error) {
        console.warn('Error removing notification listeners:', error);
      }
    };
  }, []);

  // Hide WhatsApp button on these screens
  // Check if any segment matches the hidden list
  const hideOnRoutes = ['onboarding', 'register', 'signin', 'admin', 'poster-editor', 'news-detail', 'news'];
  const shouldHideWhatsApp = segments.some(seg => hideOnRoutes.includes(seg));

  // Debug log
  console.log('Current route:', currentRoute, 'Segments:', segments, 'Should hide WhatsApp:', shouldHideWhatsApp);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <PaperProvider>
          <View style={{ flex: 1 }}>
            {!appIsReady ? null : (
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="signin" />
                <Stack.Screen name="register" />
                <Stack.Screen name="google-signup" />
                <Stack.Screen name="google-signin" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="+not-found" />
              </Stack>
            )}
            {!shouldHideWhatsApp && <WhatsAppButton />}
            <StatusBar style="auto" />
          </View>
        </PaperProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}


