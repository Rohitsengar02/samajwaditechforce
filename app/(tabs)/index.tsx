import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Calendar, Book, Video, Image as ImageIcon, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tasks = [
    { id: 1, title: 'Complete Training Module', progress: 75, color: '#667eea' },
    { id: 2, title: 'Submit Weekly Report', progress: 40, color: '#f093fb' },
    { id: 3, title: 'Community Meetup', progress: 100, color: '#4facfe' },
    { id: 4, title: 'Review Resources', progress: 60, color: '#43e97b' },
  ];

  const quickActions = [
    { id: 1, title: 'Posters', icon: ImageIcon, color: '#667eea', bgColor: 'rgba(102, 126, 234, 0.1)' },
    { id: 2, title: 'Reels', icon: Video, color: '#f093fb', bgColor: 'rgba(240, 147, 251, 0.1)' },
    { id: 3, title: 'Training', icon: Book, color: '#4facfe', bgColor: 'rgba(79, 172, 254, 0.1)' },
    { id: 4, title: 'Resources', icon: Users, color: '#43e97b', bgColor: 'rgba(67, 233, 123, 0.1)' },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <LinearGradient
        colors={isDark ? ['#1a0b2e', '#2d1b4e'] : ['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello User 👋</Text>
            <Text style={styles.welcomeMessage}>Ready to make progress today?</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#ffffff" strokeWidth={2} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>VU</Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <LinearGradient
            colors={isDark ? ['#2d1b4e', '#4a2c6b'] : ['#ffffff', '#f5f7fa']}
            style={styles.digitalIdCard}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                Digital ID
              </Text>
              <View style={styles.membershipBadge}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.badgeGradient}
                >
                  <Text style={styles.badgeText}>MEMBER</Text>
                </LinearGradient>
              </View>
            </View>
            <Text style={[styles.memberName, isDark && styles.memberNameDark]}>
              VSD Community Member
            </Text>
            <Text style={[styles.memberId, isDark && styles.memberIdDark]}>
              ID: VSD-2024-1234
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Daily Tasks
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tasksScroll}
          >
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                  style={[styles.taskCard, isDark && styles.taskCardDark]}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskHeader}>
                    <View style={[styles.taskIcon, { backgroundColor: `${task.color}15` }]}>
                      <Calendar size={20} color={task.color} strokeWidth={2} />
                    </View>
                  </View>
                  <Text style={[styles.taskTitle, isDark && styles.taskTitleDark]}>
                    {task.title}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={[task.color, `${task.color}CC`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${task.progress}%` }]}
                      />
                    </View>
                    <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
                      {task.progress}%
                    </Text>
                  </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                    style={[styles.actionCard, isDark && styles.actionCardDark]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
                      <IconComponent size={28} color={action.color} strokeWidth={2} />
                    </View>
                    <Text style={[styles.actionTitle, isDark && styles.actionTitleDark]}>
                      {action.title}
                    </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Progress
          </Text>
          <View style={[styles.progressWidget, isDark && styles.progressWidgetDark]}>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircle}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.progressCircleGradient}
                >
                  <Text style={styles.progressPercentage}>68%</Text>
                </LinearGradient>
              </View>
            </View>
            <View style={styles.progressDetails}>
              <Text style={[styles.progressTitle, isDark && styles.progressTitleDark]}>
                Weekly Completion
              </Text>
              <Text style={[styles.progressSubtitle, isDark && styles.progressSubtitleDark]}>
                Great progress! Keep it up
              </Text>
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, isDark && styles.statValueDark]}>12</Text>
                  <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, isDark && styles.statValueDark]}>6</Text>
                  <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Pending</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  containerDark: {
    backgroundColor: '#0f0620',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f5576c',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarContainer: {
    position: 'absolute',
    right: 24,
    bottom: -28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  digitalIdCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cardTitleDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  membershipBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  memberName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  memberNameDark: {
    color: '#ffffff',
  },
  memberId: {
    fontSize: 14,
    color: '#999',
  },
  memberIdDark: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tasksScroll: {
    gap: 16,
    paddingRight: 24,
  },
  taskCard: {
    width: CARD_WIDTH * 0.65,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  taskCardDark: {
    backgroundColor: '#1a0b2e',
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  taskTitleDark: {
    color: '#ffffff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressTextDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  actionCardDark: {
    backgroundColor: '#1a0b2e',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionTitleDark: {
    color: '#ffffff',
  },
  progressWidget: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressWidgetDark: {
    backgroundColor: '#1a0b2e',
  },
  progressCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 4,
    backgroundColor: '#f0f0f0',
  },
  progressCircleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  progressDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  progressTitleDark: {
    color: '#ffffff',
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  progressSubtitleDark: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statValueDark: {
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  statLabelDark: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
  },
});
