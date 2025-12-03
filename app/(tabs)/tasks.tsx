import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../utils/api';
import { TranslatedText } from '../../components/TranslatedText';

interface Task {
  _id: string;
  title: string;
  description: string;
  type: string;
  platform?: string;
  linkToShare?: string;
  points: number;
  deadline?: string;
  status: string;
  mediaUrl?: string;
}

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function TasksScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const url = getApiUrl();
      // Note: Auth might be required depending on backend config, but route says removed for testing
      const response = await fetch(`${url}/tasks`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      // Filter for Active tasks only if needed, or show all
      const activeTasks = data.filter((task: Task) => task.status === 'Active');
      setTasks(activeTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleTaskAction = (task: Task) => {
    if (task.linkToShare) {
      Linking.openURL(task.linkToShare);
    }
  };

  const getIconForType = (type: string, platform?: string) => {
    if (platform) {
      switch (platform.toLowerCase()) {
        case 'facebook': return 'facebook';
        case 'twitter': return 'twitter';
        case 'instagram': return 'instagram';
        case 'whatsapp': return 'whatsapp';
        case 'youtube': return 'youtube';
      }
    }
    switch (type) {
      case 'Social Media': return 'share-variant';
      case 'Field Work': return 'account-group';
      case 'Event': return 'calendar-star';
      default: return 'checkbox-marked-circle-outline';
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskAction(item)}
      activeOpacity={0.9}
    >
      <View style={styles.taskHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.type === 'Social Media' ? '#E3F2FD' : '#F3E5F5' }]}>
          <MaterialCommunityIcons
            name={getIconForType(item.type, item.platform)}
            size={24}
            color={item.type === 'Social Media' ? '#1976D2' : '#7B1FA2'}
          />
        </View>
        <View style={styles.pointsBadge}>
          <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{item.points}</Text>
        </View>
      </View>

      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>

      <View style={styles.taskFooter}>
        <View style={styles.deadlineBadge}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
          <Text style={styles.deadlineText}>
            {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No Deadline'}
          </Text>
        </View>
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>
            {item.linkToShare ? 'Complete Now' : 'View Details'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={SP_RED} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[SP_RED, '#b91c1c']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <TranslatedText>Daily Tasks</TranslatedText>
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={SP_RED} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[SP_RED]} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No active tasks available</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: '#64748b',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SP_RED,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
