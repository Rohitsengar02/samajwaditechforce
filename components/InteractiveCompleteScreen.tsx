import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Samajwadi Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Floating Bubble Component
const FloatingBubble = ({ delay = 0, size = 60, color = '#fff', duration = 8000 }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;
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
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    />
  );
};

// Confetti Particle
const ConfettiParticle = ({ delay = 0, color = '#fff', left = '50%' }: any) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height + 100,
          duration: 3000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 200,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 360,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left,
          backgroundColor: color,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
          ],
        },
      ]}
    />
  );
};

export default function InteractiveCompleteScreen({ navigation }: any) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(slideUp, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  const handleGetStarted = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      {/* Green Gradient Background */}
      <LinearGradient
        colors={[SP_GREEN, '#15803d', '#166534']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Bubbles */}
      <View style={styles.bubblesContainer}>
        <FloatingBubble delay={0} size={80} color="rgba(255,255,255,0.1)" duration={10000} />
        <FloatingBubble delay={1000} size={60} color="rgba(255,255,255,0.08)" duration={12000} />
        <FloatingBubble delay={500} size={100} color="rgba(255,255,255,0.06)" duration={9000} />
        <FloatingBubble delay={1500} size={70} color="rgba(255,255,255,0.09)" duration={11000} />
      </View>

      {/* Confetti */}
      {[...Array(15)].map((_, i) => (
        <ConfettiParticle
          key={i}
          delay={i * 100}
          color={['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'][i % 5]}
          left={`${10 + (i * 6)}%`}
        />
      ))}

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Success Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.successCircle}>
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <MaterialCommunityIcons name="check-circle" size={100} color="#fff" />
            </Animated.View>
          </View>
          <View style={styles.outerRing} />
          <View style={styles.outerRing2} />
        </Animated.View>

        {/* Content Card */}
        <Animated.View style={[styles.cardWrapper, { transform: [{ translateY: slideUp }] }]}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>Welcome Aboard! 🎉</Title>
              <Text style={styles.subtitle}>
                You're now part of the Samajwadi Tech Force
              </Text>

              <View style={styles.divider} />

              {/* Features */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: '#fef2f2' }]}>
                    <MaterialCommunityIcons name="bullhorn" size={24} color={SP_RED} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Campaign Updates</Text>
                    <Text style={styles.featureDescription}>Stay informed with real-time updates</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: '#f0fdf4' }]}>
                    <MaterialCommunityIcons name="account-group" size={24} color={SP_GREEN} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Join Community</Text>
                    <Text style={styles.featureDescription}>Connect with volunteers nationwide</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: '#fef3c7' }]}>
                    <MaterialCommunityIcons name="trophy" size={24} color="#f59e0b" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Earn Rewards</Text>
                    <Text style={styles.featureDescription}>Get recognized for your contributions</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: '#ede9fe' }]}>
                    <MaterialCommunityIcons name="school" size={24} color="#8b5cf6" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Training Resources</Text>
                    <Text style={styles.featureDescription}>Access exclusive learning materials</Text>
                  </View>
                </View>
              </View>

              {/* Get Started Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleGetStarted}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[SP_RED, '#b91c1c']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => navigation.navigate('LoginForm')}
                activeOpacity={0.7}
              >
                <Text style={styles.signInText}>Already have an account? </Text>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Together, we'll bring the change! 🚴
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
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
  bubblesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    bottom: -100,
    left: Math.random() * (width - 100),
  },
  confetti: {
    position: 'absolute',
    top: -50,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  outerRing2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cardContent: {
    padding: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  buttonGradient: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  signInText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  signInLink: {
    fontSize: 15,
    color: SP_RED,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
  },
});
