import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TRAINING_PHASES } from '@/constants/trainingData';
import { TranslatedText } from '../../components/TranslatedText';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';

const PhaseCard = ({ phase, index, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
    >
      <Animated.View style={[styles.phaseCard, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[phase.color, '#000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.phaseCardGradient}
        >
          <View style={styles.phaseHeader}>
            <View style={styles.phaseIconContainer}>
              <MaterialCommunityIcons name={phase.icon} size={28} color={phase.color} />
            </View>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>
                <TranslatedText>{`Phase ${index + 1}`}</TranslatedText>
              </Text>
            </View>
          </View>

          <View style={styles.phaseContent}>
            <Text style={styles.phaseTitle}>
              <TranslatedText>{phase.title}</TranslatedText>
            </Text>
            <Text style={styles.phaseSubtitle}>
              <TranslatedText>{phase.subtitle}</TranslatedText>
            </Text>
            <Text style={styles.phaseDescription} numberOfLines={2}>
              <TranslatedText>{phase.description}</TranslatedText>
            </Text>
          </View>

          <View style={styles.phaseFooter}>
            <View style={styles.moduleCount}>
              <MaterialCommunityIcons name="book-open-page-variant" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.moduleCountText}>
                <TranslatedText>{`${phase.modules.length} Modules`}</TranslatedText>
              </Text>
            </View>
            <View style={styles.arrowButton}>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function TrainingScreen() {
  const router = useRouter();
  const isDesktop = width >= 768;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <LinearGradient
            colors={[SP_RED, '#b91c1c']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>
                  <TranslatedText>प्रशिक्षण कार्यक्रम</TranslatedText>
                </Text>
                <Text style={styles.headerSubtitle}>
                  <TranslatedText>Training Program</TranslatedText>
                </Text>
              </View>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name="school" size={32} color="#fff" />
              </View>
            </View>

            {/* Progress Summary */}
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  <TranslatedText>Overall Progress</TranslatedText>
                </Text>
                <Text style={styles.progressValue}>15%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '15%' }]} />
              </View>
              <Text style={styles.progressMessage}>
                <TranslatedText>Keep going! You're doing great.</TranslatedText>
              </Text>
            </View>
          </LinearGradient>

          {/* Phases List */}
          <View style={[styles.contentContainer, isDesktop && styles.desktopContent]}>
            <Text style={styles.sectionTitle}>
              <TranslatedText>Your Journey</TranslatedText>
            </Text>
            <View style={styles.phasesList}>
              {TRAINING_PHASES.map((phase, index) => (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  index={index}
                  onPress={() => router.push(`/training/phase/${phase.id}` as any)}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  progressValue: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  contentContainer: {
    padding: 24,
  },
  desktopContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  phasesList: {
    gap: 16,
  },
  phaseCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: '#fff',
  },
  phaseCardGradient: {
    padding: 20,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  phaseIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phaseBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  phaseContent: {
    marginBottom: 20,
  },
  phaseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  phaseSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  phaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  moduleCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moduleCountText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
