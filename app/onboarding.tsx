import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Samajwadi Party Theme Colors
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const SP_DARK = '#1a1a1a';

export default function OnboardingScreen() {
  const router = useRouter();
  const isWideLayout = width >= 768;

  // Skip onboarding on desktop/web - go directly to register
  useEffect(() => {
    if (isWideLayout) {
      router.replace('/register');
    }
  }, [isWideLayout]);

  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const ringAnim = useState(new Animated.Value(0))[0];
  const illustrationAnim = useState(new Animated.Value(0))[0];
  const translateXAnim = useState(new Animated.Value(0))[0];
  const badgeAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const [direction, setDirection] = useState(1);

  // Splash screen animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing ring animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Floating animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(illustrationAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(illustrationAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation for interactive elements
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
    );

    pulse.start();
    floatLoop.start();
    pulseLoop.start();

    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 1800);

    return () => {
      pulse.stop();
      floatLoop.stop();
      pulseLoop.stop();
      clearTimeout(timer);
    };
  }, []);

  // Slide transition animations
  useEffect(() => {
    opacityAnim.setValue(0);
    scaleAnim.setValue(0.96);
    translateXAnim.setValue(direction > 0 ? 24 : -24);
    badgeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(badgeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex, direction]);

  const slides = [
    {
      key: 'connect',
      title: 'Join the Movement',
      description: 'Connect with thousands of Samajwadi Party youth members working together for positive change across Uttar Pradesh.',
      icon: 'account-group',
      color: SP_RED,
      gradient: [SP_RED, '#b91c1c'],
    },
    {
      key: 'identity',
      title: 'Digital Membership Card',
      description: 'Get your official digital SP membership ID, participate in campaigns, and track your contribution to the movement.',
      icon: 'card-account-details',
      color: SP_GREEN,
      gradient: [SP_GREEN, '#15803d'],
    },
    {
      key: 'training',
      title: 'Learn & Grow',
      description: 'Access exclusive training programs, campaign materials, and resources to become an effective voice for change.',
      icon: 'school',
      color: SP_RED,
      gradient: ['#dc2626', SP_RED],
    },
    {
      key: 'tasks',
      title: 'Make an Impact',
      description: 'Complete daily tasks, share campaign content, and track your achievements as you contribute to our mission.',
      icon: 'chart-line',
      color: SP_GREEN,
      gradient: ['#16a34a', SP_GREEN],
    },
  ];

  const currentSlide = slides[currentIndex];
  const illustrationHeight = height * 0.35;

  const illustrationFloatStyle = {
    transform: [
      {
        translateY: illustrationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
      {
        scale: illustrationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };

  const badgeStyle = {
    opacity: badgeAnim,
    transform: [
      {
        translateX: badgeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: direction > 0 ? [32, 0] : [-32, 0],
        }),
      },
      {
        scale: badgeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  };

  const handleNext = () => {
    setDirection(1);
    if (currentIndex === slides.length - 1) {
      router.push('/register');
      return;
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    router.push('/register');
  };

  // Don't render anything on desktop (will redirect automatically)
  if (isWideLayout) {
    return null;
  }

  if (isSplashVisible) {
    return (
      <LinearGradient colors={[SP_RED, '#b91c1c']} style={styles.splashContainer}>
        <Animated.View
          style={[
            styles.splashContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Pulsing rings */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                opacity: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 0],
                }),
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.8],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRingSecondary,
              {
                opacity: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 0],
                }),
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2.2],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* SP Logo */}
          <View style={styles.splashLogo}>
            <MaterialCommunityIcons name="bicycle" size={80} color="#fff" />
          </View>

          <Text style={styles.splashTitle}>Samajwadi Tech force</Text>
          <Text style={styles.splashSubtitle}>Youth Network</Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentSlide.gradient as any} style={StyleSheet.absoluteFill} />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { translateX: translateXAnim }],
          },
        ]}
      >
        {/* Illustration area */}
        <View style={[styles.illustrationArea, { height: illustrationHeight }]}>
          <Animated.View style={[styles.iconContainer, illustrationFloatStyle]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={currentSlide.icon as any} size={120} color="#fff" />
            </View>

            {/* Floating badges */}
            <Animated.View style={[styles.floatingBadge, styles.badgeTopLeft, badgeStyle]}>
              <MaterialCommunityIcons name="check-circle" size={24} color={SP_GREEN} />
            </Animated.View>
            <Animated.View style={[styles.floatingBadge, styles.badgeBottomRight, badgeStyle]}>
              <MaterialCommunityIcons name="star" size={24} color="#fbbf24" />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Text content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>

        {/* Progress indicators */}
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.progressDot,
                  index === currentIndex && styles.progressDotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePrev}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#fff',
  },
  pulseRingSecondary: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  splashLogo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#fff',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  illustrationArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  floatingBadge: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeTopLeft: {
    top: 0,
    left: 0,
  },
  badgeBottomRight: {
    bottom: 0,
    right: 0,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  navigationContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  nextButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
