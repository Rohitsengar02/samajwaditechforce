import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function OnboardingCompleteScreen({ navigation }: any) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Dashboard');
    }
  };

  return (
    <LinearGradient colors={[SP_GREEN, '#15803d']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="check-circle" size={80} color={SP_GREEN} />
            </View>

            <Title style={styles.title}>Welcome Aboard!</Title>
            <Text style={styles.subtitle}>
              You are now part of the Samajwadi Tech Force. Together we will bring change.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[SP_RED, '#b91c1c']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Get Started</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 24,
    elevation: 8,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#64748b',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
