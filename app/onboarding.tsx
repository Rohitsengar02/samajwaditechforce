import { View, Text, StyleSheet, TouchableOpacity, Dimensions, useColorScheme, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const ringAnim = useState(new Animated.Value(0))[0];

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

    pulse.start();

    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 1800);

    return () => {
      pulse.stop();
      clearTimeout(timer);
    };
  }, [opacityAnim, ringAnim, scaleAnim]);

  useEffect(() => {
    opacityAnim.setValue(0);
    scaleAnim.setValue(0.96);

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
    ]).start();
  }, [currentIndex, opacityAnim, scaleAnim]);

  const slides = [
    {
      key: 'connect',
      title: 'Connect with the Community',
      description:
        'Join thousands of active youth and become part of a powerful digital community working for social change.',
      gradientLight: ['#667eea', '#764ba2'] as const,
      gradientDark: ['#1a0b2e', '#2d1b4e'] as const,
    },
    {
      key: 'identity',
      title: 'Your Digital Identity, Verified',
      description:
        'Get your official digital membership card, participate in activities, and grow your rank within the organization.',
      gradientLight: ['#f093fb', '#f5576c'] as const,
      gradientDark: ['#2d1b4e', '#4a2c6b'] as const,
    },
    {
      key: 'training',
      title: '4-Phase Youth Training Program',
      description:
        'Complete interactive modules designed to guide your growth — Connect, Create, Conquer, and Lead.',
      gradientLight: ['#4facfe', '#43e97b'] as const,
      gradientDark: ['#151627', '#283046'] as const,
    },
    {
      key: 'tasks',
      title: 'Daily Tasks & Leadership Progress',
      description:
        'Take part in daily activities, access posters & resources, complete tasks, and track your achievements in real time.',
      gradientLight: ['#667eea', '#f093fb'] as const,
      gradientDark: ['#1a0b2e', '#764ba2'] as const,
    },
  ];

  const currentSlide = slides[currentIndex];

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      router.push('/register');
      return;
    }
    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const handleSkip = () => {
    setCurrentIndex(slides.length - 1);
  };

  const getBackgroundColors = () => {
    return isDark
      ? (['#050313', '#130b26', '#1f1237'] as const)
      : (['#e0e7ff', '#f5e9ff', '#ffe8fb'] as const);
  };

  const renderSplash = () => {
    return (
      <LinearGradient colors={getBackgroundColors()} style={styles.splashContainer}>
        <View style={styles.splashInner}>
          <Animated.View
            style={[
              styles.splashGlow,
              {
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.35],
                    }),
                  },
                ],
                opacity: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
              },
            ]}
          />

          <Animated.View
            style={[
              styles.splashLogo,
              {
                transform: [
                  { scale: scaleAnim },
                ],
                opacity: opacityAnim,
              },
            ]}
          >
            <LinearGradient
              colors={isDark ? ['#f093fb', '#f5576c'] : ['#667eea', '#f093fb']}
              style={styles.splashLogoGradient}
            >
              <Sparkles size={56} color="#ffffff" strokeWidth={1.4} />
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ opacity: opacityAnim, marginTop: 32 }}>
            <Text style={[styles.splashTitle, isDark && styles.splashTitleDark]}>VSD Youth Network</Text>
            <Text style={[styles.splashSubtitle, isDark && styles.splashSubtitleDark]}>
              Loading your movement...
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  };

  if (isSplashVisible) {
    return renderSplash();
  }

  return (
    <LinearGradient colors={getBackgroundColors()} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <Text style={[styles.appLabel, isDark && styles.appLabelDark]}>VSD Youth</Text>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={[styles.skipText, isDark && styles.skipTextDark]}>
              {currentIndex === slides.length - 1 ? 'Skip intro' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={isDark ? currentSlide.gradientDark : currentSlide.gradientLight}
            style={styles.cardGradient}
          >
            <View style={styles.cardIllustrationWrapper}>
              <View style={styles.blobLarge} />
              <View style={styles.blobSmall} />

              {currentSlide.key === 'connect' && (
                <View style={styles.illustrationConnect}>
                  <View style={styles.nodeRow}>
                    <View style={styles.node} />
                    <View style={styles.node} />
                    <View style={styles.node} />
                  </View>
                  <View style={styles.nodeLink} />
                  <View style={styles.nodeRow}>
                    <View style={styles.node} />
                    <View style={styles.node} />
                    <View style={styles.node} />
                  </View>
                </View>
              )}

              {currentSlide.key === 'identity' && (
                <View style={styles.illustrationCard}>
                  <View style={styles.idCardShadow} />
                  <View style={styles.idCard}>
                    <View style={styles.idAvatar} />
                    <View style={styles.idContent}>
                      <View style={styles.idLineWide} />
                      <View style={styles.idLine} />
                      <View style={styles.idTagRow}>
                        <View style={styles.idTag} />
                        <View style={styles.idTagSoft} />
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {currentSlide.key === 'training' && (
                <View style={styles.illustrationSteps}>
                  {[1, 2, 3, 4].map((step) => (
                    <View key={step} style={styles.stepItem}>
                      <View style={styles.stepCircle}>
                        <Text style={styles.stepNumber}>{step}</Text>
                      </View>
                      <View style={styles.stepBar} />
                    </View>
                  ))}
                </View>
              )}

              {currentSlide.key === 'tasks' && (
                <View style={styles.illustrationTasks}>
                  <View style={styles.taskRow}>
                    <View style={styles.checkbox} />
                    <View style={styles.taskLine} />
                    <View style={styles.trophy} />
                  </View>
                  <View style={[styles.taskRow, { opacity: 0.8 }] }>
                    <View style={styles.checkbox} />
                    <View style={[styles.taskLine, { width: '55%' }]} />
                    <View style={styles.resourceDot} />
                  </View>
                  <View style={[styles.taskRow, { opacity: 0.6 }] }>
                    <View style={styles.checkbox} />
                    <View style={[styles.taskLine, { width: '65%' }]} />
                    <View style={styles.resourceDot} />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.cardTextArea}>
              <Text style={styles.title}>{currentSlide.title}</Text>
              <Text style={styles.subtitle}>{currentSlide.description}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            {slides.map((slide, index) => (
              <View
                key={slide.key}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
        

          <TouchableOpacity activeOpacity={0.85} onPress={handleNext}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
              <ChevronRight size={20} color="#ffffff" strokeWidth={3} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#4b5563',
  },
  appLabelDark: {
    color: '#e5e7eb',
  },
  skipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  skipTextDark: {
    color: '#9ca3af',
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 32,
  },
  cardIllustrationWrapper: {
    height: height * 0.3,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.16)',
  },
  blobLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -40,
    right: -40,
  },
  blobSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    bottom: -30,
    left: -20,
  },
  illustrationConnect: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeRow: {
    flexDirection: 'row',
    gap: 18,
  },
  node: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  nodeLink: {
    width: '70%',
    height: 2,
    borderRadius: 999,
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  illustrationCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idCardShadow: {
    position: 'absolute',
    width: 220,
    height: 140,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    top: 26,
    left: 32,
  },
  idCard: {
    width: 240,
    height: 150,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  idAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e5e7eb',
    marginRight: 14,
  },
  idContent: {
    flex: 1,
  },
  idLineWide: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
    marginBottom: 8,
    width: '70%',
  },
  idLine: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginBottom: 10,
    width: '60%',
  },
  idTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#4f46e5',
  },
  idTagSoft: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  illustrationSteps: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    color: '#ffffff',
    fontWeight: '700',
  },
  stepBar: {
    width: 40,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  illustrationTasks: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  taskLine: {
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    flex: 1,
  },
  trophy: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
  },
  resourceDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(96, 165, 250, 0.95)',
  },
  cardTextArea: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(248, 250, 252, 0.92)',
    lineHeight: 22,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.6)',
  },
  dotActive: {
    width: 26,
    backgroundColor: '#6366f1',
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#f5576c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButtonTextDark: {
    color: '#e5e7eb',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashInner: {
    alignItems: 'center',
  },
  splashGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(129, 140, 248, 0.5)',
  },
  splashLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  splashLogoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  splashTitleDark: {
    color: '#f9fafb',
  },
  splashSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  splashSubtitleDark: {
    color: '#9ca3af',
  },
});
